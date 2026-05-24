<script setup lang="ts">
defineProps<{ modelValue: string; placeholder?: string }>()
defineEmits(['update:modelValue'])
</script>
<template>
  <div class="flex flex-wrap gap-3 rounded-[2rem] border border-white/10 bg-white/[.045] p-3">
    <input
      :value="modelValue"
      class="lux-input flex-1"
      :placeholder="placeholder || 'جستجو...'"
      @input="emit('update:modelValue', (event.target as HTMLInputElement).value)"
    />
    <slot />
  </div>
</template>
