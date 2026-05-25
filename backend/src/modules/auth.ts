import { authEmailRoutes } from './authEmail'
import { sendVerificationEmail } from '../lib/email'

export const authRoutes = authEmailRoutes

authRoutes.get('/resend-debug', async c => {
  const to = String(c.req.query('to') || '').trim()
  if (!to) return c.json({ ok: false, error: 'missing to query' }, 400)
  const result: any = await sendVerificationEmail(c.env, to, '123456').catch((err: any) => ({ ok: false, error: String(err?.message || err) }))
  const reason = String(result?.reason || result?.error || '')
  return c.json({
    ok: !!result?.ok,
    has_resend_key: !!c.env.RESEND_API_KEY,
    has_email_from: !!c.env.EMAIL_FROM,
    email_from_verified: c.env.EMAIL_FROM_VERIFIED === '1',
    status: result?.status || null,
    reason: reason.slice(0, 900)
  })
})
