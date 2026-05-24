import { Hono } from 'hono'
import type { Env } from '../index'
export const publicRoutes = new Hono<{ Bindings: Env }>()
publicRoutes.get('/women/:id', async c => {
  const id = c.req.param('id')
  const today = new Date().toISOString().slice(0, 10)
  const profile: any = await c.env.DB.prepare('SELECT * FROM woman_profiles WHERE user_id=? OR id=?').bind(id, id).first()
  if (!profile) return c.json({ error: 'Profile not found' }, 404)
  const albums: any[] = (await c.env.DB.prepare(`SELECT g.*, (SELECT COUNT(*) FROM woman_gallery_media m WHERE m.gallery_id=g.id) media_count FROM woman_galleries g WHERE g.woman_id=? AND g.status='active' ORDER BY g.created_at DESC`).bind(profile.user_id).all()).results as any[]
  for (const g of albums) {
    g.media = (await c.env.DB.prepare('SELECT * FROM woman_gallery_media WHERE gallery_id=? ORDER BY created_at DESC LIMIT 6').bind(g.id).all()).results
  }
  const legacy = (await c.env.DB.prepare('SELECT * FROM woman_gallery WHERE woman_id=? ORDER BY created_at DESC').bind(profile.user_id).all()).results
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
  return c.json({ profile, gallery: albums.length ? albums : legacy, services, locations, availability })
})
