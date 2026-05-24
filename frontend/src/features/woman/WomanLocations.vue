<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import AppShell from '../../components/layout/AppShell.vue'
import UploadCard from '../../components/lux/UploadCard.vue'
import LuxCalendar from '../../components/lux/LuxCalendar.vue'
import { useWomanStore } from '../../stores/woman'

const woman = useWomanStore()
const form = reactive({ title: '', address_hint: '', date: '', time: '21:00', cover_url: '', price_modifier: 0 })

onMounted(() => woman.studio())
function selectDate(d: string) { form.date = d }

async function submit() {
  await woman.addLocation(form)
  form.title = ''
  form.address_hint = ''
  form.date = ''
  form.time = '21:00'
  form.cover_url = ''
  form.price_modifier = 0
}
</script>

<template>
  <AppShell>
    <section class="px-6 py-10 lg:px-10">
      <div class="badge">تقویم موقعیت‌ها</div>
      <h1 class="mt-5 text-7xl font-black">لوکیشن‌های قابل انتخاب را بر اساس تاریخ و زمان تنظیم کن.</h1>

      <div class="mt-10 grid gap-8 xl:grid-cols-[1.15fr_.85fr]">
        <LuxCalendar @select="selectDate" />

        <div class="lux-panel p-8">
          <div class="badge">ساخت موقعیت</div>
          <UploadCard
            v-model="form.cover_url"
            class="mt-5"
            label="موقعیت cover"
            subtitle="این همان چیزی است که آقایان در پیش‌نمایش رزرو می‌بینند."
            image="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1000&auto=format&fit=crop"
          />
          <input v-model="form.title" class="lux-input mt-5" placeholder="عنوان موقعیت" />
          <input v-model="form.address_hint" class="lux-input mt-4" placeholder="راهنمای آدرس / محدوده" />
          <div class="mt-4 grid gap-4 md:grid-cols-2">
            <input v-model="form.date" type="date" class="lux-input" />
            <input v-model="form.time" type="time" class="lux-input" />
          </div>
          <input v-model="form.price_modifier" type="number" class="lux-input mt-4" placeholder="تغییر قیمت" />
          <button class="lux-btn mt-5 w-full" @click="submit">افزودن موقعیت</button>
        </div>
      </div>

      <div class="mt-8 grid gap-4 md:grid-cols-3">
        <div v-for="l in woman.locations" :key="l.id" class="relative overflow-hidden rounded-[2rem] border border-white/10">
          <img :src="l.cover_url" class="h-96 w-full object-cover opacity-80" />
          <div class="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
          <div class="absolute bottom-5 left-5 right-5">
            <div class="badge">{{ l.دیت }} · {{ l.time }}</div>
            <h3 class="mt-3 text-3xl font-black">{{ l.title }}</h3>
            <p class="muted mt-1">{{ l.address_hint }} · +{{ l.price_modifier }}</p>
          </div>
        </div>
      </div>
    </section>
  </AppShell>
</template>
