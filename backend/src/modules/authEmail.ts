import { Hono } from 'hono'
import { sign } from 'hono/jwt'
import { id, now } from '../lib/id'
import { hashPassword, verifyPassword } from '../lib/password'
import { sendCriticalEmail, sendVerificationEmail } from '../lib/email'
import type { Env } from '../index'

export const authEmailRoutes = new Hono<{ Bindings: Env }>()

const norm = (v: any) => String(v || '').trim().toLowerCase()
const code = () => String(Math.floor(100000 + Math.random() * 900000))

async function sha(v: string) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(v))
  return Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, '0')).join('')
}

async function token(c: any, u: any) {
  return sign({ sub: u.id, email: u.email, role: u.role, exp: Math.floor(Date.now() / 1000) + 1209600 }, c.env.JWT_SECRET)
}

async function sendCode(c: any, u: any) {
  const t = now()
  const v = code()
  await c.env.DB.prepare('UPDATE email_confirmations SET consumed_at=? WHERE user_id=? AND consumed_at IS NULL').bind(t, u.id).run()
  await c.env.DB.prepare('INSERT INTO email_confirmations(id,user_id,email,code_digest,attempts,expires_at,created_at) VALUES(?,?,?,?,?,?,?)')
    .bind(id('emc'), u.id, u.email, await sha(`${u.id}:${u.email}:${v}`), 0, new Date(Date.now() + 900000).toISOString(), t).run()
  await sendVerificationEmail(c.env, u.email, v)
}

authEmailRoutes.post('/register', async c => {
  const b: any = await c.req.json()
  const email = norm(b.email)
  if (!email || !b.password) return c.json({ error: 'Email and password required' }, 400)
  if (!['man', 'woman'].includes(String(b.role))) return c.json({ error: 'Invalid role' }, 400)
  const old: any = await c.env.DB.prepare('SELECT * FROM users WHERE email=?').bind(email).first()
  if (old?.email_verified) return c.json({ error: 'Email already registered' }, 409)
  if (old?.id) { await sendCode(c, old); return c.json({ verification_required: true, email }) }
  const t = now(); const uid = id('usr')
  await c.env.DB.prepare('INSERT INTO users(id,email,password_hash,full_name,role,status,verified,created_at,updated_at,email_verified) VALUES(?,?,?,?,?,?,?,?,?,?)')
    .bind(uid, email, await hashPassword(String(b.password)), String(b.full_name || ''), String(b.role), 'pending_email', 0, t, t, 0).run()
  await c.env.DB.prepare('INSERT INTO wallets(id,user_id,balance,locked_balance,created_at,updated_at) VALUES(?,?,?,?,?,?)').bind(id('wal'), uid, 0, 0, t, t).run()
  if (b.role === 'woman') await c.env.DB.prepare('INSERT INTO woman_profiles(id,user_id,display_name,created_at,updated_at) VALUES(?,?,?,?,?)').bind(id('wp'), uid, String(b.full_name || email.split('@')[0]), t, t).run()
  else await c.env.DB.prepare('INSERT INTO man_profiles(id,user_id,display_name,created_at,updated_at) VALUES(?,?,?,?,?)').bind(id('mp'), uid, String(b.full_name || email.split('@')[0]), t, t).run()
  await sendCode(c, { id: uid, email })
  return c.json({ verification_required: true, email })
})

authEmailRoutes.post('/verify-email', async c => {
  const b: any = await c.req.json(); const email = norm(b.email); const v = String(b.code || '').trim()
  const u: any = await c.env.DB.prepare('SELECT * FROM users WHERE email=?').bind(email).first()
  if (!u) return c.json({ error: 'حساب پیدا نشد.' }, 404)
  const rec: any = await c.env.DB.prepare('SELECT * FROM email_confirmations WHERE user_id=? AND consumed_at IS NULL ORDER BY created_at DESC LIMIT 1').bind(u.id).first()
  if (!rec || new Date(rec.expires_at).getTime() < Date.now()) return c.json({ error: 'کد معتبر نیست یا منقضی شده.' }, 400)
  if (rec.code_digest !== await sha(`${u.id}:${email}:${v}`)) { await c.env.DB.prepare('UPDATE email_confirmations SET attempts=attempts+1 WHERE id=?').bind(rec.id).run(); return c.json({ error: 'کد اشتباه است.' }, 400) }
  const t = now()
  await c.env.DB.prepare('UPDATE email_confirmations SET consumed_at=? WHERE id=?').bind(t, rec.id).run()
  await c.env.DB.prepare('UPDATE users SET email_verified=1,email_verified_at=?,status="active",updated_at=? WHERE id=?').bind(t, t, u.id).run()
  const fresh: any = await c.env.DB.prepare('SELECT * FROM users WHERE id=?').bind(u.id).first()
  await sendCriticalEmail(c.env, fresh.email, 'عضویت Luxora فعال شد', 'حساب شما فعال شد', 'ایمیل شما تایید شد و حساب فعال است.', fresh.role === 'woman' ? '/#/woman/studio' : '/#/man')
  return c.json({ token: await token(c, fresh), user: { id: fresh.id, email: fresh.email, full_name: fresh.full_name, role: fresh.role, verified: fresh.verified, email_verified: 1 } })
})

authEmailRoutes.post('/resend-email-code', async c => {
  const b: any = await c.req.json(); const u: any = await c.env.DB.prepare('SELECT * FROM users WHERE email=?').bind(norm(b.email)).first()
  if (!u) return c.json({ error: 'حساب پیدا نشد.' }, 404)
  if (u.email_verified) return c.json({ success: true, already_verified: true })
  await sendCode(c, u)
  return c.json({ success: true })
})

authEmailRoutes.post('/login', async c => {
  const b: any = await c.req.json(); const u: any = await c.env.DB.prepare('SELECT * FROM users WHERE email=?').bind(norm(b.email)).first()
  if (!u || !(await verifyPassword(String(b.password || ''), u.password_hash))) return c.json({ error: 'Invalid credentials' }, 401)
  if (u.status === 'blocked') return c.json({ error: 'Account blocked' }, 403)
  if (!u.email_verified) { await sendCode(c, u); return c.json({ error: 'EMAIL_VERIFICATION_REQUIRED', verification_required: true, email: u.email }, 403) }
  return c.json({ token: await token(c, u), user: { id: u.id, email: u.email, full_name: u.full_name, role: u.role, verified: u.verified, email_verified: u.email_verified } })
})
