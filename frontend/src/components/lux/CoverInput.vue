<script setup lang="ts">
defineProps<{ label: string; subtitle?: string; modelValue: string | number; image?: string; type?: string; placeholder?: string }>()
defineEmits(['update:modelValue'])
</script>

<template>
  <label class="cover-field block min-h-[300px] overflow-hidden">
    <img v-if="image" :src="image" alt="" />
    <img v-else src="/upload-image-placeholder.svg" alt="" />
    <div class="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent"></div>

    <div class="relative z-10 flex min-h-[300px] flex-col justify-end p-7">
      <span class="badge">{{ label }}</span>
      <p v-if="subtitle" class="mt-3 max-w-sm text-sm text-muted">{{ subtitle }}</p>
      <input
        :type="type || 'text'"
        :value="modelValue"
        :placeholder="placeholder"
        class="mt-6 w-full rounded-2xl border border-white/10 bg-black/55 px-5 py-4 text-xl font-black text-white outline-none focus:border-gold"
        @input="emit('update:modelValue', (event.target as HTMLInputElement).value)"
      />
    </div>
  </label>
</template>
