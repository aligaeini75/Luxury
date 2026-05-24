
import { Hono } from 'hono'
import type { Env } from '../index'
import { hmacSha256Hex, safeEqual } from '../lib/crypto'

type MediaEnv = Env & { MEDIA_BUCKET?: R2Bucket }
export const mediaRoutes = new Hono<{ Bindings: MediaEnv }>()

async function verifySigned(c: any, key: string) {
  const secret = c.env.R2_SIGNING_SECRET || c.env.JWT_SECRET || 'dev-media-secret'
  const exp = String(c.req.query('exp') || '')
  const sig = String(c.req.query('sig') || '')
  if (!exp || !sig) return false
  if (Date.now() > Number(exp) * 1000) return false
  const expected = await hmacSha256Hex(secret, `${key}.${exp}`)
  return safeEqual(sig, expected)
}

export async function makeMediaUrl(env: any, key: string, ttlSeconds = 60 * 60 * 24 * 30) {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds
  const secret = env.R2_SIGNING_SECRET || env.JWT_SECRET || 'dev-media-secret'
  const sig = await hmacSha256Hex(secret, `${key}.${exp}`)
  return `/api/media/file/${encodeURIComponent(key)}?exp=${exp}&sig=${sig}`
}

mediaRoutes.get('/file/:key', async c => {
  const key = decodeURIComponent(c.req.param('key'))
  if (!await verifySigned(c, key)) return c.text('Signed media URL expired or invalid', 403)
  if (!c.env.MEDIA_BUCKET) return c.redirect('https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1200&auto=format&fit=crop')
  const obj = await c.env.MEDIA_BUCKET.get(key)
  if (!obj) return c.text('Not found', 404)
  const headers = new Headers()
  obj.writeHttpMetadata(headers)
  headers.set('Cache-Control', 'private, max-age=600')
  headers.set('X-Content-Type-Options', 'nosniff')
  return new Response(obj.body, { headers })
})
