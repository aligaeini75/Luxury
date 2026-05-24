<script setup lang="ts">
defineProps<{ balance?: number; locked?: number; income?: number }>()
</script>
<template>
  <div class="lux-premium-card p-4">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-xs text-muted">نمای مالی سریع</p>
        <h3 class="mt-1 font-black text-champagne">{{ balance || 0 }} تومان</h3>
      </div>
      <span class="lux-status-dot"></span>
    </div>
    <div class="mt-4 grid grid-cols-3 gap-2">
      <div class="lux-mini-stat"><p class="text-[10px] text-muted">آزاد</p><b class="text-gold">{{ balance || 0 }}</b></div>
      <div class="lux-mini-stat"><p class="text-[10px] text-muted">امانت</p><b class="text-gold">{{ locked || 0 }}</b></div>
      <div class="lux-mini-stat"><p class="text-[10px] text-muted">درآمد</p><b class="text-gold">{{ income || 0 }}</b></div>
    </div>
  </div>
</template>
