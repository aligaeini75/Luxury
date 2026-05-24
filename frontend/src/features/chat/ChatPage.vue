<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppShell from '../../components/layout/AppShell.vue'
import { useChatStore } from '../../stores/chat'

const chat = useChatStore()
const msg = ref('')
const loading = ref(false)

const hasRooms = computed(() => chat.rooms.length > 0)

onMounted(async () => {
  loading.value = true
  try {
    await chat.loadRooms()
  } finally {
    loading.value = false
  }
})

async function send() {
  if (!msg.value.trim()) return
  await chat.sendMessage(msg.value)
  msg.value = ''
}
</script>

<template>
  <AppShell>
    <section class="px-4 py-7 lg:px-10 lg:py-10">
      <div class="badge">چت خصوصی</div>
      <h1 class="mt-5 text-4xl font-black md:text-7xl">چت فقط بعد از رزرو تاییدشده باز می‌شود.</h1>
      <p class="muted mt-4 max-w-2xl leading-8">
        چت عمومی از منو حذف شده است. فقط اگر دیت یا چت پرداخت و تایید شده باشد، از صفحه درخواست‌ها می‌توانی وارد اتاق مربوط به همان رزرو شوی.
      </p>

      <div v-if="loading" class="mt-8 skeleton-gold h-72 rounded-[2rem]"></div>

      <div v-else-if="!hasRooms" class="mt-8 rounded-[2rem] border border-gold/15 bg-white/[.045] p-6 shadow-aura">
        <h2 class="text-2xl font-black text-champagne">فعلاً چتی برای حساب شما فعال نیست</h2>
        <p class="muted mt-3 leading-8">
          بعد از اینکه درخواست دیت یا چت تایید و پرداخت آن نهایی شود، لینک ورود به چت داخل صفحه «درخواست‌های من» برای مرد و صفحه «درخواست‌ها و جلسات» برای زن نمایش داده می‌شود.
        </p>
        <div class="mt-5 grid gap-3 sm:grid-cols-2">
          <RouterLink to="/man/requests" class="lux-btn">درخواست‌های آقا</RouterLink>
          <RouterLink to="/woman/requests" class="lux-btn-dark">درخواست‌های خانم</RouterLink>
        </div>
      </div>

      <div v-else class="mt-8 grid gap-5 xl:grid-cols-[320px_1fr]">
        <div class="lux-panel p-4 md:p-5">
          <button v-for="r in chat.rooms" :key="r.id" class="mb-3 w-full rounded-2xl bg-white/[.06] p-4 text-right" @click="chat.openRoom(r.id)">
            <b>{{ r.title }}</b>
            <p class="muted mt-1 text-xs">{{ r.last_message }}</p>
          </button>
        </div>

        <div class="lux-panel min-h-[520px] p-4 md:p-6">
          <div class="max-h-[55vh] space-y-4 overflow-y-auto pb-3">
            <div v-for="m in chat.messages" :key="m.id" :class="m.is_me ? 'text-right' : 'text-left'">
              <span :class="m.is_me ? 'chat-bubble-me inline-block' : 'chat-bubble-other inline-block'">{{ m.body }}</span>
            </div>
          </div>

          <div class="mt-5 flex gap-2 md:gap-3">
            <input v-model="msg" class="lux-input" placeholder="پیام..." />
            <button class="lux-btn shrink-0" @click="send">ارسال</button>
          </div>
        </div>
      </div>
    </section>
  </AppShell>
</template>
