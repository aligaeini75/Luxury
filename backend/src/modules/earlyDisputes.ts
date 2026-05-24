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

  const bookingIds = [
    booking.man_id,
    booking.woman_id,
    booking.user_id,
    booking.requester_id,
    booking.customer_id,
  ].filter(Boolean).map((x: any) => String(x))

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

earlyDisputesRoutes.post('/bookings/:id/early-open/request', async (c) => {
  const bookingId = c.req.param('id')
  const body = await c.req.json().catch(() => ({}))
  const booking: any = await getBooking(c, bookingId)

  if (!booking) return c.json({ error: 'رزرو پیدا نشد' }, 404)

  const allowed = await getAccess(c, booking)
  if (!allowed) {
    return c.json({
      error: 'دسترسی نداری: این رزرو به حساب فعلی وصل نیست.',
      debug_hint: {
        booking_id: booking.id,
        booking_man_id: booking.man_id,
        booking_woman_id: booking.woman_id,
        current_user_id: currentUserId(c),
        current_user_role: currentUser(c).role || '',
        current_user_email: currentUser(c).email || '',
      }
    }, 403)
  }

  if (!['chat', 'video_call'].includes(String(booking.booking_type))) {
    return c.json({ error: 'درخواست باز شدن زودتر فقط برای چت و ویدیوکال فعال است.' }, 400)
  }

  if (booking.status !== 'accepted') {
    return c.json({ error: 'تا زمانی که خانم درخواست را تایید نکرده، امکان درخواست باز شدن زودتر وجود ندارد.' }, 409)
  }

  const existing: any = await c.env.DB.prepare(`
    SELECT * FROM booking_early_open_requests
    WHERE booking_id = ? AND status = 'pending'
    ORDER BY created_at DESC
    LIMIT 1
  `).bind(bookingId).first()

  if (existing) return c.json({ success: true, already_pending: true, id: existing.id, message: 'این درخواست قبلاً ثبت شده و در انتظار ادمین است.' })

  const id = crypto.randomUUID()
  const requesterId = currentUserId(c)

  await c.env.DB.prepare(`
    INSERT INTO booking_early_open_requests (id, booking_id, requester_id, note, status, created_at)
    VALUES (?, ?, ?, ?, 'pending', datetime('now'))
  `).bind(id, bookingId, requesterId || null, body.note || '').run()

  const targetUserId = otherSideUserId(c, booking)
  if (targetUserId) {
    await c.env.DB.prepare(`
      INSERT INTO user_alerts(id,user_id,type,title,body,target_url,is_read,created_at)
      VALUES(?,?,?,?,?,?,0,datetime('now'))
    `).bind(
      crypto.randomUUID(),
      targetUserId,
      'early_open_requested',
      'درخواست باز شدن زودتر',
      'طرف مقابل درخواست داده چت یا ویدیوکال زودتر باز شود.',
      currentUser(c).role === 'woman' ? '/#/man/requests' : '/#/woman/requests'
    ).run().catch(() => {})
  }

  return c.json({ success: true, id, message: 'درخواست باز شدن زودتر برای ادمین ارسال شد.' })
})

earlyDisputesRoutes.post('/bookings/:id/disputes', async (c) => {
  const bookingId = c.req.param('id')
  const body = await c.req.json().catch(() => ({}))
  const booking: any = await getBooking(c, bookingId)

  if (!booking) return c.json({ error: 'رزرو پیدا نشد' }, 404)
  if (!(await getAccess(c, booking))) {
    return c.json({ error: 'دسترسی نداری: این رزرو به حساب فعلی وصل نیست.' }, 403)
  }

  if (booking.status !== 'accepted') {
    return c.json({ error: 'گزارش اختلاف بعد از تایید رزرو فعال می‌شود.' }, 409)
  }

  const id = crypto.randomUUID()
  await c.env.DB.prepare(`
    INSERT INTO booking_disputes (id, booking_id, reporter_id, reason, status, created_at)
    VALUES (?, ?, ?, ?, 'open', datetime('now'))
  `).bind(id, bookingId, currentUserId(c) || null, body.reason || '').run()

  return c.json({ success: true, id, message: 'گزارش اختلاف ثبت شد.' })
})

