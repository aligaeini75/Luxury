<script setup lang="ts">
import { RouterLink } from 'vue-router'

const steps = [
  {
    n: '۰۱',
    title: 'ثبت‌نام و احراز هویت',
    body: 'آقا ابتدا حساب خصوصی می‌سازد و اطلاعات پایه را تکمیل می‌کند تا امکان رزرو فعال شود.',
  },
  {
    n: '۰۲',
    title: 'مشاهده پروفایل خانم‌ها',
    body: 'پروفایل‌ها، عکس‌ها، توضیحات، قیمت‌ها و تایم‌های آزاد در یک نمای لوکس و مرتب نمایش داده می‌شود.',
  },
  {
    n: '۰۳',
    title: 'انتخاب نوع ارتباط',
    body: 'آقا می‌تواند بین دیت حضوری، چت خصوصی یا ویدیوکال زمان‌دار یکی را انتخاب کند.',
  },
  {
    n: '۰۴',
    title: 'واریز امن و ثبت درخواست',
    body: 'مبلغ به‌صورت امن ثبت می‌شود و درخواست برای بررسی و تایید به خانم ارسال می‌گردد.',
  },
  {
    n: '۰۵',
    title: 'تایید خانم',
    body: 'خانم درخواست را بررسی می‌کند. بعد از تایید، وضعیت درخواست برای هر دو طرف به‌روزرسانی می‌شود.',
  },
  {
    n: '۰۶',
    title: 'باز شدن چت یا ویدیوکال',
    body: 'برای دیت و چت، گفت‌وگوی خصوصی باز می‌شود. برای ویدیوکال، دکمه ورود فقط در زمان رزرو فعال می‌شود.',
  },
]

const bookingCards = [
  { title: 'دیت حضوری', price: 'از ۱۲۰ تومان', desc: 'رزرو تایم مشخص با تایید خانم و باز شدن چت هماهنگی پس از پذیرش.' },
  { title: 'چت خصوصی', price: 'از ۳۰ تومان', desc: 'چت زمان‌دار در بازه مشخص؛ مناسب آشنایی و هماهنگی مستقیم.' },
  { title: 'ویدیوکال امن', price: 'از ۵۰ تومان', desc: 'اتاق ویدیوکال فقط در زمان رزرو فعال می‌شود و لینک آن کنترل‌شده است.' },
]

const adminFacts = [
  'درخواست‌های در انتظار تایید',
  'پرداخت‌های نیازمند بررسی',
  'ویدیوکال‌های امروز',
  'احراز هویت‌های جدید',
]
</script>

