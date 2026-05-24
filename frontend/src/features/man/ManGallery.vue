<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppShell from '../../components/layout/AppShell.vue'
import UploadCard from '../../components/lux/UploadCard.vue'
import { useManStore } from '../../stores/man'

const man = useManStore()
const uploadUrl = ref('')

onMounted(() => man.loadProfile())

async function addUploaded() {
  if (!uploadUrl.value) return
  await man.addGallery({ url: uploadUrl.value, type: 'photo' })
  uploadUrl.value = ''
}
</script>

<template>
  <AppShell>
    <section class="px-6 py-10 lg:px-10">
      <div class="badge">آقایان گالری</div>
      <h1 class="mt-5 text-7xl font-black">عکس‌هایی که خانم‌ها قبل از پذیرش می‌بینند.</h1>
      <p class="muted mt-4 max-w-2xl text-lg">عکس‌های گالری را آپلود کن و تصویر اصلی پیش‌نمایش را انتخاب کن.</p>

      <div class="mt-10 grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <UploadCard
            v-model="uploadUrl"
            label="آپلود gallery photo"
            subtitle="یک تصویر از دستگاه خودت انتخاب کن."
            image="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1000&auto=format&fit=crop"
          />
          <button class="lux-btn mt-5 w-full" @click="addUploaded">افزودن به گالری</button>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <div v-for="g in man.gallery" :key="g.id" class="relative overflow-hidden rounded-[2rem] border border-white/10">
            <img :src="g.url" class="h-96 w-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
            <button class="lux-btn-dark absolute bottom-4 left-4" @click="man.setMainPhoto(g.id)">
              {{ g.is_main ? 'Main Photo' : 'Set Main' }}
            </button>
          </div>
        </div>
      </div>
    </section>
  </AppShell>
</template>
