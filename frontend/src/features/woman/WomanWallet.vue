<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppShell from '../../components/layout/AppShell.vue'
import { useWalletStore } from '../../stores/wallet'
const wallet = useWalletStore()
const amount = ref(100)
const address = ref('')
onMounted(() => wallet.load())
</script>
<template>
  <AppShell>
    <section class="px-6 py-10 lg:px-10">
      <div class="badge">خانم‌ها کیف پول</div>
      <h1 class="mt-5 text-7xl font-black">فقط درآمد و برداشت.</h1>
      <div class="mt-8 grid gap-5 md:grid-cols-2">
        <div class="lux-panel p-8"><p class="muted">موجودی قابل استفاده</p><b class="text-6xl text-gold">{{ wallet.wallet.balance || 0 }}</b></div>
        <div class="lux-panel p-8"><p class="muted">موجودی قفل‌شده</p><b class="text-6xl text-gold">{{ wallet.wallet.locked_balance || 0 }}</b></div>
      </div>
      <div class="lux-panel mt-8 p-8">
        <div class="badge">برداشت</div>
        <input v-model="amount" type="number" class="lux-input mt-5" placeholder="مبلغ" />
        <input v-model="address" class="lux-input mt-4" placeholder="تومان payout address" />
        <button class="lux-btn mt-5" @click="wallet.requestWithdrawal(amount, address)">درخواست برداشت</button>
      </div>
    </section>
  </AppShell>
</template>
