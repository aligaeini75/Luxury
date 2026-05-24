import { Hono } from 'hono'
import { sign } from 'hono/jwt'
import { id, now } from '../lib/id'
import { hashPassword, verifyPassword } from '../lib/password'
import { auth } from '../middleware/auth'
import type { Env } from '../index'

export const authRoutes = new Hono<{ Bindings: Env; Variables: { user: any } }>()

authRoutes.post('/register', async c => {
  const b: any = await c.req.json()
  if (!b.email || !b.password) return c.json({ error: 'Email and password required' }, 400)
  if (!['man', 'woman'].includes(String(b.role))) return c.json({ error: 'Invalid role' }, 400)
  const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email=?').bind(b.email).first()
  if (existing) return c.json({ error: 'Email already registered' }, 409)
  const t = now()
  const userId = id('usr')
  const passwordHash = await hashPassword(String(b.password))
  await c.env.DB.prepare('INSERT INTO users(id,email,password_hash,full_name,role,status,verified,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)')
    .bind(userId, String(b.email), passwordHash, String(b.full_name || ''), String(b.role), 'active', 0, t, t).run()
  await c.env.DB.prepare('INSERT INTO wallets(id,user_id,balance,locked_balance,created_at,updated_at) VALUES(?,?,?,?,?,?)')
    .bind(id('wal'), userId, 0, 0, t, t).run()
  if (b.role === 'woman') {
    await c.env.DB.prepare('INSERT INTO woman_profiles(id,user_id,display_name,created_at,updated_at) VALUES(?,?,?,?,?)')
      .bind(id('wp'), userId, String(b.full_name || b.email.split('@')[0]), t, t).run()
  } else {
    await c.env.DB.prepare('INSERT INTO man_profiles(id,user_id,display_name,created_at,updated_at) VALUES(?,?,?,?,?)')
      .bind(id('mp'), userId, String(b.full_name || b.email.split('@')[0]), t, t).run()
  }
  const user = { id: userId, email: b.email, full_name: b.full_name || '', role: b.role }
  const token = await sign({ sub: userId, email: b.email, role: b.role, exp: Math.floor(Date.now()/1000)+60*60*24*14 }, c.env.JWT_SECRET)
  return c.json({ token, user })
})

authRoutes.post('/login', async c => {
  const b: any = await c.req.json()
  const row: any = await c.env.DB.prepare('SELECT * FROM users WHERE email=?').bind(b.email).first()
  if (!row || !(await verifyPassword(String(b.password || ''), row.password_hash))) return c.json({ error: 'Invalid credentials' }, 401)
  if (row.status === 'blocked') return c.json({ error: 'Account blocked' }, 403)
  const token = await sign({ sub: row.id, email: row.email, role: row.role, exp: Math.floor(Date.now()/1000)+60*60*24*14 }, c.env.JWT_SECRET)
  return c.json({ token, user: { id: row.id, email: row.email, full_name: row.full_name, role: row.role, verified: row.verified } })
})

authRoutes.get('/me', auth, async c => {
  const u = c.get('user')
  const user = await c.env.DB.prepare('SELECT id,email,full_name,role,verified,status FROM users WHERE id=?').bind(u.id).first()
  return c.json({ user })
})


authRoutes.get('/alerts', auth, async c => {
  const u = c.get('user')
  const alerts = (await c.env.DB.prepare('SELECT * FROM user_alerts WHERE user_id=? ORDER BY created_at DESC LIMIT 20').bind(u.id).all()).results
  return c.json({ alerts, unread: alerts.filter((a: any) => !a.is_read).length })
})

authRoutes.post('/alerts/:id/read', auth, async c => {
  const u = c.get('user')
  await c.env.DB.prepare('UPDATE user_alerts SET is_read=1 WHERE id=? AND user_id=?').bind(c.req.param('id'), u.id).run()
  return c.json({ success: true })
})


authRoutes.get('/kyc', auth, async c => {
  const u = c.get('user')
  const user = await c.env.DB.prepare('SELECT id,email,full_name,role,verified,status,mobile FROM users WHERE id=?').bind(u.id).first().catch(async () => {
    return await c.env.DB.prepare('SELECT id,email,full_name,role,verified,status FROM users WHERE id=?').bind(u.id).first()
  })
  const kyc = await c.env.DB.prepare('SELECT * FROM kyc_requests WHERE user_id=? ORDER BY created_at DESC LIMIT 1').bind(u.id).first()
  const challengeText = `من مالک این حساب لوکسورا هستم و تاریخ امروز ${new Date().toLocaleDateString('fa-IR')} است.`
  return c.json({ user, kyc, challengeText })
})

authRoutes.post('/kyc', auth, async c => {
  const u = c.get('user')
  const b:any = await c.req.json()
  const id = crypto.randomUUID()
  const t = new Date().toISOString()

  await c.env.DB.prepare('UPDATE users SET mobile=COALESCE(?, mobile), email=COALESCE(?, email), updated_at=? WHERE id=?')
    .bind(String(b.mobile || ''), String(b.email || ''), t, u.id).run().catch(async () => {
      await c.env.DB.prepare('UPDATE users SET email=COALESCE(?, email), updated_at=? WHERE id=?')
        .bind(String(b.email || ''), t, u.id).run()
    })

  await c.env.DB.prepare(`
    INSERT INTO kyc_requests(id,user_id,document_type,national_card_url,selfie_url,selfie_video_url,mobile,email,status,admin_note,challenge_text,created_at,updated_at)
    VALUES(?,?,?,?,?,?,?,?, 'pending','',?,?,?)
  `).bind(
    id,
    u.id,
    'national_card',
    String(b.national_card_url || ''),
    String(b.selfie_video_url || ''),
    String(b.selfie_video_url || ''),
    String(b.mobile || ''),
    String(b.email || ''),
    String(b.challenge_text || ''),
    t,
    t
  ).run()

  const kyc = await c.env.DB.prepare('SELECT * FROM kyc_requests WHERE id=?').bind(id).first()
  return c.json({ success:true, message:'درخواست تایید هویت برای ادمین ارسال شد.', kyc })
})
