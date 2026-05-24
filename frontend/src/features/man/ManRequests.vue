<script setup lang="ts">
import BookingAccessCard from '../../components/lux/BookingAccessCard.vue'
import BookingActionsPanel from '../../components/lux/BookingActionsPanel.vue'
import BookingTimeline from '../../components/lux/BookingTimeline.vue'
import PremiumEmptyState from '../../components/lux/PremiumEmptyState.vue'
import { computed, onMounted } from 'vue'
import AppShell from '../../components/layout/AppShell.vue'
import { useManStore } from '../../stores/man'

const man = useManStore()
const labels: Record<string, string> = { date: 'دیت', chat: 'چت خصوصی', video_call: 'ویدیوکال' }

onMounted(() => man.myRequests())

const pending = computed(() => man.requests.filter((r: any) => ['pending', 'countered'].includes(r.status)))
const accepted = computed(() => man.requests.filter((r: any) => r.status === 'accepted'))
const closed = computed(() => man.requests.filter((r: any) => ['rejected', 'completed', 'cancelled', 'refunded'].includes(r.status)))

function slotStart(r: any) {
  if (!r?.date || !r?.time) return null
  return new Date(`{r.date}T{r.time}:00`)
}

function canAccess(r: any) {
  const start = slotStart(r)
  if (!start) return false
  const now = new Date()
  const openAt = new Date(start.getTime() - 5 * 60 * 1000)
  const closeAt = new Date(start.getTime() + Number(r.duration_minutes || 60) * 60 * 1000)
  return r.status === 'accepted' && ['chat','video_call'].includes(r.booking_type) && (r.early_open_approved || (now >= openAt && now <= closeAt))
}
</script>

<template>
  <AppShell>
    <section class="px-4 py-8 lg:px-10">
      <div class="badge">درخواست‌های من</div>
      <h1 class="mt-5 font-black">وضعیت رزرو، پیشنهاد جدید و اختلاف‌ها</h1>
      <p class="muted mt-4 max-w-3xl text-base leading-8 md:text-lg">
        همه درخواست‌ها اینجا دیده می‌شود. اگر خانم پیشنهاد قیمت جدید بدهد، در همین صفحه نمایش داده می‌شود.
      </p>

      <div class="mt-6 grid gap-4 xl:grid-cols-3">
        <section class="lux-panel p-5">
          <div class="badge">در انتظار</div>
          <h2 class="mt-3 font-black">درخواست‌های ارسال‌شده</h2>

          <div class="mt-5 space-y-4">
            <article v-for="r in pending" :key="r.id" class="rounded-[1.2rem] border border-gold/10 bg-black/35 p-4">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-base font-black text-white">{{ labels[r.booking_type] || r.booking_type }}</p>
                  <p class="mt-1 text-sm text-muted">{{ r.date }} · {{ r.time }} · {{ Number(r.offer_amount || 0) }} تومان</p>
                </div>
                <span class="rounded-full bg-gold/10 px-3 py-1 text-xs font-black text-champagne">{{ r.status === 'countered' ? 'پیشنهاد جدید خانم' : 'در انتظار' }}</span>
              </div>

              <div v-if="r.status === 'countered'" class="mt-4 rounded-2xl border border-gold/20 bg-gold/10 p-4">
                <p class="text-sm text-muted">پیشنهاد جدید خانم</p>
                <p class="mt-1 text-2xl font-black text-champagne">{{ Number(r.counter_amount || 0) }} تومان</p>
                <p class="mt-2 text-xs leading-6 text-muted">در مرحله بعد می‌توانیم دکمه پرداخت مابه‌التفاوت/تایید پیشنهاد را هم اضافه کنیم.</p>
              </div>

              <BookingTimeline :status="r.status" :booking-type="r.booking_type" class="mt-3" />
              <BookingAccessCard :booking-id="r.id" :booking-type="r.booking_type" :status="r.status" :date="r.date" :time="r.time" :duration-minutes="r.duration_minutes" :early-open-approved="r.early_open_approved" />
              <BookingActionsPanel :booking-id="r.id" :booking-type="r.booking_type" :status="r.status" :access-allowed="canAccess(r)" @updated="man.myRequests()" />
            </article>

            <PremiumEmptyState v-if="!pending.length" title="درخواستی در انتظار نیست" text="وقتی رزروی ارسال کنی اینجا دیده می‌شود." />
          </div>
        </section>

        <section class="lux-panel p-5">
          <div class="badge">تایید شده</div>
          <h2 class="mt-3 font-black">ارتباط‌های باز</h2>

          <div class="mt-5 space-y-4">
            <article v-for="r in accepted" :key="r.id" class="rounded-[1.2rem] border border-gold/10 bg-black/35 p-4">
              <p class="text-base font-black text-white">{{ labels[r.booking_type] || r.booking_type }}</p>
              <p class="mt-1 text-sm text-muted">{{ r.date }} · {{ r.time }} · {{ Number(r.offer_amount || 0) }} تومان</p>

              <BookingTimeline :status="r.status" :booking-type="r.booking_type" class="mt-3" />
              <BookingAccessCard :booking-id="r.id" :booking-type="r.booking_type" :status="r.status" :date="r.date" :time="r.time" :duration-minutes="r.duration_minutes" :early-open-approved="r.early_open_approved" />
              <BookingActionsPanel :booking-id="r.id" :booking-type="r.booking_type" :status="r.status" :access-allowed="canAccess(r)" @updated="man.myRequests()" />
            </article>

            <PremiumEmptyState v-if="!accepted.length" title="جلسه فعالی نداری" text="بعد از تایید خانم، ارتباط اینجا فعال می‌شود." />
          </div>
        </section>

        <section class="lux-panel p-5">
          <div class="badge">بسته‌شده‌ها</div>
          <h2 class="mt-3 font-black">رد، تکمیل یا ریفاند</h2>

          <div class="mt-5 space-y-4">
            <article v-for="r in closed" :key="r.id" class="rounded-[1.2rem] border border-gold/10 bg-black/35 p-4">
              <p class="text-base font-black text-white">{{ labels[r.booking_type] || r.booking_type }}</p>
              <p class="mt-1 text-sm text-muted">وضعیت: {{ r.status }} · {{ r.date }} · {{ r.time }}</p>
              <BookingTimeline :status="r.status" :booking-type="r.booking_type" class="mt-3" />
              <BookingAccessCard :booking-id="r.id" :booking-type="r.booking_type" :status="r.status" :date="r.date" :time="r.time" :duration-minutes="r.duration_minutes" :early-open-approved="r.early_open_approved" />
              <BookingActionsPanel :booking-id="r.id" :booking-type="r.booking_type" :status="r.status" :access-allowed="canAccess(r)" @updated="man.myRequests()" />
            </article>

            <PremiumEmptyState v-if="!closed.length" title="آرشیو خالی است" text="رزروهای تکمیل، رد یا ریفاند شده اینجا می‌آیند." />
          </div>
        </section>
      </div>
    </section>
  </AppShell>
</template>
