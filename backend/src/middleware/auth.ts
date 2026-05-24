import type { MiddlewareHandler } from 'hono'
import { verify } from 'hono/jwt'
import type { Env } from '../index'

export const auth: MiddlewareHandler<{ Bindings: Env; Variables: { user: any } }> = async (c, next) => {
  const header = c.req.header('Authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) return c.json({ error: 'Unauthorized' }, 401)
  const payload: any = await verify(token, c.env.JWT_SECRET)
  c.set('user', { id: payload.sub, email: payload.email, role: payload.role })
  await next()
}
