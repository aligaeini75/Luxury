<script setup lang="ts">
import { CheckCircle2, AlertTriangle, Info, X, ShieldAlert } from 'lucide-vue-next'
import { useToastStore } from '../../stores/toast'

const toast = useToastStore()

function icon(type: string) {
  if (type === 'success') return CheckCircle2
  if (type === 'error') return AlertTriangle
  if (type === 'warning') return ShieldAlert
  return Info
}
</script>

<template>
  <Teleport to="body">
    <div dir="rtl" class="fixed right-4 top-4 z-[9999] flex w-[calc(100vw-2rem)] max-w-md flex-col gap-3 text-right">
      <TransitionGroup enter-active-class="transition duration-300" leave-active-class="transition duration-200" enter-from-class="translate-y-3 opacity-0 scale-95" leave-to-class="translate-y-3 opacity-0 scale-95">
        <article
          v-for="item in toast.items"
          :key="item.id"
          class="rounded-[1.4rem] border bg-black/90 p-4 text-white shadow-[0_25px_80px_rgba(0,0,0,.55)] backdrop-blur-2xl"
          :class="{
            'border-emerald-300/25': item.type === 'success',
            'border-red-300/25': item.type === 'error',
            'border-gold/25': item.type === 'info' || item.type === 'warning'
          }"
        >
          <div class="flex items-start gap-3">
            <component :is="icon(item.type)" class="mt-0.5 h-5 w-5 shrink-0" :class="item.type === 'error' ? 'text-red-200' : item.type === 'success' ? 'text-emerald-200' : 'text-champagne'" />
            <div class="min-w-0 flex-1">
              <p class="font-black text-white">{{ item.title }}</p>
              <p v-if="item.body" class="mt-1 text-sm leading-6 text-muted">{{ item.body }}</p>
            </div>
            <button class="grid h-8 w-8 place-items-center rounded-full bg-white/[.06] text-muted" @click="toast.remove(item.id)">
              <X class="h-4 w-4" />
            </button>
          </div>
        </article>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
