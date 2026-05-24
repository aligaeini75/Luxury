<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import AdminShell from '../../components/admin/AdminShell.vue'
import FilterBar from '../../components/admin/FilterBar.vue'
import { api } from '../../lib/api'
const rows = ref<any[]>([])
const q = ref('')
onMounted(async () => { const { data } = await api.get('/admin/wallet-monitor'); rows.value = data.rows || [] })
const filtered = computed(() => rows.value.filter(r => JSON.stringify(r).toLowerCase().includes(q.value.toLowerCase())))
</script>
<template>
  <AdminShell>
    <section class="motion-page px-6 py-10 lg:px-10">
      <div class="badge">مانیتور کیف پول</div><h1 class="mt-5 text-7xl font-black">موجودی‌ها، وجه‌های قفل‌شده و کارمزدها.</h1>
      <FilterBar v-model="q" class="mt-8" placeholder="جستجوی کاربران..." />
      <div class="mt-8 overflow-hidden rounded-[2rem] border border-white/10">
        <table class="w-full text-left">
          <thead class="bg-white/[.06] text-xs uppercase tracking-[.18em] text-muted"><tr><th class="p-4">ایمیل</th><th>نقش</th><th>موجودی</th><th>قفل شده</th><th>واریزها</th><th>برداشت‌ها</th></tr></thead>
          <tbody><tr v-for="r in filtered" :key="r.user_id" class="border-t border-white/10"><td class="p-4">{{ r.email }}</td><td>{{ r.role }}</td><td>{{ r.balance }}</td><td>{{ r.locked_balance }}</td><td>{{ r.deposits }}</td><td>{{ r.withdrawals }}</td></tr></tbody>
        </table>
      </div>
    </section>
  </AdminShell>
</template>
