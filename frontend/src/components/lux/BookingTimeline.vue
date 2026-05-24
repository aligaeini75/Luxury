<script setup lang="ts">
const props = defineProps<{ status?: string; bookingType?: string }>()
const steps = [
  { key: 'pending', label: 'درخواست' },
  { key: 'accepted', label: 'تایید' },
  { key: 'active', label: 'ارتباط' },
  { key: 'completed', label: 'تسویه' },
]
function activeIndex() {
  if (props.status === 'completed') return 3
  if (props.status === 'accepted') return 1
  if (props.status === 'rejected' || props.status === 'cancelled') return 0
  return 0
}
</script>
<template>
  <div class="rounded-2xl border border-gold/10 bg-black/25 p-3">
    <div class="flex items-center gap-2">
      <template v-for="(s,i) in steps" :key="s.key">
        <div class="flex min-w-0 flex-1 items-center gap-2">
          <div class="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-black"
               :class="i <= activeIndex() ? 'bg-gold text-black' : 'bg-white/[.07] text-muted'">
            {{ i + 1 }}
          </div>
          <span class="truncate text-[11px]" :class="i <= activeIndex() ? 'text-champagne' : 'text-muted'">{{ s.label }}</span>
        </div>
        <div v-if="i < steps.length-1" class="h-px w-5 bg-gold/15"></div>
      </template>
    </div>
  </div>
</template>
