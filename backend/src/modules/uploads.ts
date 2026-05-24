import { Hono } from 'hono'

type Env = {
  DB: D1Database
  MEDIA_BUCKET?: R2Bucket
  APP_URL?: string
  PUBLIC_MEDIA_BASE_URL?: string
}

export const uploadRoutes = new Hono<{ Bindings: Env; Variables: any }>()

function extFromFile(file: File) {
  const name = file.name || ''
  const ext = name.split('.').pop()?.toLowerCase()
  if (ext && /^[a-z0-9]{2,8}$/.test(ext)) return ext
  const type = file.type || ''
  if (type.includes('png')) return 'png'
  if (type.includes('webp')) return 'webp'
  if (type.includes('jpeg') || type.includes('jpg')) return 'jpg'
  if (type.includes('mp4')) return 'mp4'
  if (type.includes('quicktime')) return 'mov'
  if (type.includes('mpeg')) return 'mp3'
  if (type.includes('wav')) return 'wav'
  return 'bin'
}

function isAllowed(file: File, kind: string) {
  const type = file.type || ''
  if (kind === 'image') return type.startsWith('image/')
  if (kind === 'audio') return type.startsWith('audio/')
  if (kind === 'video') return type.startsWith('video/')
  return true
}

function maxBytes(kind: string) {
  if (kind === 'image') return 8 * 1024 * 1024
  if (kind === 'audio') return 35 * 1024 * 1024
  if (kind === 'video') return 80 * 1024 * 1024
  return 20 * 1024 * 1024
}

async function handleUpload(c: any) {
  const user = c.get('user')
  const form = await c.req.formData()
  const file = form.get('file')
  const kind = String(form.get('kind') || 'image')

  if (!(file instanceof File)) return c.json({ error: 'فایل ارسال نشده است.' }, 400)
  if (!isAllowed(file, kind)) return c.json({ error: 'نوع فایل مجاز نیست.' }, 400)
  if (file.size > maxBytes(kind)) return c.json({ error: 'حجم فایل بیشتر از حد مجاز است.' }, 400)

  const id = crypto.randomUUID()
  const ext = extFromFile(file)
  const key = `uploads/${kind}/${new Date().toISOString().slice(0, 10)}/${id}.${ext}`

  if (c.env.MEDIA_BUCKET) {
    await c.env.MEDIA_BUCKET.put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type || 'application/octet-stream' },
      customMetadata: {
        user_id: user?.id || '',
        kind,
        original_name: file.name || '',
      },
    })

    const publicBase = c.env.PUBLIC_MEDIA_BASE_URL || c.env.APP_URL || ''
    const url = publicBase
      ? `${publicBase.replace(/\/$/, '')}/api/uploads/file/${key}`
      : `/api/uploads/file/${key}`

    await c.env.DB.prepare(`
      INSERT INTO media_items (id, user_id, url, type, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'active', datetime('now'), datetime('now'))
    `).bind(id, user?.id || '', url, kind).run().catch(() => {})

    return c.json({ ok: true, id, key, url })
  }

  const buffer = await file.arrayBuffer()
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)))
  const url = `data:${file.type || 'application/octet-stream'};base64,${base64}`

  await c.env.DB.prepare(`
    INSERT INTO media_items (id, user_id, url, type, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'active', datetime('now'), datetime('now'))
  `).bind(id, user?.id || '', url, kind).run().catch(() => {})

  return c.json({
    ok: true,
    id,
    url,
    warning: 'R2 binding تنظیم نشده؛ فایل به صورت data-url ذخیره شد. برای production حتما MEDIA_BUCKET را تنظیم کن.',
  })
}

uploadRoutes.post('/uploads', handleUpload)
uploadRoutes.post('/', handleUpload)

async function handleFile(c: any) {
  const key = c.req.path.replace(/^\/api\/uploads\/file\//, '')
  if (!c.env.MEDIA_BUCKET) return c.json({ error: 'MEDIA_BUCKET تنظیم نشده است.' }, 404)

  const object = await c.env.MEDIA_BUCKET.get(key)
  if (!object) return c.json({ error: 'فایل پیدا نشد.' }, 404)

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('cache-control', 'public, max-age=31536000, immutable')
  return new Response(object.body, { headers })
}

uploadRoutes.get('/uploads/file/*', handleFile)
uploadRoutes.get('/file/*', handleFile)
