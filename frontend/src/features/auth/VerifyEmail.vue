<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ShieldCheck, Mail, RefreshCw } from 'lucide-vue-next'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
const code = ref('')
const sentAgain = ref(false)

async function submit() {
  if (code.value.trim().length < 4) {
    auth.error = 'کد تایید را کامل وارد کن.'
    return
  }
  await auth.verifyEmail(code.value.trim())
}

async function resend() {
  sentAgain.value = await auth.resendEmailCode()
}
</script>

<template>
  <section class="relative min-h-screen overflow-hidden px-6 py-10">
    <div class="absolute inset-0">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_85%_0%,rgba(214,173,82,.24),transparent_34%),linear-gradient(180deg,#020100,#080502_55%,#020100)]"></div>
    </div>

    <div class="relative mx-auto grid min-h-[82vh] max-w-6xl place-items-center">
      <form class="lux-panel w-full max-w-2xl p-8 text-center md:p-12" @submit.prevent="submit">
        <div class="mx-auto grid h-20 w-20 place-items-center rounded-full border border-gold/30 bg-gold/10 text-gold">
          <Mail class="h-9 w-9" />
        </div>
        <div class="badge mx-auto mt-6">EMAIL VERIFICATION</div>
        <h1 class="mt-6 text-4xl font-black leading-tight md:text-6xl">کد تایید ایمیل را وارد کن.</h1>
        <p class="muted mx-auto mt-4 max-w-xl text-base leading-8">
          برای کامل شدن ثبت‌نام، کدی که به ایمیل
          <b class="text-champagne">{{ auth.pendingVerificationEmail || 'شما' }}</b>
          ارسال شده را وارد کن.
        </p>

        <input
          v-model="code"
          inputmode="numeric"
          maxlength="6"
          class="mt-8 w-full rounded-[1.6rem] border border-gold/20 bg-black/45 px-6 py-5 text-center text-4xl font-black tracking-[.35em] text-champagne outline-none focus:border-gold"
          placeholder="------"
        />

        <p v-if="auth.error" class="mt-4 rounded-2xl border border-red-300/20 bg-red-500/10 p-3 text-sm text-red-100">{{ auth.error }}</p>
        <p v-if="sentAgain" class="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-500/10 p-3 text-sm text-emerald-100">کد جدید ارسال شد.</p>

        <button class="lux-btn mt-7 w-full" :disabled="auth.loading">
          <ShieldCheck class="ml-2 inline h-5 w-5" />
          تایید و ورود به حساب
        </button>
        <button type="button" class="lux-btn-dark mt-3 w-full" :disabled="auth.loading || !auth.pendingVerificationEmail" @click="resend">
          <RefreshCw class="ml-2 inline h-5 w-5" />
          ارسال دوباره کد
        </button>

        <RouterLink to="/register" class="mt-6 inline-block text-sm font-black text-gold">بازگشت به ثبت‌نام</RouterLink>
      </form>
    </div>
  </section>
</template>
