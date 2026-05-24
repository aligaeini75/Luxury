import { Hono } from 'hono'
import { id, now } from '../lib/id'
import { auth } from '../middleware/auth'
import type { Env } from '../index'
import { createNowPaymentsInvoice } from '../lib/providers'


async function autoReleaseMaturedEscrows(c: any, userId: string) {
  // آزادسازی خودکار پول بعد از پایان زمان رزرو؛ اگر مشکلی باشد مرد باید تیکت/اختلاف ثبت کند.
  const matured = (await c.env.DB.prepare(`
    SELECT e.*, br.date, br.time, br.duration_minutes, br.booking_type, br.status AS booking_status
    FROM escrows e
    JOIN booking_requests br ON br.id = e.booking_id
    WHERE e.status IN ('funded','pending_accept','locked')
      AND (e.man_id = ? OR e.woman_id = ?)
      AND br.status = 'accepted'
      AND datetime(br.date || 'T' || br.time || ':00', '+' || COALESCE(br.duration_minutes,60) || ' minutes') <= datetime('now')
    LIMIT 25
  `).bind(userId, userId).all().catch(() => ({ results: [] }))).results || []

  for (const e of matured as any[]) {
    const amount = Number(e.amount || e.booking_amount || 0)
    if (!amount || !e.woman_id) continue

    await c.env.DB.prepare(`UPDATE escrows SET status='released', released_at=datetime('now'), updated_at=datetime('now') WHERE id=? AND status!='released'`).bind(e.id).run().catch(() => {})
    await c.env.DB.prepare(`UPDATE booking_requests SET escrow_status='released', status='completed', updated_at=datetime('now') WHERE id=?`).bind(e.booking_id).run().catch(() => {})
    await c.env.DB.prepare(`UPDATE wallets SET balance=balance+?, updated_at=datetime('now') WHERE user_id=?`).bind(amount, e.woman_id).run().catch(() => {})
    await c.env.DB.prepare(`
      INSERT INTO wallet_transactions(id,user_id,type,amount,description,created_at)
      VALUES(?,?,?,?,?,datetime('now'))
    `).bind(crypto.randomUUID(), e.woman_id, 'escrow_release', amount, 'آزادسازی خودکار مبلغ رزرو پس از پایان زمان جلسه').run().catch(() => {})
  }

  return matured.length
}


export const walletRoutes = new Hono<{ Bindings: Env; Variables: { user: any } }>()
walletRoutes.use('*', auth)

walletRoutes.get('/me', async c => {
  const u=c.get('user')
  await autoReleaseMaturedEscrows(c, u.id).catch(() => {})
  const wallet = await c.env.DB.prepare('SELECT * FROM wallets WHERE user_id=?').bind(u.id).first()
  const transactions=(await c.env.DB.prepare('SELECT * FROM wallet_transactions WHERE user_id=? ORDER BY created_at DESC').bind(u.id).all()).results
  const deposits=(await c.env.DB.prepare('SELECT * FROM crypto_deposits WHERE user_id=? ORDER BY created_at DESC').bind(u.id).all()).results
  const withdrawals=(await c.env.DB.prepare('SELECT * FROM withdrawals WHERE user_id=? ORDER BY created_at DESC').bind(u.id).all()).results
  const escrows=(await c.env.DB.prepare('SELECT * FROM escrows WHERE man_id=? OR woman_id=? ORDER BY created_at DESC').bind(u.id,u.id).all()).results
  return c.json({wallet,transactions,deposits,withdrawals,escrows})
})

walletRoutes.post('/deposits', async c => {
  const u=c.get('user'); const b:any=await c.req.json(); const t=now(); const amount=Number(b.amount||0)
  if(amount<=0)return c.json({error:'مبلغ نامعتبر است'},400)
  const depositId = id('dep')
  await c.env.DB.prepare('INSERT INTO crypto_deposits(id,user_id,amount,network,deposit_address,provider,provider_payment_id,provider_payment_url,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)')
    .bind(depositId,u.id,amount,'IR_BANK','درگاه بانکی ایران','iran_bank',depositId,'','pending',t,t).run()
  return c.json({success:true,deposit_id:depositId,status:'pending',message:'درخواست پرداخت بانکی ثبت شد. اطلاعات درگاه بعداً متصل می‌شود.'})
})

walletRoutes.post('/withdrawals', async c => {
  const u=c.get('user'); const b:any=await c.req.json(); const amount=Number(b.amount||0); const t=now()
  const wallet:any=await c.env.DB.prepare('SELECT * FROM wallets WHERE user_id=?').bind(u.id).first()
  if(amount<=0||Number(wallet.balance||0)<amount)return c.json({error:'Insufficient balance'},400)
  await c.env.DB.prepare('UPDATE wallets SET balance=balance-?,locked_balance=locked_balance+?,updated_at=? WHERE user_id=?').bind(amount,amount,t,u.id).run()
  await c.env.DB.prepare('INSERT INTO withdrawals(id,user_id,amount,payout_address,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?)').bind(id('wd'),u.id,amount,String(b.card_number||b.payout_address||''),'pending',t,t).run()
  return c.json({success:true})
})

walletRoutes.post('/escrows', async c => {
  const u=c.get('user'); const b:any=await c.req.json(); const amount=Number(b.amount||0); const t=now()
  const wallet:any=await c.env.DB.prepare('SELECT * FROM wallets WHERE user_id=?').bind(u.id).first()
  if(amount<=0||Number(wallet.balance||0)<amount)return c.json({error:'Insufficient balance'},400)
  await c.env.DB.prepare('UPDATE wallets SET balance=balance-?,locked_balance=locked_balance+?,updated_at=? WHERE user_id=?').bind(amount,amount,t,u.id).run()
  await c.env.DB.prepare('INSERT INTO escrows(id,booking_id,man_id,woman_id,amount,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)').bind(id('esc'),String(b.booking_id||id('book')),u.id,String(b.woman_id||''),amount,'funded',t,t).run()
  return c.json({success:true})
})
