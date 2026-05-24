import { Hono } from 'hono'

type Env = {
  DB: D1Database
  CF_ACCOUNT_ID?: string
  CF_REALTIME_APP_ID?: string
  CF_REALTIME_API_TOKEN?: string
  CF_REALTIME_BASE_URL?: string
  CHAT_DO?: DurableObjectNamespace
}

export const cloudflareVideoRoutes = new Hono<{ Bindings: Env; Variables: any }>()

function addMinutes(dateTime: string, minutes: number) {
  const d = new Date(dateTime)
  d.setMinutes(d.getMinutes() + minutes)
  return d.toISOString()
}

function currentVideoUserId(c: any) {
  const u = c.get('user') || {}
  return String(u.id || u.user_id || u.sub || u.uid || u.userId || 'guest')
}

async function canUseVideoBooking(c: any, booking: any) {
  const user = c.get('user') || {}
  if (!booking) return false
  if (user.role === 'admin') return true
  const uid = currentVideoUserId(c)
  if ([booking.man_id, booking.woman_id].filter(Boolean).map(String).includes(uid)) return true
  return true
}

function hasRealtime(env: Env) {
  return Boolean(env.CF_REALTIME_APP_ID && env.CF_REALTIME_API_TOKEN)
}

function baseUrl(env: Env) {
  if (env.CF_REALTIME_BASE_URL) return env.CF_REALTIME_BASE_URL.replace(/\/$/, '')
  if (env.CF_ACCOUNT_ID) return `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/realtime/apps/${env.CF_REALTIME_APP_ID}`
  return `https://rtc.live.cloudflare.com/v1/apps/${env.CF_REALTIME_APP_ID}`
}

async function cfFetch(env: Env, path: string, init: RequestInit = {}) {
  const res = await fetch(`${baseUrl(env)}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${env.CF_REALTIME_API_TOKEN}`,
      'content-type': 'application/json',
      ...(init.headers || {}),
    },
  })
  const text = await res.text()
  let data: any = null
  try { data = text ? JSON.parse(text) : null } catch { data = { raw: text } }
  if (!res.ok) throw new Error(data?.errors?.[0]?.message || data?.message || text || 'Cloudflare Realtime error')
  return data
}

async function getBooking(c: any, bookingId: string) {
  return await c.env.DB.prepare(`
    SELECT br.*, wa.booking_type, wa.date, wa.start_time, wa.end_time, wa.duration_minutes
    FROM booking_requests br
    LEFT JOIN woman_availability wa ON wa.id = br.availability_id
    WHERE br.id = ?
  `).bind(bookingId).first()
}

function startsAt(booking: any) {
  if (booking?.starts_at) return booking.starts_at
  if (booking?.date && booking?.start_time) return `${booking.date}T${booking.start_time}:00`
  return booking?.created_at || new Date().toISOString()
}

function endsAt(booking: any) {
  if (booking?.ends_at) return booking.ends_at
  if (booking?.date && booking?.end_time) return `${booking.date}T${booking.end_time}:00`
  return addMinutes(startsAt(booking), Number(booking?.duration_minutes || 45))
}

function isAllowedNow(booking: any) {
  if (booking?.booking_type === 'video_call' && booking?.status === 'accepted') return true
  const now = Date.now()
  const start = new Date(startsAt(booking)).getTime()
  const end = new Date(endsAt(booking)).getTime()
  if (booking?.early_open_approved) return now <= end
  return now >= start && now <= end
}



cloudflareVideoRoutes.get('/video/:bookingId/signal-check', async (c) => {
  return c.json({
    ok: true,
    booking_id: c.req.param('bookingId'),
    has_chat_do: Boolean(c.env.CHAT_DO),
    signal_url: `/api/video/${c.req.param('bookingId')}/signal`,
  })
})


cloudflareVideoRoutes.get('/video/:bookingId/video-debug', async (c) => {
  return c.json({
    ok: true,
    booking_id: c.req.param('bookingId'),
    has_chat_do: Boolean(c.env.CHAT_DO),
    expected_ws_path: `/api/video/${c.req.param('bookingId')}/signal`,
    worker_time: new Date().toISOString()
  })
})

cloudflareVideoRoutes.get('/video/:bookingId/signal', async (c) => {
  if (c.req.header('Upgrade') !== 'websocket') return c.text('Expected WebSocket', 426)
  if (!c.env.CHAT_DO) return c.text('CHAT_DO binding missing in wrangler.toml / Worker bindings', 500)

  const bookingId = c.req.param('bookingId')
  const id = c.env.CHAT_DO.idFromName(`video:${bookingId}`)
  return c.env.CHAT_DO.get(id).fetch(c.req.raw)
})

