<script setup lang="ts">
import { ref } from 'vue'
import AppShell from '../../components/layout/AppShell.vue'
const ghost = ref(localStorage.getItem('luxora_ghost') === 'on')
function toggle(){ ghost.value=!ghost.value; localStorage.setItem('luxora_ghost', ghost.value?'on':'off') }
</script>

<template>
  <AppShell>
    <section class="motion-page px-6 py-10 lg:px-10">
      <div class="badge">حالت مخفی</div>
      <h1 class="mt-5 text-7xl font-black">مرور نامرئی، وضعیت آنلاین مخفی و مشاهده پنهان.</h1>
      <div class="mt-8 lux-panel p-8" :class="ghost ? 'ghost-mask' : ''">
        <div class="badge">{{ ghost ? 'Ghost active' : 'Visible mode' }}</div>
        <h2 class="mt-4 text-5xl font-black">{{ ghost ? 'You are browsing quietly.' : 'Your presence is visible.' }}</h2>
        <button class="lux-btn mt-6" @click="toggle">{{ ghost ? 'Disable Ghost' : 'Enable Ghost' }}</button>
      </div>
    </section>
  </AppShell>
</template>
