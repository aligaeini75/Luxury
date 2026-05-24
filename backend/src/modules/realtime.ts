import { Hono } from 'hono'
import { auth } from '../middleware/auth'
import type { Env } from '../index'
type RealtimeEnv = Env & { CHAT_DO: DurableObjectNamespace }
export const realtimeRoutes = new Hono<{ Bindings: RealtimeEnv; Variables: { user: any } }>()
realtimeRoutes.use('*', auth)
realtimeRoutes.get('/chat/:roomId', async c => {
  const id = c.env.CHAT_DO.idFromName(c.req.param('roomId'))
  return c.env.CHAT_DO.get(id).fetch(c.req.raw)
})
