<script setup lang="ts">
import { reactive } from 'vue'
import { useAuthStore } from '../../stores/auth'
const auth = useAuthStore()
const form = reactive({ email: 'admin@luxora.local', password: 'password123' })
</script>

<template>
  <section class="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 sm:py-10">
    <div class="absolute inset-0">
      <img class="h-full w-full object-cover opacity-35" src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1800&auto=format&fit=crop" />
      <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-lux to-lux"></div>
      <div class="absolute left-10 top-10 h-96 w-96 rounded-full bg-gold/15 blur-3xl"></div>
    </div>

    <div class="relative mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-10 lg:grid-cols-[.95fr_1.05fr]">
      <div>
        <div class="badge">ورود امن اعضا</div>
        <h1 class="mt-6 text-5xl md:text-7xl font-black leading-[.88]">به فضای خصوصی خودت برگرد.</h1>
        <p class="muted mt-6 max-w-xl text-lg">ورود امن برای آقا، خانم و ادمین با احراز هویت محافظت‌شده.</p>
        <div class="mt-8 hidden grid-cols-3 sm:grid gap-3">
          <img class="h-40 rounded-[2rem] object-cover" src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=600&auto=format&fit=crop" />
          <img class="h-40 rounded-[2rem] object-cover" src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop" />
          <img class="h-40 rounded-[2rem] object-cover" src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=600&auto=format&fit=crop" />
        </div>
      </div>

      <form class="lux-panel p-8" @submit.prevent="auth.login(form)">
        <div class="badge">ورود</div>
        <h2 class="mt-5 text-5xl font-black">خوش برگشتی.</h2>
        <input v-model="form.email" class="lux-input mt-8" placeholder="ایمیل" />
        <input v-model="form.password" type="password" class="lux-input mt-4" placeholder="رمز عبور" />
        <p v-if="auth.error" class="mt-4 text-red-300">{{ auth.error }}</p>
        <button class="lux-btn mt-6 w-full">ورود به لوکسورا</button>
        <RouterLink to="/register" class="mt-5 block text-center text-sm text-muted">ساخت حساب خصوصی</RouterLink>
      </form>
    </div>
  </section>
</template>
