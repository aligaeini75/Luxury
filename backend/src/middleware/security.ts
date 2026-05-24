import type { MiddlewareHandler } from 'hono'
import type { Env } from '../index'
import { id, now } from '../lib/id'

export const rateLimit: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
  const ip = c.req.header('CF-Connecting-IP') || c.req.header('x-forwarded-for') || 'unknown'
  const bucket = `${ip}:${c.req.path}`
  const windowStart = new Date(Math.floor(Date.now() / 60000) * 60000).toISOString()
  try {
    const row: any = await c.env.DB.prepare('SELECT * FROM rate_limits WHERE bucket=? AND window_start=?').bind(bucket, windowStart).first()
    if (row && Number(row.count) > 90) return c.json({ error: 'Rate limit exceeded' }, 429)
    if (row) await c.env.DB.prepare('UPDATE rate_limits SET count=count+1, updated_at=? WHERE id=?').bind(now(), row.id).run()
    else await c.env.DB.prepare('INSERT INTO rate_limits(id,bucket,ip,path,count,window_start,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)').bind(id('rl'), bucket, ip, c.req.path, 1, windowStart, now(), now()).run()
  } catch {}
  await next()
}

export async function auditLog(c: any, action: string, entityType: string, entityId?: string, metadata: any = {}) {
  try {
    const actor = c.get?.('user')?.id || null
    await c.env.DB.prepare('INSERT INTO audit_logs(id,actor_id,action,entity_type,entity_id,metadata,created_at) VALUES(?,?,?,?,?,?,?)')
      .bind(id('aud'), actor, action, entityType, entityId || '', JSON.stringify(metadata), now()).run()
  } catch {}
}
