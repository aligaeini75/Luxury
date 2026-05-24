<template>
  <section class="relative isolate overflow-hidden border-b border-white/10 bg-lux px-6 py-20 md:py-28">
    <div class="absolute inset-0 -z-10">
      <div class="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gold/15 blur-3xl"></div>
      <div class="absolute right-0 top-20 h-[420px] w-[420px] rounded-full bg-purplelux/15 blur-3xl"></div>
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_35%),linear-gradient(to_bottom,rgba(0,0,0,.1),rgba(0,0,0,.85))]"></div>
    </div>

    <div class="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">
      <div>
        <div class="badge">دسترسی خصوصی · گالری ماهانه · رزروها</div>
        <h1 class="mt-7 max-w-5xl text-6xl font-black leading-[0.9] tracking-tight text-white md:text-8xl">
          یک فضای خصوصی و لوکس برای رزروهای منتخب و گالری خانم‌ها.
        </h1>
        <p class="mt-7 max-w-2xl text-lg leading-8 text-muted md:text-xl">
          دیت، چت یا ویدیوکال رزرو کن، گالری ماهانه را باز کن و همه چیز را با کیف پول محافظت‌شده و تایید ادمین مدیریت کن.
        </p>
        <div class="mt-9 flex flex-wrap gap-3">
          <RouterLink to="/register" class="lux-btn">ورود به لوکسورا</RouterLink>
          <RouterLink to="/login" class="lux-btn-dark">ورود</RouterLink>
        </div>
      </div>

      <div class="relative">
        <div class="absolute -inset-4 rounded-[3rem] bg-gradient-to-br from-gold/20 via-white/5 to-purplelux/20 blur-2xl"></div>
        <div class="relative overflow-hidden rounded-[3rem] border border-white/10 bg-white/[0.04] p-3 shadow-aura backdrop-blur-2xl">
          <img
            class="h-[520px] w-full rounded-[2.5rem] object-cover opacity-85"
            src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop"
            alt="پیش‌نمایش دسترسی خصوصی لوکس"
          />
          <div class="absolute bottom-8 left-8 right-8 rounded-[2rem] border border-white/10 bg-black/55 p-6 backdrop-blur-2xl">
            <div class="badge">هسته فعال</div>
            <div class="mt-3 grid grid-cols-3 gap-3 text-center">
              <div>
                <div class="text-2xl font-black text-white">دیت</div>
                <div class="text-xs text-muted">رزروها</div>
              </div>
              <div>
                <div class="text-2xl font-black text-white">چت</div>
                <div class="text-xs text-muted">جلسات</div>
              </div>
              <div>
                <div class="text-2xl font-black text-white">ویدیو</div>
                <div class="text-xs text-muted">تماس‌ها</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
