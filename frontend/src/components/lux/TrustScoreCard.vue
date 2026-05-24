<script setup lang="ts">
defineProps<{ user?: any; score?: number }>()
</script>

<template>
  <div class="lux-panel p-7">
    <div class="badge">نمودار اعتماد</div>
    <h3 class="mt-4 text-4xl font-black">{{ score || 92 }}/100</h3>
    <div class="mt-6 space-y-3">
      <div v-for="x in [
        ['Reliability', 94],
        ['Response', 91],
        ['Premium history', 88],
        ['لغوlation risk', 12]
      ]" :key="x[0] as string">
        <div class="mb-2 flex justify-between text-sm text-muted">
          <span>{{ x[0] }}</span><span>{{ x[1] }}%</span>
        </div>
        <div class="h-2 rounded-full bg-white/10">
          <div class="h-2 rounded-full bg-gradient-to-r from-gold to-champagne" :style="{ width: x[1] + '%' }"></div>
        </div>
      </div>
    </div>
  </div>
</template>
