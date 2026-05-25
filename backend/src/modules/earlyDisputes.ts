import { Hono } from 'hono'
import { auth } from '../middleware/auth'

export const earlyDisputesRoutes = new Hono<{ Bindings: any; Variables: any }>()
earlyDisputesRoutes.use('*', auth)

function currentUser(c: any) {
  return c.get('user') || {}
}

function currentUserId(c: any) {
  const u = currentUser(c)
  return String(u.id || u.user_id || u.sub || u.uid || u.userId || '')
}

async function getBooking(c: any, bookingId: string) {
  return await c.env.DB.prepare(`
    SELECT br.*,
           mu.email AS man_email,
           wu.email AS woman_email
    FROM booking_requests br
    LEFT JOIN users mu ON mu.id = br.man_id
    LEFT JOIN users wu ON wu.id = br.woman_id
    WHERE br.id = ?
    LIMIT 1
  `).bind(bookingId).first()
}

async function getAccess(c: any, booking: any) {
  const user = currentUser(c)
  const uid = currentUserId(c)
  const email = String(user.email || '').toLowerCase()

  if (!booking) return false
  if (!uid && !user.email) return false
  if (user.role === 'admin') return true

  const bookingIds = [booking.man_id, booking.woman_id, booking.user_id, booking.requester_id, booking.customer_id].filter(Boolean).map((x: any) => String(x))
  if (uid && bookingIds.includes(uid)) return true

  if (email) {
    const manEmail = String(booking.man_email || '').toLowerCase()
    const womanEmail = String(booking.woman_email || '').toLowerCase()
    if (email === manEmail || email === womanEmail) return true
  }

  return false
}

function otherSideUserId(c: any, booking: any) {
  const uid = currentUserId(c)
  if (String(booking.woman_id || '') === uid) return booking.man_id
  return booking.woman_id
}

function bookingAccessPayload(booking: any) {
  const status = String(booking.status || '')
  const type = String(booking.booking_type || '')
  const start = booking.date && booking.time ? new Date(`${booking.date}T${booking.time}:00`) : null
  const duration = Number(booking.duration_minutes || 60)
  const now = new Date()
  const openAt = start ? new Date(start.getTime() - 5 * 60 * 1000) : null
  const closeAt = start ? new Date(start.getTime() + duration * 60 * 1000) : null
  const byTime = !!(openAt && closeAt && now >= openAt && now <= closeAt)
  const early = !!Number(booking.early_open_approved || 0)
  const communication = ['chat', 'video_call'].includes(type)
  const allowed = status === 'accepted' && (early || (communication && byTime))
  return {
    allowed,
    status,
    booking_type: type,
    early_open_approved: early,
    by_time: byTime,
    open_at: openAt?.toISOString() || null,
    close_at: closeAt?.toISOString() || null,
  }
}

earlyDisputesRoutes.get('/bookings/:id/access', async (c) => {
  const bookingId = c.req.param('id')
  const booking: any = await getBooking(c, bookingId)
  if (!booking) return c.json({ error: 'رزرو پیدا نشد' }, 404)
  if (!(await getAccess(c, booking))) return c.json({ error: 'دسترسی نداری' }, 403)
  return c.json(bookingAccessPayload(booking))
})

