<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AdminShell from '../../components/admin/AdminShell.vue'
import { api } from '../../lib/api'
const data = ref<any>({})
onMounted(async () => { const res = await api.get('/admin/monitoring'); data.value = res.data })
</script>
<template>
  <AdminShell>
    <section class="motion-page px-6 py-10 lg:px-10">
      <div class="badge">مانیتورینگ</div><h1 class="mt-5 text-7xl font-black">خطاها, API health and logging.</h1>
      <div class="mt-10 grid gap-5 md:grid-cols-4"><div v-for="(v,k) in data.metrics" :key="k" class="lux-panel p-7"><p class="muted">{{ k }}</p><b class="mt-3 block text-5xl text-gold">{{ v }}</b></div></div>
      <div class="mt-8 space-y-4"><div v-for="e in data.errors || []" :key="e.id" class="lux-panel p-6"><b>{{ e.message }}</b><p class="muted mt-2">{{ e.path }} · {{ e.created_at }}</p></div></div>
    </section>
  </AdminShell>
</template>
