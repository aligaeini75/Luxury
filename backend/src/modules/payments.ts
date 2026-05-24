
import { Hono } from 'hono'
import { id, now } from '../lib/id'
import type { Env } from '../index'
import { hmacSha512Hex, safeEqual, stableJsonStringify } from '../lib/crypto'

export const paymentRoutes = new Hono<{ Bindings: Env }>()

paymentRoutes.post('/nowpayments/ipn', async c => {
  const raw = await c.req.text()
  let b: any = {}
  try { b = JSON.parse(raw) } catch { return c.json({ error: 'Invalid JSON' }, 400) }

  const secret = c.env.NOWPAYMENTS_IPN_SECRET
  if (secret) {
    const given = c.req.header('x-nowpayments-sig') || c.req.header('X-NOWPAYMENTS-SIG') || ''
    const expected = await hmacSha512Hex(secret, stableJsonStringify(b))
    if (!safeEqual(given.toLowerCase(), expected.toLowerCase())) {
      await c.env.DB.prepare('INSERT INTO audit_logs(id,actor_id,action,entity_type,entity_id,metadata,created_at) VALUES(?,?,?,?,?,?,?)')
        .bind(id('aud'), 'system', 'ipn_signature_failed', 'crypto_deposit', String(b.order_id || ''), JSON.stringify({ provider: 'nowpayments' }), now()).run()
      return c.json({ error: 'Invalid IPN signature' }, 401)
    }
  }

  const paymentStatus = String(b.payment_status || b.status || '')
  const orderId = String(b.order_id || '')
  if (!orderId) return c.json({ error: 'order_id required' }, 400)
  const dep: any = await c.env.DB.prepare('SELECT * FROM crypto_deposits WHERE id=?').bind(orderId).first()
  if (!dep) return c.json({ error: 'Deposit not found' }, 404)

  await c.env.DB.prepare('INSERT INTO audit_logs(id,actor_id,action,entity_type,entity_id,metadata,created_at) VALUES(?,?,?,?,?,?,?)')
    .bind(id('aud'), 'system', 'nowpayments_ipn_received', 'crypto_deposit', orderId, JSON.stringify({ paymentStatus, provider_payment_id: b.payment_id || b.invoice_id || '' }), now()).run()

  if (['finished', 'confirmed', 'sending'].includes(paymentStatus) && dep.status !== 'confirmed') {
    const t = now()
    await c.env.DB.prepare('UPDATE crypto_deposits SET status="confirmed", provider_payment_id=COALESCE(provider_payment_id, ?), updated_at=? WHERE id=?')
      .bind(String(b.payment_id || b.invoice_id || ''), t, orderId).run()
    await c.env.DB.prepare('UPDATE wallets SET balance=balance+?, updated_at=? WHERE user_id=?').bind(dep.amount, t, dep.user_id).run()
    await c.env.DB.prepare('INSERT INTO wallet_transactions(id,user_id,type,amount,status,note,created_at) VALUES(?,?,?,?,?,?,?)')
      .bind(id('tx'), dep.user_id, 'deposit', dep.amount, 'completed', 'NOWPayments confirmed deposit', t).run()
    await c.env.DB.prepare('INSERT INTO user_alerts(id,user_id,type,title,body,target_url,is_read,created_at) VALUES(?,?,?,?,?,?,?,?)')
      .bind(id('al'), dep.user_id, 'payment_confirmed', 'Deposit confirmed', `Your $${dep.amount} wallet deposit is confirmed.`, '/#/wallet', 0, t).run()
  }
  return c.json({ success: true })
})
