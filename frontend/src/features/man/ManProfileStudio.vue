<script setup lang="ts">
import KycProfileCard from '../../components/lux/KycProfileCard.vue'
import { onMounted, reactive, ref } from 'vue'
import AppShell from '../../components/layout/AppShell.vue'
import CoverInput from '../../components/lux/CoverInput.vue'
import UploadCard from '../../components/lux/UploadCard.vue'
import MediaUploadCard from '../../components/lux/MediaUploadCard.vue'
import InterestDeck from '../../components/lux/InterestDeck.vue'
import { useManStore } from '../../stores/man'

const man = useManStore()

const form = reactive({
  display_name: '',
  bio: '',
  main_photo_url: '',
  voice_intro_url: '',
  video_intro_url: '',
  date_note: ''
})

const generalInterests = ref<string[]>([])
const galleryUpload = ref('')

onMounted(async () => {
  await man.loadProfile()
  Object.assign(form, man.profile || {})
  generalInterests.value = man.interests.filter((x:any) => x.scope === 'general').map((x:any) => x.key)
})

async function save() {
  await man.saveProfile(form)
  await man.saveInterests(generalInterests.value.map(key => ({ key, scope: 'general' })))
}

async function addGallery() {
  if (!galleryUpload.value) return
  await man.addGallery({ url: galleryUpload.value, type: 'photo' })
  galleryUpload.value = ''
}
</script>

<template>
  <AppShell>
    <section class="px-6 py-10 lg:px-10">
      <div class="flex items-end justify-between">
        <div>
          <div class="badge">استودیو اعتبار آقایان</div>
          <h1 class="mt-5 text-7xl font-black">پروفایلی را بساز که خانم‌ها می‌بینند.</h1>
          <p class="muted mt-4 max-w-2xl text-lg">عکس‌ها از کارت‌های لوکس آپلود می‌شوند؛ لینک خام عکس لازم نیست.</p>
        </div>
        <button class="lux-btn" @click="save">ذخیره پروفایل</button>
      </div>

      <div class="mt-10 grid gap-5 lg:grid-cols-3">
        <CoverInput
          v-model="form.display_name"
          label="نام نمایشی"
        />

        <UploadCard
          v-model="form.main_photo_url"
          label="آپلود عکس اصلی"
          subtitle="این عکس اصلی در پیش‌نمایش درخواست برای خانم‌ها نمایش داده می‌شود."
        />

        <CoverInput
          v-model="form.date_note"
          label="یادداشت دیت"
        />

        <MediaUploadCard
          v-model="form.voice_intro_url"
          type="audio"
          label="آپلود معرفی صوتی"
          subtitle="خانم‌ها قبل از پذیرش می‌توانند گوش کنند."
        />

        <MediaUploadCard
          v-model="form.video_intro_url"
          type="video"
          label="آپلود معرفی ویدیویی"
          subtitle="پیش‌نمایش معرفی لوکس."
        />

        <UploadCard
          v-model="galleryUpload"
          label="آپلود عکس گالری"
          subtitle="افزودن عکس به گالری پیش‌نمایش."
        />
      </div>

      <button class="lux-btn mt-5" @click="addGallery">افزودن عکس آپلودشده به گالری</button>

      <div class="lux-panel mt-8 p-8">
        <div class="badge">علایق عمومی</div>
        <h2 class="mt-4 text-5xl font-black">سبک زندگی</h2>
        <InterestDeck v-model="generalInterests" class="mt-6" />
      </div>

      <div class="mt-8 grid gap-4 md:grid-cols-3">
        <div v-for="g in man.gallery" :key="g.id" class="relative overflow-hidden rounded-[2rem] border border-white/10">
          <img v-if="g.url" :src="g.url" class="h-80 w-full object-cover" /><div v-else class="skeleton-gold h-80 w-full"></div>
          <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
          <button class="absolute bottom-4 left-4 lux-btn-dark" @click="man.setMainPhoto(g.id)">
            {{ g.is_main ? 'عکس اصلی' : 'انتخاب به عنوان اصلی' }}
          </button>
        </div>
      </div>
          <KycProfileCard />
    </section>
  </AppShell>
</template>
