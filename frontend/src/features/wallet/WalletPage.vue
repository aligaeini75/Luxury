<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppShell from '../../components/layout/AppShell.vue'
import WalletAnalyticsCard from '../../components/lux/WalletAnalyticsCard.vue'
import { useWalletStore } from '../../stores/wallet'
import { useAuthStore } from '../../stores/auth'

const w = useWalletStore()
const auth = useAuthStore()
const dep = ref(2500000)
const wd = ref(1000000)
const cardNumber = ref('')
const cardHolder = ref('')
const notice = ref('')

async function createInvoice() {
  const invoice = await w.createDeposit(Number(dep.value || 0), 'iran_bank')
  notice.value = invoice?.message || 'درخواست پرداخت بانکی ثبت شد.'
}
async function withdraw() {
  await w.requestWithdrawal(Number(wd.value || 0), cardNumber.value, cardHolder.value)
  notice.value = 'درخواست برداشت با شماره کارت ثبت شد.'
}
onMounted(async () => { await auth.me().catch(() => {}); await w.load() })
function statusLabel(s?: string) {
  const map: Record<string, string> = { funded:'قفل‌شده', pending_accept:'در انتظار', locked:'قفل‌شده', released:'آزاد شده', refunded:'برگشت خورده', pending:'در انتظار', confirmed:'تایید شده' }
  return map[String(s || '')] || s || 'نامشخص'
}
</script>

<template>
  <AppShell>
    <section class="px-4 py-8 lg:px-8">
      <div class="badge">کیف پول</div>
      <h1 class="mt-4 font-black">کیف پول، پرداخت بانکی، برداشت و امانت</h1>
      <p class="muted mt-3 max-w-3xl">
        پرداخت کریپتو از UI حذف شد. پرداخت با درگاه بانکی ایران آماده اتصال است؛ اطلاعات درگاه را بعداً اضافه می‌کنیم.
      </p>

      <WalletAnalyticsCard class="mt-6" :balance="w.wallet.balance" :locked="w.wallet.locked_balance" :income="w.transactions?.filter((x:any)=>x.type==='escrow_release' || x.type==='booking_payout').reduce((s:number,x:any)=>s+Number(x.amount||0),0)" />

      <div class="mt-6 grid gap-4 md:grid-cols-2">
        <div class="lux-panel p-5"><p class="muted">موجودی قابل استفاده</p><b class="mt-2 block text-4xl text-gold">{{ w.wallet.balance || 0 }} تومان</b></div>
        <div class="lux-panel p-5"><p class="muted">موجودی در امانت</p><b class="mt-2 block text-4xl text-gold">{{ w.wallet.locked_balance || 0 }} تومان</b></div>
      </div>

      <div class="mt-6 grid gap-4 xl:grid-cols-2">
        <div class="lux-panel p-5">
          <h2 class="font-black">شارژ کیف پول با درگاه بانکی</h2>
          <p class="muted mt-2">آقایان می‌توانند کیف پول را شارژ کنند یا در رزرو مستقیم پرداخت کنند.</p>
          <input v-model="dep" type="number" class="lux-input mt-4" placeholder="مبلغ تومان" />
          <button class="lux-btn mt-4" @click="createInvoice">ثبت پرداخت بانکی</button>
        </div>

        <div class="lux-panel p-5">
          <h2 class="font-black">برداشت به کارت بانکی</h2>
          <p class="muted mt-2">خانم‌ها شماره کارت منتخب را ثبت می‌کنند؛ برداشت برای ادمین ارسال می‌شود.</p>
          <input v-model="wd" type="number" class="lux-input mt-4" placeholder="مبلغ تومان" />
          <input v-model="cardNumber" class="lux-input mt-3" placeholder="شماره کارت" />
          <input v-model="cardHolder" class="lux-input mt-3" placeholder="نام صاحب کارت" />
          <button class="lux-btn mt-4" @click="withdraw">ثبت برداشت</button>
        </div>
      </div>

      <div v-if="notice" class="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/[.08] p-3 text-emerald-100">{{ notice }}</div>

      <div class="lux-panel mt-6 p-5">
        <h2 class="font-black">امانت پرداخت رزروها</h2>
        <p class="muted mt-1">بعد از اتمام زمان چت/ویدیو/دیت، مبلغ به کیف پول خانم می‌نشیند؛ اگر آقا مشکلی داشت باید تیکت/اختلاف بزند.</p>
        <div class="mt-4 grid gap-3">
          <article v-for="e in w.escrows" :key="e.id" class="rounded-2xl border border-gold/10 bg-black/25 p-4">
            <div class="flex items-center justify-between gap-3">
              <div><p class="text-sm font-black text-white">رزرو #{{ String(e.booking_id || '').slice(-8) }}</p><p class="muted mt-1 text-xs">وضعیت: {{ statusLabel(e.status) }}</p></div>
              <b class="text-2xl text-gold">{{ e.amount || 0 }} تومان</b>
            </div>
          </article>
          <p v-if="!w.escrows?.length" class="rounded-2xl border border-dashed border-gold/15 p-5 text-center text-muted">فعلاً امانت پرداختی وجود ندارد.</p>
        </div>
      </div>
    </section>
  </AppShell>
</template>
