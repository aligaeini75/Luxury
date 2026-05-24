<script setup lang="ts">
import { ref } from 'vue'
import { Volume2, VolumeX } from 'lucide-vue-next'

const enabled = ref(localStorage.getItem('luxora_sound') === 'on')

function toggle() {
  enabled.value = !enabled.value
  localStorage.setItem('luxora_sound', enabled.value ? 'on' : 'off')
  if (enabled.value) {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3')
    audio.volume = 0.14
    audio.play().catch(() => {})
  }
}
</script>

<template>
  <button class="lux-btn-dark" @click="toggle">
    <Volume2 v-if="enabled" class="mr-2 h-4 w-4" />
    <VolumeX v-else class="mr-2 h-4 w-4" />
    {{ enabled ? 'Sound On' : 'Sound Off' }}
  </button>
</template>
