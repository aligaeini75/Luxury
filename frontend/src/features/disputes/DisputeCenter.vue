<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppShell from '../../components/layout/AppShell.vue'
import DisputeCenterCard from '../../components/lux/DisputeCenterCard.vue'
import { api } from '../../lib/api'

const disputes = ref<any[]>([])
async function load() {
  const { data } = await api.get('/disputes')
  disputes.value = data.disputes || []
}
onMounted(load)
</script>

<template>
  <AppShell>
    <section class="motion-page px-6 py-10 lg:px-10">
      <div class="badge">مرکز کامل اختلاف امانت پرداخت</div>
      <h1 class="mt-5 text-7xl font-black">مدرک، فریز، داوری و آزادسازی تقسیم‌شده.</h1>
      <div class="mt-8 grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
        <DisputeCenterCard @created="load" />
        <div class="space-y-4">
          <div v-for="d in disputes" :key="d.id" class="lux-panel p-6">
            <div class="flex items-center justify-between">
              <div>
                <b class="text-2xl">{{ d.reason }}</b>
                <p class="muted mt-1">{{ d.status }} · {{ d.created_at }}</p>
              </div>
              <span class="status-gold">{{ d.stage }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </AppShell>
</template>
