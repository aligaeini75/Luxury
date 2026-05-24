<script setup lang="ts">
import { computed, onMounted, watch, ref } from 'vue'
import { api } from '../../lib/api'

const props = defineProps<{
  bookingId: string
  bookingType?: string
  status?: string
  accessAllowed?: boolean
}>()

const emit = defineEmits(['updated'])

const earlyNote = ref('')
const disputeReason = ref('')
const loading = ref(false)
const message = ref('')
const earlyRequests = ref<any[]>([])
const disputes = ref<any[]>([])

const isAccepted = computed(() => String(props.status || '') === 'accepted')
const canRequestEarly = computed(() =>
  isAccepted.value && !props.accessAllowed && ['chat', 'video_call'].includes(String(props.bookingType || ''))
)
const canReportDispute = computed(() => isAccepted.value)

async function loadActivity() {
  if (!props.bookingId || !isAccepted.value) {
    earlyRequests.value = []
    disputes.value = []
    return
  }
  const { data } = await api.get(`/bookings/{props.bookingId}/activity`).catch(() => ({ data: null }))
  earlyRequests.value = data?.early_open_requests || []
  disputes.value = data?.disputes || []
}

async function requestEarlyOpen() {
  if (!canRequestEarly.value) {
    message.value = 'بعد از تایید خانم، امکان درخواست باز شدن زودتر فعال می‌شود.'
    return
  }

  loading.value = true
  message.value = ''
  try {
    await api.post(`/bookings/{props.bookingId}/early-open/request`, { note: earlyNote.value })
    message.value = 'درخواست باز شدن زودتر برای ادمین ارسال شد.'
    earlyNote.value = ''
    await loadActivity()
    emit('updated')
  } catch (err: any) {
    message.value = err?.response?.data?.error || 'ثبت درخواست ناموفق بود.'
  } finally {
    loading.value = false
  }
}

async function reportDispute() {
  if (!canReportDispute.value) {
    message.value = 'گزارش اختلاف بعد از تایید رزرو فعال می‌شود.'
    return
  }

  loading.value = true
  message.value = ''
  try {
    await api.post(`/bookings/{props.bookingId}/disputes`, { reason: disputeReason.value })
    message.value = 'گزارش اختلاف ثبت شد و ادمین می‌تواند بررسی یا ریفاند انجام دهد.'
    disputeReason.value = ''
    await loadActivity()
    emit('updated')
  } catch (err: any) {
    message.value = err?.response?.data?.error || 'ثبت اختلاف ناموفق بود.'
  } finally {
    loading.value = false
  }
}

function statusLabel(status?: string) {
  const map: Record<string, string> = {
    pending: 'در انتظار',
    approved: 'تایید شده',
    rejected: 'رد شده',
    open: 'باز',
    refunded: 'ریفاند شده',
    released: 'آزادسازی شده',
  }
  return map[String(status || '')] || status || 'نامشخص'
}

onMounted(loadActivity)
watch(() => props.status, loadActivity)
</script>

<template>
  <div class="mt-4 rounded-[1.6rem] border border-gold/15 bg-black/35 p-4">
    <p class="text-sm font-black text-champagne">عملیات رزرو</p>

    <div v-if="!isAccepted" class="mt-4 rounded-2xl border border-gold/10 bg-white/[.035] p-4">
      <p class="text-sm font-black text-white">بعد از تایید خانم فعال می‌شود</p>
      <p class="mt-2 text-sm leading-7 text-muted">
        درخواست باز شدن زودتر و گزارش اختلاف فقط زمانی نمایش داده می‌شود که رزرو توسط خانم تایید شده باشد.
      </p>
    </div>

    <template v-else>
      <div v-if="canRequestEarly" class="mt-4 rounded-2xl border border-gold/10 bg-white/[.035] p-4">
        <p class="text-sm leading-7 text-muted">
          اگر هر دو طرف می‌خواهند چت یا ویدیوکال زودتر باز شود، درخواست را برای بررسی ادمین ثبت کن.
        </p>
        <textarea v-model="earlyNote" class="lux-input mt-3 min-h-24" placeholder="توضیح کوتاه برای ادمین"></textarea>
        <button class="lux-btn mt-3 w-full" :disabled="loading" @click="requestEarlyOpen">
          درخواست باز شدن زودتر
        </button>
      </div>

      <div class="mt-4 rounded-2xl border border-red-300/15 bg-red-500/[.04] p-4">
        <p class="text-sm leading-7 text-muted">
          اگر در رزرو، پرداخت، هماهنگی یا کیفیت جلسه مشکلی وجود دارد، اختلاف ثبت کن تا ادمین بررسی کند.
        </p>
        <textarea v-model="disputeReason" class="lux-input mt-3 min-h-24" placeholder="شرح اختلاف یا مشکل"></textarea>
        <button class="mt-3 w-full rounded-full border border-red-300/20 bg-red-500/10 px-5 py-3 font-black text-red-100" :disabled="loading" @click="reportDispute">
          ثبت گزارش اختلاف
        </button>
      </div>
    </template>

    <div v-if="earlyRequests.length || disputes.length" class="mt-4 grid gap-3">
      <div v-if="earlyRequests.length" class="rounded-2xl border border-gold/10 bg-white/[.03] p-4">
        <p class="text-sm font-black text-champagne">درخواست‌های باز شدن زودتر</p>
        <div v-for="item in earlyRequests" :key="item.id" class="mt-3 rounded-xl bg-black/35 p-3 text-xs leading-6 text-muted">
          وضعیت: {{ statusLabel(item.status) }}<br />
          توضیح: {{ item.note || 'بدون توضیح' }}
        </div>
      </div>

      <div v-if="disputes.length" class="rounded-2xl border border-red-300/10 bg-red-500/[.035] p-4">
        <p class="text-sm font-black text-red-100">اختلاف‌های ثبت‌شده</p>
        <div v-for="item in disputes" :key="item.id" class="mt-3 rounded-xl bg-black/35 p-3 text-xs leading-6 text-muted">
          وضعیت: {{ statusLabel(item.status) }}<br />
          توضیح: {{ item.reason || 'بدون توضیح' }}
        </div>
      </div>
    </div>

    <p v-if="message" class="mt-3 rounded-2xl bg-gold/10 p-3 text-sm font-bold text-champagne">{{ message }}</p>
  </div>
</template>
