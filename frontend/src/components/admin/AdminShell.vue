<script setup lang="ts">
import NotificationBell from '../lux/NotificationBell.vue'
import {
  Activity,
  Users,
  Wallet,
  CalendarCheck,
  ShieldCheck,
  MessageCircle,
  LogOut,
  FileText,
} from 'lucide-vue-next'
const links = [
  { to: '/admin', label: 'نمای کلی ادمین', icon: Activity },
  { to: '/admin/users', label: 'کاربران', icon: Users },
  { to: '/admin/wallets', label: 'کیف پول و تراکنش‌ها', icon: Wallet },
  { to: '/admin/bookings', label: 'رزروها', icon: CalendarCheck },
  { to: '/admin/kyc', label: 'تایید هویت کاربران', icon: ShieldCheck },
  { to: '/admin/tickets', label: 'تیکت‌ها', icon: MessageCircle },
  { to: '/admin/disputes', label: 'اختلاف‌ها و ریفاند', icon: FileText },
]
function logout(){ localStorage.removeItem('luxora_token'); window.location.assign('/#/login') }
</script>
<template>
  <div class="fixed left-5 top-5 z-[70] hidden lg:block"><NotificationBell /></div>
  <div dir="rtl" class="admin-shell">
  <div class="min-h-screen bg-[#030201]">
    <aside class="fixed right-0 top-0 bottom-0 z-50 hidden w-80 border-l border-gold/15 bg-black/80 p-6 shadow-[24px_0_80px_rgba(0,0,0,.35)] backdrop-blur-2xl lg:block">
      <RouterLink to="/admin" class="text-3xl font-black tracking-[.22em] text-gold">لوکسورا</RouterLink>
      <nav class="mt-8 max-h-[calc(100vh-150px)] space-y-2 overflow-y-auto pr-1">
        <RouterLink v-for="l in links" :key="l.to" :to="l.to" class="flex items-center gap-3 rounded-2xl bg-white/[.05] px-5 py-3.5 transition hover:bg-white/[.12]">
          <component :is="l.icon" class="h-5 w-5 text-gold" /><span class="font-bold">{{ l.label }}</span>
        </RouterLink>
      </nav>
      <button class="lux-btn-dark absolute bottom-8 left-6 right-6" @click="logout"><LogOut class="mr-2 h-4 w-4"/> خروج</button>
    </aside>
    <div class="sticky top-0 z-40 border-b border-gold/15 bg-black/85 px-4 py-3 backdrop-blur-2xl lg:hidden">
      <div class="flex items-center justify-between">
        <RouterLink to="/admin" class="text-xl font-black tracking-[.18em] text-gold">لوکسورا</RouterLink>
        <button class="rounded-full border border-gold/20 bg-white/[.06] px-4 py-2 text-sm font-bold text-champagne" @click="logout">خروج</button>
      </div>
      <div class="mt-3 flex gap-2 overflow-x-auto pb-1">
        <RouterLink v-for="l in links" :key="l.to" :to="l.to" class="shrink-0 rounded-full border border-gold/15 bg-white/[.05] px-4 py-2 text-xs font-bold text-muted">
          {{ l.label }}
        </RouterLink>
      </div>
    </div>
    <MobileHamburgerMenu mode="admin" :items="links" title="پنل مدیریت" subtitle="همه منوهای ادمین" />

    <main class="relative z-0 min-h-screen w-full overflow-x-hidden lg:pr-80"><div class="w-full"><slot /></div></main>
  </div>
  </div>
</template>
