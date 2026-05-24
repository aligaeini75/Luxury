<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import AppShell from '../../components/layout/AppShell.vue'
import UploadCard from '../../components/lux/UploadCard.vue'
import CoverInput from '../../components/lux/CoverInput.vue'
import { useWomanStore } from '../../stores/woman'

const woman = useWomanStore()
const form = reactive({ title: '', price: 0, cover_url: '', description: '' })

onMounted(() => woman.studio())

async function submit() {
  await woman.addService(form)
  form.title = ''
  form.price = 0
  form.cover_url = ''
  form.description = ''
}
</script>

<template>
  <AppShell>
    <section class="px-6 py-10 lg:px-10">
      <div class="badge">سرویس‌های اضافه</div>
      <h1 class="mt-5 text-7xl font-black">افزونه‌های پریمیوم با کاور بساز.</h1>

      <div class="mt-10 grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
        <div class="space-y-5">
          <UploadCard
            v-model="form.cover_url"
            label="Service cover"
            subtitle="یک کاور زیبا برای این افزونه آپلود کن."
            image="https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1000&auto=format&fit=crop"
          />
          <CoverInput v-model="form.title" label="Service title" image="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1000&auto=format&fit=crop" />
          <CoverInput v-model="form.price" type="number" label="Service price" image="https://images.unsplash.com/photo-1520986606214-8b456906c813?q=80&w=1000&auto=format&fit=crop" />
          <textarea v-model="form.description" class="lux-input min-h-32" placeholder="توضیحات"></textarea>
          <button class="lux-btn w-full" @click="submit">افزودن سرویس</button>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <div v-for="s in woman.services" :key="s.id" class="relative overflow-hidden rounded-[2rem] border border-white/10">
            <img :src="s.cover_url" class="h-96 w-full object-cover opacity-80" />
            <div class="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
            <div class="absolute bottom-5 left-5 right-5">
              <div class="badge">{{ s.price }}</div>
              <h3 class="mt-3 text-3xl font-black">{{ s.title }}</h3>
              <p class="muted mt-1">{{ s.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </AppShell>
</template>
