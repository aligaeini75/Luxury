import { Hono } from 'hono'
import { id, now } from '../lib/id'
import { auth } from '../middleware/auth'
import { sendBookingEmail } from '../lib/email'
import type { Env } from '../index'

export const womanRoutes = new Hono<{ Bindings: Env; Variables: { user: any } }>()
womanRoutes.use('*', auth)

function addMinutesToDateTime(date: string, time: string, minutes: number) {
  const [hh, mm] = String(time || '00:00').split(':').map((v: string) => Number(v || 0))
  const d = new Date(`${date}T${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00`)
  d.setMinutes(d.getMinutes() + Number(minutes || 60))
  return `${date}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:00`
}

async function loadGalleries(c: any, womanId: string) {
  const galleries: any[] = (await c.env.DB.prepare(`SELECT g.*, (SELECT COUNT(*) FROM woman_gallery_media m WHERE m.gallery_id=g.id) media_count FROM woman_galleries g WHERE g.woman_id=? ORDER BY g.created_at DESC`).bind(womanId).all()).results
  for (const g of galleries) {
    g.media = (await c.env.DB.prepare('SELECT * FROM woman_gallery_media WHERE gallery_id=? ORDER BY created_at DESC').bind(g.id).all()).results
  }
  return galleries
}

womanRoutes.get('/studio', async c => {
  const u = c.get('user')
  const profile = await c.env.DB.prepare('SELECT * FROM woman_profiles WHERE user_id=?').bind(u.id).first()
  const services = (await c.env.DB.prepare('SELECT * FROM woman_services WHERE woman_id=? ORDER BY created_at DESC').bind(u.id).all()).results
  const locations = (await c.env.DB.prepare('SELECT * FROM woman_locations WHERE woman_id=? ORDER BY date DESC,time DESC').bind(u.id).all()).results
  const availability = (await c.env.DB.prepare('SELECT * FROM woman_availability WHERE woman_id=? ORDER BY date ASC,start_time ASC').bind(u.id).all()).results
  const requests = (await c.env.DB.prepare('SELECT * FROM booking_requests WHERE woman_id=? ORDER BY created_at DESC').bind(u.id).all()).results
  const gallery = await loadGalleries(c, u.id)
  const wallet:any = await c.env.DB.prepare('SELECT * FROM wallets WHERE user_id=?').bind(u.id).first()
  const pending:any = await c.env.DB.prepare('SELECT COUNT(*) c FROM booking_requests WHERE woman_id=? AND status="pending"').bind(u.id).first()
  return c.json({ profile, services, locations, availability, requests, gallery, wallet, stats:{pending_requests:pending?.c||0} })
})

womanRoutes.post('/pricing', async c => {
  const u = c.get('user'); const b:any = await c.req.json(); const t=now()
  await c.env.DB.prepare('UPDATE woman_profiles SET public_price=?, monthly_gallery_price=?, minimum_offer=?, cover_url=?, updated_at=? WHERE user_id=?')
    .bind(Number(b.public_price||0), Number(b.monthly_gallery_price||0), Number(b.minimum_offer||0), String(b.cover_url||''), t, u.id).run()
  return c.json({ success: true })
})

