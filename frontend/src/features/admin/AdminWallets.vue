<script setup lang="ts">
import { onMounted } from 'vue'
import AdminShell from '../../components/admin/AdminShell.vue'
import UserAvatar from '../../components/lux/UserAvatar.vue'
import { useAdminStore } from '../../stores/admin'

const a = useAdminStore()
onMounted(() => a.loadWallets())
</script>

<template>
  <AdminShell>
    <section class="px-4 py-8 lg:px-10">
      <div class="rounded-[2.4rem] border border-gold/15 bg-white/[.045] p-6 shadow-aura">
        <div class="badge">کیف پول و تراکنش‌ها</div>
        <h1 class="mt-5 text-4xl font-black md:text-7xl">مالی خشک نیست؛ هر تراکنش با صاحبش دیده می‌شود</h1>
        <p class="muted mt-4 max-w-3xl leading-8">
          هر واریز، برداشت و امانت پرداخت با عکس، ایمیل، نقش و وضعیت کاربر نمایش داده می‌شود تا ادمین دقیق بداند چه کسی چه درخواستی دارد.
        </p>
      </div>

      <div class="mt-8 grid gap-6 xl:grid-cols-3">
        <section class="lux-panel p-5">
          <div class="badge">واریزها</div>
          <h2 class="mt-3 text-3xl font-black">درخواست‌های واریز</h2>
          <div class="mt-5 space-y-4">
            <article v-for="d in a.deposits" :key="d.id" class="rounded-[1.8rem] border border-gold/10 bg-black/35 p-4">
              <div class="flex items-center gap-3">
                <UserAvatar :src="d.avatar_url" :name="d.display_name || d.email" />
                <div>
                  <p class="font-black text-white">{{ d.display_name || d.email }}</p>
                  <p class="text-xs text-muted">{{ d.email }} · {{ d.role === 'woman' ? 'خانم' : 'آقا' }}</p>
                </div>
              </div>
              <div class="mt-4 rounded-2xl bg-white/[.04] p-4">
                <p class="text-sm text-muted">مبلغ و وضعیت</p>
                <p class="mt-1 text-2xl font-black text-champagne">{{ d.amount }} تومان · {{ d.status }}</p>
                <p class="mt-1 text-xs text-muted">{{ d.provider }} · {{ d.network }}</p>
              </div>
              <button v-if="d.status !== 'confirmed'" class="lux-btn mt-3 w-full" @click="a.markDepositPaid(d.id)">تایید واریز</button>
            </article>
            <p v-if="!a.deposits.length" class="muted mt-4">هنوز واریزی وجود ندارد.</p>
          </div>
        </section>

        <section class="lux-panel p-5">
          <div class="badge">برداشت‌ها</div>
          <h2 class="mt-3 text-3xl font-black">درخواست برداشت</h2>
          <div class="mt-5 space-y-4">
            <article v-for="w in a.withdrawals" :key="w.id" class="rounded-[1.8rem] border border-gold/10 bg-black/35 p-4">
              <div class="flex items-center gap-3">
                <UserAvatar :src="w.avatar_url" :name="w.display_name || w.email" />
                <div>
                  <p class="font-black text-white">{{ w.display_name || w.email }}</p>
                  <p class="text-xs text-muted">{{ w.email }} · {{ w.role === 'woman' ? 'خانم' : 'آقا' }}</p>
                </div>
              </div>
              <div class="mt-4 rounded-2xl bg-white/[.04] p-4">
                <p class="text-sm text-muted">مبلغ برداشت</p>
                <p class="mt-1 text-2xl font-black text-champagne">{{ w.amount }} تومان</p>
                <p class="mt-1 break-all text-xs text-muted">{{ w.payout_address }}</p>
              </div>
              <div v-if="w.status === 'pending'" class="mt-3 grid grid-cols-2 gap-2">
                <button class="lux-btn" @click="a.approveWithdrawal(w.id)">تایید</button>
                <button class="lux-btn-dark" @click="a.rejectWithdrawal(w.id)">رد</button>
              </div>
            </article>
            <p v-if="!a.withdrawals.length" class="muted mt-4">هنوز برداشتی وجود ندارد.</p>
          </div>
        </section>

        <section class="lux-panel p-5">
          <div class="badge">امانت پرداخت</div>
          <h2 class="mt-3 text-3xl font-black">رزروهای دارای وجه</h2>
          <div class="mt-5 space-y-4">
            <article v-for="e in a.escrows" :key="e.id" class="rounded-[1.8rem] border border-gold/10 bg-black/35 p-4">
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-2">
                  <UserAvatar :src="e.man_avatar_url" :name="e.man_name" size="sm" />
                  <UserAvatar :src="e.woman_avatar_url" :name="e.woman_name" size="sm" />
                </div>
                <span class="rounded-full bg-gold/10 px-3 py-1 text-xs font-black text-champagne">{{ e.status }}</span>
              </div>
              <p class="mt-4 font-black text-white">{{ e.man_name || e.man_email }} ← {{ e.woman_name || e.woman_email }}</p>
              <p class="mt-1 text-sm text-muted">رزرو: {{ e.booking_id }}</p>
              <p class="mt-3 text-2xl font-black text-champagne">{{ e.amount }} تومان</p>
              <div v-if="['funded','pending_accept'].includes(e.status)" class="mt-3 grid grid-cols-2 gap-2">
                <button class="lux-btn" @click="a.releaseEscrow(e.id)">آزادسازی</button>
                <button class="lux-btn-dark" @click="a.refundEscrow(e.id)">ریفاند</button>
              </div>
            </article>
            <p v-if="!a.escrows.length" class="muted mt-4">امانت فعالی وجود ندارد.</p>
          </div>
        </section>
      </div>
    </section>
  </AdminShell>
</template>
