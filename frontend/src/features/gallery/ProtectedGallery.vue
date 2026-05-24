<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppShell from '../../components/layout/AppShell.vue'
import BlurUnlockCard from '../../components/lux/BlurUnlockCard.vue'
import { api } from '../../lib/api'

const items = ref<any[]>([])
const unlocked = ref<Record<string, boolean>>({})

onMounted(async () => {
  const { data } = await api.get('/protected-gallery')
  items.value = data.items || []
})

async function unlock(item: any) {
  await api.post(`/protected-gallery/{item.id}/unlock`)
  unlocked.value[item.id] = true
}
</script>

<template>
  <AppShell>
    <section class="px-6 py-10 lg:px-10">
      <div class="badge">گالری‌های تار تا زمان باز شدن</div>
      <h1 class="mt-5 text-7xl font-black">رسانه پولی محافظت‌شده.</h1>
      <p class="muted mt-4 max-w-2xl text-lg">پیش‌نمایش تار، دسترسی زمان‌دار، واترمارک و هشدار ضد اسکرین‌شات.</p>

      <div class="mt-10 grid gap-5 md:grid-cols-3">
        <BlurUnlockCard
          v-for="item in items"
          :key="item.id"
          :item="item"
          :unlocked="unlocked[item.id]"
          watermark="LUXORA MEMBER"
          @unlock="unlock"
        />
      </div>
    </section>
  </AppShell>
</template>
