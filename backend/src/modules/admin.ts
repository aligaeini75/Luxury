import { Hono } from 'hono'
import { now, id } from '../lib/id'
import { auth } from '../middleware/auth'
import type { Env } from '../index'
export const adminRoutes = new Hono<{ Bindings: Env; Variables: { user: any } }>()
adminRoutes.use('*', auth)
adminRoutes.use('*', async (c,next)=>{ if(c.get('user').role!=='admin') return c.json({error:'Admin only'},403); await next() })
adminRoutes.get('/overview', async c => {
  const users:any=await c.env.DB.prepare('SELECT COUNT(*) c FROM users').first()
  const locked:any=await c.env.DB.prepare('SELECT COALESCE(SUM(amount),0) c FROM escrows WHERE status="funded"').first()
  const kyc:any=await c.env.DB.prepare('SELECT COUNT(*) c FROM kyc_requests WHERE status="pending"').first()
  const risk:any=await c.env.DB.prepare('SELECT COUNT(*) c FROM risk_flags WHERE status="open"').first()
  const activity=(await c.env.DB.prepare('SELECT * FROM activity_feed ORDER BY created_at DESC LIMIT 10').all()).results
  const revenue=(await c.env.DB.prepare('SELECT * FROM revenue_daily ORDER BY day ASC LIMIT 10').all()).results
  return c.json({metrics:{users:users?.c||0,locked_escrow:locked?.c||0,pending_kyc:kyc?.c||0,risk_flags:risk?.c||0},activity,revenue})
})
adminRoutes.get('/users', async c => {
  const users = (await c.env.DB.prepare(`
    SELECT u.*,
      COALESCE(mp.display_name, wp.display_name, u.full_name, u.email) AS display_name,
      COALESCE(mp.main_photo_url, wp.cover_url, '') AS avatar_url,
      COALESCE(w.balance,0) AS balance,
      COALESCE(w.locked_balance,0) AS locked_balance,
      (SELECT COUNT(*) FROM booking_requests br WHERE br.man_id=u.id OR br.woman_id=u.id) AS booking_count
    FROM users u
    LEFT JOIN man_profiles mp ON mp.user_id=u.id
    LEFT JOIN woman_profiles wp ON wp.user_id=u.id
    LEFT JOIN wallets w ON w.user_id=u.id
    ORDER BY u.created_at DESC
  `).all()).results
  return c.json({ users })
})
adminRoutes.post('/users/:id/status', async c => { const b:any=await c.req.json(); await c.env.DB.prepare('UPDATE users SET status=?,updated_at=? WHERE id=?').bind(String(b.status||'active'),now(),c.req.param('id')).run(); return c.json({success:true}) })
adminRoutes.get('/wallets', async c => c.json({
  wallets:(await c.env.DB.prepare(`SELECT w.*,u.email,u.full_name,u.role,u.status,u.verified,
    COALESCE(mp.main_photo_url, wp.cover_url, '') AS avatar_url,
    COALESCE(mp.display_name, wp.display_name, u.full_name, u.email) AS display_name
    FROM wallets w
    JOIN users u ON u.id=w.user_id
    LEFT JOIN man_profiles mp ON mp.user_id=u.id
    LEFT JOIN woman_profiles wp ON wp.user_id=u.id
    ORDER BY w.updated_at DESC`).all()).results,
  deposits:(await c.env.DB.prepare(`SELECT d.*,u.email,u.full_name,u.role,
    COALESCE(mp.main_photo_url, wp.cover_url, '') AS avatar_url,
    COALESCE(mp.display_name, wp.display_name, u.full_name, u.email) AS display_name
    FROM crypto_deposits d
    JOIN users u ON u.id=d.user_id
    LEFT JOIN man_profiles mp ON mp.user_id=u.id
    LEFT JOIN woman_profiles wp ON wp.user_id=u.id
    ORDER BY d.created_at DESC`).all()).results,
  withdrawals:(await c.env.DB.prepare(`SELECT wd.*,u.email,u.full_name,u.role,
    COALESCE(mp.main_photo_url, wp.cover_url, '') AS avatar_url,
    COALESCE(mp.display_name, wp.display_name, u.full_name, u.email) AS display_name
    FROM withdrawals wd
    JOIN users u ON u.id=wd.user_id
    LEFT JOIN man_profiles mp ON mp.user_id=u.id
    LEFT JOIN woman_profiles wp ON wp.user_id=u.id
    ORDER BY wd.created_at DESC`).all()).results,
  escrows:(await c.env.DB.prepare(`SELECT e.*, 
    mu.email AS man_email, wu.email AS woman_email,
    COALESCE(mp.main_photo_url,'') AS man_avatar_url,
    COALESCE(wp.cover_url,'') AS woman_avatar_url,
    COALESCE(mp.display_name, mu.full_name, mu.email) AS man_name,
    COALESCE(wp.display_name, wu.full_name, wu.email) AS woman_name
    FROM escrows e
    LEFT JOIN users mu ON mu.id=e.man_id
    LEFT JOIN users wu ON wu.id=e.woman_id
    LEFT JOIN man_profiles mp ON mp.user_id=e.man_id
    LEFT JOIN woman_profiles wp ON wp.user_id=e.woman_id
    ORDER BY e.created_at DESC`).all()).results
}))

