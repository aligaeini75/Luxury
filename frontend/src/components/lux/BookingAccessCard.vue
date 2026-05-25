<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { MessageCircle, Video } from 'lucide-vue-next'
import { api } from '../../lib/api'

const props = defineProps<{
  bookingId: string
  bookingType?: string
  status?: string
  date?: string
  time?: string
  durationMinutes?: number
  earlyOpenApproved?: number | boolean
}>()

const access = ref<any>(null)
const router = useRouter()
const loading = ref(false)
const now = ref(Date.now())
let timer: number | undefined

async function load() {
  if (!props.bookingId) return
  loading.value = true
  try {
    const { data } = await api.get(`/bookings/${props.bookingId}/access`)
    access.value = data
  } catch {
    access.value = null
  } finally {
    loading.value = false
  }
}

const startMs = computed(() => {
  if (!props.date || !props.time) return 0
  return new Date(`${props.date}T${props.time}:00`).getTime()
})
const endMs = computed(() => startMs.value ? startMs.value + Number(props.durationMinutes || 60) * 60_000 : 0)
const openMs = computed(() => startMs.value ? startMs.value - 5 * 60_000 : 0)
const isAccepted = computed(() => String(props.status || '') === 'accepted')
const isCommunication = computed(() => ['chat', 'video_call'].includes(String(props.bookingType || '')))
const isOpenByTime = computed(() => Boolean(startMs.value && now.value >= openMs.value && now.value <= endMs.value))
const earlyApproved = computed(() => Boolean(props.earlyOpenApproved || access.value?.early_open_approved))
const hasAccess = computed(() => {
  if (!isAccepted.value) return false
  if (earlyApproved.value) return true
  if (!isCommunication.value) return false
  return isOpenByTime.value
})

const remainingMs = computed(() => Math.max(0, openMs.value - now.value))
const remainingLabel = computed(() => {
  const total = Math.floor(remainingMs.value / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
})

function openChat() { if (hasAccess.value) router.push('/chat') }
function openVideo() { if (hasAccess.value) router.push(`/video-call/${props.bookingId}`) }

onMounted(() => {
  load()
  timer = window.setInterval(() => now.value = Date.now(), 1000)
})
onUnmounted(() => { if (timer) window.clearInterval(timer) })
</script>

<template>
  <div v-if="isAccepted && isCommunication" class="mt-3 rounded-[1.2rem] border border-gold/10 bg-black/25 p-4">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-sm font-black text-champagne">دسترسی ارتباط</p>
        <p v-if="hasAccess" class="mt-1 text-xs leading-6 text-muted">دسترسی فعال است؛ می‌توانی وارد ارتباط شوی.</p>
        <p v-else class="mt-1 text-xs leading-6 text-muted">بعد از رسیدن زمان، دکمه ارتباط فعال می‌شود.</p>
      </div>

      <div v-if="!hasAccess" class="rounded-2xl border border-gold/15 bg-gold/10 px-4 py-3 text-center">
        <p class="text-[11px] font-bold text-muted">مانده تا باز شدن</p>
        <b class="mt-1 block text-xl text-gold">{{ remainingLabel }}</b>
      </div>
    </div>

    <button
      v-if="bookingType === 'chat'"
      class="lux-btn mt-4 w-full"
      :class="!hasAccess ? 'opacity-45' : ''"
      :disabled="!hasAccess"
      @click="openChat"
    >
      <MessageCircle class="ml-2 h-4 w-4" />
      ورود به چت
    </button>

    <button
      v-if="bookingType === 'video_call'"
      class="lux-btn mt-4 w-full"
      :class="!hasAccess ? 'opacity-45' : ''"
      :disabled="!hasAccess"
      @click="openVideo"
    >
      <Video class="ml-2 h-4 w-4" />
      ورود به ویدیوکال
    </button>
  </div>
</template>
