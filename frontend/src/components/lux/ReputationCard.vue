<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Star, ShieldCheck, AlertTriangle } from 'lucide-vue-next'
import { api } from '../../lib/api'

const props = defineProps<{ userId?: string }>()
const rep = ref<any>(null)

onMounted(async () => {
  if (!props.userId) return
  const { data } = await api.get(`/users/{props.userId}/reputation`).catch(() => ({ data: null }))
  rep.value = data
})
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-3">
    <div class="rounded-2xl border border-gold/15 bg-black/35 p-4">
      <Star class="h-5 w-5 text-gold" />
      <p class="mt-2 text-xs text-muted">امتیاز</p>
      <b class="text-2xl text-champagne">{{ rep?.avg_rating || '0.0' }}</b>
    </div>
    <div class="rounded-2xl border border-gold/15 bg-black/35 p-4">
      <ShieldCheck class="h-5 w-5 text-emerald-200" />
      <p class="mt-2 text-xs text-muted">رزرو موفق</p>
      <b class="text-2xl text-champagne">{{ rep?.booking_count || 0 }}</b>
    </div>
    <div class="rounded-2xl border border-gold/15 bg-black/35 p-4">
      <AlertTriangle class="h-5 w-5 text-red-200" />
      <p class="mt-2 text-xs text-muted">اختلاف</p>
      <b class="text-2xl text-champagne">{{ rep?.dispute_count || 0 }}</b>
    </div>
  </div>
</template>
