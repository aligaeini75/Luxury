<script setup lang="ts">
import NotificationBell from '../lux/NotificationBell.vue'
import LuxoraLogo from '../brand/LuxoraLogo.vue'
import { LogOut, User, Wallet, Search, Image, CalendarDays, Inbox, ClipboardList, Bell } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import { api } from '../../lib/api'
import { useAuthStore } from '../../stores/auth'
import MobileBottomNav from '../lux/MobileBottomNav.vue'
import MobileHamburgerMenu from '../lux/MobileHamburgerMenu.vue'

const auth = useAuthStore()
const alerts = ref<any[]>([])
const showAlerts = ref(false)
async function loadNotifications() { try { const { data } = await api.get('/auth/alerts'); alerts.value = data.alerts || [] } catch {} }
async function openAlert(a: any) { await api.post(`/auth/alerts/${a.id}/read`).catch(() => {}); if (a.target_url) window.location.assign(a.target_url); await loadNotifications() }
onMounted(async () => { await auth.me().catch(() => {}); await loadNotifications() })

const manLinks = [
  { to: '/#/man', label: 'نمای کلی آقایان', icon: User },
  { to: '/#/man/discover', label: 'کشف و رزرو', icon: Search },
  { to: '/#/man/requests', label: 'درخواست‌های من', icon: ClipboardList },
  { to: '/#/man/subscriptions', label: 'گالری‌های ماهانه', icon: Bell },
  { to: '/#/man/profile', label: 'استودیو پروفایل', icon: User },
  { to: '/#/man/gallery', label: 'گالری من', icon: Image },
  { to: '/#/wallet', label: 'کیف پول و واریز', icon: Wallet },
]

const womanLinks = [
  { to: '/#/woman/studio', label: 'استودیو خانم', icon: User },
  { to: '/#/woman/requests', label: 'درخواست‌ها و جلسات', icon: Inbox },
  { to: '/#/woman/calendar', label: 'تایم دیت / چت / ویدیو', icon: CalendarDays },
  { to: '/#/woman/gallery', label: 'گالری ماهانه', icon: Image },
  { to: '/#/woman/wallet', label: 'کیف پول و برداشت', icon: Wallet },
]

function go(to: string) { window.location.assign(to) }
</script>

<template>
  <div class="fixed left-5 top-5 z-[70] hidden lg:block"><NotificationBell /></div>
  <div class="min-h-screen bg-[#030201]">
    <aside class="fixed right-0 top-0 bottom-0 z-40 hidden w-80 border-l border-gold/15 bg-black/75 p-6 shadow-[-24px_0_80px_rgba(0,0,0,.35)] backdrop-blur-2xl lg:block">
      <LuxoraLogo />
      <div class="mt-7 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[.055]">
        <div class="hero-art hero-art-sm h-36"><span class="lux-face"></span><span class="lux-shoulder"></span><span class="lux-shine"></span></div>
        <div class="p-5">
          <div class="badge">{{ auth.user?.role === 'woman' ? 'پنل خانم' : 'لانژ خصوصی آقا' }}</div>
          <p class="mt-3 text-sm text-muted">{{ auth.user?.email || 'پنل خصوصی بر اساس نقش' }}</p>
        </div>
      </div>
      <nav class="mt-6 max-h-[calc(100vh-310px)] space-y-2 overflow-y-auto pl-1">
        <button v-for="l in (auth.user?.role === 'woman' ? womanLinks : manLinks)" :key="l.to" class="flex w-full items-center gap-3 rounded-2xl bg-white/[.05] px-5 py-3.5 text-right transition hover:bg-white/[.12]" @click="go(l.to)">
          <component :is="l.icon" class="h-5 w-5 text-gold" />
          <span class="font-bold">{{ l.label }}</span>
        </button>
      </nav>
      <div class="absolute bottom-8 right-6 left-6 space-y-3">
        <button class="lux-btn-dark w-full" @click="showAlerts = !showAlerts"><Bell class="ml-2 h-4 w-4" /> اعلان‌ها <span v-if="alerts.filter(a => !a.is_read).length" class="mr-2 rounded-full bg-gold px-2 py-0.5 text-black">{{ alerts.filter(a => !a.is_read).length }}</span></button>
        <div v-if="showAlerts" class="max-h-64 overflow-y-auto rounded-[1.4rem] border border-white/10 bg-black/90 p-3 shadow-aura">
          <button v-for="a in alerts" :key="a.id" class="mb-2 w-full rounded-xl bg-white/[.06] p-3 text-right text-xs" @click="openAlert(a)">
            <b :class="a.is_read ? 'text-white/60' : 'text-gold'">{{ a.title }}</b>
            <p class="text-muted">{{ a.body }}</p>
          </button>
          <p v-if="!alerts.length" class="p-3 text-xs text-muted">هنوز اعلانی نداری.</p>
        </div>
        <button class="lux-btn-dark w-full" @click="auth.logout"><LogOut class="ml-2 h-4 w-4" /> خروج</button>
      </div>
    </aside>
    <main class="min-h-screen w-full overflow-x-hidden px-0 lg:pr-80"><slot /></main>
    <MobileHamburgerMenu :mode="auth.user?.role === 'admin' ? 'admin' : auth.user?.role === 'woman' ? 'woman' : 'man'" />
    <MobileBottomNav />
  </div>
</template>
