import { Hono } from 'hono'
import { id, now } from '../lib/id'
import { auth } from '../middleware/auth'
import type { Env } from '../index'

export const protectedGalleryRoutes = new Hono<{ Bindings: Env; Variables: { user: any } }>()
protectedGalleryRoutes.use('*', auth)

protectedGalleryRoutes.get('/', async c => {
  const items = (await c.env.DB.prepare('SELECT * FROM protected_gallery_items WHERE status="active" ORDER BY created_at DESC').all()).results
  return c.json({ items })
})

protectedGalleryRoutes.post('/:id/unlock', async c => {
  const u = c.get('user')
  const itemId = c.req.param('id')
  const t = now()
  await c.env.DB.prepare('INSERT INTO media_access_tokens(id,user_id,media_id,token,expires_at,created_at) VALUES(?,?,?,?,datetime(?, "+24 hours"),?)')
    .bind(id('mat'), u.id, itemId, crypto.randomUUID(), t, t).run()
  return c.json({ success: true })
})
