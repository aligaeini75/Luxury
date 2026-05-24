<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AdminShell from '../../components/admin/AdminShell.vue'
import UserAvatar from '../../components/lux/UserAvatar.vue'
import PremiumEmptyState from '../../components/lux/PremiumEmptyState.vue'
import { useAdminStore } from '../../stores/admin'

const a = useAdminStore()
const search = ref('')
const open = ref<Record<string, boolean>>({})
const filteredUsers = computed(() => a.users.filter((u:any) => {
  const q = search.value.toLowerCase()
  return !q || String(u.display_name || u.email || '').toLowerCase().includes(q)
}))
onMounted(() => a.loadUsers())
function roleLabel(role: string) { return role === 'woman' ? 'خانم' : role === 'man' ? 'آقا' : role === 'admin' ? 'ادمین' : 'کاربر' }
function toggle(id: string) { open.value[id] = !open.value[id] }
</script>

<template>
  <AdminShell>
    <section class="px-4 py-7 lg:px-8">
      <div class="rounded-[1.6rem] border border-gold/15 bg-white/[.045] p-5 shadow-aura">
        <div class="badge">کاربران</div>
        <h1 class="mt-3 font-black">مدیریت مینیمال کاربران</h1>
        <p class="muted mt-2 max-w-3xl">کارت‌ها پیش‌فرض بسته هستند تا صفحه شلوغ نشود. برای عملیات، کارت را باز کن.</p>
      </div>

      <div class="mt-5"><input v-model="search" class="lux-input" placeholder="جستجو کاربر..." /></div>

      <div class="mt-5 grid gap-3 xl:grid-cols-2">
        <article v-for="u in filteredUsers" :key="u.id" class="rounded-[1.35rem] border border-gold/10 bg-white/[.04] p-3">
          <button class="flex w-full items-center gap-3 text-right" @click="toggle(u.id)">
            <UserAvatar :src="u.avatar_url" :name="u.display_name || u.email" size="md" />
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <h2 class="truncate text-base font-black text-white">{{ u.display_name || u.full_name || u.email }}</h2>
                <span class="rounded-full bg-gold/10 px-2 py-0.5 text-[11px] font-black text-champagne">{{ roleLabel(u.role) }}</span>
                <span :class="u.status === 'blocked' ? 'status-red' : 'status-green'">{{ u.status === 'blocked' ? 'مسدود' : 'فعال' }}</span>
                <span v-if="u.verified" class="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[11px] font-black text-emerald-100">تایید شده</span>
              </div>
              <p class="mt-1 truncate text-xs text-muted">{{ u.email }}</p>
            </div>
            <span class="rounded-full border border-gold/15 px-3 py-1 text-xs text-muted">{{ open[u.id] ? 'بستن' : 'جزئیات' }}</span>
          </button>

          <div v-if="open[u.id]" class="mt-3 grid gap-3 border-t border-gold/10 pt-3 md:grid-cols-3">
            <div class="rounded-2xl bg-black/25 p-3"><p class="text-[11px] text-muted">کیف پول</p><b class="text-gold">{{ u.balance || 0 }}</b></div>
            <div class="rounded-2xl bg-black/25 p-3"><p class="text-[11px] text-muted">امانت</p><b class="text-gold">{{ u.locked_balance || 0 }}</b></div>
            <div class="rounded-2xl bg-black/25 p-3"><p class="text-[11px] text-muted">رزروها</p><b class="text-gold">{{ u.booking_count || 0 }}</b></div>

            <div class="md:col-span-3 flex flex-wrap gap-2">
              <button class="lux-btn-dark" @click="a.setUserStatus(u.id, u.status === 'blocked' ? 'active' : 'blocked')">
                {{ u.status === 'blocked' ? 'فعال کردن' : 'مسدود کردن' }}
              </button>
              <button class="lux-btn-dark" @click="a.setUserTicketLock(u.id, !u.ticket_locked)">
                {{ u.ticket_locked ? 'باز کردن تیکت' : 'مسدود کردن تیکت' }}
              </button>
            </div>
          </div>
        </article>

        <PremiumEmptyState v-if="!filteredUsers.length" title="کاربری پیدا نشد" text="عبارت جستجو را تغییر بده." />
      </div>
    </section>
  </AdminShell>
</template>
