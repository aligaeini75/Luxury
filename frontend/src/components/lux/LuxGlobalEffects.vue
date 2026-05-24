<script setup lang="ts">
import { onMounted, ref } from 'vue'

const loaded = ref(false)

onMounted(() => {
  window.setTimeout(() => { loaded.value = true }, 760)
})
</script>

<template>
  <div class="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
    <div class="lux-static-glow lux-static-glow-a"></div>
    <div class="lux-static-glow lux-static-glow-b"></div>
    <div class="lux-static-glow lux-static-glow-c"></div>
    <div class="lux-film-grain"></div>
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_42%,rgba(0,0,0,.58)_100%)]"></div>
  </div>

  <Transition leave-active-class="transition duration-700 ease-out" leave-to-class="opacity-0 blur-xl">
    <div v-if="!loaded" class="fixed inset-0 z-[10000] grid place-items-center bg-[#030201]">
      <div class="relative text-center">
        <div class="absolute -inset-20 rounded-full bg-gold/14 blur-3xl animate-goldBreath"></div>
        <div class="relative mx-auto grid h-24 w-24 place-items-center rounded-full border border-gold/35 bg-white/[.035] shadow-aura backdrop-blur-2xl">
          <span class="text-4xl font-black text-gold">ل</span>
        </div>
        <p class="relative mt-6 text-xs font-black uppercase tracking-[.65em] text-champagne/75">لوکسورا</p>
      </div>
    </div>
  </Transition>
</template>
