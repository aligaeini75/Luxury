<script setup lang="ts">
defineProps<{ compact?: boolean }>()
</script>

<template>
  <RouterLink to="/" class="inline-flex items-center gap-3" aria-label="Luxora">
    <span class="grid h-12 w-12 place-items-center rounded-2xl border border-gold/30 bg-gold/10">
      <span class="font-black text-gold">LX</span>
    </span>
    <span v-if="!compact" class="leading-none">
      <span class="block text-2xl font-black tracking-[.22em] text-champagne" dir="ltr">LUXORA</span>
      <span class="mt-1 block text-[10px] font-black tracking-[.28em] text-muted" dir="ltr">PRIVATE LOUNGE</span>
    </span>
  </RouterLink>
</template>
