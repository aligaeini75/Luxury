<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AdminShell from '../../components/admin/AdminShell.vue'
import UserAvatar from '../../components/lux/UserAvatar.vue'
import PremiumEmptyState from '../../components/lux/PremiumEmptyState.vue'
import { useAdminStore } from '../../stores/admin'

const admin = useAdminStore()
const notes = ref<Record<string, string>>({})
const busy = ref('')
async function review(id: string, status: 'approved' | 'rejected') {
  busy.value = id
  try { await admin.reviewKyc(id, status, notes.value[id] || '') } finally { busy.value = '' }
}

onMounted(() => admin.loadKyc())

function statusLabel(status: string) {
  if (status === 'approved') return 'تایید شده'
  if (status === 'rejected') return 'رد شده'
  return 'در انتظار بررسی'
}
</script>

<template>
  <AdminShell>
    <section class="px-4 py-8 lg:px-10">
      <div class="rounded-[1.6rem] border border-gold/15 bg-white/[.045] p-3 shadow-aura">
        <div class="badge">این کاربر تایید شده کاربران</div>
        <h1 class="mt-5 font-black">مدارک مرد و زن با اطلاعات کامل</h1>
        <p class="muted mt-4 max-w-3xl leading-8">
          اینجا شماره موبایل، ایمیل، عکس کارت ملی، ویدیو سلفی و اطلاعات پروفایل کاربر دیده می‌شود. تایید نهایی فقط از سمت ادمین انجام می‌شود.
        </p>
      </div>

      <div class="mt-8 grid gap-5 xl:grid-cols-2">
        <details class='rounded-[1rem] border border-gold/10 bg-white/[.04] p-3'><summary class='cursor-pointer text-sm font-black text-white'>نمایش مدارک احراز هویت</summary><article v-for="k in admin.kyc" :key="k.id" class="overflow-hidden rounded-[1.35rem] border border-gold/15 bg-white/[.045] shadow-aura">
          <div class="flex items-center gap-4 border-b border-gold/10 p-5">
            <UserAvatar :src="k.avatar_url" :name="k.display_name || k.user_email" size="lg" />
            <div class="min-w-0 flex-1">
              <h2 class="truncate text-lg font-black text-white">{{ k.display_name || k.full_name || k.user_email }}</h2>
              <p class="mt-1 text-sm text-muted">{{ k.user_email }} · {{ k.role === 'woman' ? 'خانم' : k.role === 'man' ? 'آقا' : 'ادمین' }}</p>
              <div class="mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black"
                :class="k.status === 'approved' ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100' : k.status === 'rejected' ? 'border-red-300/20 bg-red-500/10 text-red-100' : 'border-gold/20 bg-gold/10 text-champagne'">
                <span class="h-2 w-2 rounded-full" :class="k.status === 'approved' ? 'bg-emerald-300' : k.status === 'rejected' ? 'bg-red-300' : 'bg-gold'"></span>
                {{ statusLabel(k.status) }}
              </div>
            </div>
          </div>

          <div class="grid gap-4 p-5 md:grid-cols-2">
            <div class="rounded-2xl border border-gold/10 bg-black/35 p-4">
              <p class="text-xs font-black text-muted">شماره موبایل</p>
              <p class="mt-2 text-lg font-black text-white">{{ k.mobile || 'ثبت نشده' }}</p>
            </div>
            <div class="rounded-2xl border border-gold/10 bg-black/35 p-4">
              <p class="text-xs font-black text-muted">ایمیل</p>
              <p class="mt-2 truncate text-lg font-black text-white">{{ k.email || k.user_email }}</p>
            </div>

            <div class="rounded-2xl border border-gold/10 bg-black/35 p-3">
              <p class="mb-3 text-xs font-black text-muted">عکس کارت ملی</p>
              <img v-if="k.national_card_url" :src="k.national_card_url" class="h-28 w-full rounded-xl object-cover" />
              <div v-else class="skeleton-gold grid h-28 place-items-center rounded-xl text-muted">مدرک بارگذاری نشده</div>
            </div>

            <div class="rounded-2xl border border-gold/10 bg-black/35 p-3">
              <p class="mb-3 text-xs font-black text-muted">ویدیو سلفی</p>
              <video v-if="k.selfie_video_url || k.selfie_url" controls :src="k.selfie_video_url || k.selfie_url" class="h-28 w-full rounded-xl object-cover"></video>
              <div v-else class="skeleton-gold grid h-28 place-items-center rounded-xl text-muted">ویدیو بارگذاری نشده</div>
            </div>
          </div>

          <div class="border-t border-gold/10 p-5">
            <textarea v-model="notes[k.id]" class="lux-input min-h-24" placeholder="یادداشت ادمین برای کاربر"></textarea>
            <div class="mt-3 grid grid-cols-2 gap-3">
              <button class="lux-btn" :disabled="busy === k.id || k.status === 'approved'" @click="review(k.id, 'approved')">{{ k.status === 'approved' ? 'تایید شده' : 'این کاربر تایید شده' }}</button>
              <button class="rounded-full border border-red-300/20 bg-red-500/10 px-5 py-3 font-black text-red-100" :disabled="busy === k.id || k.status === 'rejected'" @click="review(k.id, 'rejected')">{{ k.status === 'rejected' ? 'رد شده' : 'رد مدارک' }}</button>
            </div>
          </div>
        </article></details>

        <div v-if="!admin.kyc.length" class="rounded-[1.35rem] border border-gold/15 bg-white/[.045] p-8 text-muted">
          هنوز درخواست احراز هویتی ثبت نشده است.
        </div>
      </div>
    </section>
  </AdminShell>
</template>