womanRoutes.post('/availability', async c => {
  const u=c.get('user'); const b:any=await c.req.json(); const t=now()
  const type = ['date','chat','video_call'].includes(String(b.booking_type)) ? String(b.booking_type) : 'date'
  const photos = Array.isArray(b.location_photos) ? b.location_photos : []
  const services = Array.isArray(b.services) ? b.services : []
  const price = Number(b.total_price || b.price_override || 0)
  await c.env.DB.prepare(`INSERT INTO woman_availability(
    id,woman_id,booking_type,date,start_time,end_time,duration_minutes,price_override,is_booked,
    location_title,location_hint,location_photos_json,services_json,total_price,status,created_at,updated_at
  ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .bind(id('av'),u.id,type,String(b.date||''),String(b.start_time||''),String(b.end_time||''),Number(b.duration_minutes||60),price,0,String(b.location_title||''),String(b.location_hint||''),JSON.stringify(photos),JSON.stringify(services),price,'active',t,t).run()
  return c.json({success:true, message:'تایم جدید ثبت شد.'})
})

womanRoutes.patch('/availability/:id', async c => {
  const u=c.get('user'); const avId=c.req.param('id'); const b:any=await c.req.json(); const t=now()
  const current:any = await c.env.DB.prepare('SELECT * FROM woman_availability WHERE id=? AND woman_id=?').bind(avId,u.id).first()
  if (!current) return c.json({error:'تایم پیدا نشد'},404)
  if (current.is_booked) return c.json({error:'تایم رزرو شده قابل ویرایش نیست'},409)
  const type = ['date','chat','video_call'].includes(String(b.booking_type)) ? String(b.booking_type) : String(current.booking_type || 'date')
  const photos = Array.isArray(b.location_photos) ? b.location_photos : JSON.parse(current.location_photos_json || '[]')
  const services = Array.isArray(b.services) ? b.services : JSON.parse(current.services_json || '[]')
  const price = Number(b.total_price || b.price_override || current.total_price || current.price_override || 0)
  await c.env.DB.prepare(`UPDATE woman_availability SET
    booking_type=?, date=?, start_time=?, end_time=?, duration_minutes=?, price_override=?,
    location_title=?, location_hint=?, location_photos_json=?, services_json=?, total_price=?, updated_at=?
    WHERE id=? AND woman_id=?`)
    .bind(type,String(b.date||current.date||''),String(b.start_time||current.start_time||''),String(b.end_time||current.end_time||''),Number(b.duration_minutes||current.duration_minutes||60),price,String(b.location_title ?? current.location_title ?? ''),String(b.location_hint ?? current.location_hint ?? ''),JSON.stringify(photos),JSON.stringify(services),price,t,avId,u.id).run()
  return c.json({success:true, message:'تایم ویرایش شد.'})
})

womanRoutes.delete('/availability/:id', async c => {
  const u=c.get('user'); const avId=c.req.param('id')
  const current:any = await c.env.DB.prepare('SELECT * FROM woman_availability WHERE id=? AND woman_id=?').bind(avId,u.id).first()
  if (!current) return c.json({error:'تایم پیدا نشد'},404)
  if (current.is_booked) return c.json({error:'تایم رزرو شده قابل حذف نیست'},409)
  await c.env.DB.prepare('DELETE FROM woman_availability WHERE id=? AND woman_id=?').bind(avId,u.id).run()
  return c.json({success:true, message:'تایم حذف شد.'})
})

womanRoutes.post('/galleries', async c => {
  const u = c.get('user'); const b:any = await c.req.json(); const t=now(); const gid=id('gal')
  await c.env.DB.prepare('INSERT INTO woman_galleries(id,woman_id,title,price,cover_url,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)')
    .bind(gid,u.id,String(b.title||'Monthly Private Gallery'),Number(b.price||0),String(b.cover_url||''),'active',t,t).run()
  return c.json({success:true,gallery_id:gid})
})

womanRoutes.post('/galleries/:id/media', async c => {
  const u = c.get('user'); const gid = c.req.param('id'); const b:any = await c.req.json(); const t=now()
  const gallery:any = await c.env.DB.prepare('SELECT id FROM woman_galleries WHERE id=? AND woman_id=?').bind(gid,u.id).first()
  if (!gallery) return c.json({error:'Gallery not found'},404)
  await c.env.DB.prepare('INSERT INTO woman_gallery_media(id,gallery_id,woman_id,url,type,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)')
    .bind(id('gm'),gid,u.id,String(b.url||''),String(b.type||'photo'),'active',t,t).run()
  const galleryInfo: any = await c.env.DB.prepare('SELECT title FROM woman_galleries WHERE id=?').bind(gid).first()
  const subscribers: any[] = (await c.env.DB.prepare(`SELECT DISTINCT man_id FROM woman_gallery_subscriptions WHERE gallery_id=? AND status='active' AND expires_at > ?`).bind(gid, t).all()).results as any[]
  for (const sub of subscribers) {
    await c.env.DB.prepare('INSERT INTO user_alerts(id,user_id,type,title,body,target_url,is_read,created_at) VALUES(?,?,?,?,?,?,?,?)')
      .bind(id('al'), sub.man_id, 'gallery_new_media', 'New gallery photo', `New photo added to ${galleryInfo?.title || 'a monthly gallery'}.`, '/#/man/subscriptions', 0, t).run()
  }
  return c.json({success:true, notified: subscribers.length})
})

womanRoutes.post('/gallery', async c => {
  const u = c.get('user'); const b: any = await c.req.json(); const t = now(); const gid=id('gal')
  await c.env.DB.prepare('INSERT INTO woman_galleries(id,woman_id,title,price,cover_url,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)')
    .bind(gid,u.id,String(b.title||'Monthly Private Gallery'),Number(b.price||0),String(b.url||b.cover_url||''),'active',t,t).run()
  return c.json({ success: true, gallery_id: gid })
})

womanRoutes.post('/services', async c => {
  const u=c.get('user'); const b:any=await c.req.json(); const t=now()
  await c.env.DB.prepare('INSERT INTO woman_services(id,woman_id,title,description,price,cover_url,is_active,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)')
    .bind(id('svc'),u.id,String(b.title||''),String(b.description||''),Number(b.price||0),String(b.cover_url||''),1,t,t).run()
  return c.json({success:true})
})

womanRoutes.post('/locations', async c => {
  const u=c.get('user'); const b:any=await c.req.json(); const t=now()
  await c.env.DB.prepare('INSERT INTO woman_locations(id,woman_id,title,address_hint,date,time,cover_url,price_modifier,is_active,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)')
    .bind(id('loc'),u.id,String(b.title||''),String(b.address_hint||''),String(b.date||''),String(b.time||''),String(b.cover_url||''),Number(b.price_modifier||0),1,t,t).run()
  return c.json({success:true})
})

womanRoutes.post('/requests/:id/respond', async c => {
  const u=c.get('user'); const b:any=await c.req.json(); const t=now()
  const bookingId = c.req.param('id')
  const req: any = await c.env.DB.prepare('SELECT * FROM booking_requests WHERE id=? AND woman_id=?').bind(bookingId, u.id).first()
  if (!req) return c.json({ error: 'Request not found' }, 404)
  if (!['pending','countered'].includes(String(req.status))) return c.json({ error: 'Request is already processed' }, 409)

  const status = b.action === 'accepted' ? 'accepted' : b.action === 'rejected' ? 'rejected' : 'countered'
  const counterAmount = Number(b.counterAmount || 0)
  if (status === 'countered' && counterAmount < Number(req.offer_amount || 0)) {
    return c.json({ error: `پیشنهاد جدید نمی‌تواند کمتر از پیشنهاد آقا باشد. حداقل: ${Number(req.offer_amount || 0)}` }, 400)
  }
  await c.env.DB.prepare('UPDATE booking_requests SET status=?, counter_amount=?, updated_at=? WHERE id=? AND woman_id=?').bind(status, status === 'countered' ? counterAmount : Number(req.counter_amount || 0), t, bookingId, u.id).run()

  const manUser: any = await c.env.DB.prepare('SELECT email FROM users WHERE id=?').bind(req.man_id).first()

  if (status === 'accepted') {
    await c.env.DB.prepare('UPDATE escrows SET status="funded", updated_at=? WHERE booking_id=? AND status="pending_accept"').bind(t, bookingId).run()
    await c.env.DB.prepare('UPDATE booking_requests SET escrow_status=CASE WHEN offer_amount > 0 THEN "funded" ELSE "none" END, updated_at=? WHERE id=?').bind(t, bookingId).run()
    const wp: any = await c.env.DB.prepare('SELECT * FROM woman_profiles WHERE user_id=?').bind(req.woman_id).first()
    await c.env.DB.prepare('INSERT OR IGNORE INTO chat_rooms(id,booking_id,man_id,woman_id,man_name,woman_name,man_avatar_url,woman_avatar_url,status,is_online,typing_label,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)')
      .bind(id('room'), req.id, req.man_id, req.woman_id, req.man_name, wp?.display_name || 'Private member', req.man_photo_url || '', wp?.cover_url || '', 'open', 1, '', t, t).run()
    if (req.booking_type === 'video_call') {
      await c.env.DB.prepare('INSERT OR IGNORE INTO video_sessions(id,booking_id,room_name,status,starts_at,ends_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)')
        .bind(id('vid'), req.id, `booking_${req.id}`, 'ready', `${req.date}T${req.time}:00`, addMinutesToDateTime(req.date, req.time, Number(req.duration_minutes || 60)), t, t).run()
      await sendBookingEmail(c.env, manUser?.email || '', 'call_ready', { type: req.booking_type, date: req.date, time: req.time, amount: req.offer_amount, call_url: `/#/video-call/${req.id}`, note: 'لینک ورود به ویدیوکال آماده است.' }).catch((err: any) => console.error('CALL_READY_EMAIL_FAILED', err?.message || err))
    } else {
      await sendBookingEmail(c.env, manUser?.email || '', 'accepted', { type: req.booking_type, date: req.date, time: req.time, amount: req.offer_amount, note: 'رزرو شما تایید شد و جزئیات در داشبورد قابل مشاهده است.' }).catch((err: any) => console.error('BOOKING_ACCEPT_EMAIL_FAILED', err?.message || err))
    }
    await c.env.DB.prepare('INSERT INTO user_alerts(id,user_id,type,title,body,target_url,is_read,created_at) VALUES(?,?,?,?,?,?,?,?)')
      .bind(id('al'), req.man_id, 'booking_accepted', 'درخواست تایید شد', `درخواست ${String(req.booking_type).replace('_',' ')} شما تایید شد.`, req.booking_type === 'video_call' ? '/#/man/requests' : '/#/chat', 0, t).run()
    await c.env.DB.prepare('INSERT INTO user_alerts(id,user_id,type,title,body,target_url,is_read,created_at) VALUES(?,?,?,?,?,?,?,?)')
      .bind(id('al'), req.woman_id, 'booking_accepted', 'Request accepted', `You accepted a ${String(req.booking_type).replace('_',' ')} request.`, '/#/woman/requests', 0, t).run()
  }

  if (status === 'rejected') {
    const esc: any = await c.env.DB.prepare('SELECT * FROM escrows WHERE booking_id=? AND status IN ("pending_accept","funded")').bind(bookingId).first()
    if (esc) {
      await c.env.DB.prepare('UPDATE escrows SET status="refunded", refunded_at=?, updated_at=? WHERE id=?').bind(t, t, esc.id).run()
      await c.env.DB.prepare('UPDATE wallets SET balance=balance+?, locked_balance=locked_balance-?, updated_at=? WHERE user_id=?').bind(esc.amount, esc.amount, t, esc.man_id).run()
      await c.env.DB.prepare('INSERT INTO wallet_transactions(id,user_id,type,amount,status,note,created_at) VALUES(?,?,?,?,?,?,?)')
        .bind(id('tx'), esc.man_id, 'booking_refund', esc.amount, 'completed', 'Booking request rejected refund', t).run()
    }
    await c.env.DB.prepare('UPDATE booking_requests SET escrow_status="refunded", updated_at=? WHERE id=?').bind(t, bookingId).run()
    await c.env.DB.prepare('UPDATE woman_availability SET is_booked=0, updated_at=? WHERE id=?').bind(t, req.availability_id).run()
    await c.env.DB.prepare('INSERT INTO user_alerts(id,user_id,type,title,body,target_url,is_read,created_at) VALUES(?,?,?,?,?,?,?,?)')
      .bind(id('al'), req.man_id, 'booking_rejected', 'Booking rejected', 'Your request was rejected and the held amount was refunded.', '/#/man/requests', 0, t).run()
    await sendBookingEmail(c.env, manUser?.email || '', 'rejected', { type: req.booking_type, date: req.date, time: req.time, amount: req.offer_amount, note: 'درخواست رد شد و مبلغ بلوکه‌شده در صورت وجود آزاد شد.' }).catch((err: any) => console.error('BOOKING_REJECT_EMAIL_FAILED', err?.message || err))
  }

  return c.json({success:true,status})
})
