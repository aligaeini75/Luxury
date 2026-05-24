<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppShell from '../../components/layout/AppShell.vue'
import BookingFlow from '../../components/lux/BookingFlow.vue'
import ReputationMiniCard from '../../components/lux/ReputationMiniCard.vue'
import { useManStore } from '../../stores/man'
import { api } from '../../lib/api'

const man = useManStore()
const selectedWoman = ref<any>(null)
const loadingProfile = ref(false)
const notice = ref('')
const galleryBusy = ref('')

onMounted(() => man.discoverWomen())

async function openWoman(w: any) {
  loadingProfile.value = true
  notice.value = ''
  try {
    const data = await man.loadWoman(w.user_id || w.id)
    selectedWoman.value = {
      ...data.profile,
      gallery: data.gallery || [],
      services: data.services || [],
      locations: data.locations || [],
      availability: data.availability || []
    }
    setTimeout(() => document.getElementById('booking-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  } finally {
    loadingProfile.value = false
  }
}


async function buyGallery(g: any) {
  galleryBusy.value = g.id
  try {
    await man.subscribeGallery(g.id)
    notice.value = 'گالری ماهانه باز شد. از این به بعد وقتی عکس جدید اضافه شود به تو اطلاع داده می‌شود.'
    if (selectedWoman.value) {
      const data = await man.loadWoman(selectedWoman.value.user_id || selectedWoman.value.id)
      selectedWoman.value = { ...data.profile, gallery: data.gallery || [], services: data.services || [], locations: data.locations || [], availability: data.availability || [] }
    }
  } catch (e: any) {
    notice.value = e?.response?.data?.error || 'Could not subscribe. Please check wallet balance.'
  } finally {
    galleryBusy.value = ''
  }
}

function openSubscriptions() {
  window.location.hash = '#/man/subscriptions'
}

async function request(payload: any) {
  await man.createRequest(payload)
  notice.value = 'درخواست با موفقیت ثبت شد. تایم انتخاب‌شده تا زمان بررسی خانم رزرو می‌ماند و می‌توانی وضعیت را در درخواست‌های من ببینی.'
  selectedWoman.value = null
  await man.discoverWomen()
  await man.myRequests()
  window.setTimeout(() => { window.location.hash = '#/man/requests' }, 700)
}
</script>

<template>
  <AppShell>
    <section class="px-6 py-10 lg:px-10">
      <div class="badge">کشف</div>
      <h1 class="mt-5 text-7xl font-black">یک خانم انتخاب کن و تایم واقعی رزرو کن.</h1>
      <p class="muted mt-4 max-w-2xl text-lg">روی پروفایل کلیک کن، تایم‌های دیت / چت / ویدیوکال را ببین و درخواست محافظت‌شده بفرست.</p>

      <div v-if="notice" class="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-emerald-100">{{ notice }}</div>

      <div class="mt-10 space-y-12">
        <div>
          <div class="mb-5 flex items-end justify-between">
            <div><div class="badge">قابل استفاده خانم‌ها</div><h2 class="mt-3 text-4xl font-black">پروفایل‌ها</h2></div>
          </div>
          <div class="flex gap-5 overflow-x-auto pb-4">
            <button v-for="w in man.women" :key="w.id" class="group relative min-w-[360px] overflow-hidden rounded-[2.5rem] border border-white/10 text-left" @click="openWoman(w)">
              <img :src="w.cover_url" class="h-[520px] w-full object-cover opacity-80 transition duration-500 group-hover:scale-105" />
              <div class="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent"></div>
              <div class="absolute bottom-6 left-6 right-6">
                <div class="badge">شروع از {{ w.public_price }}</div>
                <h3 class="mt-3 text-4xl font-black">{{ w.display_name }}</h3>
                <p class="muted">{{ w.city }} · تایید شده</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div v-if="loadingProfile" class="mt-12 lux-panel p-8">در حال بارگذاری تایم‌های پروفایل...</div>

      <div v-if="selectedWoman" id="booking-panel" class="mt-12 grid gap-8 xl:grid-cols-[.9fr_1.1fr]">
        <div class="lux-panel p-7">
          <div class="badge">گالری ماهانه</div>
          <h2 class="mt-4 text-5xl font-black">اشتراک بخر و عکس‌های او را باز کن.</h2>
          <p class="muted mt-3">از این پروفایل دسترسی ماهانه بخر. عکس‌های جدید بعدی به‌صورت خودکار به تو اطلاع داده می‌شوند.</p>
          <div class="mt-6 space-y-5">
            <article v-for="g in selectedWoman.gallery" :key="g.id" class="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[.045]">
              <div class="relative h-72">
                <img :src="g.cover_url || g.url" class="h-full w-full object-cover opacity-80" :class="!g.is_subscribed ? 'blur-md' : ''" />
                <div class="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                <div class="absolute bottom-5 left-5 right-5">
                  <div class="badge">{{ g.price || 0 }} تومان / ماهانه · {{ g.media_count || 0 }} عکس</div>
                  <h3 class="mt-3 text-3xl font-black">{{ g.title || 'گالری ماهانه' }}</h3>
                </div>
              </div>
              <div class="p-5">
                <button v-if="!g.is_subscribed" class="lux-btn w-full" :disabled="galleryBusy === g.id" @click="buyGallery(g)">
                  {{ galleryBusy === g.id ? 'در حال پردازش...' : 'خرید گالری ماهانه' }}
                </button>
                <div v-else>
                  <div class="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/[.08] p-4 text-emerald-100">باز شده تا {{ new Date(g.subscription_expires_at).toLocaleDateString() }}</div>
                  <div class="grid gap-3 sm:grid-cols-2">
                    <div v-for="m in g.media" :key="m.id" class="watermark-tile rounded-[1.2rem]">
                      <img :src="m.url" class="h-56 w-full rounded-[1.2rem] object-cover" />
                    </div>
                  </div>
                  <button class="lux-btn-dark mt-4 w-full" @click="openSubscriptions">باز کردن گالری‌های من</button>
                </div>
              </div>
            </article>
            <p v-if="!selectedWoman.gallery?.length" class="muted">این خانم هنوز گالری ماهانه نساخته است.</p>
          </div>
        </div>
          <ReputationMiniCard class="my-5" :completed="selectedWoman?.booking_count || 0" />
        <BookingFlow :woman="selectedWoman" @submit="request" />
      </div>
    </section>
  </AppShell>
</template>