adminRoutes.post('/deposits/:id/mark-paid', async c => {
  const dep:any=await c.env.DB.prepare('SELECT * FROM crypto_deposits WHERE id=?').bind(c.req.param('id')).first(); if(!dep)return c.json({error:'Not found'},404)
  if (dep.status === 'confirmed') return c.json({success:true, already_confirmed:true})
  const t=now()
  await c.env.DB.prepare('UPDATE crypto_deposits SET status="confirmed", updated_at=? WHERE id=?').bind(t,dep.id).run()
  await c.env.DB.prepare('UPDATE wallets SET balance=balance+?, updated_at=? WHERE user_id=?').bind(dep.amount,t,dep.user_id).run()
  await c.env.DB.prepare('INSERT INTO wallet_transactions(id,user_id,type,amount,status,note,created_at) VALUES(?,?,?,?,?,?,?)').bind(id('tx'),dep.user_id,'manual_deposit',dep.amount,'completed','Admin marked deposit as paid',t).run()
  await c.env.DB.prepare('INSERT INTO user_alerts(id,user_id,type,title,body,target_url,is_read,created_at) VALUES(?,?,?,?,?,?,?,?)').bind(id('al'),dep.user_id,'payment_confirmed','Deposit confirmed',`Admin confirmed your $${dep.amount} deposit.`,'/#/wallet',0,t).run()
  return c.json({success:true})
})
adminRoutes.post('/withdrawals/:id/approve', async c => { const wd:any=await c.env.DB.prepare('SELECT * FROM withdrawals WHERE id=?').bind(c.req.param('id')).first(); if(!wd)return c.json({error:'Not found'},404); await c.env.DB.prepare('UPDATE withdrawals SET status="approved",updated_at=? WHERE id=?').bind(now(),wd.id).run(); await c.env.DB.prepare('UPDATE wallets SET locked_balance=locked_balance-?,updated_at=? WHERE user_id=?').bind(wd.amount,now(),wd.user_id).run(); return c.json({success:true}) })
adminRoutes.post('/withdrawals/:id/reject', async c => { const wd:any=await c.env.DB.prepare('SELECT * FROM withdrawals WHERE id=?').bind(c.req.param('id')).first(); if(!wd)return c.json({error:'Not found'},404); await c.env.DB.prepare('UPDATE withdrawals SET status="rejected",updated_at=? WHERE id=?').bind(now(),wd.id).run(); await c.env.DB.prepare('UPDATE wallets SET balance=balance+?,locked_balance=locked_balance-?,updated_at=? WHERE user_id=?').bind(wd.amount,wd.amount,now(),wd.user_id).run(); return c.json({success:true}) })
adminRoutes.post('/escrows/:id/release', async c => {
  const esc:any=await c.env.DB.prepare('SELECT * FROM escrows WHERE id=?').bind(c.req.param('id')).first(); if(!esc)return c.json({error:'Not found'},404)
  if (esc.status === 'released') return c.json({success:true, already_released:true})
  const t=now(); const feePercent=Number(c.env.PLATFORM_FEE_PERCENT||20); const fee=Number((Number(esc.amount||0)*feePercent/100).toFixed(2)); const net=Number((Number(esc.amount||0)-fee).toFixed(2))
  await c.env.DB.prepare('UPDATE escrows SET status="released",released_at=?,updated_at=? WHERE id=?').bind(t,t,esc.id).run()
  await c.env.DB.prepare('UPDATE wallets SET locked_balance=locked_balance-?,updated_at=? WHERE user_id=?').bind(esc.amount,t,esc.man_id).run()
  await c.env.DB.prepare('UPDATE wallets SET balance=balance+?,updated_at=? WHERE user_id=?').bind(net,t,esc.woman_id).run()
  await c.env.DB.prepare('INSERT INTO wallet_transactions(id,user_id,type,amount,status,note,created_at) VALUES(?,?,?,?,?,?,?)').bind(id('tx'),esc.woman_id,'booking_payout',net,'completed',`Booking payout after ${feePercent}% platform fee`,t).run()
  if (fee>0) await c.env.DB.prepare('INSERT INTO platform_fees(id,escrow_id,amount,fee_percent,created_at) VALUES(?,?,?,?,?)').bind(id('fee'),esc.id,fee,feePercent,t).run()
  await c.env.DB.prepare('UPDATE booking_requests SET status="completed", escrow_status="released", updated_at=? WHERE id=?').bind(t,esc.booking_id).run()
  await c.env.DB.prepare('INSERT INTO user_alerts(id,user_id,type,title,body,target_url,is_read,created_at) VALUES(?,?,?,?,?,?,?,?)').bind(id('al'),esc.woman_id,'booking_payout','Booking payout released',`Net payout credited: $${net}.`,'/#/woman/wallet',0,t).run()
  return c.json({success:true,net,platform_fee:fee})
})
adminRoutes.post('/escrows/:id/refund', async c => { const esc:any=await c.env.DB.prepare('SELECT * FROM escrows WHERE id=?').bind(c.req.param('id')).first(); if(!esc)return c.json({error:'Not found'},404); const t=now(); await c.env.DB.prepare('UPDATE escrows SET status="refunded",refunded_at=?,updated_at=? WHERE id=?').bind(t,t,esc.id).run(); await c.env.DB.prepare('UPDATE wallets SET balance=balance+?,locked_balance=locked_balance-?,updated_at=? WHERE user_id=?').bind(esc.amount,esc.amount,t,esc.man_id).run(); await c.env.DB.prepare('UPDATE booking_requests SET status="cancelled", escrow_status="refunded", updated_at=? WHERE id=?').bind(t,esc.booking_id).run(); await c.env.DB.prepare('INSERT INTO wallet_transactions(id,user_id,type,amount,status,note,created_at) VALUES(?,?,?,?,?,?,?)').bind(id('tx'),esc.man_id,'booking_refund',esc.amount,'completed','Admin refunded escrow',t).run(); return c.json({success:true}) })
adminRoutes.get('/bookings', async c => {
  const bookings = (await c.env.DB.prepare(`
    SELECT br.*,
      mu.email AS man_email, wu.email AS woman_email,
      COALESCE(mp.display_name, mu.full_name, mu.email) AS man_name,
      COALESCE(wp.display_name, wu.full_name, wu.email) AS woman_name,
      COALESCE(mp.main_photo_url,'') AS man_avatar_url,
      COALESCE(wp.cover_url,'') AS woman_avatar_url,
      wa.start_time, wa.end_time, wa.location_title, wa.location_hint, wa.location_photos_json, wa.services_json, wa.total_price
    FROM booking_requests br
    LEFT JOIN users mu ON mu.id=br.man_id
    LEFT JOIN users wu ON wu.id=br.woman_id
    LEFT JOIN man_profiles mp ON mp.user_id=br.man_id
    LEFT JOIN woman_profiles wp ON wp.user_id=br.woman_id
    LEFT JOIN woman_availability wa ON wa.id=br.availability_id
    ORDER BY br.created_at DESC
  `).all()).results
  return c.json({ bookings })
})
adminRoutes.get('/kyc', async c => {
  const kyc = (await c.env.DB.prepare(`
    SELECT k.*, u.email AS user_email, u.email, u.full_name, u.role, u.status AS user_status, u.verified,
           COALESCE(mp.main_photo_url, wp.cover_url, '') AS avatar_url,
           COALESCE(mp.display_name, wp.display_name, u.full_name, u.email) AS display_name
    FROM kyc_requests k
    JOIN users u ON u.id=k.user_id
    LEFT JOIN man_profiles mp ON mp.user_id=u.id
    LEFT JOIN woman_profiles wp ON wp.user_id=u.id
    ORDER BY k.created_at DESC
  `).all()).results
  return c.json({ kyc })
})
adminRoutes.post('/kyc/:id/review', async c => {
  const b:any=await c.req.json()
  const status = b.status === 'approved' ? 'approved' : 'rejected'
  const row:any = await c.env.DB.prepare('SELECT * FROM kyc_requests WHERE id=?').bind(c.req.param('id')).first()
  if (!row) return c.json({error:'درخواست پیدا نشد'},404)
  await c.env.DB.prepare('UPDATE kyc_requests SET status=?,admin_note=?,reviewed_at=?,updated_at=? WHERE id=?')
    .bind(status,String(b.note||''),now(),now(),row.id).run()
  if (status === 'approved') await c.env.DB.prepare('UPDATE users SET verified=1, updated_at=? WHERE id=?').bind(now(),row.user_id).run()
  await c.env.DB.prepare('INSERT INTO user_alerts(id,user_id,type,title,body,target_url,is_read,created_at) VALUES(?,?,?,?,?,?,0,?)')
    .bind(id('al'), row.user_id, 'kyc_reviewed', status === 'approved' ? 'احراز هویت تایید شد' : 'احراز هویت رد شد', String(b.note || ''), '/#/man/profile', now()).run().catch(()=>{})
  return c.json({success:true, message: status === 'approved' ? 'احراز هویت تایید شد.' : 'احراز هویت رد شد.'})
})
adminRoutes.get('/media', async c => c.json({media:(await c.env.DB.prepare('SELECT m.*,u.email owner_email FROM media_items m JOIN users u ON u.id=m.user_id ORDER BY m.created_at DESC').all()).results}))
adminRoutes.post('/media/:id/moderate', async c => { const b:any=await c.req.json(); await c.env.DB.prepare('UPDATE media_items SET status=?,updated_at=? WHERE id=?').bind(String(b.status||'pending'),now(),c.req.param('id')).run(); return c.json({success:true}) })
adminRoutes.get('/tickets', async c => {
  const tickets = (await c.env.DB.prepare(`
    SELECT t.*,
      u.email AS user_email, u.full_name, u.role, u.mobile, u.ticket_locked,
      COALESCE(mp.display_name, wp.display_name, u.full_name, u.email) AS display_name,
      COALESCE(mp.main_photo_url, wp.cover_url, '') AS avatar_url,
      (SELECT body FROM ticket_messages tm WHERE tm.ticket_id=t.id ORDER BY tm.created_at DESC LIMIT 1) AS last_message
    FROM tickets t
    LEFT JOIN users u ON u.id=t.user_id
    LEFT JOIN man_profiles mp ON mp.user_id=t.user_id
    LEFT JOIN woman_profiles wp ON wp.user_id=t.user_id
    ORDER BY t.updated_at DESC
  `).all()).results
  return c.json({ tickets })
})
adminRoutes.post('/tickets/:id/reply', async c => { const b:any=await c.req.json(); const t=now(); await c.env.DB.prepare('INSERT INTO ticket_messages(id,ticket_id,sender_id,message,created_at) VALUES(?,?,?,?,?)').bind(id('tm'),c.req.param('id'),'admin',String(b.message||''),t).run(); await c.env.DB.prepare('UPDATE tickets SET status="answered",updated_at=? WHERE id=?').bind(t,c.req.param('id')).run(); return c.json({success:true}) })

