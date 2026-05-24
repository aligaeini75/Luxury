<script setup lang="ts">
const props = defineProps<{ modelValue: string[] }>()
const emit = defineEmits(['update:modelValue'])
const options = [
  { key: 'fine-dining', title: 'Fine Dining', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=900&auto=format&fit=crop' },
  { key: 'art', title: 'Art Nights', image: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?q=80&w=900&auto=format&fit=crop' },
  { key: 'music', title: 'زنده Music', image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=900&auto=format&fit=crop' },
  { key: 'travel', title: 'لوکس Travel', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=900&auto=format&fit=crop' },
  { key: 'private-lounge', title: 'Private Lounge', image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=900&auto=format&fit=crop' },
  { key: 'wellness', title: 'Wellness', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=900&auto=format&fit=crop' }
]
function toggle(key: string) {
  const set = new Set(props.modelValue || [])
  if (set.has(key)) set.delete(key)
  else set.add(key)
  emit('update:modelValue', [...set])
}
</script>
<template>
  <div class="grid gap-4 md:grid-cols-3">
    <button v-for="o in options" :key="o.key" type="button" class="group relative overflow-hidden rounded-[2rem] border p-5 text-left transition" :class="modelValue?.includes(o.key) ? 'border-gold shadow-aura' : 'border-white/10'" @click="toggle(o.key)">
      <img :src="o.image" class="absolute inset-0 h-full w-full object-cover opacity-35 transition group-hover:scale-110" />
      <div class="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
      <div class="relative pt-28">
        <div class="badge">{{ modelValue?.includes(o.key) ? 'Selected' : 'Interest' }}</div>
        <h3 class="mt-4 text-2xl font-black">{{ o.title }}</h3>
      </div>
    </button>
  </div>
</template>