earlyDisputesRoutes.get('/bookings/:id/activity', async (c) => {
  const bookingId = c.req.param('id')
  const booking: any = await getBooking(c, bookingId)

  if (!booking) return c.json({ error: 'رزرو پیدا نشد' }, 404)
  if (!(await getAccess(c, booking))) return c.json({ error: 'دسترسی نداری' }, 403)

  const early = await c.env.DB.prepare(`
    SELECT r.*, u.email AS requester_email, u.role AS requester_role
    FROM booking_early_open_requests r
    LEFT JOIN users u ON u.id = r.requester_id
    WHERE r.booking_id = ?
    ORDER BY r.created_at DESC
  `).bind(bookingId).all()

  const disputes = await c.env.DB.prepare(`
    SELECT d.*, u.email AS reporter_email, u.role AS reporter_role
    FROM booking_disputes d
    LEFT JOIN users u ON u.id = d.reporter_id
    WHERE d.booking_id = ?
    ORDER BY d.created_at DESC
  `).bind(bookingId).all()

  return c.json({ early_open_requests: early.results || [], disputes: disputes.results || [] })
})


earlyDisputesRoutes.get('/admin/early-disputes', async (c) => {
  const disputes = await c.env.DB.prepare(`
    SELECT d.*, b.booking_type, b.status AS booking_status, b.offer_amount AS booking_amount,
           m.email AS man_email, w.email AS woman_email, r.email AS reporter_email,
           COALESCE(mp.main_photo_url,'') AS man_avatar_url,
           COALESCE(wp.cover_url,'') AS woman_avatar_url,
           COALESCE(mp.display_name, m.full_name, m.email) AS man_name,
           COALESCE(wp.display_name, w.full_name, w.email) AS woman_name
    FROM booking_disputes d
    LEFT JOIN booking_requests b ON b.id = d.booking_id
    LEFT JOIN users m ON m.id = b.man_id
    LEFT JOIN users w ON w.id = b.woman_id
    LEFT JOIN users r ON r.id = d.reporter_id
    LEFT JOIN man_profiles mp ON mp.user_id = b.man_id
    LEFT JOIN woman_profiles wp ON wp.user_id = b.woman_id
    WHERE d.status = 'open'
    ORDER BY d.created_at DESC
    LIMIT 100
  `).all()

  const early = await c.env.DB.prepare(`
    SELECT r.*, b.booking_type, b.status AS booking_status, b.offer_amount AS booking_amount,
           m.email AS man_email, w.email AS woman_email, u.email AS requester_email, u.role AS requester_role,
           COALESCE(mp.main_photo_url,'') AS man_avatar_url,
           COALESCE(wp.cover_url,'') AS woman_avatar_url,
           COALESCE(mp.display_name, m.full_name, m.email) AS man_name,
           COALESCE(wp.display_name, w.full_name, w.email) AS woman_name
    FROM booking_early_open_requests r
    LEFT JOIN booking_requests b ON b.id = r.booking_id
    LEFT JOIN users m ON m.id = b.man_id
    LEFT JOIN users w ON w.id = b.woman_id
    LEFT JOIN users u ON u.id = r.requester_id
    LEFT JOIN man_profiles mp ON mp.user_id = b.man_id
    LEFT JOIN woman_profiles wp ON wp.user_id = b.woman_id
    WHERE r.status = 'pending'
    ORDER BY r.created_at DESC
    LIMIT 100
  `).all()

  return c.json({ disputes: disputes.results || [], early_open_requests: early.results || [] })
})


earlyDisputesRoutes.get('/admin/disputes', async (c) => {
  const disputes = await c.env.DB.prepare(`
    SELECT d.*, b.booking_type, b.status AS booking_status, b.offer_amount AS booking_amount,
           m.email AS man_email, w.email AS woman_email, r.email AS reporter_email
    FROM booking_disputes d
    LEFT JOIN booking_requests b ON b.id = d.booking_id
    LEFT JOIN users m ON m.id = b.man_id
    LEFT JOIN users w ON w.id = b.woman_id
    LEFT JOIN users r ON r.id = d.reporter_id
    WHERE d.status = 'open'
    ORDER BY d.created_at DESC
    LIMIT 100
  `).all()

  const early = await c.env.DB.prepare(`
    SELECT r.*, b.booking_type, b.status AS booking_status, b.offer_amount AS booking_amount,
           m.email AS man_email, w.email AS woman_email, u.email AS requester_email, u.role AS requester_role
    FROM booking_early_open_requests r
    LEFT JOIN booking_requests b ON b.id = r.booking_id
    LEFT JOIN users m ON m.id = b.man_id
    LEFT JOIN users w ON w.id = b.woman_id
    LEFT JOIN users u ON u.id = r.requester_id
    WHERE r.status = 'pending'
    ORDER BY r.created_at DESC
    LIMIT 100
  `).all()

  return c.json({ disputes: disputes.results || [], early_open_requests: early.results || [] })
})

