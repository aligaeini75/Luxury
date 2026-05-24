<script setup lang="ts">
import { reactive } from 'vue'
import { UploadCloud, Scale } from 'lucide-vue-next'
import { api } from '../../lib/api'

const form = reactive({ escrow_id: '', reason: '', evidence_url: '' })
const emit = defineEmits(['created'])

async function submit() {
  await api.post('/disputes', form)
  emit('created')
}
</script>

<template>
  <div class="lux-panel p-8">
    <div class="badge"><Scale class="mr-2 h-4 w-4" /> مرکز اختلاف امانت پرداخت</div>
    <h2 class="mt-4 text-5xl font-black">مدارک، زمان‌بندی و داوری.</h2>
    <input v-model="form.escrow_id" class="lux-input mt-6" placeholder="شناسه امانت پرداخت" />
    <textarea v-model="form.reason" class="lux-input mt-4 min-h-32" placeholder="توضیح اختلاف"></textarea>
    <input v-model="form.evidence_url" class="lux-input mt-4" placeholder="لینک یا مسیر مدرک آپلودشده" />
    <button class="lux-btn mt-5" @click="submit"><UploadCloud class="mr-2 h-4 w-4" /> باز کردن اختلاف</button>
  </div>
</template>
