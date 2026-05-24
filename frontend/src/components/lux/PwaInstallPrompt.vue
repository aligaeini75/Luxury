<script setup lang="ts">
import { onMounted, ref } from 'vue'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const show = ref(false)
const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null)

onMounted(() => {
  const dismissed = localStorage.getItem('luxora_pwa_dismissed') === '1'
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferredPrompt.value = event as BeforeInstallPromptEvent
    if (!dismissed) show.value = true
  })
})

async function installApp() {
  if (!deferredPrompt.value) return
  await deferredPrompt.value.prompt()
  await deferredPrompt.value.userChoice.catch(() => null)
  show.value = false
  deferredPrompt.value = null
}

function dismiss() {
  localStorage.setItem('luxora_pwa_dismissed', '1')
  show.value = false
}
</script>

<template>
  <Transition enter-active-class="transition duration-300" leave-active-class="transition duration-300" enter-from-class="translate-y-8 opacity-0" leave-to-class="translate-y-8 opacity-0">
    <div v-if="show" class="fixed bottom-24 left-4 right-4 z-[80] rounded-[1.6rem] border border-gold/25 bg-black/88 p-4 shadow-aura backdrop-blur-2xl md:left-auto md:right-8 md:w-96">
      <div class="flex items-start gap-4">
        <div class="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-gold to-champagne font-black text-black">ل</div>
        <div class="min-w-0 flex-1">
          <p class="font-black text-white">نصب لوکسورا</p>
          <p class="mt-1 text-sm leading-6 text-muted">برای دسترسی سریع‌تر، لوکسورا را روی صفحه اصلی موبایل نصب کن.</p>
          <div class="mt-4 flex gap-2">
            <button class="lux-btn px-4 py-2 text-sm" @click="installApp">نصب</button>
            <button class="lux-btn-dark px-4 py-2 text-sm" @click="dismiss">فعلاً نه</button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
