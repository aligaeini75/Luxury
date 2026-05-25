import { Hono } from 'hono'
import { id, now } from '../lib/id'
import { auth } from '../middleware/auth'
import { sendBookingEmail } from '../lib/email'
import type { Env } from '../index'

export const manRoutes = new Hono<{ Bindings: Env; Variables: { user: any } }>()
manRoutes.use('*', auth)

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

async function loadWomanProfileForMan(c: any, womanIdOrProfileId: string, manId: string) {
  const profile: any = await c.env.DB.prepare('SELECT * FROM woman_profiles WHERE user_id=? OR id=?').bind(womanIdOrProfileId, womanIdOrProfileId).first()
  if (!profile) return null
  const t = now()
  const today = todayISO()
  const galleries: any[] = (await c.env.DB.prepare(`SELECT g.*, (SELECT COUNT(*) FROM woman_gallery_media m WHERE m.gallery_id=g.id) media_count FROM woman_galleries g WHERE g.woman_id=? AND g.status='active' ORDER BY g.created_at DESC`).bind(profile.user_id).all()).results as any[]
  for (const g of galleries) {
    const sub: any = await c.env.DB.prepare(`SELECT * FROM woman_gallery_subscriptions WHERE gallery_id=? AND man_id=? AND status='active' AND expires_at > ? ORDER BY expires_at DESC LIMIT 1`).bind(g.id, manId, t).first()
    g.is_subscribed = !!sub
    g.subscription_expires_at = sub?.expires_at || ''
    g.media = sub ? (await c.env.DB.prepare('SELECT * FROM woman_gallery_media WHERE gallery_id=? AND status="active" ORDER BY created_at DESC').bind(g.id).all()).results : []
  }
  const services = (await c.env.DB.prepare('SELECT * FROM woman_services WHERE woman_id=? AND is_active=1 ORDER BY created_at DESC').bind(profile.user_id).all()).results
  const locations = (await c.env.DB.prepare('SELECT * FROM woman_locations WHERE woman_id=? AND is_active=1 ORDER BY date DESC').bind(profile.user_id).all()).results
  const availability = (await c.env.DB.prepare(`
    SELECT * FROM woman_availability
    WHERE woman_id=?
      AND is_booked=0
      AND date >= ?
      AND COALESCE(status, 'active')='active'
    ORDER BY date ASC,start_time ASC
  `).bind(profile.user_id, today).all()).results
  return { profile, gallery: galleries, services, locations, availability }
}

manRoutes.get('/profile', async c => {
  const u = c.get('user')
  const profile = await c.env.DB.prepare('SELECT * FROM man_profiles WHERE user_id=?').bind(u.id).first()
  const gallery = (await c.env.DB.prepare('SELECT * FROM man_gallery WHERE user_id=? ORDER BY created_at DESC').bind(u.id).all()).results
  const interests = (await c.env.DB.prepare('SELECT * FROM man_interests WHERE user_id=? ORDER BY created_at DESC').bind(u.id).all()).results
  return c.json({ profile, gallery, interests })
})

manRoutes.post('/profile', async c => {
  const u = c.get('user'); const b: any = await c.req.json(); const t = now()
  const existing = await c.env.DB.prepare('SELECT id FROM man_profiles WHERE user_id=?').bind(u.id).first()
  if (existing) {
    await c.env.DB.prepare('UPDATE man_profiles SET display_name=?, bio=?, main_photo_url=?, voice_intro_url=?, video_intro_url=?, date_note=?, updated_at=? WHERE user_id=?')
      .bind(String(b.display_name||''), String(b.bio||''), String(b.main_photo_url||''), String(b.voice_intro_url||''), String(b.video_intro_url||''), String(b.date_note||''), t, u.id).run()
  } else {
    await c.env.DB.prepare('INSERT INTO man_profiles(id,user_id,display_name,bio,main_photo_url,voice_intro_url,video_intro_url,date_note,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)')
      .bind(id('mp'), u.id, String(b.display_name||''), String(b.bio||''), String(b.main_photo_url||''), String(b.voice_intro_url||''), String(b.video_intro_url||''), String(b.date_note||''), t, t).run()
  }
  return c.json({ success: true })
})

