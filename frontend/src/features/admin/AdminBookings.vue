<script setup lang="ts">
import { onMounted } from 'vue'
import AdminShell from '../../components/admin/AdminShell.vue'
import UserAvatar from '../../components/lux/UserAvatar.vue'
import { useAdminStore } from '../../stores/admin'
import { faDate, faTimeRange, money } from '../../lib/format'

const a = useAdminStore()
onMounted(() => a.loadBookings())

function parseJson(v: any) {
  try { return Array.isArray(v) ? v : JSON.parse(v || '[]') } catch { return [] }
}
function typeLabel(t: string) {
  return { date: 'دیت حضوری', chat: 'چت خصوصی', video_call: 'ویدیوکال' }[t] || t
}
function statusText(s: string) {
  return { pending: 'در انتظار', accepted: 'تایید شده', countered: 'پیشنهاد جدید', rejected: 'رد شده', completed: 'تکمیل شده', refunded: 'ریفاند' }[s] || s
}
</script>

<template>
  <AdminShell>
    <section class="px-4 py-7 lg:px-10 lg:py-10">
      <div class="rounded-[2.4rem] border border-gold/15 bg-white/[.045] p-6 shadow-aura">
        <div class="badge">رزروها</div>
        <h1 class="mt-5 text-4xl font-black md:text-7xl">هر رزرو با دو کاربر، زمان، مرحله و مبلغ</h1>
      </div>

      <div class="mt-8 grid gap-5 xl:grid-cols-2">
        <article v-for="b in a.bookings" :key="b.id" class="overflow-hidden rounded-[2rem] border border-gold/15 bg-white/[.045] shadow-aura">
          <div v-if="parseJson(b.location_photos_json).length" class="grid h-44 grid-cols-3 gap-1">
            <img v-for="p in parseJson(b.location_photos_json).slice(0,3)" :key="p" :src="p" class="h-full w-full object-cover" />
          </div>
          <div v-else class="h-36 bg-[radial-gradient(circle_at_20%_10%,rgba(214,173,82,.20),transparent_35%),linear-gradient(135deg,rgba(255,240,189,.08),rgba(0,0,0,.5))]"></div>

          <div class="p-5">
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <UserAvatar :src="b.man_avatar_url" :name="b.man_name" />
                <div>
                  <p class="font-black text-white">{{ b.man_name || b.man_email }}</p>
                  <p class="text-xs text-muted">آقا · {{ b.man_email }}</p>
                </div>
              </div>
              <span class="text-gold">←</span>
              <div class="flex items-center gap-3">
                <UserAvatar :src="b.woman_avatar_url" :name="b.woman_name" />
                <div>
                  <p class="font-black text-white">{{ b.woman_name || b.woman_email }}</p>
                  <p class="text-xs text-muted">خانم · {{ b.woman_email }}</p>
                </div>
              </div>
            </div>

            <div class="mt-5 grid gap-3 sm:grid-cols-4">
              <div class="rounded-2xl bg-black/35 p-3"><p class="text-xs text-muted">نوع</p><b>{{ typeLabel(b.booking_type) }}</b></div>
              <div class="rounded-2xl bg-black/35 p-3"><p class="text-xs text-muted">مرحله</p><b>{{ statusText(b.status) }}</b></div>
              <div class="rounded-2xl bg-black/35 p-3"><p class="text-xs text-muted">امانت</p><b>{{ b.escrow_status || '-' }}</b></div>
              <div class="rounded-2xl bg-black/35 p-3"><p class="text-xs text-muted">مبلغ</p><b>{{ money(b.total_price || b.offer_amount || b.counter_amount || 0) }}</b></div>
            </div>

            <div class="mt-5 rounded-2xl border border-gold/10 bg-white/[.035] p-4">
              <p class="font-black text-champagne">زمان رزرو</p>
              <p class="mt-2 text-sm text-muted">{{ faDate(b.date) }} · {{ faTimeRange(b.time || b.start_time, b.end_time) }} · مدت {{ b.duration_minutes || 60 }} دقیقه</p>
              <p v-if="b.location_title" class="mt-3 text-sm text-white">{{ b.location_title }}</p>
              <p v-if="b.location_hint" class="mt-1 text-xs leading-6 text-muted">{{ b.location_hint }}</p>
              <div v-if="parseJson(b.services_json).length" class="mt-3 flex flex-wrap gap-2">
                <span v-for="s in parseJson(b.services_json)" :key="s.title" class="rounded-full bg-gold/10 px-3 py-1 text-xs text-champagne">
                  {{ s.title }} · {{ money(s.price || 0) }}
                </span>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  </AdminShell>
</template>