earlyDisputesRoutes.post('/admin/early-open/:id/:action', async (c) => {
  const id = c.req.param('id')
  const action = c.req.param('action')
  const body = await c.req.json().catch(() => ({}))
  const status = action === 'approve' ? 'approved' : 'rejected'

  const req: any = await c.env.DB.prepare(`SELECT * FROM booking_early_open_requests WHERE id = ?`).bind(id).first()
  if (!req) return c.json({ error: 'درخواست پیدا نشد' }, 404)

  const booking: any = await getBooking(c, req.booking_id)
  if (!booking) return c.json({ error: 'رزرو پیدا نشد' }, 404)
  if (booking.status !== 'accepted') return c.json({ error: 'رزرو هنوز تایید نشده است.' }, 409)

  await c.env.DB.prepare(`
    UPDATE booking_early_open_requests
    SET status = ?, admin_note = ?, decided_at = datetime('now')
    WHERE id = ?
  `).bind(status, body.note || '', id).run()

  if (status === 'approved') {
    await c.env.DB.prepare(`
      UPDATE booking_requests
      SET early_open_approved = 1,
          access_unlocked_at = datetime('now'),
          chat_unlocked = CASE WHEN booking_type='chat' THEN 1 ELSE COALESCE(chat_unlocked,0) END,
          video_unlocked = CASE WHEN booking_type='video_call' THEN 1 ELSE COALESCE(video_unlocked,0) END,
          updated_at = datetime('now')
      WHERE id = ?
    `).bind(req.booking_id).run()
  }

  for (const uid of [booking.man_id, booking.woman_id].filter(Boolean)) {
    await c.env.DB.prepare(`
      INSERT INTO user_alerts(id,user_id,type,title,body,target_url,is_read,created_at)
      VALUES(?,?,?,?,?,?,0,datetime('now'))
    `).bind(
      crypto.randomUUID(),
      uid,
      'early_open_decided',
      status === 'approved' ? 'باز شدن زودتر تایید شد' : 'درخواست باز شدن زودتر رد شد',
      status === 'approved' ? 'ادمین تایید کرد؛ ارتباط برای هر دو طرف باز شد.' : 'ادمین درخواست باز شدن زودتر را رد کرد.',
      '/#/man/requests'
    ).run().catch(() => {})
  }

  return c.json({ success: true, message: status === 'approved' ? 'باز شدن زودتر تایید شد.' : 'درخواست رد شد.' })
})

earlyDisputesRoutes.post('/admin/disputes/:id/resolve', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => ({}))
  const action = body.action || 'reject'

  const dispute: any = await c.env.DB.prepare(`SELECT * FROM booking_disputes WHERE id = ?`).bind(id).first()
  if (!dispute) return c.json({ error: 'اختلاف پیدا نشد' }, 404)

  const booking: any = await getBooking(c, dispute.booking_id)
  const status = action === 'refund' ? 'refunded' : action === 'release' ? 'released' : 'rejected'

  await c.env.DB.prepare(`
    UPDATE booking_disputes
    SET status = ?, admin_note = ?, resolved_at = datetime('now')
    WHERE id = ?
  `).bind(status, body.note || '', id).run()

  if (booking && action === 'refund') {
    const amount = Number(booking.offer_amount || 0)
    await c.env.DB.prepare(`UPDATE booking_requests SET status = 'refunded', escrow_status='refunded', updated_at=datetime('now') WHERE id = ?`).bind(dispute.booking_id).run()
    if (amount > 0) {
      await c.env.DB.prepare(`UPDATE wallets SET balance=balance+?, locked_balance=MAX(locked_balance-?,0), updated_at=datetime('now') WHERE user_id=?`).bind(amount, amount, booking.man_id).run()
      await c.env.DB.prepare(`UPDATE escrows SET status='refunded', refunded_at=datetime('now'), updated_at=datetime('now') WHERE booking_id=?`).bind(dispute.booking_id).run().catch(() => {})
    }
  }

  if (booking && action === 'release') {
    await c.env.DB.prepare(`UPDATE booking_requests SET status = 'completed', escrow_status='released', updated_at=datetime('now') WHERE id = ?`).bind(dispute.booking_id).run()
    await c.env.DB.prepare(`UPDATE escrows SET status='released', released_at=datetime('now'), updated_at=datetime('now') WHERE booking_id=?`).bind(dispute.booking_id).run().catch(() => {})
  }

  return c.json({ success: true, status })
})