manRoutes.post('/gallery', async c => {
  const u = c.get('user'); const b:any = await c.req.json(); const t = now()
  await c.env.DB.prepare('INSERT INTO man_gallery(id,user_id,url,type,is_main,created_at,updated_at) VALUES(?,?,?,?,?,?,?)')
    .bind(id('mg'), u.id, String(b.url||''), String(b.type||'photo'), 0, t, t).run()
  return c.json({ success: true })
})

manRoutes.post('/gallery/:id/main', async c => {
  const u = c.get('user'); const mediaId = c.req.param('id')
  await c.env.DB.prepare('UPDATE man_gallery SET is_main=0 WHERE user_id=?').bind(u.id).run()
  await c.env.DB.prepare('UPDATE man_gallery SET is_main=1 WHERE user_id=? AND id=?').bind(u.id, mediaId).run()
  const row:any = await c.env.DB.prepare('SELECT url FROM man_gallery WHERE id=?').bind(mediaId).first()
  if (row?.url) await c.env.DB.prepare('UPDATE man_profiles SET main_photo_url=?, updated_at=? WHERE user_id=?').bind(row.url, now(), u.id).run()
  return c.json({ success: true })
})

manRoutes.post('/interests', async c => {
  const u = c.get('user'); const b:any = await c.req.json(); const t=now()
  await c.env.DB.prepare('DELETE FROM man_interests WHERE user_id=? AND scope="general"').bind(u.id).run()
  for (const item of Array.isArray(b.items) ? b.items : []) {
    await c.env.DB.prepare('INSERT INTO man_interests(id,user_id,key,title,scope,created_at) VALUES(?,?,?,?,?,?)')
      .bind(id('mi'), u.id, String(item.key), String(item.title || item.key), 'general', t).run()
  }
  return c.json({ success: true })
})

manRoutes.get('/women', async c => {
  const today = todayISO()
  const women = (await c.env.DB.prepare(`
    SELECT wp.*, (
      SELECT COUNT(*) FROM woman_availability av
      WHERE av.woman_id=wp.user_id
        AND av.is_booked=0
        AND av.date >= ?
        AND COALESCE(av.status, 'active')='active'
    ) open_slots
    FROM woman_profiles wp
    WHERE wp.is_active=1
    ORDER BY wp.verified DESC, open_slots DESC, wp.public_price DESC
  `).bind(today).all()).results
  return c.json({ women })
})

manRoutes.get('/requests', async c => {
  const u = c.get('user')
  const requests = (await c.env.DB.prepare('SELECT * FROM booking_requests WHERE man_id=? ORDER BY created_at DESC').bind(u.id).all()).results
  return c.json({ requests })
})

manRoutes.get('/women/:id', async c => {
  const u = c.get('user')
  const data = await loadWomanProfileForMan(c, c.req.param('id'), u.id)
  if (!data) return c.json({ error: 'Profile not found' }, 404)
  return c.json(data)
})

manRoutes.get('/alerts', async c => {
  const u = c.get('user')
  const alerts = (await c.env.DB.prepare('SELECT * FROM user_alerts WHERE user_id=? ORDER BY created_at DESC LIMIT 50').bind(u.id).all()).results
  return c.json({ alerts })
})

manRoutes.post('/alerts/:id/read', async c => {
  const u = c.get('user')
  await c.env.DB.prepare('UPDATE user_alerts SET is_read=1 WHERE id=? AND user_id=?').bind(c.req.param('id'), u.id).run()
  return c.json({ success: true })
})

manRoutes.get('/gallery-subscriptions', async c => {
  const u = c.get('user')
  const t = now()
  const subscriptions: any[] = (await c.env.DB.prepare(`SELECT s.*, g.title, g.cover_url, g.price, wp.display_name, wp.cover_url AS woman_cover_url
    FROM woman_gallery_subscriptions s
    JOIN woman_galleries g ON g.id=s.gallery_id
    JOIN woman_profiles wp ON wp.user_id=s.woman_id
    WHERE s.man_id=? AND s.status='active' AND s.expires_at > ?
    ORDER BY s.expires_at DESC`).bind(u.id, t).all()).results as any[]
  for (const sub of subscriptions) {
    sub.media = (await c.env.DB.prepare('SELECT * FROM woman_gallery_media WHERE gallery_id=? AND status="active" ORDER BY created_at DESC').bind(sub.gallery_id).all()).results
  }
  return c.json({ subscriptions })
})

