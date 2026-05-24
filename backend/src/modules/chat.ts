import { Hono } from 'hono'
import { id, now } from '../lib/id'
import { auth } from '../middleware/auth'
import type { Env } from '../index'
import { signJwtHS256 } from '../lib/jwt'
export const chatRoutes = new Hono<{ Bindings: Env; Variables: { user: any } }>()
chatRoutes.use('*', auth)
chatRoutes.get('/rooms', async c => {
  const u=c.get('user')
  const rooms=(await c.env.DB.prepare(`SELECT cr.*, CASE WHEN cr.man_id=? THEN cr.woman_name ELSE cr.man_name END title, CASE WHEN cr.man_id=? THEN cr.woman_avatar_url ELSE cr.man_avatar_url END avatar_url, (SELECT COUNT(*) FROM chat_messages cm WHERE cm.room_id=cr.id AND cm.sender_id!=? AND cm.read_at IS NULL) unread_count, (SELECT body FROM chat_messages cm WHERE cm.room_id=cr.id ORDER BY cm.created_at DESC LIMIT 1) last_message FROM chat_rooms cr WHERE cr.man_id=? OR cr.woman_id=? ORDER BY cr.updated_at DESC`).bind(u.id,u.id,u.id,u.id,u.id).all()).results
  return c.json({rooms})
})
chatRoutes.get('/rooms/:id', async c => {
  const u=c.get('user'); const roomId=c.req.param('id')
  const room:any=await c.env.DB.prepare(`SELECT cr.*, br.booking_type, CASE WHEN cr.man_id=? THEN cr.woman_name ELSE cr.man_name END title, CASE WHEN cr.man_id=? THEN cr.woman_avatar_url ELSE cr.man_avatar_url END avatar_url FROM chat_rooms cr LEFT JOIN booking_requests br ON br.id=cr.booking_id WHERE cr.id=? AND (cr.man_id=? OR cr.woman_id=?)`).bind(u.id,u.id,roomId,u.id,u.id).first()
  if(!room)return c.json({error:'Room not found'},404)
  const messages=(await c.env.DB.prepare('SELECT *, sender_id=? AS is_me FROM chat_messages WHERE room_id=? ORDER BY created_at ASC').bind(u.id,roomId).all()).results
  return c.json({room,messages})
})
chatRoutes.post('/rooms/:id/messages', async c => {
  const u=c.get('user'); const roomId=c.req.param('id'); const b:any=await c.req.json(); const t=now()
  const room:any=await c.env.DB.prepare('SELECT * FROM chat_rooms WHERE id=? AND (man_id=? OR woman_id=?)').bind(roomId,u.id,u.id).first()
  if(!room)return c.json({error:'Room not found'},404)
  const message={id:id('msg'),room_id:roomId,sender_id:u.id,body:String(b.body||''),type:String(b.type||'text'),created_at:t,is_me:true}
  await c.env.DB.prepare('INSERT INTO chat_messages(id,room_id,sender_id,body,type,created_at) VALUES(?,?,?,?,?,?)').bind(message.id,roomId,u.id,message.body,message.type,t).run()
  await c.env.DB.prepare('UPDATE chat_rooms SET updated_at=? WHERE id=?').bind(t,roomId).run()
  return c.json({message})
})
chatRoutes.post('/rooms/:id/read', async c => { const u=c.get('user'); await c.env.DB.prepare('UPDATE chat_messages SET read_at=? WHERE room_id=? AND sender_id!=? AND read_at IS NULL').bind(now(),c.req.param('id'),u.id).run(); return c.json({success:true}) })
chatRoutes.get('/video/:bookingId/session', async c => {
  const u=c.get('user'); const bookingId=c.req.param('bookingId')
  const req:any=await c.env.DB.prepare('SELECT * FROM booking_requests WHERE id=? AND booking_type="video_call" AND status="accepted" AND (man_id=? OR woman_id=?)').bind(bookingId,u.id,u.id).first()
  if(!req) return c.json({error:'Accepted video call booking not found'},404)
  const start = new Date(`${req.date}T${req.time}:00`)
  const openAt = new Date(start.getTime() - 5 * 60 * 1000)
  const closeAt = new Date(start.getTime() + Number(req.duration_minutes || 60) * 60 * 1000)
  const current = new Date()
  if (current < openAt) return c.json({ error: 'Video room is not open yet', opens_at: openAt.toISOString() }, 403)
  if (current > closeAt) return c.json({ error: 'Video room has ended', ended_at: closeAt.toISOString() }, 410)
  let session:any=await c.env.DB.prepare('SELECT * FROM video_sessions WHERE booking_id=?').bind(bookingId).first()
  if(!session){ const t=now(); await c.env.DB.prepare('INSERT INTO video_sessions(id,booking_id,room_name,status,starts_at,ends_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)').bind(id('vid'),bookingId,`booking_${bookingId}`,'ready',start.toISOString(),closeAt.toISOString(),t,t).run(); session=await c.env.DB.prepare('SELECT * FROM video_sessions WHERE booking_id=?').bind(bookingId).first() }
  let livekit: any = null
  if (c.env.LIVEKIT_URL && c.env.LIVEKIT_API_KEY && c.env.LIVEKIT_API_SECRET) {
    const token = await signJwtHS256(c.env.LIVEKIT_API_SECRET, {
      iss: c.env.LIVEKIT_API_KEY,
      sub: u.id,
      name: u.full_name || u.email,
      video: { roomJoin: true, room: session.room_name, canPublish: true, canSubscribe: true, canPublishData: true }
    }, Math.max(300, Math.floor((closeAt.getTime() - Date.now()) / 1000)))
    livekit = { url: c.env.LIVEKIT_URL, token }
  }
  return c.json({session, livekit})
})
