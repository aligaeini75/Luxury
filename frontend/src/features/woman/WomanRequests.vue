<script setup lang="ts">
import BookingAccessCard from '../../components/lux/BookingAccessCard.vue'
import BookingActionsPanel from '../../components/lux/BookingActionsPanel.vue'
import { computed, onMounted, reactive, ref } from 'vue'
import AppShell from '../../components/layout/AppShell.vue'
import { useWomanStore } from '../../stores/woman'

const woman = useWomanStore()
const counters = reactive<Record<string, number>>({})
const notice = ref('')
const labels: Record<string, string> = { date: 'دیت', chat: 'چت خصوصی', video_call: 'ویدیوکال' }

onMounted(async () => {
  await woman.studio()
  woman.requests.forEach((r: any) => {
    counters[r.id] = Number(r.counter_amount || r.offer_amount || 0)
  })
})

const pending = computed(() => woman.requests.filter((r: any) => ['pending', 'countered'].includes(r.status)))
const accepted = computed(() => woman.requests.filter((r: any) => r.status === 'accepted'))
const closed = computed(() => woman.requests.filter((r: any) => ['rejected', 'completed', 'cancelled', 'refunded'].includes(r.status)))

function minCounter(r: any) {
  return Number(r.offer_amount || 0)
}

async function respond(id: string, action: string, counterAmount?: number) {
  const req = woman.requests.find((x: any) => x.id === id)
  const min = Number(req?.offer_amount || 0)
  if (action === 'countered' && Number(counterAmount || 0) < min) {
    notice.value = `پیشنهاد جدید نمی‌تواند کمتر از مبلغ پیشنهادی آقا یعنی {min} تومان باشد.`
    return
  }

  await woman.respondRequest(id, action, counterAmount)
  notice.value =
    action === 'accepted'
      ? 'درخواست تایید شد و ارتباط خصوصی طبق نوع رزرو فعال می‌شود.'
      : action === 'rejected'
        ? 'درخواست رد شد و از صف انتظار خارج شد.'
        : 'پیشنهاد جدید برای آقا ارسال شد.'
}

function slotStart(r: any) {
  if (!r?.date || !r?.time) return null
  return new Date(`{r.date}T{r.time}:00`)
}

function canJoinVideo(r: any) {
  const start = slotStart(r)
  if (!start) return false
  const now = new Date()
  const openAt = new Date(start.getTime() - 5 * 60 * 1000)
  const closeAt = new Date(start.getTime() + Number(r.duration_minutes || 60) * 60 * 1000)
  return r.status === 'accepted' && r.booking_type === 'video_call' && now >= openAt && now <= closeAt
}

function goChat() { window.location.hash = '#/chat' }
function goVideo(id: string) { window.location.hash = `#/video-call/{id}` }
</script>