earlyDisputesRoutes.post('/bookings/:id/early-open/request', async (c) => {
  const bookingId = c.req.param('id')
  const body = await c.req.json().catch(() => ({}))
  const booking: any = await getBooking(c, bookingId)

  if (!booking) return c.json({ error: 'رزرو پیدا نشد' }, 404)

  const allowed = await getAccess(c, booking)
  if (!allowed) {
    return c.json({ error: 'دسترسی نداری: این رزرو به حساب فعلی وصل نیست.' }, 403)
  }

  if (!['chat', 'video_call'].includes(String(booking.booking_type))) return c.json({ error: 'درخواست باز شدن زودتر فقط برای چت و ویدیوکال فعال است.' }, 400)
  if (booking.status !== 'accepted') return c.json({ error: 'تا زمانی که خانم درخواست را تایید نکرده، امکان درخواست باز شدن زودتر وجود ندارد.' }, 409)

  const existing: any = await c.env.DB.prepare(`SELECT * FROM booking_early_open_requests WHERE booking_id = ? AND status = 'pending' ORDER BY created_at DESC LIMIT 1`).bind(bookingId).first()
  if (existing) return c.json({ success: true, already_pending: true, id: existing.id, message: 'این درخواست قبلاً ثبت شده و در انتظار ادمین است.' })

  const id = crypto.randomUUID()
  const requesterId = currentUserId(c)
  await c.env.DB.prepare(`INSERT INTO booking_early_open_requests (id, booking_id, requester_id, note, status, created_at) VALUES (?, ?, ?, ?, 'pending', datetime('now'))`).bind(id, bookingId, requesterId || null, body.note || '').run()

  const targetUserId = otherSideUserId(c, booking)
  if (targetUserId) {
    await c.env.DB.prepare(`INSERT INTO user_alerts(id,user_id,type,title,body,target_url,is_read,created_at) VALUES(?,?,?,?,?,?,0,datetime('now'))`).bind(crypto.randomUUID(), targetUserId, 'early_open_requested', 'درخواست باز شدن زودتر', 'طرف مقابل درخواست داده چت یا ویدیوکال زودتر باز شود.', currentUser(c).role === 'woman' ? '/#/man/requests' : '/#/woman/requests').run().catch(() => {})
  }

  return c.json({ success: true, id, message: 'درخواست باز شدن زودتر برای ادمین ارسال شد.' })
})

earlyDisputesRoutes.get('/bookings/:id/activity', async (c) => {
  const bookingId = c.req.param('id')
  const booking: any = await getBooking(c, bookingId)
  if (!booking) return c.json({ error: 'رزرو پیدا نشد' }, 404)
  if (!(await getAccess(c, booking))) return c.json({ error: 'دسترسی نداری' }, 403)

  const early = await c.env.DB.prepare(`SELECT r.*, u.email AS requester_email, u.role AS requester_role FROM booking_early_open_requests r LEFT JOIN users u ON u.id = r.requester_id WHERE r.booking_id = ? ORDER BY r.created_at DESC`).bind(bookingId).all()
  const disputes = await c.env.DB.prepare(`SELECT d.*, u.email AS reporter_email, u.role AS reporter_role FROM booking_disputes d LEFT JOIN users u ON u.id = d.reporter_id WHERE d.booking_id = ? ORDER BY d.created_at DESC`).bind(bookingId).all()
  return c.json({ early_open_requests: early.results || [], disputes: disputes.results || [] })
})

earlyDisputesRoutes.post('/bookings/:id/disputes', async (c) => {
  const bookingId = c.req.param('id')
  const body = await c.req.json().catch(() => ({}))
  const booking: any = await getBooking(c, bookingId)
  if (!booking) return c.json({ error: 'رزرو پیدا نشد' }, 404)
  if (!(await getAccess(c, booking))) return c.json({ error: 'دسترسی نداری: این رزرو به حساب فعلی وصل نیست.' }, 403)
  if (booking.status !== 'accepted') return c.json({ error: 'گزارش اختلاف بعد از تایید رزرو فعال می‌شود.' }, 409)
  const id = crypto.randomUUID()
  await c.env.DB.prepare(`INSERT INTO booking_disputes (id, booking_id, reporter_id, reason, status, created_at) VALUES (?, ?, ?, ?, 'open', datetime('now'))`).bind(id, bookingId, currentUserId(c) || null, body.reason || '').run()
  return c.json({ success: true, id, message: 'گزارش اختلاف ثبت شد.' })
})

earlyDisputesRoutes.get('/admin/early-disputes', async (c) => c.json({ disputes: [], early_open_requests: [] }))
earlyDisputesRoutes.get('/admin/disputes', async (c) => c.json({ disputes: [], early_open_requests: [] }))
earlyDisputesRoutes.post('/admin/early-open/:id/:action', async (c) => c.json({ success: true }))
earlyDisputesRoutes.post('/admin/disputes/:id/resolve', async (c) => c.json({ success: true }))
