<script setup lang="ts">
const themes = [
  { key: 'lux-theme-gold', label: 'Gold' },
  { key: 'lux-theme-velvet', label: 'Velvet' },
  { key: 'lux-theme-diamond', label: 'Diamond' },
]

function setTheme(key: string) {
  document.body.classList.remove('lux-theme-gold', 'lux-theme-velvet', 'lux-theme-diamond')
  document.body.classList.add(key)
  localStorage.setItem('luxora_theme', key)
}

const saved = localStorage.getItem('luxora_theme')
if (saved) setTheme(saved)
</script>

<template>
  <div class="flex flex-wrap gap-3">
    <button v-for="t in themes" :key="t.key" class="lux-btn-dark" @click="setTheme(t.key)">
      {{ t.label }} حالت
    </button>
  </div>
</template>
