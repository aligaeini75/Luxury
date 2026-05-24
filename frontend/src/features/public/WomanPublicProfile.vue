
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../../lib/api'
import BookingFlow from '../../components/lux/BookingFlow.vue'
import ReputationMiniCard from '../../components/lux/ReputationMiniCard.vue'
import TrustScoreCard from '../../components/lux/TrustScoreCard.vue'

const route = useRoute()
const profile = ref<any>(null)
const gallery = ref<any[]>([])
const services = ref<any[]>([])
const locations = ref<any[]>([])
const availability = ref<any[]>([])
const showBooking = ref(false)
const activeTab = ref<'book' | 'gallery'>('book')
function loginRequired() { window.alert('برای ثبت درخواست باید وارد حساب کاربری شوید.') }
onMounted(async () => {
  const { data } = await api.get(`/public/women/${route.params.id}`)
  profile.value = data.profile
  gallery.value = data.gallery || []
  services.value = data.services || []
  locations.value = data.locations || []
  availability.value = data.availability || []
})
</script>

<template>
  <section class="motion-page min-h-screen px-6 py-10">
    <div class="mx-auto max-w-7xl">
      <nav class="flex items-center justify-between rounded-full border border-white/10 bg-black/40 px-5 py-3 backdrop-blur-2xl">
        <RouterLink to="/" class="text-2xl font-black tracking-[.22em] text-gold">لوکسورا</RouterLink>
        <RouterLink to="/login" class="lux-btn-dark">ورود</RouterLink>
      </nav>

      <div v-if="profile" class="mt-10 overflow-hidden rounded-[3rem] border border-white/10 bg-white/[.045] shadow-aura backdrop-blur-3xl">
        <div class="grid lg:grid-cols-[1.05fr_.95fr]">
          <div class="p-8 md:p-12">
            <div class="badge">پروفایل خصوصی تاییدشده</div>
            <h1 class="mt-6 text-6xl font-black leading-[.9] md:text-8xl">{{ profile.display_name }}</h1>
            <p class="muted mt-6 max-w-2xl text-lg leading-8">{{ profile.bio || 'پروفایل خصوصی با دسترسی مدیریت‌شده.' }}</p>
            <div class="mt-8 flex flex-wrap gap-3"><span class="status-gold">شروع از {{ profile.public_price }} تومان</span><span class="status-green">تاییدشده</span><span class="status-gold">{{ profile.city || 'شهر خصوصی' }}</span></div>
            <ReputationMiniCard class="mt-6 max-w-md" :completed="profile.booking_count || 0" />
            <div class="mt-8 flex flex-wrap gap-3"><button class="lux-btn" @click="showBooking = true; activeTab='book'">مشاهده تایم‌های آزاد</button><button class="lux-btn-dark" @click="activeTab='gallery'">گالری ماهانه</button></div>
          </div>
          <div class="relative min-h-[620px]"><img :src="profile.cover_url" class="absolute inset-0 h-full w-full object-cover opacity-85" /><div class="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent"></div></div>
        </div>
      </div>

      <div v-if="profile" class="mt-8 grid gap-6 lg:grid-cols-[.7fr_1.3fr]">
        <TrustScoreCard :score="94" />
        <div class="lux-panel p-8">
          <div class="badge">تجربه‌های قابل استفاده</div>
          <div class="mt-6 grid gap-4 md:grid-cols-3">
            <button v-for="type in ['date','chat','video_call']" :key="type" class="rounded-[2rem] border border-white/10 bg-white/[.055] p-5 text-right transition hover:border-gold/40" @click="showBooking=true; activeTab='book'">
              <b>{{ type === 'date' ? 'دیت حضوری' : type === 'chat' ? 'چت خصوصی' : 'ویدیوکال' }}</b>
              <p class="muted mt-1">{{ availability.filter(a => (a.booking_type || 'date') === type && !a.is_booked).length }} تایم آزاد</p>
            </button>
          </div>
        </div>
      </div>

      <div v-if="profile && activeTab === 'gallery'" class="mt-10">
        <div class="badge">گالری‌های ماهانه</div>
        <h2 class="mt-4 text-5xl font-black">پیش‌نمایش گالری پریمیوم.</h2>
        <div class="mt-6 grid gap-5 md:grid-cols-3">
          <div v-for="g in gallery" :key="g.id" class="relative overflow-hidden rounded-[2.5rem] border border-white/10">
            <img :src="g.cover_url || g.url" class="h-[460px] w-full object-cover opacity-80 blur-md" />
            <div class="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
            <div class="absolute bottom-6 left-6 right-6"><div class="badge">{{ g.price || 0 }} تومان / ماهانه</div><h3 class="mt-4 text-3xl font-black">{{ g.title || 'گالری خصوصی' }}</h3><p class="muted">{{ g.media_count || 0 }} عکس · برای باز کردن وارد شو</p></div>
          </div>
          <p v-if="!gallery.length" class="muted">این خانم هنوز گالری ماهانه نساخته است.</p>
        </div>
      </div>

      <div v-if="showBooking && profile && activeTab === 'book'" class="mt-10"><ReputationMiniCard class="my-5" :completed="profile?.booking_count || 0" />
        <BookingFlow :woman="{ ...profile, services, locations, availability }" @submit="loginRequired" /></div>
    </div>
  </section>
</template>
