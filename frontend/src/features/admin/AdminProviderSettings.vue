<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import AdminShell from '../../components/admin/AdminShell.vue'
import { api } from '../../lib/api'
const settings = ref<any[]>([])
const form = reactive({ key: 'NOWPAYMENTS_API_KEY', value: '', is_secret: 1 })
async function load() { const { data } = await api.get('/admin/provider-settings'); settings.value = data.settings || [] }
async function save() { await api.post('/admin/provider-settings', form); form.value = ''; await load() }
onMounted(load)
</script>
<template>
  <AdminShell>
    <section class="motion-page px-6 py-10 lg:px-10">
      <div class="badge">اتصال درگاه‌ها</div>
      <h1 class="mt-5 text-7xl font-black">تنظیمات پرداخت و رسانه.</h1>
      <div class="mt-8 grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
        <div class="lux-panel p-8">
          <select v-model="form.key" class="lux-input">
            <option>NOWPAYMENTS_API_KEY</option><option>کلید محرمانه وبهوک پرداخت</option><option>R2_SIGNING_SECRET</option><option>نام فضای ابری رسانه</option><option>تنظیمات آپلود رسانه</option>
          </select>
          <input v-model="form.value" class="lux-input mt-4" placeholder="مقدار یا ارجاع محرمانه" />
          <button class="lux-btn mt-5" @click="save">ذخیره تنظیمات</button>
        </div>
        <div class="space-y-3">
          <div v-for="s in settings" :key="s.key" class="lux-panel p-5"><b>{{ s.key }}</b><p class="muted">{{ s.is_secret ? 'Stored as secret reference' : s.value }}</p></div>
        </div>
      </div>
    </section>
  </AdminShell>
</template>
