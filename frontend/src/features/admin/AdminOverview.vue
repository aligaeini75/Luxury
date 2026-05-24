<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AdminShell from '../../components/admin/AdminShell.vue'
import UserAvatar from '../../components/lux/UserAvatar.vue'
import { api } from '../../lib/api'

const data = ref<any>({ kpis: {}, recent_bookings: [] })

async function load() {
  const res = await api.get('/admin/ops/overview')
  data.value = res.data
}

function typeLabel(type: string) {
  const map: Record<string, string> = { date: 'دیت حضوری', chat: 'چت', video_call: 'ویدیوکال' }
  return map[type] || type
}

onMounted(load)
</script>

<template>
  <AdminShell>
    <section class="px-4 py-7 lg:px-10 lg:py-10">
      <div class="rounded-[2.4rem] border border-gold/15 bg-white/[.045] p-6 shadow-aura">
        <div class="badge">داشبورد عملیاتی</div>
        <h1 class="mt-5 text-4xl font-black md:text-7xl">وضعیت واقعی سیستم امروز</h1>
        <p class="muted mt-4 max-w-3xl leading-8">
          رزروها، پرداخت‌های امانی، احراز هویت، اختلاف‌ها، برداشت‌ها و اتاق‌های فعال اینجا یک‌جا دیده می‌شود.
        </p>
      </div>

      <div class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div class="lux-panel p-5"><p class="text-xs text-muted">درخواست امروز</p><b class="mt-2 block text-3xl text-champagne">{{ data.kpis.requests_today || 0 }}</b></div>
        <div class="lux-panel p-5"><p class="text-xs text-muted">تایید امروز</p><b class="mt-2 block text-3xl text-emerald-200">{{ data.kpis.accepted_today || 0 }}</b></div>
        <div class="lux-panel p-5"><p class="text-xs text-muted">KYC در انتظار</p><b class="mt-2 block text-3xl text-champagne">{{ data.kpis.pending_kyc || 0 }}</b></div>
        <div class="lux-panel p-5"><p class="text-xs text-muted">اختلاف باز</p><b class="mt-2 block text-3xl text-red-200">{{ data.kpis.open_disputes || 0 }}</b></div>
        <div class="lux-panel p-5"><p class="text-xs text-muted">امانت فعال</p><b class="mt-2 block text-3xl text-champagne">{{ data.kpis.funded_escrow_amount || 0 }}</b><p class="text-xs text-muted">{{ data.kpis.funded_escrow_count || 0 }} مورد</p></div>
        <div class="lux-panel p-5"><p class="text-xs text-muted">آزادسازی شده</p><b class="mt-2 block text-3xl text-emerald-200">{{ data.kpis.released_escrow_amount || 0 }}</b></div>
        <div class="lux-panel p-5"><p class="text-xs text-muted">برداشت در انتظار</p><b class="mt-2 block text-3xl text-champagne">{{ data.kpis.pending_withdraw_amount || 0 }}</b><p class="text-xs text-muted">{{ data.kpis.pending_withdraw_count || 0 }} درخواست</p></div>
        <div class="lux-panel p-5"><p class="text-xs text-muted">اتاق ویدیو فعال/آتی</p><b class="mt-2 block text-3xl text-champagne">{{ data.kpis.active_video_rooms || 0 }}</b></div>
      </div>

      <section class="mt-8 rounded-[2.4rem] border border-gold/15 bg-white/[.045] p-5 shadow-aura">
        <div class="badge">آخرین رزروها</div>
        <h2 class="mt-4 text-3xl font-black">چه کسی چه درخواستی داده؟</h2>

        <div class="mt-6 grid gap-4 xl:grid-cols-2">
          <article v-for="b in data.recent_bookings" :key="b.id" class="rounded-[1.8rem] border border-gold/10 bg-black/35 p-4">
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <UserAvatar :src="b.man_avatar_url" :name="b.man_name" />
                <div>
                  <p class="font-black text-white">{{ b.man_name || b.man_email }}</p>
                  <p class="text-xs text-muted">آقا · {{ b.man_email }}</p>
                </div>
              </div>
              <div class="text-center text-gold">←</div>
              <div class="flex items-center gap-3">
                <UserAvatar :src="b.woman_avatar_url" :name="b.woman_name" />
                <div>
                  <p class="font-black text-white">{{ b.woman_name || b.woman_email }}</p>
                  <p class="text-xs text-muted">خانم · {{ b.woman_email }}</p>
                </div>
              </div>
            </div>

            <div class="mt-4 grid gap-2 sm:grid-cols-4">
              <div class="rounded-2xl bg-white/[.045] p-3"><p class="text-xs text-muted">نوع</p><b>{{ typeLabel(b.booking_type) }}</b></div>
              <div class="rounded-2xl bg-white/[.045] p-3"><p class="text-xs text-muted">مبلغ</p><b>{{ b.offer_amount || b.counter_amount || 0 }}</b></div>
              <div class="rounded-2xl bg-white/[.045] p-3"><p class="text-xs text-muted">وضعیت</p><b>{{ b.status }}</b></div>
              <div class="rounded-2xl bg-white/[.045] p-3"><p class="text-xs text-muted">امانت</p><b>{{ b.escrow_status || '-' }}</b></div>
            </div>
          </article>
        </div>
      </section>
    
      <section class="mt-8 grid gap-4 xl:grid-cols-3">
        <RouterLink to="/admin/kyc" class="lux-panel p-5">
          <div class="badge">صف‌های فوری</div>
          <h3 class="mt-3 text-2xl font-black">KYC در انتظار</h3>
          <p class="muted mt-2">مدارک کاربران را سریع بررسی کن.</p>
        </RouterLink>
        <RouterLink to="/admin/disputes" class="lux-panel p-5">
          <div class="badge">ریسک عملیاتی</div>
          <h3 class="mt-3 text-2xl font-black">اختلاف و ریفاند</h3>
          <p class="muted mt-2">پرونده‌های باز و درخواست‌های فوری.</p>
        </RouterLink>
        <RouterLink to="/admin/wallets" class="lux-panel p-5">
          <div class="badge">مالی</div>
          <h3 class="mt-3 text-2xl font-black">پرداخت و برداشت</h3>
          <p class="muted mt-2">واریز، برداشت و escrow.</p>
        </RouterLink>
      </section>
    </section>
  </AdminShell>
</template>
