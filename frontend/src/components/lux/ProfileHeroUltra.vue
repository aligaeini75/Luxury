<script setup lang="ts">
defineProps<{ profile: any; role?: 'man' | 'woman' }>()
</script>

<template>
  <section class="lux-panel overflow-hidden">
    <div class="grid lg:grid-cols-[1.05fr_.95fr]">
      <div class="p-7 md:p-10">
        <div class="badge">{{ role === 'woman' ? 'پروفایل خانم' : 'پروفایل آقا' }}</div>
        <h1 class="mt-6 text-4xl font-black leading-tight md:text-7xl">
          {{ profile?.display_name || 'پروفایل هنوز تکمیل نشده' }}
        </h1>
        <p class="muted mt-5 max-w-2xl text-base leading-8 md:text-lg">
          {{ profile?.bio || 'برای نمایش بهتر در سیستم، عکس، بیوگرافی و اطلاعات اعتماد حساب را تکمیل کن.' }}
        </p>

        <div class="mt-8 grid gap-4 md:grid-cols-3">
          <div class="rounded-[2rem] border border-white/10 bg-white/[.055] p-5">
            <p class="muted">احراز هویت</p>
            <b class="mt-2 block text-2xl" :class="profile?.verified ? 'text-emerald-200' : 'text-gold'">
              {{ profile?.verified ? 'تایید شده' : 'نیازمند تکمیل' }}
            </b>
          </div>
          <div class="rounded-[2rem] border border-white/10 bg-white/[.055] p-5">
            <p class="muted">وضعیت عکس</p>
            <b class="mt-2 block text-2xl text-gold">{{ profile?.cover_url || profile?.main_photo_url ? 'آپلود شده' : 'بدون عکس' }}</b>
          </div>
          <div class="rounded-[2rem] border border-white/10 bg-white/[.055] p-5">
            <p class="muted">وضعیت پروفایل</p>
            <b class="mt-2 block text-2xl text-gold">{{ profile?.display_name ? 'فعال' : 'ناقص' }}</b>
          </div>
        </div>
      </div>

      <div class="relative min-h-[420px] md:min-h-[560px]">
        <img
          v-if="profile?.cover_url || profile?.main_photo_url"
          :src="profile?.cover_url || profile?.main_photo_url"
          class="absolute inset-0 h-full w-full object-cover opacity-80"
        />
        <img v-else src="/upload-image-placeholder.svg" class="absolute inset-0 h-full w-full object-cover opacity-70" />
        <div class="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent"></div>
        <div class="absolute bottom-8 left-8 right-8">
          <div class="badge">{{ profile?.cover_url || profile?.main_photo_url ? 'پیش‌نمایش واقعی' : 'تصویر پیش‌فرض تا زمان آپلود' }}</div>
          <h2 class="mt-4 text-3xl font-black md:text-4xl">
            {{ profile?.cover_url || profile?.main_photo_url ? 'تصویر پروفایل' : 'هنوز تصویر واقعی آپلود نشده' }}
          </h2>
        </div>
      </div>
    </div>
  </section>
</template>
