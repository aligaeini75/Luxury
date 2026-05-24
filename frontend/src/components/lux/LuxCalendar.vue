<script setup lang="ts">
import { computed, ref } from 'vue'
const emit = defineEmits(['select'])
const selected = ref('')
const today = new Date()
const year = today.getFullYear()
const month = today.getMonth()
const monthName = today.toLocaleString('en-US', { month: 'long' })
const days = computed(() => {
  const first = new Date(year, month, 1)
  const count = new Date(year, month + 1, 0).getDate()
  const offset = first.getDay()
  const arr: any[] = []
  for (let i = 0; i < offset; i++) arr.push(null)
  for (let day = 1; day <= count; day++) {
    const d = new Date(year, month, day)
    arr.push({ day, date: d.toISOString().slice(0, 10), premium: [5,12,19,26].includes(day), busy: [7,14,23].includes(day) })
  }
  return arr
})
function pick(d: any) {
  if (!d || d.busy) return
  selected.value = d.دیت
  emit('select', d.دیت)
}
</script>
<template>
  <div class="lux-panel p-7">
    <div class="flex items-center justify-between">
      <div><div class="badge">باز کردن تقویم لوکس</div><h3 class="mt-4 text-4xl font-black">{{ monthName }} {{ year }}</h3></div>
      <div class="rounded-full border border-white/10 bg-white/[.06] px-5 py-3 text-sm text-muted">نمای تقویم</div>
    </div>
    <div class="mt-8 grid grid-cols-7 gap-3 text-center text-xs uppercase tracking-[.2em] text-muted">
      <span v-for="d in ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']" :key="d">{{ d }}</span>
    </div>
    <div class="mt-4 grid grid-cols-7 gap-3">
      <button v-for="(d, i) in days" :key="i" type="button" class="relative min-h-24 rounded-3xl border p-3 text-left transition" :class="[!d ? 'border-transparent opacity-0' : '', d?.busy ? 'border-white/5 bg-white/[.025] opacity-40' : 'border-white/10 bg-white/[.055] hover:border-gold/60 hover:bg-gold/10', selected === d?.دیت ? 'border-gold bg-gold/20 shadow-aura' : '']" @click="pick(d)">
        <span v-if="d" class="text-lg font-black">{{ d.day }}</span>
        <span v-if="d?.premium" class="absolute bottom-3 left-3 rounded-full bg-gold/20 px-2 py-1 text-[10px] text-champagne">پریمیوم</span>
        <span v-if="d?.busy" class="absolute bottom-3 left-3 rounded-full bg-white/10 px-2 py-1 text-[10px]">مشغول</span>
      </button>
    </div>
  </div>
</template>
