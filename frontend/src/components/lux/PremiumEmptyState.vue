<script setup lang="ts">
defineProps<{ title?: string; text?: string }>()
</script>
<template>
  <div class="lux-empty p-5">
    <div>
      <div class="mx-auto mb-3 h-10 w-10 rounded-full border border-gold/20 bg-gold/10"></div>
      <p class="font-black text-champagne">{{ title || 'هنوز چیزی ثبت نشده' }}</p>
      <p class="mt-2 text-xs leading-6 text-muted">{{ text || 'وقتی داده‌ای وجود داشته باشد اینجا نمایش داده می‌شود.' }}</p>
    </div>
  </div>
</template>
