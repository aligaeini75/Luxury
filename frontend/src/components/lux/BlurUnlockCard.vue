<script setup lang="ts">
import { Lock, ShieldCheck } from 'lucide-vue-next'

defineProps<{
  item: any
  unlocked?: boolean
  watermark?: string
}>()

defineEmits(['unlock'])
</script>

<template>
  <div class="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[.04] safe-watermark" :data-watermark="watermark || 'LUXORA'">
    <img
      :src="item.url || item.cover_url"
      class="h-[460px] w-full object-cover transition duration-700"
      :class="unlocked ? '' : 'lux-blur-lock opacity-80'"
    />
    <div class="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>

    <div v-if="!unlocked" class="absolute inset-0 flex items-center justify-center">
      <button class="lux-btn" @click="emit('unlock', item)">
        <Lock class="mr-2 h-5 w-5" /> باز کردن گالری
      </button>
    </div>

    <div class="absolute bottom-6 left-6 right-6">
      <div class="badge">
        <ShieldCheck class="mr-2 h-4 w-4" />
        {{ unlocked ? 'باز شده protected media' : 'Blur-to-unlock' }}
      </div>
      <h3 class="mt-4 text-3xl font-black">{{ item.title || 'Private گالری' }}</h3>
      <p class="muted mt-1">{{ item.price || 0 }} · دسترسی زمان‌دار · محافظت‌شده با واترمارک</p>
    </div>
  </div>
</template>
