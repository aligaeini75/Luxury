<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import AdminShell from '../../components/admin/AdminShell.vue'
import UserAvatar from '../../components/lux/UserAvatar.vue'
import { useAdminStore } from '../../stores/admin'

const a = useAdminStore()
const replies = reactive<Record<string, string>>({})
onMounted(() => a.loadTickets())

function roleLabel(role: string) {
  return role === 'woman' ? 'خانم' : role === 'man' ? 'آقا' : role || 'کاربر'
}
</script>

<template>
  <AdminShell>
    <section class="px-4 py-7 lg:px-10 lg:py-10">
      <div class="rounded-[2.4rem] border border-gold/15 bg-white/[.045] p-6 shadow-aura">
        <div class="badge">تیکت‌ها</div>
        <h1 class="mt-5 text-4xl font-black md:text-7xl">تیکت‌ها با اطلاعات کامل کاربر</h1>
        <p class="muted mt-4 max-w-3xl leading-8">
          هر تیکت با عکس کاربر، نقش، ایمیل، موبایل، وضعیت و آخرین پیام نمایش داده می‌شود.
        </p>
      </div>

      <div class="mt-8 grid gap-5 xl:grid-cols-2">
        <article v-for="t in a.tickets" :key="t.id" class="overflow-hidden rounded-[2rem] border border-gold/15 bg-white/[.045] shadow-aura">
          <div class="flex items-center gap-4 border-b border-gold/10 p-5">
            <UserAvatar :src="t.avatar_url" :name="t.display_name || t.user_email" size="lg" />
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <h2 class="truncate text-2xl font-black text-white">{{ t.display_name || t.full_name || t.user_email }}</h2>
                <span class="rounded-full bg-gold/10 px-3 py-1 text-xs font-black text-champagne">{{ roleLabel(t.role) }}</span>
                <span :class="t.status === 'closed' ? 'status-red' : 'status-gold'">{{ t.status === 'closed' ? 'بسته' : t.status }}</span>
              </div>
              <p class="mt-1 text-sm text-muted">{{ t.user_email }} · {{ t.mobile || 'بدون موبایل' }}</p>
              <p v-if="t.ticket_locked" class="mt-2 text-xs font-black text-red-200">ثبت تیکت برای این کاربر بسته شده است.</p>
            </div>
          </div>

          <div class="p-5">
            <p class="text-xs font-black text-muted">موضوع تیکت</p>
            <h3 class="mt-2 text-2xl font-black text-champagne">{{ t.subject }}</h3>
            <div class="mt-4 rounded-2xl border border-gold/10 bg-black/35 p-4">
              <p class="text-xs text-muted">آخرین پیام</p>
              <p class="mt-2 leading-8 text-white">{{ t.last_message || 'بدون پیام' }}</p>
            </div>

            <textarea v-model="replies[t.id]" class="lux-input mt-4 min-h-24" placeholder="پاسخ ادمین"></textarea>
            <div class="mt-4 grid gap-2 sm:grid-cols-3">
              <button class="lux-btn" @click="a.replyTicket(t.id, replies[t.id] || '')">ارسال پاسخ</button>
              <button class="lux-btn-dark" @click="a.setTicketStatus(t.id, 'open')">باز</button>
              <button class="rounded-full border border-red-300/20 bg-red-500/10 px-4 py-3 font-black text-red-100" @click="a.setTicketStatus(t.id, 'closed')">بستن تیکت</button>
            </div>
          </div>
        </article>

        <div v-if="!a.tickets.length" class="rounded-[2rem] border border-gold/15 bg-white/[.045] p-8 text-muted">
          تیکتی ثبت نشده است.
        </div>
      </div>
    </section>
  </AdminShell>
</template>
