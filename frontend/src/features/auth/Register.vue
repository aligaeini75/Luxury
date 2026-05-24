<script setup lang="ts">
import { reactive } from 'vue'
import { useAuthStore } from '../../stores/auth'
const auth = useAuthStore()
const form = reactive({ email: '', password: '', full_name: '', role: 'man' })
</script>

<template>
  <section class="relative min-h-screen overflow-hidden px-6 py-10">
    <div class="absolute inset-0">
      <img class="h-full w-full object-cover opacity-35" src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1800&auto=format&fit=crop" />
      <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-lux to-lux"></div>
    </div>

    <div class="relative mx-auto max-w-6xl pt-16">
      <div class="text-center">
        <div class="badge">درخواست عضویت خصوصی</div>
        <h1 class="mx-auto mt-6 max-w-4xl text-5xl md:text-7xl font-black leading-[.9]">نقش خودت را انتخاب کن و وارد لوکسورا شو.</h1>
      </div>

      <form class="lux-panel mx-auto mt-10 max-w-3xl p-8" @submit.prevent="auth.register(form)">
        <div class="grid gap-5 md:grid-cols-2">
          <input v-model="form.full_name" class="lux-input" placeholder="نام کامل" />
          <input v-model="form.email" class="lux-input" placeholder="ایمیل" />
          <input v-model="form.password" type="password" class="lux-input" placeholder="رمز عبور" />
          <select v-model="form.role" class="lux-input">
            <option value="man">آقا — کشف و ارسال درخواست</option>
            <option value="woman">خانم — استودیو و درخواست‌های ورودی</option>
          </select>
        </div>

        <div class="mt-6 grid gap-4 md:grid-cols-2">
          <label class="relative overflow-hidden rounded-[2rem] border p-6" :class="form.role === 'man' ? 'border-gold bg-gold/10' : 'border-white/10 bg-white/[.05]'">
            <input v-model="form.role" type="radio" value="man" class="hidden" />
            <img src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop" class="mb-4 h-44 w-full rounded-[1.5rem] object-cover opacity-80" />
            <b class="text-2xl">لانژ آقایان</b>
            <p class="muted mt-2">پروفایل، گالری و علایق خودت را بساز و درخواست خصوصی ارسال کن.</p>
          </label>

          <label class="relative overflow-hidden rounded-[2rem] border p-6" :class="form.role === 'woman' ? 'border-gold bg-gold/10' : 'border-white/10 bg-white/[.05]'">
            <input v-model="form.role" type="radio" value="woman" class="hidden" />
            <img src="https://images.unsplash.com/photo-1512316609839-ce289d3eba0a?q=80&w=600&auto=format&fit=crop" class="mb-4 h-44 w-full rounded-[1.5rem] object-cover opacity-80" />
            <b class="text-2xl">استودیو خانم‌ها</b>
            <p class="muted mt-2">قیمت‌گذاری، گالری، سرویس‌ها، لوکیشن‌ها و درخواست‌ها را مدیریت کن.</p>
          </label>
        </div>

        <p v-if="auth.error" class="mt-4 text-red-300">{{ auth.error }}</p>
        <button class="lux-btn mt-6 w-full">ساخت حساب خصوصی</button>
      </form>
    </div>
  </section>
</template>