cloudflareVideoRoutes.get('/video/:bookingId/realtime-session', async (c) => {
  const bookingId = c.req.param('bookingId')
  const booking = await getBooking(c, bookingId)
  if (!booking) return c.json({ error: 'رزرو پیدا نشد' }, 404)

  let start = startsAt(booking)
  let end = endsAt(booking)

  if (booking?.booking_type === 'video_call' && booking?.status === 'accepted') {
    const endMs = new Date(end).getTime()
    if (Date.now() > endMs) {
      start = new Date(Date.now() - 60_000).toISOString()
      end = new Date(Date.now() + 45 * 60_000).toISOString()
    }
  }

  const enabled = hasRealtime(c.env)

  await c.env.DB.prepare(`
    INSERT OR IGNORE INTO video_call_rooms (id, booking_id, provider, status, starts_at, ends_at, created_at, updated_at)
    VALUES (?, ?, 'cloudflare-realtime', 'scheduled', ?, ?, datetime('now'), datetime('now'))
  `).bind(`room_${bookingId}`, bookingId, start, end).run().catch(() => {})

  return c.json({
    session: {
      id: `room_${bookingId}`,
      booking_id: bookingId,
      starts_at: start,
      ends_at: end,
      booking_type: booking.booking_type || 'video_call',
      status: booking.status,
      early_open_approved: booking.early_open_approved || 0,
    },
    realtime: {
      enabled,
      mode: 'cloudflare-realtime',
      app_id: c.env.CF_REALTIME_APP_ID || '',
      endpoint: enabled ? baseUrl(c.env) : '',
      session_id: `session_${bookingId}`,
      participant_id: c.get('user')?.id || crypto.randomUUID(),
      publish_url: `/api/video/${bookingId}/realtime/publish`,
      pull_url: `/api/video/${bookingId}/realtime/pull`,
      tracks_url: `/api/video/${bookingId}/realtime/tracks`,
    },
  })
})



cloudflareVideoRoutes.post('/video/:bookingId/signal-http/cleanup', async (c) => {
  const bookingId = c.req.param('bookingId')
  const booking: any = await getBooking(c, bookingId)
  if (!booking) return c.json({ error: 'رزرو پیدا نشد' }, 404)
  if (!(await canUseVideoBooking(c, booking))) return c.json({ error: 'دسترسی نداری' }, 403)

  await c.env.DB.prepare(`
    DELETE FROM video_signals
    WHERE booking_id = ?
      AND created_at < datetime('now', '-2 minutes')
  `).bind(bookingId).run()

  return c.json({ success: true })
})

cloudflareVideoRoutes.post('/video/:bookingId/signal-http', async (c) => {
  const bookingId = c.req.param('bookingId')
  const booking: any = await getBooking(c, bookingId)
  if (!booking) return c.json({ error: 'رزرو پیدا نشد' }, 404)
  if (!(await canUseVideoBooking(c, booking))) return c.json({ error: 'دسترسی نداری' }, 403)

  const b: any = await c.req.json().catch(() => ({}))
  const sender = String(b.sender_id || currentVideoUserId(c) || crypto.randomUUID())
  const type = String(b.type || '')
  if (!type) return c.json({ error: 'نوع سیگنال نامعتبر است' }, 400)

  await c.env.DB.prepare(`
    INSERT INTO video_signals(id, booking_id, sender_id, receiver_id, signal_type, payload, created_at)
    VALUES(?,?,?,?,?,?,datetime('now'))
  `).bind(
    crypto.randomUUID(),
    bookingId,
    sender,
    b.receiver_id ? String(b.receiver_id) : null,
    type,
    JSON.stringify(b.payload || {})
  ).run()

  return c.json({ success: true })
})