adminRoutes.post('/tickets/:id/status', async c => {
  const b:any = await c.req.json()
  const status = ['open','answered','closed'].includes(String(b.status)) ? String(b.status) : 'open'
  await c.env.DB.prepare('UPDATE tickets SET status=?, updated_at=? WHERE id=?').bind(status, now(), c.req.param('id')).run()
  return c.json({success:true, message: status === 'closed' ? 'تیکت بسته شد.' : 'وضعیت تیکت تغییر کرد.'})
})

adminRoutes.get('/risk', async c => c.json({risk:(await c.env.DB.prepare('SELECT * FROM risk_flags ORDER BY created_at DESC').all()).results}))

adminRoutes.get('/audit-logs', async c => c.json({ logs: (await c.env.DB.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100').all()).results }))
adminRoutes.get('/disputes', async c => c.json({ disputes: (await c.env.DB.prepare('SELECT * FROM escrow_disputes ORDER BY created_at DESC LIMIT 100').all()).results }))
adminRoutes.get('/provider-settings', async c => c.json({ settings: (await c.env.DB.prepare('SELECT key,value,is_secret,updated_at FROM provider_settings ORDER BY key ASC').all()).results }))
adminRoutes.post('/provider-settings', async c => { const b:any=await c.req.json(); await c.env.DB.prepare('INSERT OR REPLACE INTO provider_settings(key,value,is_secret,updated_at) VALUES(?,?,?,?)').bind(String(b.key||''),String(b.value||''),Number(b.is_secret||0),now()).run(); return c.json({success:true}) })
adminRoutes.get('/wallet-monitor', async c => c.json({ rows: (await c.env.DB.prepare(`SELECT w.*, u.email, u.role, (SELECT COUNT(*) FROM crypto_deposits d WHERE d.user_id=w.user_id) deposits, (SELECT COUNT(*) FROM withdrawals wd WHERE wd.user_id=w.user_id) withdrawals FROM wallets w JOIN users u ON u.id=w.user_id ORDER BY w.updated_at DESC`).all()).results }))
adminRoutes.get('/monitoring', async c => { const users:any=await c.env.DB.prepare('SELECT COUNT(*) c FROM users').first(); const bookings:any=await c.env.DB.prepare('SELECT COUNT(*) c FROM booking_requests').first(); return c.json({ metrics:{ users:users?.c||0, bookings:bookings?.c||0 }, errors: (await c.env.DB.prepare('SELECT * FROM app_errors ORDER BY created_at DESC LIMIT 20').all()).results }) })
adminRoutes.get('/users/:id', async c => {
  const userId = c.req.param('id')
  const user = await c.env.DB.prepare('SELECT id,email,full_name,role,status,verified,created_at FROM users WHERE id=?').bind(userId).first()
  const wallet = await c.env.DB.prepare('SELECT * FROM wallets WHERE user_id=?').bind(userId).first()
  const escrows = (await c.env.DB.prepare('SELECT * FROM escrows WHERE man_id=? OR woman_id=? ORDER BY created_at DESC').bind(userId,userId).all()).results
  const risk = (await c.env.DB.prepare('SELECT * FROM risk_flags WHERE user_id=? ORDER BY created_at DESC').bind(userId).all()).results
  return c.json({ user, wallet, escrows, risk })
})
adminRoutes.post('/users/:id/revoke-sessions', async c => { await c.env.DB.prepare('UPDATE sessions SET revoked_at=?, updated_at=? WHERE user_id=? AND revoked_at IS NULL').bind(now(),now(),c.req.param('id')).run(); return c.json({success:true}) })
adminRoutes.get('/rate-limits', async c => c.json({ items: (await c.env.DB.prepare('SELECT * FROM rate_limits ORDER BY updated_at DESC LIMIT 100').all()).results }))
adminRoutes.post('/disputes/:id/decide', async c => { const b:any=await c.req.json(); await c.env.DB.prepare('UPDATE escrow_disputes SET status="resolved", resolution=?, updated_at=? WHERE id=?').bind(String(b.action||'resolved'),now(),c.req.param('id')).run(); return c.json({success:true}) })

adminRoutes.post('/users/:id/ticket-lock', async c => {
  const b:any = await c.req.json()
  const ticketLocked = b.ticket_locked ? 1 : 0
  await c.env.DB.prepare('UPDATE users SET ticket_locked=?, updated_at=? WHERE id=?').bind(ticketLocked, now(), c.req.param('id')).run()
  return c.json({ success:true, message: ticketLocked ? 'ثبت تیکت برای کاربر بسته شد.' : 'ثبت تیکت برای کاربر باز شد.' })
})
