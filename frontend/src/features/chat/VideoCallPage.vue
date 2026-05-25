<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { AlertTriangle, Camera, CameraOff, Maximize, Mic, MicOff, PhoneOff, RefreshCw, Signal, Volume2 } from 'lucide-vue-next'
import AppShell from '../../components/layout/AppShell.vue'
import { api } from '../../lib/api'

type SessionPayload = {
  session: {
    id: string
    booking_id: string
    starts_at: string
    ends_at: string
    booking_type: string
    status: string
    early_open_approved?: number
  }
  realtime?: { enabled?: boolean }
}

type QualityStats = {
  rtt: number
  jitter: number
  packetLoss: number
  bitrate: number
  level: 'عالی' | 'خوب' | 'ضعیف' | 'در حال بررسی'
}

const route = useRoute()
const bookingId = computed(() => String(route.params.bookingId || ''))
const videoBase = computed(() => `/video/${bookingId.value}`)

const payload = ref<SessionPayload | null>(null)
const error = ref('')
const info = ref('')
const warning = ref('')
const mobileLogs = ref<string[]>([])
const showDebug = ref(true)
const copiedDebug = ref(false)
const loading = ref(false)
const joined = ref(false)
const micOn = ref(true)
const camOn = ref(true)
const speakerOn = ref(true)
const fullscreenMode = ref(false)
const reconnecting = ref(false)
const connectionState = ref('قطع')
const remoteStatus = ref('در انتظار طرف مقابل')
const presence = ref<any[]>([])
const reportReason = ref('')
const now = ref(Date.now())

const quality = ref<QualityStats>({ rtt: 0, jitter: 0, packetLoss: 0, bitrate: 0, level: 'در حال بررسی' })
const localVideo = ref<HTMLVideoElement | null>(null)
const remoteVideo = ref<HTMLVideoElement | null>(null)

let localStream: MediaStream | null = null
let remoteStream: MediaStream | null = null
let pc: RTCPeerConnection | null = null
let ticker: number | undefined
let signalPoller: number | undefined
let joinHeartbeatTimer: number | undefined
let qualityTimer: number | undefined
let presenceTimer: number | undefined
let reconnectTimer: number | undefined
let fallbackTimer: number | undefined
const signalId = crypto.randomUUID()
let lastSignalId = ''
let signalStartedAt = ''
let makingOffer = false
let madeOffer = false
let polite = false
let pendingCandidates: RTCIceCandidateInit[] = []
const processed = new Set<string>()

const startsAt = computed(() => payload.value ? new Date(payload.value.session.starts_at).getTime() : 0)
const endsAt = computed(() => payload.value ? new Date(payload.value.session.ends_at).getTime() : 0)
const isBeforeStart = computed(() => payload.value ? now.value < startsAt.value : true)
const isAfterEnd = computed(() => payload.value ? now.value > endsAt.value : false)
const canJoin = computed(() => {
  if (!payload.value) return false
  if (payload.value.session.booking_type === 'video_call' && payload.value.session.status === 'accepted') return true
  if (payload.value.session.early_open_approved) return !isAfterEnd.value
  return now.value >= startsAt.value && now.value <= endsAt.value
})
const remainingMs = computed(() => {
  if (!payload.value) return 0
  if (isBeforeStart.value && !payload.value.session.early_open_approved) return Math.max(0, startsAt.value - now.value)
  return Math.max(0, endsAt.value - now.value)
})
const remainingLabel = computed(() => formatDuration(remainingMs.value))
const roomStatusLabel = computed(() => {
  if (!payload.value) return 'در حال دریافت اطلاعات'
  if (canJoin.value) return 'اتاق ویدیوکال فعال است'
  if (isBeforeStart.value) return 'اتاق هنوز فعال نشده است'
  if (isAfterEnd.value) return 'زمان جلسه تمام شده است'
  return 'اتاق در حال بررسی است'
})
const countdownTitle = computed(() => isBeforeStart.value ? 'مانده تا باز شدن اتاق' : 'مانده تا بسته شدن اتاق')
const qualityColor = computed(() => {
  if (quality.value.level === 'عالی') return 'text-emerald-200'
  if (quality.value.level === 'خوب') return 'text-champagne'
  if (quality.value.level === 'ضعیف') return 'text-red-200'
  return 'text-muted'
})