<template>
  <main dir="rtl" class="relative min-h-screen overflow-hidden bg-[#020100] text-right text-white">
    <div class="pointer-events-none fixed inset-0 z-0">
      <div class="absolute -right-40 top-10 h-[34rem] w-[34rem] rounded-full bg-gold/15 blur-[110px]"></div>
      <div class="absolute -left-40 top-80 h-[30rem] w-[30rem] rounded-full bg-champagne/10 blur-[100px]"></div>
      <div class="absolute inset-0 opacity-[0.035] [background-image:radial-gradient(circle,rgba(255,240,189,.8)_1px,transparent_1px)] [background-size:12px_12px]"></div>
    </div>

    <header class="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 md:px-8">
      <nav class="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-gold/15 bg-black/78 px-3 py-2.5 shadow-[0_18px_70px_rgba(0,0,0,.42)] backdrop-blur-2xl sm:px-5">
        <RouterLink to="/" class="flex items-center gap-3">
          <span class="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-champagne via-gold to-bronze text-lg font-black text-black shadow-goldSoft">ل</span>
          <span class="text-lg font-black tracking-tight text-champagne sm:text-xl">لوکسورا</span>
        </RouterLink>

        <div class="hidden items-center gap-7 md:flex">
          <a href="#flow" class="text-sm font-bold text-muted transition hover:text-champagne">فلو رزرو</a>
          <a href="#booking-types" class="text-sm font-bold text-muted transition hover:text-champagne">نوع ارتباط</a>
          <a href="#trust" class="text-sm font-bold text-muted transition hover:text-champagne">امنیت پرداخت</a>
        </div>

        <div class="flex items-center gap-2">
          <RouterLink to="/login" class="hidden rounded-full px-4 py-2.5 text-sm font-black text-muted transition hover:bg-white/10 hover:text-white sm:block">ورود</RouterLink>
          <RouterLink to="/register" class="rounded-full bg-gold px-4 py-2.5 text-sm font-black text-black shadow-goldSoft transition active:scale-[.98] sm:px-5">شروع عضویت</RouterLink>
        </div>
      </nav>
    </header>

    <section class="relative z-10 px-4 pt-28 sm:px-6 md:px-8 lg:pt-32">
      <div class="mx-auto grid min-h-[calc(100vh-7rem)] max-w-7xl items-center gap-10 pb-16 lg:grid-cols-[1.05fr_.95fr]">
        <div>
          <div class="inline-flex rounded-full border border-gold/25 bg-gold/10 px-4 py-2 text-xs font-black text-champagne">
            پلتفرم خصوصی رزرو، چت و ویدیوکال
          </div>

          <h1 class="mt-6 max-w-5xl text-[3.1rem] font-black leading-[1.05] tracking-[-0.04em] sm:text-6xl md:text-7xl lg:text-8xl">
            رزرو خصوصی،
            <span class="block bg-gradient-to-l from-champagne via-gold to-champagne bg-clip-text text-transparent">
              با پرداخت امن و تایید دوطرفه.
            </span>
          </h1>

          <p class="mt-7 max-w-2xl text-base leading-9 text-muted sm:text-lg md:text-xl md:leading-10">
            لوکسورا برای آقایانی ساخته شده که می‌خواهند پس از احراز هویت، پروفایل خانم‌ها را ببینند، تایم دیت، چت یا ویدیوکال انتخاب کنند، مبلغ را امن واریز کنند و بعد از تایید خانم وارد ارتباط خصوصی شوند.
          </p>

          <div class="mt-9 flex flex-col gap-3 sm:flex-row">
            <RouterLink to="/register" class="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-gold via-champagne to-gold px-8 py-4 text-base font-black text-black shadow-aura">
              شروع عضویت خصوصی
            </RouterLink>
            <RouterLink to="/login" class="inline-flex items-center justify-center rounded-full border border-gold/20 bg-white/[.055] px-8 py-4 text-base font-black text-white">
              ورود اعضا
            </RouterLink>
          </div>

          <div class="mt-10 grid max-w-2xl grid-cols-3 gap-3">
            <div class="rounded-[1.5rem] border border-gold/15 bg-white/[.045] p-4 shadow-aura backdrop-blur-2xl">
              <b class="text-2xl text-champagne">۳</b>
              <p class="mt-1 text-xs font-bold text-muted">دیت، چت، ویدیو</p>
            </div>
            <div class="rounded-[1.5rem] border border-gold/15 bg-white/[.045] p-4 shadow-aura backdrop-blur-2xl">
              <b class="text-2xl text-champagne">امن</b>
              <p class="mt-1 text-xs font-bold text-muted">پرداخت تحت بررسی</p>
            </div>
            <div class="rounded-[1.5rem] border border-gold/15 bg-white/[.045] p-4 shadow-aura backdrop-blur-2xl">
              <b class="text-2xl text-champagne">۳۰ روز</b>
              <p class="mt-1 text-xs font-bold text-muted">اشتراک گالری</p>
            </div>
          </div>
        </div>

        <div class="relative mx-auto w-full max-w-[430px] lg:max-w-[540px]">
          <div class="rounded-[2.6rem] border border-gold/20 bg-white/[.055] p-4 shadow-aura backdrop-blur-3xl">
            <div class="rounded-[2.1rem] border border-gold/15 bg-black/45 p-5">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs font-black text-champagne/70">نمونه درخواست</p>
                  <h3 class="mt-2 text-2xl font-black">ویدیوکال خصوصی</h3>
                </div>
                <span class="rounded-full bg-gold px-4 py-2 text-xs font-black text-black">در انتظار تایید</span>
              </div>

              <div class="mt-6 grid gap-3">
                <div class="rounded-2xl border border-gold/15 bg-white/[.04] p-4">
                  <p class="text-sm font-bold text-muted">خانم انتخاب‌شده</p>
                  <p class="mt-1 text-xl font-black text-white">پروفایل تاییدشده</p>
                </div>
                <div class="rounded-2xl border border-gold/15 bg-white/[.04] p-4">
                  <p class="text-sm font-bold text-muted">زمان رزرو</p>
                  <p class="mt-1 text-xl font-black text-white">امشب · ساعت ۲۱:۳۰</p>
                </div>
                <div class="rounded-2xl border border-gold/15 bg-white/[.04] p-4">
                  <p class="text-sm font-bold text-muted">وضعیت پرداخت</p>
                  <p class="mt-1 text-xl font-black text-champagne">ثبت‌شده و قابل بررسی</p>
                </div>
              </div>

              <div class="mt-6 rounded-2xl bg-gold/10 p-4 text-sm leading-7 text-champagne">
                بعد از تایید خانم، لینک ویدیوکال در زمان رزرو فعال می‌شود و قبل از زمان جلسه غیرفعال می‌ماند.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    
    <section id="flow" class="relative z-10 px-4 py-20 sm:px-6 md:px-8">
      <div class="mx-auto max-w-7xl">
        <div class="max-w-3xl">
          <div class="inline-flex rounded-full border border-gold/25 bg-gold/10 px-4 py-2 text-xs font-black text-champagne">فلو واقعی آقا</div>
          <h2 class="mt-5 text-4xl font-black leading-tight md:text-6xl">
            از احراز هویت تا باز شدن ارتباط، همه‌چیز روشن و مرحله‌ای است.
          </h2>
        </div>

        <div class="relative mt-16">
          <div class="pointer-events-none absolute right-8 left-8 top-1/2 hidden h-[2px] -translate-y-1/2 overflow-hidden rounded-full bg-gold/15 lg:block">
            <div class="h-full w-1/3 animate-[flowLine_3s_ease-in-out_infinite] rounded-full bg-gradient-to-l from-transparent via-champagne to-transparent"></div>
          </div>

          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-6">
            <article v-for="(step, index) in steps" :key="step.n" class="group relative rounded-[2rem] border border-gold/15 bg-black/55 p-4 shadow-aura backdrop-blur-2xl">
              <div class="relative overflow-hidden rounded-[1.45rem] border border-gold/15 bg-[radial-gradient(circle_at_50%_20%,rgba(255,240,189,.22),transparent_35%),linear-gradient(180deg,rgba(214,173,82,.18),rgba(0,0,0,.82))] p-4">
                <div class="mb-4 h-32 rounded-[1.2rem] border border-gold/10 bg-black/35">
                  <div class="grid h-full place-items-center">
                    <div class="grid h-16 w-16 place-items-center rounded-full bg-gold/15 text-3xl">
                      <span v-if="index === 0">🪪</span>
                      <span v-else-if="index === 1">👤</span>
                      <span v-else-if="index === 2">📅</span>
                      <span v-else-if="index === 3">💳</span>
                      <span v-else-if="index === 4">✅</span>
                      <span v-else>💬</span>
                    </div>
                  </div>
                </div>
                <span class="text-sm font-black text-gold">{{ step.n }}</span>
                <h3 class="mt-3 text-xl font-black text-white">{{ step.title }}</h3>
                <p class="mt-3 min-h-[7rem] text-sm leading-7 text-muted">{{ step.body }}</p>
              </div>

              <div v-if="index < steps.length - 1" class="absolute -left-5 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-gold/25 bg-black text-gold shadow-aura lg:grid">
                ←
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>


    <section id="booking-types" class="relative z-10 bg-black/30 px-4 py-20 sm:px-6 md:px-8">
      <div class="mx-auto max-w-7xl">
        <div class="grid items-end gap-8 md:grid-cols-2">
          <div>
            <div class="inline-flex rounded-full border border-gold/25 bg-gold/10 px-4 py-2 text-xs font-black text-champagne">انتخاب نوع ارتباط</div>
            <h2 class="mt-5 text-4xl font-black leading-tight md:text-6xl">
              آقا در پروفایل خانم، تایم‌ها و قیمت‌ها را می‌بیند.
            </h2>
          </div>
          <p class="text-lg leading-9 text-muted">
            هر خانم می‌تواند برای دیت، چت و ویدیوکال تایم و قیمت جدا تعریف کند. آقا همان تایم را انتخاب و درخواست ثبت می‌کند.
          </p>
        </div>

        <div class="mt-12 grid gap-5 md:grid-cols-3">
          <article v-for="card in bookingCards" :key="card.title" class="rounded-[2.2rem] border border-gold/15 bg-gradient-to-b from-white/[.07] to-white/[.025] p-7 shadow-aura backdrop-blur-2xl">
            <div class="mb-7 h-44 rounded-[1.7rem] border border-gold/15 bg-[radial-gradient(circle_at_50%_25%,rgba(255,240,189,.25),transparent_38%),linear-gradient(180deg,rgba(214,173,82,.20),rgba(0,0,0,.80))]"></div>
            <h3 class="text-3xl font-black text-white">{{ card.title }}</h3>
            <p class="mt-2 text-xl font-black text-champagne">{{ card.price }}</p>
            <p class="mt-4 leading-8 text-muted">{{ card.desc }}</p>
          </article>
        </div>
      </div>
    </section>

    <section id="trust" class="relative z-10 px-4 py-20 sm:px-6 md:px-8">
      <div class="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[.9fr_1.1fr]">
        <div class="rounded-[2.4rem] border border-gold/15 bg-white/[.045] p-8 shadow-aura backdrop-blur-2xl">
          <div class="inline-flex rounded-full border border-gold/25 bg-gold/10 px-4 py-2 text-xs font-black text-champagne">پرداخت و بررسی</div>
          <h2 class="mt-5 text-4xl font-black leading-tight">
            پول مستقیم آزاد نمی‌شود؛ درخواست باید تایید شود.
          </h2>
          <p class="mt-5 leading-9 text-muted">
            برای رزروهای دیت، چت و ویدیوکال، وضعیت پرداخت و درخواست در پنل آقا، خانم و ادمین قابل پیگیری است. پس از تایید، ارتباط خصوصی باز می‌شود.
          </p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div v-for="item in adminFacts" :key="item" class="rounded-[2rem] border border-gold/15 bg-white/[.04] p-6">
            <p class="text-xl font-black text-white">{{ item }}</p>
            <p class="mt-3 text-sm leading-7 text-muted">در پنل ادمین با وضعیت و عملیات مرتبط نمایش داده می‌شود.</p>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
@keyframes flowLine {
  0% { transform: translateX(110%); opacity: 0; }
  20% { opacity: 1; }
  55% { transform: translateX(0%); opacity: 1; }
  100% { transform: translateX(-220%); opacity: 0; }
}
</style>
