import { Hono } from 'hono'

export const operationalRoutes = new Hono<{ Bindings: any; Variables: any }>()

operationalRoutes.get('/admin/ops/overview', async (c) => {
  const today = new Date().toISOString().slice(0, 10)

  const q = async (sql: string, ...binds: any[]) => {
    const stmt = c.env.DB.prepare(sql)
    const row = binds.length ? await stmt.bind(...binds).first() : await stmt.first()
    return row || {}
  }

  const requestsToday:any = await q(`SELECT COUNT(*) c FROM booking_requests WHERE date(created_at)=date(?)`, today)
  const acceptedToday:any = await q(`SELECT COUNT(*) c FROM booking_requests WHERE status='accepted' AND date(updated_at)=date(?)`, today)
  const pendingKyc:any = await q(`SELECT COUNT(*) c FROM kyc_requests WHERE status='pending'`)
  const openDisputes:any = await q(`SELECT COUNT(*) c FROM booking_disputes WHERE status='open'`)
  const fundedEscrows:any = await q(`SELECT COALESCE(SUM(amount),0) total, COUNT(*) c FROM escrows WHERE status IN ('funded','pending_accept')`)
  const releasedEscrows:any = await q(`SELECT COALESCE(SUM(amount),0) total FROM escrows WHERE status='released'`)
  const pendingWithdrawals:any = await q(`SELECT COALESCE(SUM(amount),0) total, COUNT(*) c FROM withdrawals WHERE status='pending'`)
  const activeVideo:any = await q(`SELECT COUNT(*) c FROM video_call_rooms WHERE status IN ('scheduled','active') AND datetime(ends_at) >= datetime('now')`)

  const recent = await c.env.DB.prepare(`
    SELECT br.*, 
           mu.email AS man_email, wu.email AS woman_email,
           COALESCE(mp.main_photo_url,'') AS man_avatar_url,
           COALESCE(wp.cover_url,'') AS woman_avatar_url,
           COALESCE(mp.display_name, mu.full_name, mu.email) AS man_name,
           COALESCE(wp.display_name, wu.full_name, wu.email) AS woman_name
    FROM booking_requests br
    LEFT JOIN users mu ON mu.id=br.man_id
    LEFT JOIN users wu ON wu.id=br.woman_id
    LEFT JOIN man_profiles mp ON mp.user_id=br.man_id
    LEFT JOIN woman_profiles wp ON wp.user_id=br.woman_id
    ORDER BY br.created_at DESC
    LIMIT 12
  `).all()

  return c.json({
    kpis: {
      requests_today: requestsToday.c || 0,
      accepted_today: acceptedToday.c || 0,
      pending_kyc: pendingKyc.c || 0,
      open_disputes: openDisputes.c || 0,
      funded_escrow_amount: fundedEscrows.total || 0,
      funded_escrow_count: fundedEscrows.c || 0,
      released_escrow_amount: releasedEscrows.total || 0,
      pending_withdraw_amount: pendingWithdrawals.total || 0,
      pending_withdraw_count: pendingWithdrawals.c || 0,
      active_video_rooms: activeVideo.c || 0,
    },
    recent_bookings: recent.results || []
  })
})

operationalRoutes.get('/bookings/:id/access', async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')
  const row:any = await c.env.DB.prepare(`SELECT * FROM booking_requests WHERE id=?`).bind(id).first()
  if (!row) return c.json({ error: 'رزرو پیدا نشد' }, 404)
  if (user?.role !== 'admin' && row.man_id !== user?.id && row.woman_id !== user?.id) {
    return c.json({ error: 'دسترسی نداری' }, 403)
  }

  const paid = ['funded','released'].includes(String(row.escrow_status || '')) || ['accepted','completed'].includes(String(row.status || ''))
  const accepted = row.status === 'accepted' || row.status === 'completed'
  const chatAllowed = paid && accepted && ['chat','date'].includes(String(row.booking_type))
  const videoAllowed = paid && accepted && String(row.booking_type) === 'video_call'

  return c.json({
    booking_id: id,
    booking_type: row.booking_type,
    paid,
    accepted,
    chat_allowed: Boolean(chatAllowed || row.chat_unlocked),
    video_allowed: Boolean(videoAllowed || row.video_unlocked || row.early_open_approved),
    reason: paid && accepted ? 'دسترسی فعال است.' : 'تا وقتی پرداخت و تایید کامل نشود، ارتباط باز نمی‌شود.'
  })
})
