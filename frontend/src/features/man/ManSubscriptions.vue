<script setup lang="ts">
import { computed, onMounted } from 'vue'
import AppShell from '../../components/layout/AppShell.vue'
import { useManStore } from '../../stores/man'

const man = useManStore()

onMounted(async () => {
  await Promise.all([man.loadSubscriptions(), man.loadAlerts()])
})

const unread = computed(() => man.alerts.filter((a: any) => !a.is_read))
</script>

<template>
  <AppShell>
    <section class="px-6 py-10 lg:px-10">
      <div class="badge">گالری‌های ماهانه</div>
      <h1 class="mt-5 text-7xl font-black">گالری‌های بازشده تو.</h1>
      <p class="muted mt-4 max-w-2xl text-lg">گالری‌های خریداری‌شده تا پایان اعتبار باز می‌مانند. وقتی خانم عکس جدید اضافه کند، اینجا می‌بینی.</p>

      <div v-if="unread.length" class="mt-8 space-y-3">
        <article v-for="a in unread" :key="a.id" class="rounded-[1.5rem] border border-gold/30 bg-gold/10 p-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <b>{{ a.title }}</b>
              <p class="muted mt-1">{{ a.body }}</p>
            </div>
            <button class="lux-btn-dark" @click="man.markAlertRead(a.id)">خوانده شد</button>
          </div>
        </article>
      </div>

      <div class="mt-10 grid gap-7">
        <article v-for="s in man.subscriptions" :key="s.id" class="lux-panel overflow-hidden">
          <div class="grid gap-0 lg:grid-cols-[.65fr_1.35fr]">
            <div class="relative min-h-[360px]">
              <img :src="s.cover_url || s.woman_cover_url" class="absolute inset-0 h-full w-full object-cover opacity-80" />
              <div class="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
              <div class="absolute bottom-6 left-6 right-6">
                <div class="badge">فعال تا {{ new Date(s.expires_at).toLocaleDateString() }}</div>
                <h2 class="mt-3 text-4xl font-black">{{ s.title }}</h2>
                <p class="muted">{{ s.display_name }}</p>
              </div>
            </div>
            <div class="p-7">
              <div class="badge">رسانه‌های بازشده</div>
              <div class="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div v-for="m in s.media" :key="m.id" class="watermark-tile rounded-[1.6rem]">
                  <img :src="m.url" class="h-72 w-full rounded-[1.6rem] object-cover" />
                </div>
                <div v-if="!s.media?.length" class="rounded-[1.6rem] border border-white/10 bg-white/[.05] p-6 text-muted">هنوز عکسی نیست. وقتی عکس جدید اضافه شود به تو اطلاع داده می‌شود.</div>
              </div>
            </div>
          </div>
        </article>
        <div v-if="!man.subscriptions.length" class="lux-panel p-8 text-muted">هنوز اشتراک فعال گالری نداری. وارد بخش کشف شو، یک پروفایل انتخاب کن و اشتراک گالری بخر.</div>
      </div>
    </section>
  </AppShell>
</template>
