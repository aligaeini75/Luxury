<script setup lang="ts">
defineProps<{ badge: string; title: string; subtitle?: string }>()
</script>

<template>
  <div>
    <div class="badge">{{ badge }}</div>
    <h1 class="mt-5 text-6xl font-black leading-[.9] md:text-7xl">{{ title }}</h1>
    <p v-if="subtitle" class="muted mt-4 max-w-2xl text-lg">{{ subtitle }}</p>
  </div>
</template>
