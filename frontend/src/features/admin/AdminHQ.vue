<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AdminShell from '../../components/admin/AdminShell.vue'
import { api } from '../../lib/api'
const hq = ref<any>({})
onMounted(async()=>{ const {data}=await api.get('/admin/hq'); hq.value=data })
</script>

<template>
  <AdminShell>
    <section class="motion-page px-6 py-10 lg:px-10">
      <div class="badge">مرکز فرماندهی فوق‌لوکس ادمین</div>
      <h1 class="mt-5 text-7xl font-black">مانیتور امانت پرداخت، اختلاف‌ها و کنترل رزروها.</h1>
      <div class="mt-10 grid gap-5 md:grid-cols-4">
        <div v-for="(v,k) in hq.metrics" :key="k" class="lux-panel p-7">
          <p class="muted">{{ k }}</p>
          <b class="mt-3 block text-5xl text-gold">{{ v }}</b>
        </div>
      </div>
      <div class="mt-8 grid gap-6 lg:grid-cols-2">
        <div class="lux-panel p-8"><h2 class="text-4xl font-black">امانت پرداخت مانیتور</h2><p class="muted mt-3">زیرساخت عملیات زنده.</p></div>
        <div class="lux-panel p-8"><h2 class="text-4xl font-black">مدیریت محتوا</h2><p class="muted mt-3">صف ریسک، امنیت کاربر و بررسی محتوا.</p></div>
      </div>
    </section>
  </AdminShell>
</template>
