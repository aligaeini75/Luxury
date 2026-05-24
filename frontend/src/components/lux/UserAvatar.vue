<script setup lang="ts">
defineProps<{ src?: string; name?: string; size?: 'sm' | 'md' | 'lg' | 'xl' }>()
</script>

<template>
  <div
    class="relative shrink-0 overflow-hidden rounded-[1.35rem] border border-gold/15 bg-white/[.045]"
    :class="{
      'h-12 w-12': size === 'sm',
      'h-16 w-16': !size || size === 'md',
      'h-24 w-24': size === 'lg',
      'h-36 w-36': size === 'xl'
    }"
  >
    <img v-if="src" :src="src" class="h-full w-full object-cover" />
    <div v-else class="skeleton-gold grid h-full w-full place-items-center">
      <span class="text-xl font-black text-gold/70">{{ (name || 'کاربر').slice(0, 1) }}</span>
    </div>
  </div>
</template>
