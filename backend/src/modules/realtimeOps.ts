import { Hono } from 'hono'
import { now, id } from '../lib/id'

export const realtimeOpsRoutes = new Hono<{ Bindings: any; Variables: any }>()

function uid(c: any) {
  const u = c.get('user') || {}
  return String(u.id || u.user_id || u.sub || '')
}

realtimeOpsRoutes.post('/presence/heartbeat', async c => {
  const userId = uid(c)
  const b:any = await c.req.json().catch(() => ({}))
  if (!userId) return c.json({ error: 'Unauthorized' }, 401)
  await c.env.DB.prepare(`
    INSERT OR REPLACE INTO user_presence(user_id, online, last_seen_at, current_page)
    VALUES(?, 1, ?, ?)
  `).bind(userId, now(), String(b.page || '')).run()
  return c.json({ ok: true })
})

realtimeOpsRoutes.get('/notifications', async c => {
  const userId = uid(c)
  if (!userId) return c.json({ error: 'Unauthorized' }, 401)
  const alerts = (await c.env.DB.prepare(`
    SELECT * FROM user_alerts
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 50
  `).bind(userId).all()).results || []
  const unread:any = await c.env.DB.prepare(`SELECT COUNT(*) c FROM user_alerts WHERE user_id=? AND is_read=0`).bind(userId).first()
  return c.json({ alerts, unread: unread?.c || 0 })
})

realtimeOpsRoutes.post('/notifications/:id/read', async c => {
  const userId = uid(c)
  await c.env.DB.prepare(`UPDATE user_alerts SET is_read=1 WHERE id=? AND user_id=?`).bind(c.req.param('id'), userId).run()
  return c.json({ success: true })
})

realtimeOpsRoutes.post('/notifications/read-all', async c => {
  const userId = uid(c)
  await c.env.DB.prepare(`UPDATE user_alerts SET is_read=1 WHERE user_id=?`).bind(userId).run()
  return c.json({ success: true })
})

realtimeOpsRoutes.post('/bookings/:id/review', async c => {
  const userId = uid(c)
  const bookingId = c.req.param('id')
  const b:any = await c.req.json().catch(() => ({}))
  const booking:any = await c.env.DB.prepare(`SELECT * FROM booking_requests WHERE id=?`).bind(bookingId).first()
  if (!booking) return c.json({ error: 'رزرو پیدا نشد' }, 404)
  if (![booking.man_id, booking.woman_id].map(String).includes(userId)) return c.json({ error: 'دسترسی نداری' }, 403)
  if (!['completed','released'].includes(String(booking.status)) && booking.escrow_status !== 'released') return c.json({ error: 'بعد از تکمیل رزرو می‌توانی امتیاز بدهی.' }, 409)
  const reviewee = String(booking.man_id) === userId ? booking.woman_id : booking.man_id
  const rating = Math.max(1, Math.min(5, Number(b.rating || 5)))
  await c.env.DB.prepare(`
    INSERT INTO booking_reviews(id,booking_id,reviewer_id,reviewee_id,rating,comment,created_at)
    VALUES(?,?,?,?,?,?,?)
  `).bind(id('rv'), bookingId, userId, reviewee, rating, String(b.comment || ''), now()).run()
  await c.env.DB.prepare(`
    INSERT INTO user_alerts(id,user_id,type,title,body,target_url,is_read,created_at)
    VALUES(?,?,?,?,?,?,0,?)
  `).bind(id('al'), reviewee, 'review_received', 'امتیاز جدید دریافت شد', `برای یک رزرو ${rating} ستاره گرفتی.`, '/#/woman/requests', now()).run().catch(()=>{})
  return c.json({ success: true, message: 'امتیاز ثبت شد.' })
})

realtimeOpsRoutes.get('/users/:id/reputation', async c => {
  const userId = c.req.param('id')
  const row:any = await c.env.DB.prepare(`SELECT COUNT(*) review_count, COALESCE(AVG(rating),0) avg_rating FROM booking_reviews WHERE reviewee_id=?`).bind(userId).first()
  const bookings:any = await c.env.DB.prepare(`SELECT COUNT(*) c FROM booking_requests WHERE (man_id=? OR woman_id=?) AND status IN ('completed','accepted')`).bind(userId,userId).first()
  const disputes:any = await c.env.DB.prepare(`SELECT COUNT(*) c FROM booking_disputes d JOIN booking_requests b ON b.id=d.booking_id WHERE (b.man_id=? OR b.woman_id=?)`).bind(userId,userId).first().catch(()=>({c:0}))
  return c.json({
    review_count: row?.review_count || 0,
    avg_rating: Number(row?.avg_rating || 0).toFixed(1),
    booking_count: bookings?.c || 0,
    dispute_count: disputes?.c || 0,
  })
})

realtimeOpsRoutes.get('/escrows/:id/timeline', async c => {
  const escrowId = c.req.param('id')
  const timeline = (await c.env.DB.prepare(`SELECT * FROM escrow_timeline WHERE escrow_id=? ORDER BY created_at ASC`).bind(escrowId).all()).results || []
  return c.json({ timeline })
})