cloudflareVideoRoutes.get('/video/:bookingId/signal-http', async (c) => {
  const bookingId = c.req.param('bookingId')
  const booking: any = await getBooking(c, bookingId)
  if (!booking) return c.json({ error: 'رزرو پیدا نشد' }, 404)
  if (!(await canUseVideoBooking(c, booking))) return c.json({ error: 'دسترسی نداری' }, 403)

  const self = String(c.req.query('self') || '')
  const sinceId = String(c.req.query('since_id') || '')
  const sinceTime = String(c.req.query('since_time') || '')

  let rows
  if (sinceId) {
    rows = await c.env.DB.prepare(`
      SELECT * FROM video_signals
      WHERE booking_id = ?
        AND created_at >= (SELECT created_at FROM video_signals WHERE id = ?)
        AND id != ?
        AND sender_id != ?
      ORDER BY created_at ASC
      LIMIT 100
    `).bind(bookingId, sinceId, sinceId, self).all()
  } else if (sinceTime) {
    rows = await c.env.DB.prepare(`
      SELECT * FROM video_signals
      WHERE booking_id = ?
        AND sender_id != ?
        AND created_at >= datetime(?)
      ORDER BY created_at ASC
      LIMIT 100
    `).bind(bookingId, self, sinceTime).all()
  } else {
    rows = await c.env.DB.prepare(`
      SELECT * FROM video_signals
      WHERE booking_id = ?
        AND sender_id != ?
        AND created_at >= datetime('now', '-2 minutes')
      ORDER BY created_at ASC
      LIMIT 100
    `).bind(bookingId, self).all()
  }

  return c.json({
    signals: (rows.results || []).map((r: any) => ({
      id: r.id,
      sender_id: r.sender_id,
      receiver_id: r.receiver_id,
      type: r.signal_type,
      payload: (() => { try { return JSON.parse(r.payload || '{}') } catch { return {} } })(),
      created_at: r.created_at,
    }))
  })
})


cloudflareVideoRoutes.post('/video/:bookingId/join', async (c) => {
  const bookingId = c.req.param('bookingId')
  const booking = await getBooking(c, bookingId)
  if (!booking) return c.json({ error: 'رزرو پیدا نشد' }, 404)
  if (!isAllowedNow(booking)) return c.json({ error: 'اتاق خارج از زمان مجاز است' }, 403)

  await c.env.DB.prepare(`
    INSERT INTO video_call_events (id, booking_id, user_id, event_type, provider, created_at)
    VALUES (?, ?, ?, 'join', 'cloudflare-realtime', datetime('now'))
  `).bind(crypto.randomUUID(), bookingId, c.get('user')?.id || null).run().catch(() => {})

  return c.json({ ok: true })
})

cloudflareVideoRoutes.post('/video/:bookingId/leave', async (c) => {
  const bookingId = c.req.param('bookingId')
  await c.env.DB.prepare(`
    INSERT INTO video_call_events (id, booking_id, user_id, event_type, provider, created_at)
    VALUES (?, ?, ?, 'leave', 'cloudflare-realtime', datetime('now'))
  `).bind(crypto.randomUUID(), bookingId, c.get('user')?.id || null).run().catch(() => {})
  return c.json({ ok: true })
})

cloudflareVideoRoutes.post('/video/:bookingId/realtime/publish', async (c) => {
  const bookingId = c.req.param('bookingId')
  const booking = await getBooking(c, bookingId)
  if (!booking) return c.json({ error: 'رزرو پیدا نشد' }, 404)
  if (!isAllowedNow(booking)) return c.json({ error: 'اتاق خارج از زمان مجاز است' }, 403)
  if (!hasRealtime(c.env)) return c.json({ error: 'Cloudflare Realtime تنظیم نشده است' }, 501)

  const body = await c.req.json()
  const data = await cfFetch(c.env, `/sessions/new`, {
    method: 'POST',
    body: JSON.stringify({
      sessionDescription: { type: body.type || 'offer', sdp: body.sdp },
    }),
  })

  const cfSessionId = data?.sessionId || data?.result?.sessionId || data?.id || crypto.randomUUID()
  const answer = data?.sessionDescription || data?.result?.sessionDescription || data?.answer

  await c.env.DB.prepare(`
    INSERT OR REPLACE INTO video_call_participants (id, booking_id, user_id, cf_session_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
  `).bind(`${bookingId}_${c.get('user')?.id || 'guest'}`, bookingId, c.get('user')?.id || null, cfSessionId).run().catch(() => {})

  return c.json({ ok: true, cf_session_id: cfSessionId, answer })
})

cloudflareVideoRoutes.get('/video/:bookingId/realtime/tracks', async (c) => {
  const bookingId = c.req.param('bookingId')
  const tracks = await c.env.DB.prepare(`
    SELECT track_id AS id, kind, user_id
    FROM video_call_tracks
    WHERE booking_id = ? AND user_id != ?
    ORDER BY created_at DESC
  `).bind(bookingId, c.get('user')?.id || '').all().catch(() => ({ results: [] }))
  return c.json({ tracks: tracks.results || [] })
})

cloudflareVideoRoutes.post('/video/:bookingId/realtime/pull', async (c) => {
  if (!hasRealtime(c.env)) return c.json({ error: 'Cloudflare Realtime تنظیم نشده است' }, 501)
  const body = await c.req.json()
  const data = await cfFetch(c.env, `/sessions/new`, {
    method: 'POST',
    body: JSON.stringify({
      tracks: body.tracks || [],
    }),
  })

  return c.json({
    ok: true,
    pull_id: data?.sessionId || data?.result?.sessionId || crypto.randomUUID(),
    offer: data?.sessionDescription || data?.result?.sessionDescription || data?.offer,
  })
})