function logMobile(message: string, data?: any) {
  const time = new Date().toLocaleTimeString('fa-IR')
  const extra = data === undefined ? '' : ` ${typeof data === 'string' ? data : JSON.stringify(data)}`
  const line = `[${time}] ${message}${extra}`
  mobileLogs.value = [line, ...mobileLogs.value].slice(0, 100)
  try {
    console.log('[VIDEO_DEBUG]', message, data ?? '')
    localStorage.setItem('luxora_video_debug', mobileLogs.value.join('\n'))
  } catch {}
}

async function copyDebugLogs() {
  try {
    await navigator.clipboard.writeText(mobileLogs.value.join('\n'))
    copiedDebug.value = true
    setTimeout(() => copiedDebug.value = false, 1600)
  } catch {
    copiedDebug.value = false
  }
}

function formatDuration(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
}

function translateConnectionState(state: string) {
  const map: Record<string, string> = {
    new: 'جدید', connecting: 'در حال اتصال', connected: 'متصل', disconnected: 'قطع موقت', failed: 'ناموفق', closed: 'بسته شده',
  }
  return map[state] || state || 'نامشخص'
}

async function loadSession() {
  loading.value = true
  error.value = ''
  try {
    logMobile('loadSession:start', bookingId.value)
    const { data } = await api.get(`${videoBase.value}/realtime-session`)
    payload.value = data
    logMobile('loadSession:ok', { status: data?.session?.status, type: data?.session?.booking_type })
  } catch (e: any) {
    error.value = e?.response?.data?.error || 'اتاق ویدیوکال در دسترس نیست.'
    logMobile('loadSession:error', error.value)
  } finally {
    loading.value = false
  }
}

async function joinRoom() {
  logMobile('joinRoom:clicked')
  if (joined.value) leaveRoom()
  if (!payload.value) return
  if (!canJoin.value) {
    error.value = 'اتاق هنوز مجاز به ورود نیست.'
    logMobile('joinRoom:blocked')
    return
  }

  error.value = ''
  warning.value = ''
  info.value = ''
  loading.value = true

  try {
    await startMedia()
    createPeerConnection()
    localStream?.getTracks().forEach(track => pc?.addTrack(track, localStream!))
    await startSignaling()
    joined.value = true
    await api.post(`${videoBase.value}/join`, { provider: 'http-webrtc' }).catch(() => {})
    startPresencePolling()
    startQualityMonitor()
    info.value = 'وارد اتاق شدی؛ اگر طرف مقابل هم وارد شود تصویر نمایش داده می‌شود.'
  } catch (e: any) {
    error.value = e?.message || 'دسترسی دوربین یا اتصال ویدیوکال ناموفق بود.'
    logMobile('joinRoom:error', error.value)
    leaveRoom()
  } finally {
    loading.value = false
  }
}

async function startMedia() {
  logMobile('getUserMedia:start')
  localStream = await navigator.mediaDevices.getUserMedia({
    video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 24, max: 30 }, facingMode: 'user' },
    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
  })
  logMobile('getUserMedia:ok', { tracks: localStream.getTracks().map(t => `${t.kind}:${t.readyState}`) })
  await nextTick()
  if (localVideo.value) {
    localVideo.value.srcObject = localStream
    await localVideo.value.play?.().catch(() => {})
  }
}