manRoutes.post('/galleries/:id/subscribe', async c => {
  const u = c.get('user')
  const galleryId = c.req.param('id')
  const t = now()
  const gallery: any = await c.env.DB.prepare('SELECT * FROM woman_galleries WHERE id=? AND status="active"').bind(galleryId).first()
  if (!gallery) return c.json({ error: 'Gallery not found' }, 404)
  const active: any = await c.env.DB.prepare(`SELECT * FROM woman_gallery_subscriptions WHERE gallery_id=? AND man_id=? AND status='active' AND expires_at > ? ORDER BY expires_at DESC LIMIT 1`).bind(galleryId, u.id, t).first()
  if (active) return c.json({ success: true, already_active: true, subscription: active })
  const amount = Number(gallery.price || 0)
  const wallet: any = await c.env.DB.prepare('SELECT * FROM wallets WHERE user_id=?').bind(u.id).first()
  if (amount > 0 && Number(wallet?.balance || 0) < amount) return c.json({ error: 'Insufficient wallet balance', required: amount, balance: Number(wallet?.balance || 0) }, 402)
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  if (amount > 0) {
    await c.env.DB.prepare('UPDATE wallets SET balance=balance-?, updated_at=? WHERE user_id=?').bind(amount, t, u.id).run()
    await c.env.DB.prepare('INSERT INTO wallet_transactions(id,user_id,type,amount,status,note,created_at) VALUES(?,?,?,?,?,?,?)')
      .bind(id('tx'), u.id, 'gallery_subscription', -amount, 'completed', `Monthly gallery subscription: ${gallery.title}`, t).run()
  }
  const sid = id('sub')
  await c.env.DB.prepare('INSERT INTO woman_gallery_subscriptions(id,gallery_id,woman_id,man_id,amount,status,starts_at,expires_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)')
    .bind(sid, gallery.id, gallery.woman_id, u.id, amount, 'active', t, expires, t, t).run()

  const feePercent = Number(c.env.PLATFORM_FEE_PERCENT || 20)
  const fee = amount > 0 ? Number((amount * feePercent / 100).toFixed(2)) : 0
  const creatorNet = Number((amount - fee).toFixed(2))
  if (creatorNet > 0) {
    await c.env.DB.prepare('UPDATE wallets SET balance=balance+?, updated_at=? WHERE user_id=?').bind(creatorNet, t, gallery.woman_id).run()
    await c.env.DB.prepare('INSERT INTO wallet_transactions(id,user_id,type,amount,status,note,created_at) VALUES(?,?,?,?,?,?,?)')
      .bind(id('tx'), gallery.woman_id, 'gallery_sale', creatorNet, 'completed', `Creator net from monthly gallery: ${gallery.title}`, t).run()
  }
  if (fee > 0) {
    await c.env.DB.prepare('INSERT INTO platform_fees(id,escrow_id,amount,fee_percent,created_at) VALUES(?,?,?,?,?)')
      .bind(id('fee'), sid, fee, feePercent, t).run()
  }

  await c.env.DB.prepare('INSERT INTO user_alerts(id,user_id,type,title,body,target_url,is_read,created_at) VALUES(?,?,?,?,?,?,?,?)')
    .bind(id('al'), u.id, 'gallery_unlocked', 'Gallery unlocked', `Your monthly access to ${gallery.title} is active.`, '/#/man/subscriptions', 0, t).run()
  await c.env.DB.prepare('INSERT INTO user_alerts(id,user_id,type,title,body,target_url,is_read,created_at) VALUES(?,?,?,?,?,?,?,?)')
    .bind(id('al'), gallery.woman_id, 'gallery_sale', 'New gallery subscriber', `A member subscribed to ${gallery.title}. Net credited: $${creatorNet}.`, '/#/woman/wallet', 0, t).run()
  return c.json({ success: true, subscription_id: sid, expires_at: expires, creator_net: creatorNet, platform_fee: fee })
})

