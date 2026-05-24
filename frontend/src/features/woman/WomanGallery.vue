<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import AppShell from '../../components/layout/AppShell.vue'
import UploadCard from '../../components/lux/UploadCard.vue'
import CoverInput from '../../components/lux/CoverInput.vue'
import { useWomanStore } from '../../stores/woman'

const woman = useWomanStore()
const album = reactive({ title: 'گالری خصوصی ماهانه', price: 49, cover_url: '' })
const mediaUrl = ref('')
const selectedGalleryId = ref('')

const selectedGallery = computed(() => woman.gallery.find((g: any) => g.id === selectedGalleryId.value) || woman.gallery[0])

onMounted(async () => {
  await woman.studio()
  if (woman.gallery[0]) selectedGalleryId.value = woman.gallery[0].id
})

async function createGallery() {
  if (!album.cover_url) return
  const created = await woman.addGalleryAlbum({ ...album, price: Number(album.price || 0) })
  album.title = 'گالری خصوصی ماهانه'
  album.price = 49
  album.cover_url = ''
  await woman.studio()
  selectedGalleryId.value = created?.gallery_id || woman.gallery[0]?.id || ''
}

async function addPhoto() {
  const gid = selectedGallery.value?.id
  if (!gid || !mediaUrl.value) return
  await woman.addGalleryMedia(gid, { url: mediaUrl.value, type: 'photo' })
  mediaUrl.value = ''
}
</script>

<template>
  <AppShell>
    <section class="px-6 py-10 lg:px-10">
      <div class="badge">گالری ماهانه</div>
      <h1 class="mt-5 text-7xl font-black">مدیریت گالری اشتراکی.</h1>
      <p class="muted mt-4 max-w-2xl text-lg">یک گالری ماهانه بساز و به مرور عکس‌های جدید به آن اضافه کن.</p>

      <div class="mt-10 grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <div class="space-y-5">
          <div class="lux-panel p-6">
            <div class="badge">ساخت گالری ماهانه</div>
            <UploadCard v-model="album.cover_url" label="آپلود کاور گالری" subtitle="کاور قبل از خرید اشتراک ماهانه نمایش داده می‌شود." />
            <CoverInput v-model="album.title" label="عنوان گالری" />
            <CoverInput v-model="album.price" type="number" label="قیمت ماهانه" />
            <button class="lux-btn mt-4 w-full" @click="createGallery">ساخت گالری ماهانه</button>
          </div>

          <div class="lux-panel p-6">
            <div class="badge">افزودن عکس به گالری انتخاب‌شده</div>
            <select v-model="selectedGalleryId" class="lux-input mt-5">
              <option v-for="g in woman.gallery" :key="g.id" :value="g.id">{{ g.title }} · {{ g.price }} تومان / ماهانه</option>
            </select>
            <UploadCard v-model="mediaUrl" class="mt-4" label="آپلود عکس جدید" subtitle="این عکس به گالری ماهانه انتخاب‌شده اضافه می‌شود." />
            <button class="lux-btn mt-4 w-full" @click="addPhoto">افزودن عکس</button>
          </div>
        </div>

        <div class="space-y-8">
          <div class="grid gap-4 md:grid-cols-2">
            <button v-for="g in woman.gallery" :key="g.id" class="relative overflow-hidden rounded-[2rem] border text-right" :class="selectedGalleryId === g.id ? 'border-gold' : 'border-white/10'" @click="selectedGalleryId = g.id">
              <img v-if="g.cover_url || g.url" :src="g.cover_url || g.url" class="h-80 w-full object-cover opacity-80" /><div v-else class="skeleton-gold h-80 w-full"></div>
              <div class="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
              <div class="absolute bottom-5 left-5 right-5">
                <div class="badge">{{ g.price || 0 }} تومان / ماهانه</div>
                <h3 class="mt-3 text-3xl font-black">{{ g.title || 'گالری ماهانه' }}</h3>
                <p class="muted mt-1">{{ g.media_count || 0 }} عکس</p>
              </div>
            </button>
          </div>

          <div v-if="selectedGallery" class="lux-panel p-6">
            <div class="badge">{{ selectedGallery.title }}</div>
            <h2 class="mt-4 text-4xl font-black">عکس‌های این گالری</h2>
            <div class="mt-6 grid gap-4 md:grid-cols-3">
              <div v-for="m in (selectedGallery.media || [])" :key="m.id" class="watermark-tile rounded-[1.6rem]"><img v-if="m.url" :src="m.url" class="h-72 w-full rounded-[1.6rem] object-cover" /><div v-else class="skeleton-gold h-72 w-full rounded-[1.6rem]"></div></div>
              <div v-if="!(selectedGallery.media || []).length" class="rounded-[1.6rem] border border-white/10 bg-white/[.05] p-6 text-muted">هنوز عکسی وجود ندارد. اولین عکس را از پنل کناری اضافه کن.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </AppShell>
</template>