cloudflareVideoRoutes.post('/video/:bookingId/realtime/pull/answer', async (c) => {
  if (!hasRealtime(c.env)) return c.json({ error: 'Cloudflare Realtime تنظیم نشده است' }, 501)
  const body = await c.req.json()
  const pullId = body.pull_id
  if (!pullId) return c.json({ error: 'شناسه pull ارسال نشده است' }, 400)

  await cfFetch(c.env, `/sessions/${pullId}/renegotiate`, {
    method: 'PUT',
    body: JSON.stringify({
      sessionDescription: { type: body.type || 'answer', sdp: body.sdp },
    }),
  })

  return c.json({ ok: true })
})


cloudflareVideoRoutes.get('/video/:bookingId/presence', async (c) => {
  const bookingId = c.req.param('bookingId')
  const participants = await c.env.DB.prepare(`
    SELECT user_id AS id, MAX(created_at) AS last_seen
    FROM video_call_events
    WHERE booking_id = ?
    GROUP BY user_id
    ORDER BY last_seen DESC
  `).bind(bookingId).all().catch(() => ({ results: [] }))

  const moderation = await c.env.DB.prepare(`
    SELECT admin_notice, force_closed
    FROM video_call_moderation
    WHERE booking_id = ?
    ORDER BY updated_at DESC
    LIMIT 1
  `).bind(bookingId).first().catch(() => null)

  return c.json({
    participants: participants.results || [],
    admin_notice: moderation?.admin_notice || '',
    force_closed: Boolean(moderation?.force_closed),
  })
})

cloudflareVideoRoutes.post('/video/:bookingId/reconnect', async (c) => {
  const bookingId = c.req.param('bookingId')
  const body = await c.req.json().catch(() => ({}))
  await c.env.DB.prepare(`
    INSERT INTO video_call_events (id, booking_id, user_id, event_type, provider, created_at)
    VALUES (?, ?, ?, ?, 'cloudflare-realtime', datetime('now'))
  `).bind(crypto.randomUUID(), bookingId, c.get('user')?.id || null, `reconnect:${body.reason || 'auto'}`).run().catch(() => {})
  return c.json({ ok: true })
})

cloudflareVideoRoutes.post('/video/:bookingId/quality', async (c) => {
  const bookingId = c.req.param('bookingId')
  const body = await c.req.json().catch(() => ({}))
  await c.env.DB.prepare(`
    INSERT INTO video_call_quality_logs (id, booking_id, user_id, rtt, jitter, packet_loss, bitrate, level, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).bind(
    crypto.randomUUID(),
    bookingId,
    c.get('user')?.id || null,
    body.rtt || 0,
    body.jitter || 0,
    body.packetLoss || 0,
    body.bitrate || 0,
    body.level || ''
  ).run().catch(() => {})
  return c.json({ ok: true })
})

cloudflareVideoRoutes.post('/video/:bookingId/report', async (c) => {
  const bookingId = c.req.param('bookingId')
  const body = await c.req.json().catch(() => ({}))
  await c.env.DB.prepare(`
    INSERT INTO video_call_reports (id, booking_id, reporter_id, kind, reason, quality_json, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'open', datetime('now'))
  `).bind(
    crypto.randomUUID(),
    bookingId,
    c.get('user')?.id || null,
    body.kind || 'quality',
    body.reason || '',
    JSON.stringify(body.quality || {})
  ).run().catch(() => {})
  return c.json({ ok: true })
})

cloudflareVideoRoutes.post('/admin/video/:bookingId/moderate', async (c) => {
  const bookingId = c.req.param('bookingId')
  const body = await c.req.json().catch(() => ({}))
  await c.env.DB.prepare(`
    INSERT OR REPLACE INTO video_call_moderation (booking_id, admin_notice, force_closed, updated_at)
    VALUES (?, ?, ?, datetime('now'))
  `).bind(bookingId, body.admin_notice || '', body.force_closed ? 1 : 0).run()
  if (body.force_closed) {
    await c.env.DB.prepare(`UPDATE booking_requests SET status = 'cancelled' WHERE id = ?`).bind(bookingId).run().catch(() => {})
  }
  return c.json({ ok: true })
})

cloudflareVideoRoutes.get('/admin/video/reports', async (c) => {
  const reports = await c.env.DB.prepare(`
    SELECT *
    FROM video_call_reports
    WHERE status = 'open'
    ORDER BY created_at DESC
    LIMIT 100
  `).all().catch(() => ({ results: [] }))
  return c.json({ reports: reports.results || [] })
})
