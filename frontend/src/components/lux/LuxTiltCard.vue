
<script setup lang="ts">
defineProps<{ as?: string }>()
</script>

<template>
  <component :is="as || 'div'" class="lux-tilt-card group relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-white/[.045] shadow-aura backdrop-blur-2xl transition duration-500 hover:-translate-y-1 hover:border-gold/40 hover:bg-white/[.07]">
    <div class="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100" style="background: radial-gradient(circle at 40% 10%, rgba(217,185,111,.20), transparent 36%);"></div>
    <div class="relative z-10">
      <slot />
    </div>
  </component>
</template>
