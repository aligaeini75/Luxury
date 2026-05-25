<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AdminShell from '../../components/admin/AdminShell.vue'
import { api } from '../../lib/api'

const disputes = ref<any[]>([])
const earlyRequests = ref<any[]>([])
const note = ref('')

async function load() {
  const { data } = await api.get('/admin/early-disputes')
  disputes.value = data.disputes || []
  earlyRequests.value = data.early_open_requests || []
}

async function decideEarly(id: string, action: 'approve' | 'reject') {
  await api.post(`/admin/early-open/${id}/${action}`, { note: note.value })
  note.value = ''
  await load()
}

async function resolveDispute(id: string, action: 'refund' | 'release' | 'reject') {
  await api.post(`/admin/disputes/${id}/resolve`, { action, note: note.value })
  note.value = ''
  await load()
}

function typeLabel(type: string) {
  const map: Record<string, string> = { date: 'دیت', chat: 'چت خصوصی', video_call: 'ویدیوکال' }
  return map[type] || type
}

onMounted(load)
</script>

<template>
  <AdminShell>
    <section dir="rtl" class="space-y-8 px-4 py-6 text-right lg:px-8">
      <div class="rounded-[2.4rem] border border-gold/15 bg-white/[.045] p-6 shadow-aura backdrop-blur-2xl">
        <div class="inline-flex rounded-full border border-gold/25 bg-gold/10 px-4 py-2 text-xs font-black text-champagne">اختلاف‌ها و درخواست‌های فوری</div>
        <h1 class="mt-5 text-4xl font-black text-white md:text-6xl">رسیدگی به درخواست زودتر باز شدن و اختلاف‌ها</h1>
        <p class="mt-4 max-w-3xl leading-8 text-muted">
          فقط رزروهای تاییدشده چت یا ویدیوکال می‌توانند درخواست باز شدن زودتر داشته باشند. ادمین می‌تواند تایید/رد کند یا در اختلاف‌ها ریفاند و آزادسازی وجه انجام دهد.
        </p>
      </div>

      <div class="grid gap-6 xl:grid-cols-2">
        <section class="rounded-[2rem] border border-gold/15 bg-white/[.045] p-6 shadow-aura">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-black text-white">درخواست‌های باز شدن زودتر</h2>
              <p class="mt-2 text-sm text-muted">درخواست‌هایی که از پنل مرد یا زن ارسال شده‌اند</p>
            </div>
            <span class="rounded-full bg-gold px-3 py-1 text-sm font-black text-black">{{ earlyRequests.length }}</span>
          </div>

          <div class="mt-5 space-y-3">
            <article v-for="item in earlyRequests" :key="item.id" class="rounded-2xl border border-gold/10 bg-black/35 p-4">
              <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p class="font-black text-white">رزرو شماره {{ item.booking_id }}</p>
                  <p class="mt-1 text-sm text-muted">
                    نوع: {{ typeLabel(item.booking_type) }} · وضعیت رزرو: {{ item.booking_status }}
                  </p>
                  <p class="mt-1 text-sm text-muted">
                    آقا: {{ item.man_email || '-' }} · خانم: {{ item.woman_email || '-' }}
                  </p>
                  <p class="mt-1 text-sm text-muted">درخواست‌دهنده: {{ item.requester_email || '-' }} / {{ item.requester_role || '-' }}</p>
                </div>
                <span class="rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-xs font-black text-champagne">در انتظار ادمین</span>
              </div>

              <p class="mt-4 rounded-2xl bg-white/[.035] p-3 text-sm leading-7 text-muted">{{ item.note || 'بدون توضیح' }}</p>
              <textarea v-model="note" class="lux-input mt-3 min-h-20" placeholder="یادداشت ادمین"></textarea>
              <div class="mt-3 grid grid-cols-2 gap-2">
                <button class="lux-btn" @click="decideEarly(item.id, 'approve')">تایید و باز کردن</button>
                <button class="lux-btn-dark" @click="decideEarly(item.id, 'reject')">رد درخواست</button>
              </div>
            </article>
            <div v-if="!earlyRequests.length" class="rounded-2xl border border-gold/10 bg-black/35 p-6 text-muted">درخواست فوری فعالی وجود ندارد.</div>
          </div>
        </section>

        <section class="rounded-[2rem] border border-gold/15 bg-white/[.045] p-6 shadow-aura">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-black text-white">اختلاف‌های باز</h2>
              <p class="mt-2 text-sm text-muted">امکان ریفاند، آزادسازی وجه یا رد اختلاف</p>
            </div>
            <span class="rounded-full bg-red-400 px-3 py-1 text-sm font-black text-black">{{ disputes.length }}</span>
          </div>

          <div class="mt-5 space-y-3">
            <article v-for="item in disputes" :key="item.id" class="rounded-2xl border border-gold/10 bg-black/35 p-4">
              <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p class="font-black text-white">رزرو شماره {{ item.booking_id }}</p>
                  <p class="mt-1 text-sm text-muted">نوع: {{ typeLabel(item.booking_type) }} · مبلغ: {{ item.booking_amount || 0 }} تومان</p>
                  <p class="mt-1 text-sm text-muted">آقا: {{ item.man_email || '-' }} · خانم: {{ item.woman_email || '-' }}</p>
                  <p class="mt-1 text-sm text-muted">گزارش‌دهنده: {{ item.reporter_email || '-' }}</p>
                </div>
                <span class="rounded-full border border-red-300/25 bg-red-500/10 px-3 py-1 text-xs font-black text-red-100">اختلاف باز</span>
              </div>

              <p class="mt-4 rounded-2xl bg-white/[.035] p-3 text-sm leading-7 text-muted">{{ item.reason || 'بدون توضیح' }}</p>
              <textarea v-model="note" class="lux-input mt-3 min-h-20" placeholder="یادداشت تصمیم ادمین"></textarea>
              <div class="mt-3 grid gap-2 sm:grid-cols-3">
                <button class="lux-btn" @click="resolveDispute(item.id, 'refund')">ریفاند به آقا</button>
                <button class="lux-btn-dark" @click="resolveDispute(item.id, 'release')">آزادسازی وجه</button>
                <button class="rounded-full border border-red-300/20 bg-red-500/10 px-4 py-3 font-black text-red-100" @click="resolveDispute(item.id, 'reject')">رد اختلاف</button>
              </div>
            </article>
            <div v-if="!disputes.length" class="rounded-2xl border border-gold/10 bg-black/35 p-6 text-muted">اختلاف بازی وجود ندارد.</div>
          </div>
        </section>
      </div>
    </section>
  </AdminShell>
</template>
