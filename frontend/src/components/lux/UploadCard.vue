<script setup lang="ts">
import { computed, ref } from 'vue'
import { CheckCircle2, ImagePlus, Loader2 } from 'lucide-vue-next'
import { uploadImage } from '../../lib/upload'

const props = defineProps<{
  modelValue?: string
  label: string
  subtitle?: string
  image?: string
}>()

const emit = defineEmits(['update:modelValue'])

const loading = ref(false)
const error = ref('')
const preview = ref('')

const imageSrc = computed(() => preview.value || props.modelValue || '')

async function onFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  loading.value = true
  error.value = ''

  try {
    preview.value = URL.createObjectURL(file)
    const url = await uploadImage(file)
    preview.value = url
    emit('update:modelValue', url)
  } catch (err: any) {
    error.value = err?.response?.data?.error || err?.message || 'آپلود ناموفق بود.'
  } finally {
    loading.value = false
    ;(e.target as HTMLInputElement).value = ''
  }
}
</script>

<template>
  <label class="cover-field block min-h-[320px] cursor-pointer overflow-hidden">
    <img v-if="imageSrc" :src="imageSrc" alt="" />
    <img v-else src="/upload-image-placeholder.svg" alt="" />
    <div class="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent"></div>

    <div class="relative z-10 flex min-h-[320px] flex-col justify-end p-7">
      <span class="badge">{{ label }}</span>
      <p v-if="subtitle" class="mt-3 max-w-sm text-sm text-muted">{{ subtitle }}</p>

      <div class="mt-6 rounded-2xl border border-white/10 bg-black/60 p-5 backdrop-blur-xl">
        <div class="flex items-center gap-3">
          <Loader2 v-if="loading" class="h-5 w-5 animate-spin text-gold" />
          <CheckCircle2 v-else-if="modelValue" class="h-5 w-5 text-emerald" />
          <ImagePlus v-else class="h-5 w-5 text-gold" />

          <div>
            <b>{{ loading ? 'در حال آپلود...' : modelValue ? 'عکس آپلود شد' : 'انتخاب و آپلود عکس' }}</b>
            <p class="text-xs text-muted">JPG / PNG / WEBP تا ۸ مگابایت</p>
          </div>
        </div>

        <p v-if="error" class="mt-3 text-sm text-red-300">{{ error }}</p>
      </div>

      <input class="hidden" accept="image/*" type="file" @change="onFile" />
    </div>
  </label>
</template>
