<script setup lang="ts">
import KycProfileCard from '../../components/lux/KycProfileCard.vue'
import { onMounted, reactive } from 'vue'
import AppShell from '../../components/layout/AppShell.vue'
import CoverInput from '../../components/lux/CoverInput.vue'
import UploadCard from '../../components/lux/UploadCard.vue'
import ProfileHeroUltra from '../../components/lux/ProfileHeroUltra.vue'
import { useWomanStore } from '../../stores/woman'

const woman = useWomanStore()
const pricing = reactive({ public_price: 1200, monthly_gallery_price: 249, minimum_offer: 800, cover_url: '' })

onMounted(async () => {
  await woman.studio()
  if (woman.profile) {
    pricing.public_price = woman.profile.public_price || 1200
    pricing.monthly_gallery_price = woman.profile.monthly_gallery_price || 249
    pricing.minimum_offer = woman.profile.minimum_offer || 800
    pricing.cover_url = woman.profile.cover_url || ''
  }
})
</script>

<template>
  <AppShell>
    <section class="px-4 py-7 md:px-6 md:py-10 lg:px-10">
      <ProfileHeroUltra :profile="woman.profile" role="woman" />

      <div class="mt-10">
        <div class="badge">استودیو خانم‌ها</div>
        <h1 class="mt-5 text-4xl md:text-6xl font-black">قیمت‌ها و هویت عمومی.</h1>
      </div>

      <div class="mt-8 grid gap-5 lg:grid-cols-4">
        <CoverInput v-model="pricing.public_price" type="number" label="قیمت دسترسی خصوصی" />
        <CoverInput v-model="pricing.monthly_gallery_price" type="number" label="قیمت گالری ماهانه" />
        <CoverInput v-model="pricing.minimum_offer" type="number" label="حداقل پیشنهاد" />
        <UploadCard v-model="pricing.cover_url" label="آپلود کاور پروفایل" subtitle="در بخش کشف به آقایان نمایش داده می‌شود." />
      </div>

      <button class="lux-btn mt-6" @click="woman.savePricing(pricing)">ذخیره قیمت‌گذاری استودیو</button>

      <div class="mt-10 grid gap-5 md:grid-cols-2">
        <RouterLink to="/woman/gallery" class="lux-panel p-8"><div class="badge">گالری</div><h3 class="mt-4 text-3xl font-black">فروشگاه گالری پولی</h3></RouterLink>
        <RouterLink to="/woman/calendar" class="lux-panel p-8"><div class="badge">تقویم</div><h3 class="mt-4 text-3xl font-black">نقشه تایم‌های آزاد</h3></RouterLink>
      </div>
          <KycProfileCard />
    </section>
  </AppShell>
</template>
