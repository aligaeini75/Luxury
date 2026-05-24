<script setup lang="ts">
import { computed } from 'vue'
import { statusLabel, bookingTypeLabel } from '../../i18n'
const props = defineProps<{ value?: string | null; kind?: 'status' | 'booking' }>()
const label = computed(() => props.kind === 'booking' ? bookingTypeLabel(props.value) : statusLabel(props.value))
const tone = computed(() => {
  const v = props.value || ''
  if (['approved', 'accepted', 'active', 'paid', 'completed', 'released', 'finished'].includes(v)) return 'good'
  if (['rejected', 'cancelled', 'canceled', 'failed', 'expired', 'refunded'].includes(v)) return 'bad'
  return 'wait'
})
</script>
<template>
  <span class="inline-flex rounded-full border px-3 py-1 text-xs font-black" :class="{
    'border-emerald-300/30 bg-emerald-400/10 text-emerald-200': tone === 'good',
    'border-red-300/30 bg-red-500/10 text-red-200': tone === 'bad',
    'border-gold/35 bg-gold/10 text-champagne': tone === 'wait'
  }">{{ label }}</span>
</template>