function createPeerConnection() {
  logMobile('RTCPeerConnection:create')
  pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun.cloudflare.com:3478' }] })
  connectionState.value = 'در حال اتصال'
  remoteStream = new MediaStream()
  if (remoteVideo.value) remoteVideo.value.srcObject = remoteStream

  pc.onconnectionstatechange = () => {
    const state = pc?.connectionState || ''
    connectionState.value = translateConnectionState(state)
    logMobile('pc.connectionState', state)
    if (['disconnected', 'failed'].includes(state)) scheduleReconnect()
  }
  pc.oniceconnectionstatechange = () => logMobile('pc.iceConnectionState', pc?.iceConnectionState || '')
  pc.onicecandidate = event => {
    if (event.candidate) postSignal('candidate', { candidate: event.candidate }).catch(() => {})
  }
  pc.ontrack = event => {
    remoteStatus.value = 'طرف مقابل متصل شد'
    connectionState.value = 'متصل'
    logMobile('pc.ontrack', { streams: event.streams?.length || 0, track: event.track?.kind })
    const incoming = event.streams?.[0] || new MediaStream([event.track])
    remoteStream = incoming
    nextTick(() => {
      if (!remoteVideo.value) return logMobile('remoteVideo:missing-ref')
      remoteVideo.value.srcObject = incoming
      remoteVideo.value.autoplay = true
      remoteVideo.value.playsInline = true
      remoteVideo.value.muted = false
      remoteVideo.value.play?.().then(() => logMobile('remoteVideo.play:ok')).catch(e => logMobile('remoteVideo.play:error', e?.message || String(e)))
    })
  }
}

async function postSignal(type: string, payloadData: any = {}) {
  logMobile(`http:send:${type}`)
  await api.post(`${videoBase.value}/signal-http`, { sender_id: signalId, type, payload: payloadData }).catch(e => {
    logMobile(`http:send:${type}:error`, e?.response?.data?.error || e?.message || '')
  })
}

async function pollSignals() {
  const { data } = await api.get(`${videoBase.value}/signal-http`, {
    params: { self: signalId, since_id: lastSignalId, since_time: lastSignalId ? '' : signalStartedAt },
  }).catch(e => {
    logMobile('http:poll:error', e?.response?.data?.error || e?.message || '')
    return { data: { signals: [] } }
  })

  for (const msg of data?.signals || []) {
    if (msg.id && processed.has(msg.id)) continue
    if (msg.id) processed.add(msg.id)
    lastSignalId = msg.id || lastSignalId
    logMobile('http:signal:recv', { type: msg.type, from: msg.sender_id })
    await handleSignal(msg)
  }
}

async function handleSignal(msg: any) {
  if (!pc) return
  try {
    if (msg.type === 'join') {
      remoteStatus.value = 'طرف مقابل وارد اتاق شد'
      const remoteId = String(msg.sender_id || '')
      polite = signalId > remoteId
      const shouldOffer = signalId < remoteId
      logMobile('negotiation:role', { polite, shouldOffer, local: signalId, remote: remoteId })
      if (shouldOffer && !madeOffer && pc.signalingState === 'stable') await createAndSendOffer()
      else scheduleFallbackOffer()
    }

    if (msg.type === 'offer' && msg.payload?.sdp) {
      if (fallbackTimer) window.clearTimeout(fallbackTimer)
      const collision = makingOffer || pc.signalingState !== 'stable'
      if (!polite && collision) return logMobile('signal:ignore-offer-collision')
      await pc.setRemoteDescription({ type: 'offer', sdp: msg.payload.sdp })
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      await postSignal('answer', { sdp: answer.sdp })
      await flushPendingCandidates()
    }

    if (msg.type === 'answer' && msg.payload?.sdp) {
      if (pc.signalingState !== 'have-local-offer') return logMobile('signal:skip-answer-wrong-state', pc.signalingState)
      await pc.setRemoteDescription({ type: 'answer', sdp: msg.payload.sdp })
      await flushPendingCandidates()
    }

    if (msg.type === 'candidate' && msg.payload?.candidate) {
      if (pc.remoteDescription) await pc.addIceCandidate(msg.payload.candidate)
      else pendingCandidates.push(msg.payload.candidate)
    }

    if (msg.type === 'leave') remoteStatus.value = 'طرف مقابل از تماس خارج شد'
  } catch (e: any) {
    warning.value = e?.message || 'خطا در تبادل اتصال.'
    logMobile('signal:handle:error', warning.value)
  }
}

