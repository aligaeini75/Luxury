<script setup lang="ts">
import { ref, onMounted } from 'vue'

const visible = ref(true)

onMounted(() => {
  setTimeout(() => {
    visible.value = false
  }, 1600)
})
</script>

<template>
  <Transition name="luxury">
    <div
      v-if="visible"
      class="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-black"
    >
      <img
        src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2000&auto=format&fit=crop"
        class="absolute inset-0 h-full w-full scale-110 object-cover opacity-30"
      />
      <div class="absolute inset-0 bg-gradient-to-b from-black via-black/70 to-lux"></div>
      <div class="absolute h-[520px] w-[520px] animate-pulse rounded-full bg-gold/15 blur-3xl"></div>

      <div class="relative text-center">
        <div class="badge mx-auto">دسترسی خصوصی لوکس</div>
        <h1 class="mt-6 text-7xl font-black tracking-[.25em] text-gold md:text-9xl">لوکسورا</h1>
        <p class="mt-5 text-sm uppercase tracking-[.45em] text-muted">تاییدشده · امانت پرداخت · رزروها</p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.luxury-enter-active,
.luxury-leave-active {
  transition: opacity .8s ease, filter .8s ease;
}
.luxury-enter-from,
.luxury-leave-to {
  opacity: 0;
  filter: blur(18px);
}
</style>