manRoutes.post('/requests', async c => {
  const u = c.get('user'); const b:any = await c.req.json(); const t=now()
  const type = ['date','chat','video_call'].includes(String(b.booking_type)) ? String(b.booking_type) : 'date'
  const today = todayISO()
  const slot:any = b.availability_id ? await c.env.DB.prepare(`
    SELECT * FROM woman_availability
    WHERE id=?
      AND woman_id=?
      AND is_booked=0
      AND date >= ?
      AND COALESCE(status, 'active')='active'
  `).bind(String(b.availability_id), String(b.woman_id), today).first() : null
  if (!slot) return c.json({ error: 'Selected slot is not available anymore' }, 409)
  const amount = Number(b.offer_amount || slot.total_price || slot.price_override || 0)
  const wallet: any = await c.env.DB.prepare('SELECT * FROM wallets WHERE user_id=?').bind(u.id).first()
  if (amount > 0 && Number(wallet?.balance || 0) < amount) return c.json({ error: 'Insufficient wallet balance for this request', required: amount, balance: Number(wallet?.balance || 0) }, 402)

  const mp:any = await c.env.DB.prepare('SELECT * FROM man_profiles WHERE user_id=?').bind(u.id).first()
  const reqId = id('br')
  await c.env.DB.prepare(`INSERT INTO booking_requests(id,woman_id,man_id,availability_id,booking_type,man_name,man_photo_url,man_note,date,time,duration_minutes,offer_amount,message,status,escrow_status,quality_score,created_at,updated_at)
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .bind(reqId, String(b.woman_id), u.id, String(slot.id), type, String(mp?.display_name || u.email), String(mp?.main_photo_url || ''), String(mp?.date_note || ''), String(slot.date||b.date||''), String(slot.start_time||b.time||''), Number(slot.duration_minutes||b.duration_minutes||60), amount, String(b.message||''), 'pending', amount > 0 ? 'pending_accept' : 'none', 88, t, t).run()
  await c.env.DB.prepare('UPDATE woman_availability SET is_booked=1, updated_at=? WHERE id=?').bind(t, slot.id).run()

  if (amount > 0) {
    await c.env.DB.prepare('UPDATE wallets SET balance=balance-?, locked_balance=locked_balance+?, updated_at=? WHERE user_id=?').bind(amount, amount, t, u.id).run()
    await c.env.DB.prepare('INSERT INTO wallet_transactions(id,user_id,type,amount,status,note,created_at) VALUES(?,?,?,?,?,?,?)')
      .bind(id('tx'), u.id, 'booking_hold', -amount, 'completed', `Booking request hold: ${type}`, t).run()
    await c.env.DB.prepare('INSERT INTO escrows(id,booking_id,man_id,woman_id,amount,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)')
      .bind(id('esc'), reqId, u.id, String(b.woman_id), amount, 'pending_accept', t, t).run()
  }

  await c.env.DB.prepare('INSERT INTO user_alerts(id,user_id,type,title,body,target_url,is_read,created_at) VALUES(?,?,?,?,?,?,?,?)')
    .bind(id('al'), String(b.woman_id), 'booking_request', 'New booking request', `New ${type.replace('_',' ')} request for ${slot.date} at ${slot.start_time}.`, '/#/woman/requests', 0, t).run()
  await c.env.DB.prepare('INSERT INTO user_alerts(id,user_id,type,title,body,target_url,is_read,created_at) VALUES(?,?,?,?,?,?,?,?)')
    .bind(id('al'), u.id, 'booking_request_sent', 'Request sent', `Your ${type.replace('_',' ')} request was sent and the amount is held until review.`, '/#/man/requests', 0, t).run()

  const womanUser: any = await c.env.DB.prepare('SELECT email FROM users WHERE id=?').bind(String(b.woman_id)).first()
  await sendBookingEmail(c.env, womanUser?.email || '', 'created', {
    type,
    date: slot.date,
    time: slot.start_time,
    amount,
    note: `درخواست از طرف ${mp?.display_name || u.email}`
  }).catch((err: any) => console.error('BOOKING_CREATED_EMAIL_FAILED', err?.message || err))

  return c.json({ success: true, request_id: reqId, held_amount: amount })
})