async function startSignaling() {
  madeOffer = false
  makingOffer = false
  polite = false
  lastSignalId = ''
  pendingCandidates = []
  processed.clear()
  if (fallbackTimer) window.clearTimeout(fallbackTimer)
  signalStartedAt = new Date(Date.now() - 120000).toISOString()
  await api.post(`${videoBase.value}/signal-http/cleanup`).catch(() => {})
  await postSignal('join', { at: Date.now(), signalStartedAt })
  if (signalPoller) window.clearInterval(signalPoller)
  signalPoller = window.setInterval(pollSignals, 1000)
  if (joinHeartbeatTimer) window.clearInterval(joinHeartbeatTimer)
  joinHeartbeatTimer = window.setInterval(() => postSignal('join', { heartbeat: true, at: Date.now() }).catch(() => {}), 3500)
  await pollSignals()
}

function scheduleFallbackOffer() {
  if (fallbackTimer || madeOffer) return
  fallbackTimer = window.setTimeout(async () => {
    if (!pc || madeOffer || pc.remoteDescription || pc.localDescription || pc.signalingState !== 'stable') return
    logMobile('negotiation:fallback-offer')
    await createAndSendOffer()
  }, 2500)
}

async function createAndSendOffer() {
  if (!pc || makingOffer || madeOffer || pc.signalingState !== 'stable') return
  try {
    makingOffer = true
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    madeOffer = true
    await postSignal('offer', { sdp: offer.sdp })
    info.value = 'درخواست اتصال برای طرف مقابل ارسال شد.'
  } finally {
    makingOffer = false
  }
}

async function flushPendingCandidates() {
  if (!pc?.remoteDescription) return
  const items = [...pendingCandidates]
  pendingCandidates = []
  for (const item of items) {
    try { await pc.addIceCandidate(item) } catch {}
  }
}

async function loadPresence() {
  const { data } = await api.get(`${videoBase.value}/presence`).catch(() => ({ data: null }))
  presence.value = data?.participants || []
  if (data?.force_closed && joined.value) {
    error.value = 'تماس توسط ادمین بسته شد.'
    leaveRoom()
  }
}

function startPresencePolling() {
  if (presenceTimer) window.clearInterval(presenceTimer)
  presenceTimer = window.setInterval(loadPresence, 5000)
  loadPresence()
}

async function requestReconnect() {
  if (!joined.value || reconnecting.value) return
  reconnecting.value = true
  warning.value = 'در حال بازیابی اتصال...'
  try {
    pc?.restartIce?.()
    await api.post(`${videoBase.value}/reconnect`, { reason: 'manual_or_auto' }).catch(() => {})
    await postSignal('join', { reconnect: true, at: Date.now() })
    warning.value = 'درخواست بازیابی ارسال شد.'
  } finally {
    window.setTimeout(() => { reconnecting.value = false }, 2500)
  }
}

function scheduleReconnect() {
  if (reconnectTimer) return
  reconnectTimer = window.setTimeout(() => {
    reconnectTimer = undefined
    requestReconnect()
  }, 1500)
}

async function reportCallIssue(kind: 'quality' | 'abuse' | 'disconnect') {
  await api.post(`${videoBase.value}/report`, { kind, reason: reportReason.value || kind, quality: quality.value }).catch(() => {})
  reportReason.value = ''
  info.value = 'گزارش تماس برای ادمین ثبت شد.'
}

