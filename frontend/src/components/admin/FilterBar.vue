<script setup lang="ts">
defineProps<{ modelValue: string; placeholder?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="flex flex-wrap gap-3 rounded-[2rem] border border-white/10 bg-white/[.045] p-3">
    <input
      :value="modelValue"
      class="lux-input flex-1"
      :placeholder="placeholder || 'جستجو...'"
      @input="onInput"
    />
    <slot />
  </div>
</template>
