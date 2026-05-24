<script setup lang="ts">
defineProps<{ count?: number }>()
</script>
<template>
  <div class="grid gap-5 md:grid-cols-3">
    <div v-for="i in (count || 6)" :key="i" class="h-80 animate-pulse rounded-[2rem] border border-white/10 bg-white/[.055]"></div>
  </div>
</template>
