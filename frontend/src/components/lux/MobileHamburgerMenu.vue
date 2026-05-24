<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  Menu,
  X,
  Home,
  Search,
  ClipboardList,
  Image,
  Wallet,
  MessageCircle,
  User,
  CalendarDays,
  MapPin,
  Settings,
  Users,
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Video,
  Bell,
  LogOut,
  LayoutDashboard,
  CircleDot,
} from 'lucide-vue-next'
import { useAuthStore } from '../../stores/auth'

type NavItem = {
  to: string
  label: string
  icon?: any
}

const props = defineProps<{
  mode?: 'man' | 'woman' | 'admin'
  items?: NavItem[]
  title?: string
  subtitle?: string
}>()

const open = ref(false)
const auth = useAuthStore()
const fallbackIcon = CircleDot

const manItems: NavItem[] = [
  { to: '/man', label: 'نمای کلی آقایان', icon: LayoutDashboard },
  { to: '/man/discover', label: 'کشف و رزرو', icon: Search },
  { to: '/man/requests', label: 'درخواست‌های من', icon: ClipboardList },
  { to: '/man/subscriptions', label: 'اشتراک‌های گالری', icon: Image },
  { to: '/man/profile', label: 'استودیو پروفایل', icon: User },
  { to: '/man/gallery', label: 'گالری من', icon: Image },
  { to: '/man/interests', label: ' و ترجیحات', icon: User },
  { to: '/wallet', label: 'کیف پول و واریز', icon: Wallet },
  { to: '/escrow', label: '', icon: ShieldCheck },
]

const womanItems: NavItem[] = [
  { to: '/woman/studio', label: 'استودیو پروفایل', icon: User },
  { to: '/woman/requests', label: 'درخواست‌ها و جلسات', icon: ClipboardList },
  { to: '/woman/calendar', label: 'تایم دیت / چت / ویدیو', icon: CalendarDays },
  { to: '/woman/gallery', label: 'گالری ماهانه', icon: Image },
  { to: '/woman/wallet', label: 'کیف پول و برداشت', icon: Wallet },
]

const adminItems: NavItem[] = [
  { to: '/admin', label: 'نمای کلی ادمین', icon: LayoutDashboard },
  { to: '/admin/users', label: 'کاربران', icon: Users },
  { to: '/admin/wallets', label: 'کیف پول و تراکنش‌ها', icon: Wallet },
  { to: '/admin/bookings', label: 'رزروها', icon: CalendarDays },
  { to: '/admin/kyc', label: 'تایید هویت کاربران', icon: ShieldCheck },
  { to: '/admin/tickets', label: 'تیکت‌ها', icon: MessageCircle },
  { to: '/admin/disputes', label: 'اختلاف‌ها و ریفاند', icon: FileText },
]

const resolvedMode = computed(() => props.mode || auth.user?.role || 'man')

const resolvedItems = computed(() => {
  const incoming = props.items?.length ? props.items : null
  const base = incoming || (resolvedMode.value === 'admin' ? adminItems : resolvedMode.value === 'woman' ? womanItems : manItems)
  return base.map((item) => ({ ...item, icon: item.icon || fallbackIcon }))
})

const resolvedTitle = computed(() => props.title || (resolvedMode.value === 'admin' ? 'پنل مدیریت' : resolvedMode.value === 'woman' ? 'پنل خانم' : 'پنل آقا'))
const resolvedSubtitle = computed(() => props.subtitle || (resolvedMode.value === 'admin' ? 'همه منوهای مدیریتی' : resolvedMode.value === 'woman' ? 'رزروها، گالری و کیف پول' : 'رزرو، درخواست‌ها و کیف پول'))

function close() {
  open.value = false
}

function logout() {
  auth.logout()
  location.hash = '#/login'
  close()
}
</script>

<template>
  <div class="lg:hidden">
    <button
      class="fixed right-4 top-4 z-[80] grid h-12 w-12 place-items-center rounded-2xl border border-gold/20 bg-black/85 text-champagne shadow-aura backdrop-blur-2xl"
      type="button"
      aria-label="باز کردن منو"
      @click="open = true"
    >
      <Menu class="h-6 w-6" />
    </button>

    <Teleport to="body">
      <Transition enter-active-class="transition duration-300" leave-active-class="transition duration-250" enter-from-class="opacity-0" leave-to-class="opacity-0">
        <div v-if="open" class="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm lg:hidden" @click="close"></div>
      </Transition>

      <Transition enter-active-class="transition duration-300" leave-active-class="transition duration-250" enter-from-class="translate-x-full" leave-to-class="translate-x-full">
        <aside
          v-if="open"
          dir="rtl"
          class="fixed right-0 top-0 bottom-0 z-[100] flex w-[88vw] max-w-[360px] flex-col border-l border-gold/20 bg-[#050301]/95 p-3 text-right text-white shadow-[0_0_90px_rgba(0,0,0,.70)] backdrop-blur-2xl lg:hidden"
        >
          <div class="flex items-center justify-between gap-3 rounded-[1.25rem] border border-gold/15 bg-white/[.045] p-3">
            <div class="flex items-center gap-3">
              <span class="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-champagne via-gold to-bronze text-base font-black text-black shadow-goldSoft">ل</span>
              <div>
                <p class="text-base font-black text-champagne">{{ resolvedTitle }}</p>
                <p class="text-xs font-bold text-muted">{{ resolvedSubtitle }}</p>
              </div>
            </div>

            <button class="grid h-9 w-9 place-items-center rounded-xl border border-gold/15 bg-black/40 text-muted" type="button" @click="close">
              <X class="h-5 w-5" />
            </button>
          </div>

          <div class="mt-3 rounded-[1.25rem] border border-gold/15 bg-gold/10 p-3">
            <div class="flex items-center gap-2 text-sm font-black text-champagne">
              <Bell class="h-4 w-4" />
              دسترسی سریع
            </div>
            <p class="mt-1 text-xs leading-6 text-muted">همه منوهای پنل اینجا کامل نمایش داده می‌شود.</p>
          </div>

          <nav class="mt-3 flex-1 space-y-1.5 overflow-y-auto pb-4 pr-1">
            <RouterLink
              v-for="item in resolvedItems"
              :key="item.to"
              :to="item.to"
              class="flex items-center gap-3 rounded-2xl border border-transparent px-3.5 py-3 text-[13px] font-black text-muted transition active:scale-[.99] active:bg-gold/10"
              active-class="!border-gold/35 !bg-gold/12 !text-champagne"
              @click="close"
            >
              <component :is="item.icon || fallbackIcon" class="h-4.5 w-4.5 shrink-0 text-gold" />
              <span>{{ item.label }}</span>
            </RouterLink>
          </nav>

          <button class="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-gold/15 bg-white/[.045] px-3.5 py-3 text-[13px] font-black text-muted" type="button" @click="logout">
            <LogOut class="h-5 w-5" />
            خروج
          </button>
        </aside>
      </Transition>
    </Teleport>
  </div>
</template>