<template>
  <AppShell>
    <section class="px-4 py-8 lg:px-10">
      <div class="badge">درخواست‌ها و جلسات</div>
      <h1 class="mt-5 text-4xl font-black md:text-7xl">تایید، پیشنهاد جدید و پیگیری اختلاف‌ها</h1>
      <p class="muted mt-4 max-w-3xl text-base leading-8 md:text-lg">
        درخواست‌های آقا اینجا دیده می‌شود. اگر مبلغ پیشنهادی کم بود، می‌توانی پیشنهاد جدید بدهی؛ حداقل پیشنهاد جدید همان مبلغ پیشنهادی آقاست.
      </p>

      <p v-if="notice" class="mt-5 rounded-2xl border border-gold/20 bg-gold/10 p-4 font-bold text-champagne">{{ notice }}</p>

      <div class="mt-8 grid gap-6 xl:grid-cols-3">
        <section class="lux-panel p-5">
          <div class="badge">در انتظار بررسی</div>
          <h2 class="mt-3 text-3xl font-black">درخواست‌های جدید</h2>

          <div class="mt-5 space-y-4">
            <article v-for="r in pending" :key="r.id" class="rounded-[1.8rem] border border-gold/10 bg-black/35 p-4">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-lg font-black text-white">{{ r.man_name || 'آقا' }}</p>
                  <p class="mt-1 text-sm text-muted">{{ labels[r.booking_type] || r.booking_type }} · {{ r.date }} · {{ r.time }}</p>
                </div>
                <span class="rounded-full bg-gold/10 px-3 py-1 text-xs font-black text-champagne">{{ r.status === 'countered' ? 'پیشنهاد جدید ارسال شده' : 'در انتظار' }}</span>
              </div>

              <div class="mt-4 rounded-2xl border border-gold/10 bg-white/[.035] p-4">
                <p class="text-sm text-muted">مبلغ پیشنهادی آقا</p>
                <p class="mt-1 text-2xl font-black text-champagne">{{ Number(r.offer_amount || 0) }} تومان</p>
                <p v-if="r.message" class="mt-3 text-sm leading-7 text-muted">{{ r.message }}</p>
              </div>

              <label class="mt-4 block">
                <span class="text-xs font-black text-muted">پیشنهاد جدید برای آقا</span>
                <input
                  v-model="counters[r.id]"
                  type="number"
                  class="lux-input mt-2"
                  :min="minCounter(r)"
                  :placeholder="`حداقل {minCounter(r)} تومان`"
                />
              </label>

              <div class="mt-4 grid grid-cols-3 gap-2">
                <button class="lux-btn" @click="respond(r.id, 'accepted')">تایید</button>
                <button class="lux-btn-dark" @click="respond(r.id, 'countered', counters[r.id])">ارسال پیشنهاد</button>
                <button class="rounded-full border border-red-300/20 bg-red-500/10 px-4 py-3 text-sm font-black text-red-100" @click="respond(r.id, 'rejected')">رد</button>
              </div>

              <BookingAccessCard :booking-id="r.id" :booking-type="r.booking_type" :status="r.status" />
              <BookingActionsPanel :booking-id="r.id" :booking-type="r.booking_type" :status="r.status" @updated="woman.studio()" />
            </article>

            <div v-if="!pending.length" class="rounded-2xl border border-gold/10 bg-black/35 p-6 text-muted">درخواست در انتظاری وجود ندارد.</div>
          </div>
        </section>

        <section class="lux-panel p-5">
          <div class="badge">جلسات تایید شده</div>
          <h2 class="mt-3 text-3xl font-black">ارتباط‌های فعال</h2>

          <div class="mt-5 space-y-4">
            <article v-for="r in accepted" :key="r.id" class="rounded-[1.8rem] border border-gold/10 bg-black/35 p-4">
              <p class="text-lg font-black text-white">{{ r.man_name || 'آقا' }}</p>
              <p class="mt-1 text-sm text-muted">{{ labels[r.booking_type] || r.booking_type }} · {{ r.date }} · {{ r.time }}</p>

              <div class="mt-4 grid gap-2 sm:grid-cols-2">
                <button v-if="r.booking_type !== 'video_call'" class="lux-btn" @click="goChat">باز کردن چت</button>
                <button v-if="r.booking_type === 'video_call'" class="lux-btn" :disabled="!canJoinVideo(r) && !r.early_open_approved" @click="goVideo(r.id)">ورود به ویدیوکال</button>
              </div>

              <BookingAccessCard :booking-id="r.id" :booking-type="r.booking_type" :status="r.status" />
              <BookingActionsPanel :booking-id="r.id" :booking-type="r.booking_type" :status="r.status" @updated="woman.studio()" />
            </article>

            <div v-if="!accepted.length" class="rounded-2xl border border-gold/10 bg-black/35 p-6 text-muted">جلسه تایید شده‌ای وجود ندارد.</div>
          </div>
        </section>

        <section class="lux-panel p-5">
          <div class="badge">بسته‌شده‌ها</div>
          <h2 class="mt-3 text-3xl font-black">رد، تکمیل یا ریفاند</h2>

          <div class="mt-5 space-y-4">
            <article v-for="r in closed" :key="r.id" class="rounded-[1.8rem] border border-gold/10 bg-black/35 p-4">
              <p class="text-lg font-black text-white">{{ r.man_name || 'آقا' }}</p>
              <p class="mt-1 text-sm text-muted">{{ labels[r.booking_type] || r.booking_type }} · وضعیت: {{ r.status }}</p>
              <BookingAccessCard :booking-id="r.id" :booking-type="r.booking_type" :status="r.status" />
              <BookingActionsPanel :booking-id="r.id" :booking-type="r.booking_type" :status="r.status" @updated="woman.studio()" />
            </article>

            <div v-if="!closed.length" class="rounded-2xl border border-gold/10 bg-black/35 p-6 text-muted">مورد بسته‌شده‌ای وجود ندارد.</div>
          </div>
        </section>
      </div>
    </section>
  </AppShell>
</template>
