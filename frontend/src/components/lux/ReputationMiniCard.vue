<script setup lang="ts">
defineProps<{ role?: string; score?: number; completed?: number }>()
</script>
<template>
  <div class="lux-premium-card p-4">
    <div class="flex items-center justify-between gap-3">
      <div>
        <p class="text-xs font-black text-muted">اعتبار پروفایل</p>
        <h3 class="mt-1 text-xl font-black text-champagne">{{ score || 92 }}%</h3>
      </div>
      <div class="grid h-12 w-12 place-items-center rounded-full border border-gold/20 bg-gold/10 text-gold">★</div>
    </div>
    <div class="lux-progress mt-3"><span :style="{ width: `${score || 92}%` }"></span></div>
    <div class="mt-3 grid grid-cols-3 gap-2 text-center">
      <div class="lux-mini-stat"><b class="text-champagne">{{ completed || 0 }}</b><p class="text-[10px] text-muted">رزرو</p></div>
      <div class="lux-mini-stat"><b class="text-champagne">Trusted</b><p class="text-[10px] text-muted">وضعیت</p></div>
      <div class="lux-mini-stat"><b class="text-champagne">24h</b><p class="text-[10px] text-muted">پاسخ</p></div>
    </div>
  </div>
</template>
