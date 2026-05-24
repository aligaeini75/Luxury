<script setup lang="ts">
import { onMounted } from 'vue'
import AppShell from '../../components/layout/AppShell.vue'
import { useWalletStore } from '../../stores/wallet'
const wallet = useWalletStore()
onMounted(() => wallet.load())
</script>

<template>
  <AppShell>
    <section class="motion-page px-6 py-10 lg:px-10">
      <div class="badge">کیف پول فوق‌تصویری</div>
      <h1 class="mt-5 text-7xl font-black">نودهای متحرک امانت و جریان موجودی.</h1>
      <div class="mt-10 lux-panel overflow-hidden p-10">
        <div class="grid gap-8 lg:grid-cols-3">
          <div class="rounded-[2rem] border border-gold/20 bg-gold/10 p-8">
            <p class="muted">قابل استفاده</p>
            <b class="mt-3 block text-7xl text-gold">{{ wallet.wallet.balance || 0 }}</b>
          </div>
          <div class="rounded-[2rem] border border-white/10 bg-white/[.055] p-8">
            <p class="muted">امانت قفل‌شده</p>
            <b class="mt-3 block text-7xl text-gold">{{ wallet.wallet.locked_balance || 0 }}</b>
          </div>
          <div class="rounded-[2rem] border border-emerald/20 bg-emerald/10 p-8">
            <p class="muted">سرعت آزادسازی</p>
            <b class="mt-3 block text-7xl text-emerald">زنده</b>
          </div>
        </div>

        <div class="relative mt-12 h-44 rounded-[2rem] border border-white/10 bg-black/40">
          <div class="absolute left-[10%] top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-gold elite-pulse"></div>
          <div class="absolute left-[50%] top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-champagne elite-pulse"></div>
          <div class="absolute right-[10%] top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-emerald elite-pulse"></div>
          <div class="absolute left-[12%] right-[12%] top-1/2 h-1 -translate-y-1/2 bg-gradient-to-r from-gold via-champagne to-emerald"></div>
        </div>
      </div>
    </section>
  </AppShell>
</template>
