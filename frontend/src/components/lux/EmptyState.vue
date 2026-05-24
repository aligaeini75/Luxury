<script setup lang="ts">
defineProps<{ title: string; body?: string; actionLabel?: string }>()
defineEmits(['action'])
</script>
<template>
  <div class="lux-panel p-10 text-center">
    <div class="badge mx-auto">خالی</div>
    <h3 class="mt-5 text-4xl font-black">{{ title }}</h3>
    <p class="muted mx-auto mt-3 max-w-xl">{{ body || 'داده‌ای وجود ندارد available yet.' }}</p>
    <button v-if="actionLabel" class="lux-btn mt-6" @click="emit('action')">{{ actionLabel }}</button>
  </div>
</template>
