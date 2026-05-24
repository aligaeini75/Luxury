<script setup lang="ts">
import { ref } from 'vue'
import { CheckCircle2, FileVideo, Loader2, Music4, UploadCloud } from 'lucide-vue-next'
import { uploadFile } from '../../lib/upload'

const props = defineProps<{
  modelValue?: string
  label: string
  subtitle?: string
  image?: string
  type: 'audio' | 'video'
}>()

const emit = defineEmits(['update:modelValue'])

const loading = ref(false)
const error = ref('')
const preview = ref(props.modelValue || '')

async function onFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  loading.value = true
  error.value = ''

  try {
    preview.value = URL.createObjectURL(file)
    const url = await uploadFile(file, props.type)
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
    <img :src="type === 'video' ? '/upload-video-placeholder.svg' : '/upload-image-placeholder.svg'" alt="" class="absolute inset-0 h-full w-full object-cover opacity-75" />
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_18%,rgba(246,211,101,.18),transparent_32%),linear-gradient(to_top,rgba(0,0,0,.95),rgba(0,0,0,.32),rgba(0,0,0,.68))]"></div>

    <div class="relative z-10 flex min-h-[320px] flex-col justify-end p-7">
      <div class="mb-5 grid h-20 w-20 place-items-center rounded-[1.6rem] border border-gold/20 bg-black/50 shadow-aura backdrop-blur-xl">
        <Loader2 v-if="loading" class="h-9 w-9 animate-spin text-gold" />
        <CheckCircle2 v-else-if="modelValue" class="h-9 w-9 text-emerald-200" />
        <Music4 v-else-if="type === 'audio'" class="h-9 w-9 text-gold" />
        <FileVideo v-else class="h-9 w-9 text-gold" />
      </div>

      <span class="badge">{{ label }}</span>
      <p v-if="subtitle" class="mt-3 max-w-sm text-sm text-muted">{{ subtitle }}</p>

      <div class="mt-6 rounded-2xl border border-white/10 bg-black/60 p-5 backdrop-blur-xl">
        <div class="flex items-center gap-3">
          <UploadCloud class="h-5 w-5 text-gold" />
          <div>
            <b>{{ loading ? 'در حال آپلود...' : modelValue ? 'فایل آپلود شد' : type === 'audio' ? 'انتخاب فایل صوتی' : 'انتخاب ویدیو سلفی' }}</b>
            <p class="text-xs text-muted">{{ type === 'audio' ? 'MP3 / WAV' : 'MP4 / MOV، بدون نمایش پلیر خالی قبل از آپلود' }}</p>
          </div>
        </div>

        <audio v-if="preview && type === 'audio'" controls :src="preview" class="mt-4 w-full" />
        <div v-if="preview && type === 'video'" class="mt-4 rounded-2xl border border-gold/15 bg-white/[.04] p-3">
          <div class="mb-2 flex items-center gap-2 text-xs font-black text-champagne">
            <CheckCircle2 class="h-4 w-4" />
            ویدیو انتخاب/آپلود شده
          </div>
          <video controls :src="preview" class="h-40 w-full rounded-xl bg-black object-cover"></video>
        </div>

        <p v-if="error" class="mt-3 text-sm text-red-300">{{ error }}</p>
      </div>

      <input class="hidden" :accept="type === 'audio' ? 'audio/*' : 'video/*'" type="file" @change="onFile" />
    </div>
  </label>
</template>
