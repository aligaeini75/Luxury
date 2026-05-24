<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import AdminShell from '../../components/admin/AdminShell.vue'
import FilterBar from '../../components/admin/FilterBar.vue'
import EmptyState from '../../components/lux/EmptyState.vue'
import { useOpsStore } from '../../stores/ops'

const ops = useOpsStore()
const q = ref('')
onMounted(() => ops.loadAuditLogs())
const filtered = computed(() => {
  const s = q.value.toLowerCase()
  return ops.auditLogs.filter((x:any) => JSON.stringify(x).toLowerCase().includes(s))
})
</script>
<template>
  <AdminShell>
    <section class="motion-page px-6 py-10 lg:px-10">
      <div class="badge">ممیزی امنیت</div>
      <h1 class="mt-5 text-7xl font-black">لاگ فعالیت.</h1>
      <FilterBar v-model="q" class="mt-8" placeholder="جستجوی عملیات، موجودیت یا کاربر..." />
      <div v-if="filtered.length" class="mt-8 space-y-4">
        <div v-for="l in filtered" :key="l.id" class="lux-panel p-6">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div><b class="text-2xl">{{ l.action }}</b><p class="muted mt-1">{{ l.entity_type }} · {{ l.entity_id || '-' }}</p></div>
            <span class="status-gold">{{ l.created_at }}</span>
          </div>
          <pre class="mt-4 overflow-x-auto rounded-2xl bg-black/50 p-4 text-xs text-muted">{{ l.metadata }}</pre>
        </div>
      </div>
      <EmptyState v-else class="mt-8" title="لاگ فعالیتی پیدا نشد" />
    </section>
  </AdminShell>
</template>
