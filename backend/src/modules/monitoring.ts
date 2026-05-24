import { Hono } from 'hono'
import { auth } from '../middleware/auth'
import { id, now } from '../lib/id'
import type { Env } from '../index'
export const monitoringRoutes = new Hono<{ Bindings: Env; Variables: { user: any } }>()
monitoringRoutes.use('*', auth)
monitoringRoutes.post('/client-error', async c => {
  const u = c.get('user')
  const b: any = await c.req.json()
  await c.env.DB.prepare('INSERT INTO app_errors(id,user_id,path,message,stack,created_at) VALUES(?,?,?,?,?,?)').bind(id('err'), u.id, String(b.path || ''), String(b.message || ''), String(b.stack || ''), now()).run()
  return c.json({ success: true })
})
