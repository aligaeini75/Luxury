import { realtimeOpsRoutes } from './modules/realtimeOps'
import { operationalRoutes } from './modules/operational'
import { cloudflareVideoRoutes } from './modules/cloudflareVideo'
import { earlyDisputesRoutes } from './modules/earlyDisputes'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { rateLimit } from './middleware/security'
import { authRoutes } from './modules/auth'
import { manRoutes } from './modules/man'
import { womanRoutes } from './modules/woman'
import { walletRoutes } from './modules/wallet'
import { chatRoutes } from './modules/chat'
import { adminRoutes } from './modules/admin'
import { paymentRoutes } from './modules/payments'
import { mediaRoutes } from './modules/media'
import { publicRoutes } from './modules/public'
import { realtimeRoutes } from './modules/realtime'
import { monitoringRoutes } from './modules/monitoring'
import { uploadRoutes } from './modules/uploads'

export type Env = {
  DB: D1Database
  JWT_SECRET: string
  USDT_DEPOSIT_ADDRESS?: string
  CLOUDINARY_CLOUD_NAME?: string
  CLOUDINARY_UPLOAD_PRESET?: string
  APP_URL?: string
  PLATFORM_FEE_PERCENT?: string
  SENTRY_DSN?: string
  CHAT_DO: DurableObjectNamespace
  MEDIA_BUCKET: R2Bucket
  R2_SIGNING_SECRET?: string
  NOWPAYMENTS_IPN_SECRET?: string
  NOWPAYMENTS_API_KEY?: string
  LIVEKIT_URL?: string
  LIVEKIT_API_KEY?: string
  LIVEKIT_API_SECRET?: string
}

const app = new Hono<{ Bindings: Env }>()
app.use('/api/*', rateLimit)
app.use('/api/*', cors({ origin: '*', allowHeaders: ['Content-Type', 'Authorization'], allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'] }))
app.get('/api/health', c => c.json({ ok: true, name: 'Luxora Core API' }))
app.route('/api/auth', authRoutes)
app.route('/api/man', manRoutes)
app.route('/api/woman', womanRoutes)
app.route('/api/wallet', walletRoutes)
app.route('/api/chat', chatRoutes)
app.route('/api/admin', adminRoutes)
app.route('/api/payments', paymentRoutes)
app.route('/api/media', mediaRoutes)
app.route('/api/public', publicRoutes)
app.route('/api/realtime', realtimeRoutes)
app.route('/api/monitoring', monitoringRoutes)
app.route('/api', uploadRoutes)
app.onError((err, c) => { console.error('GLOBAL_ERROR_STACK:', err?.stack || err); return c.json({ error: 'Internal error', message: err.message }, 500) })
app.route('/api', earlyDisputesRoutes)

app.route('/api', cloudflareVideoRoutes)

app.route('/api', operationalRoutes)

app.route('/api', realtimeOpsRoutes)

export default app
export { ChatDurableObject } from './durable/chat_do'
