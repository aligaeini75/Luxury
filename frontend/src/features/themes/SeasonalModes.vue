<script setup lang="ts">
import AppShell from '../../components/layout/AppShell.vue'
const modes = [
  ['Monaco Summer','dynamic-diamond'],
  ['Black Winter','dynamic-night'],
  ['Tokyo Neon','lux-theme-velvet'],
  ['Velvet Nights','dynamic-velvet']
]
function apply(cls: string) {
  document.body.classList.remove('dynamic-diamond','dynamic-night','dynamic-velvet','lux-theme-velvet')
  document.body.classList.add(cls)
}
</script>

<template>
  <AppShell>
    <section class="motion-page px-6 py-10 lg:px-10">
      <div class="badge">حالت‌های فصلی پویا</div>
      <h1 class="mt-5 text-7xl font-black">تابستان موناکو، زمستان مشکی، نئون توکیو و شب‌های مخملی.</h1>
      <div class="mt-10 grid gap-5 md:grid-cols-4">
        <button v-for="m in modes" :key="m[0]" class="lux-panel p-8 text-left" @click="apply(m[1])">
          <div class="badge">تم</div>
          <h3 class="mt-4 text-3xl font-black">{{ m[0] }}</h3>
        </button>
      </div>
    </section>
  </AppShell>
</template>