function startQualityMonitor() {
  if (qualityTimer) window.clearInterval(qualityTimer)
  qualityTimer = window.setInterval(async () => {
    if (!pc) return
    let rtt = 0, jitter = 0, packetsLost = 0, bytes = 0
    const stats = await pc.getStats()
    stats.forEach((report: any) => {
      if (report.type === 'candidate-pair' && report.currentRoundTripTime) rtt = Math.round(report.currentRoundTripTime * 1000)
      if (report.type === 'inbound-rtp') {
        jitter = Math.max(jitter, Math.round((report.jitter || 0) * 1000))
        packetsLost += report.packetsLost || 0
        bytes += report.bytesReceived || 0
      }
      if (report.type === 'outbound-rtp') bytes += report.bytesSent || 0
    })
    const packetLoss = Math.min(100, packetsLost)
    const bitrate = Math.round(bytes / 1024)
    let level: QualityStats['level'] = 'عالی'
    if (rtt > 350 || jitter > 80 || packetLoss > 20) level = 'ضعیف'
    else if (rtt > 180 || jitter > 40 || packetLoss > 5) level = 'خوب'
    quality.value = { rtt, jitter, packetLoss, bitrate, level }
    api.post(`${videoBase.value}/quality`, quality.value).catch(() => {})
  }, 4000)
}

function toggle(kind: 'audio' | 'video') {
  localStream?.getTracks().filter(track => track.kind === kind).forEach(track => { track.enabled = !track.enabled })
  if (kind === 'audio') micOn.value = !micOn.value
  if (kind === 'video') camOn.value = !camOn.value
}

function toggleSpeaker() {
  speakerOn.value = !speakerOn.value
  if (remoteVideo.value) remoteVideo.value.muted = !speakerOn.value
}

function leaveRoom() {
  if (joined.value) postSignal('leave', {}).catch(() => {})
  if (signalPoller) window.clearInterval(signalPoller)
  if (joinHeartbeatTimer) window.clearInterval(joinHeartbeatTimer)
  if (qualityTimer) window.clearInterval(qualityTimer)
  if (presenceTimer) window.clearInterval(presenceTimer)
  if (fallbackTimer) window.clearTimeout(fallbackTimer)
  signalPoller = undefined
  joinHeartbeatTimer = undefined
  qualityTimer = undefined
  presenceTimer = undefined
  fallbackTimer = undefined
  pendingCandidates = []
  localStream?.getTracks().forEach(track => track.stop())
  remoteStream?.getTracks().forEach(track => track.stop())
  localStream = null
  remoteStream = null
  pc?.close()
  pc = null
  joined.value = false
  connectionState.value = 'قطع'
  remoteStatus.value = 'در انتظار طرف مقابل'
  if (localVideo.value) localVideo.value.srcObject = null
  if (remoteVideo.value) remoteVideo.value.srcObject = null
  api.post(`${videoBase.value}/leave`, { provider: 'http-webrtc' }).catch(() => {})
}

onMounted(() => {
  loadSession()
  ticker = window.setInterval(() => { now.value = Date.now() }, 1000)
})
onUnmounted(() => {
  leaveRoom()
  if (ticker) window.clearInterval(ticker)
  if (reconnectTimer) window.clearTimeout(reconnectTimer)
})
</script>

