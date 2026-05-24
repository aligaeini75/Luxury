<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Bell, X } from 'lucide-vue-next'
import { useNotificationsStore } from '../../stores/notifications'

const n = useNotificationsStore()
const open = ref(false)
onMounted(() => n.startPolling())
</script>

<template>
  <div class="relative">
    <button class="relative grid h-11 w-11 place-items-center rounded-2xl border border-gold/15 bg-white/[.05] text-champagne" @click="open = !open">
      <Bell class="h-5 w-5" />
      <span v-if="n.unread" class="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">{{ n.unread }}</span>
    </button>

    <Teleport to="body">
      <div v-if="open" class="fixed inset-0 z-[160] bg-black/45 backdrop-blur-sm" @click="open=false"></div>
      <aside v-if="open" dir="rtl" class="fixed left-4 top-4 z-[170] max-h-[86vh] w-[calc(100vw-2rem)] max-w-md overflow-y-auto rounded-[2rem] border border-gold/20 bg-[#060301]/95 p-4 text-right text-white shadow-aura">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-black">اعلان‌ها</h3>
          <button class="grid h-9 w-9 place-items-center rounded-xl bg-white/[.06]" @click="open=false"><X class="h-4 w-4" /></button>
        </div>
        <button class="lux-btn-dark mt-4 w-full" @click="n.markAllRead()">خواندن همه</button>

        <div class="mt-4 space-y-3">
          <article v-for="a in n.alerts" :key="a.id" class="rounded-2xl border border-gold/10 bg-white/[.04] p-4" :class="!a.is_read ? 'bg-gold/10' : ''">
            <p class="font-black text-champagne">{{ a.title }}</p>
            <p class="mt-1 text-sm leading-7 text-muted">{{ a.body }}</p>
            <div class="mt-3 flex items-center justify-between gap-2">
              <RouterLink v-if="a.target_url" :to="String(a.target_url).replace('/#','')" class="text-xs font-black text-gold" @click="n.markRead(a.id); open=false">باز کردن</RouterLink>
              <button class="text-xs text-muted" @click="n.markRead(a.id)">خواندم</button>
            </div>
          </article>
          <p v-if="!n.alerts.length" class="rounded-2xl bg-white/[.04] p-5 text-center text-muted">اعلانی نداری.</p>
        </div>
      </aside>
    </Teleport>
  </div>
</template>