<template>
  <AppShell>
    <section class="motion-page px-0 py-0 lg:px-10 lg:py-8" :class="fullscreenMode ? 'fixed inset-0 z-[120] bg-black' : ''">
      <div class="relative min-h-screen overflow-hidden border-gold/15 bg-black/80 shadow-aura backdrop-blur-3xl lg:min-h-0 lg:rounded-[2.5rem] lg:border lg:p-5">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(214,173,82,.18),transparent_34%),radial-gradient(circle_at_82%_16%,rgba(255,240,189,.08),transparent_36%)]"></div>
        <div class="relative z-10 grid min-h-screen gap-0 lg:min-h-0 xl:grid-cols-[.72fr_1.28fr]">
          <aside class="order-2 space-y-4 p-4 xl:order-1 xl:p-5">
            <div class="badge">ویدیوکال داخلی لوکسورا</div>
            <h1 class="mt-4 text-3xl font-black leading-tight md:text-5xl">اتاق ویدیوکال امن داخل سیستم</h1>
            <p class="muted mt-4 max-w-xl text-sm leading-7 md:text-base">تماس با زمان رزرو کنترل می‌شود و اتصال با signaling داخلی برقرار می‌شود.</p>

            <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div class="rounded-[1.5rem] border border-gold/15 bg-white/[.045] p-4">
                <p class="text-xs font-black text-muted">{{ countdownTitle }}</p>
                <h2 class="mt-2 text-3xl font-black text-champagne">{{ remainingLabel }}</h2>
              </div>
              <div class="rounded-[1.5rem] border border-gold/15 bg-white/[.045] p-4">
                <p class="text-xs font-black text-muted">وضعیت اتاق</p>
                <h2 class="mt-2 text-xl font-black" :class="canJoin ? 'text-emerald-200' : 'text-champagne'">{{ roomStatusLabel }}</h2>
              </div>
              <div class="rounded-[1.5rem] border border-gold/15 bg-white/[.045] p-4">
                <div class="flex items-center gap-2 text-xs font-black text-muted"><Signal class="h-4 w-4" /> کیفیت تماس</div>
                <h2 class="mt-2 text-2xl font-black" :class="qualityColor">{{ quality.level }}</h2>
                <p class="muted mt-2 text-xs leading-6">RTT: {{ quality.rtt }}ms · Jitter: {{ quality.jitter }}ms · Loss: {{ quality.packetLoss }}</p>
              </div>
              <div class="rounded-[1.5rem] border border-gold/15 bg-white/[.045] p-4">
                <p class="text-xs font-black text-muted">حضور کاربران</p>
                <p class="mt-2 text-sm text-champagne">{{ presence.length || 0 }} نفر آنلاین/آماده</p>
                <p class="muted mt-2 text-xs">{{ remoteStatus }}</p>
              </div>
            </div>

            <div class="grid gap-3">
              <button class="lux-btn w-full" :disabled="loading || !canJoin || joined" @click="joinRoom">{{ joined ? 'داخل اتاق هستی' : 'ورود به ویدیوکال' }}</button>
              <button class="lux-btn-dark w-full" :disabled="!joined || reconnecting" @click="requestReconnect"><RefreshCw class="ml-2 inline h-4 w-4" /> بازیابی اتصال</button>
            </div>

            <div class="rounded-[1.5rem] border border-gold/15 bg-white/[.04] p-4">
              <p class="text-sm font-black text-champagne">گزارش سریع تماس</p>
              <textarea v-model="reportReason" class="lux-input mt-3 min-h-20" placeholder="توضیح مشکل، کیفیت، رفتار نامناسب یا قطعی"></textarea>
              <div class="mt-3 grid gap-2 sm:grid-cols-3">
                <button class="rounded-full border border-gold/20 bg-gold/10 px-3 py-2 text-xs font-black text-champagne" @click="reportCallIssue('quality')">کیفیت ضعیف</button>
                <button class="rounded-full border border-red-300/20 bg-red-500/10 px-3 py-2 text-xs font-black text-red-100" @click="reportCallIssue('abuse')">گزارش رفتار</button>
                <button class="rounded-full border border-gold/20 bg-white/[.04] px-3 py-2 text-xs font-black text-white" @click="reportCallIssue('disconnect')">قطعی</button>
              </div>
            </div>

            <div class="rounded-[1.5rem] border border-gold/15 bg-black/55 p-4 text-xs leading-6 text-muted">
              <div class="flex items-center justify-between gap-2">
                <p class="font-black text-champagne">دیباگ موبایل ویدیوکال</p>
                <div class="flex gap-2">
                  <button class="rounded-full bg-white/[.06] px-3 py-1 font-black text-white" @click="showDebug = !showDebug">{{ showDebug ? 'بستن' : 'باز کردن' }}</button>
                  <button class="rounded-full bg-gold/15 px-3 py-1 font-black text-champagne" @click="copyDebugLogs">{{ copiedDebug ? 'کپی شد' : 'کپی لاگ' }}</button>
                </div>
              </div>
              <div v-if="showDebug" class="mt-3 max-h-44 overflow-y-auto rounded-2xl bg-black/50 p-3 font-mono text-[11px] text-left dir-ltr">
                <p v-for="line in mobileLogs" :key="line" class="break-all border-b border-white/5 py-1">{{ line }}</p>
                <p v-if="!mobileLogs.length">هنوز لاگی ثبت نشده.</p>
              </div>
            </div>
            <p v-if="error" class="rounded-2xl border border-red-300/20 bg-red-500/10 p-4 text-sm font-bold text-red-100"><AlertTriangle class="ml-2 inline h-4 w-4" />{{ error }}</p>
            <p v-if="warning" class="rounded-2xl border border-gold/20 bg-gold/10 p-4 text-sm font-bold text-champagne">{{ warning }}</p>
            <p v-if="info" class="rounded-2xl border border-gold/20 bg-gold/10 p-4 text-sm font-bold text-champagne">{{ info }}</p>
          </aside>

          <main class="order-1 flex min-h-[58vh] flex-col p-2 xl:order-2 xl:min-h-0 xl:p-5">
            <div class="relative flex-1 overflow-hidden rounded-[2rem] border border-gold/15 bg-[#050301] shadow-aura">
              <video ref="remoteVideo" autoplay playsinline class="h-full min-h-[48vh] w-full bg-black object-cover xl:min-h-[650px]"></video>
              <div class="absolute right-4 top-4 rounded-full bg-black/70 px-4 py-2 text-xs font-black text-champagne backdrop-blur-xl">طرف مقابل</div>
              <div class="absolute left-4 top-4 rounded-full bg-black/70 px-4 py-2 text-xs font-black text-champagne backdrop-blur-xl">{{ connectionState }}</div>
              <div class="absolute bottom-4 left-4 h-36 w-28 overflow-hidden rounded-2xl border border-gold/20 bg-black shadow-aura sm:h-44 sm:w-36">
                <video ref="localVideo" autoplay muted playsinline class="h-full w-full object-cover"></video>
                <div class="absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-1 text-[10px] font-black text-champagne">من</div>
              </div>
              <div class="absolute bottom-4 right-4 left-4 flex flex-wrap items-center justify-center gap-2">
                <button class="grid h-12 w-12 place-items-center rounded-full border border-gold/15 bg-black/70 text-white backdrop-blur-xl" :disabled="!joined" @click="toggle('audio')"><Mic v-if="micOn" class="h-5 w-5" /><MicOff v-else class="h-5 w-5 text-red-200" /></button>
                <button class="grid h-12 w-12 place-items-center rounded-full border border-gold/15 bg-black/70 text-white backdrop-blur-xl" :disabled="!joined" @click="toggle('video')"><Camera v-if="camOn" class="h-5 w-5" /><CameraOff v-else class="h-5 w-5 text-red-200" /></button>
                <button class="grid h-12 w-12 place-items-center rounded-full border border-gold/15 bg-black/70 text-white backdrop-blur-xl" :disabled="!joined" @click="toggleSpeaker"><Volume2 class="h-5 w-5" /></button>
                <button class="grid h-12 w-12 place-items-center rounded-full border border-gold/15 bg-black/70 text-white backdrop-blur-xl" @click="fullscreenMode = !fullscreenMode"><Maximize class="h-5 w-5" /></button>
                <button class="grid h-12 w-12 place-items-center rounded-full bg-red-500 text-white shadow-2xl" :disabled="!joined" @click="leaveRoom"><PhoneOff class="h-5 w-5" /></button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </section>
  </AppShell>
</template>
