<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { CheckCircle2, Clock3, ShieldCheck, XCircle } from 'lucide-vue-next'
import UploadCard from './UploadCard.vue'
import MediaUploadCard from './MediaUploadCard.vue'
import { api } from '../../lib/api'

const loading = ref(false)
const latest = ref<any>(null)
const challengeText = ref('')
const form = reactive({
  mobile: '',
  email: '',
  national_card_url: '',
  selfie_video_url: '',
  challenge_text: '',
})

const isApproved = computed(() => latest.value?.status === 'approved')
const isRejected = computed(() => latest.value?.status === 'rejected')
const hasPending = computed(() => latest.value?.status === 'pending')

async function load() {
  const { data } = await api.get('/auth/kyc').catch(() => ({ data: null }))
  latest.value = data?.kyc || null
  challengeText.value = data?.challengeText || latest.value?.challenge_text || ''
  if (data?.user) {
    form.email = data.user.email || ''
    form.mobile = data.user.mobile || ''
  }
  if (latest.value) {
    form.national_card_url = latest.value.national_card_url || ''
    form.selfie_video_url = latest.value.selfie_video_url || latest.value.selfie_url || ''
  }
}

async function submit() {
  loading.value = true
  try {
    form.challenge_text = challengeText.value
    const { data } = await api.post('/auth/kyc', form)
    latest.value = data.kyc
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <section class="mt-8 overflow-hidden rounded-[2.5rem] border border-gold/15 bg-white/[.045] shadow-aura backdrop-blur-2xl">
    <div class="relative p-6 md:p-8">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(246,211,101,.13),transparent_32%),radial-gradient(circle_at_90%_20%,rgba(212,175,55,.09),transparent_28%)]"></div>
      <div class="relative z-10">
        <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div class="badge">تایید هویت حساب</div>
            <h2 class="mt-4 text-3xl font-black md:text-5xl">
              {{ isApproved ? 'حساب شما تایید شده است' : 'احراز هویت حساب را تکمیل کن' }}
            </h2>
            <p class="muted mt-3 max-w-3xl leading-8">
              شماره موبایل، ایمیل، عکس کارت ملی و ویدیو سلفی همین‌جا بارگذاری می‌شود؛ پس از بررسی ادمین وضعیت تایید حساب نمایش داده می‌شود.
            </p>
          </div>

          <div
            class="rounded-[1.6rem] border p-5"
            :class="isApproved ? 'border-emerald-300/25 bg-emerald-400/10' : isRejected ? 'border-red-300/25 bg-red-500/10' : 'border-gold/20 bg-gold/10'"
          >
            <div class="flex items-center gap-3">
              <CheckCircle2 v-if="isApproved" class="h-9 w-9 text-emerald-200" />
              <XCircle v-else-if="isRejected" class="h-9 w-9 text-red-200" />
              <Clock3 v-else class="h-9 w-9 text-champagne" />
              <div>
                <p class="text-xs font-black text-muted">وضعیت تایید</p>
                <p class="mt-1 text-xl font-black" :class="isApproved ? 'text-emerald-100' : isRejected ? 'text-red-100' : 'text-champagne'">
                  {{ isApproved ? 'تایید شده' : isRejected ? 'رد شده' : hasPending ? 'در انتظار ادمین' : 'ارسال نشده' }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <p v-if="latest?.admin_note" class="mt-5 rounded-2xl border border-gold/15 bg-black/35 p-4 text-sm leading-7 text-muted">
          یادداشت ادمین: {{ latest.admin_note }}
        </p>

        <div class="mt-7 grid gap-4 md:grid-cols-3">
          <div class="rounded-[1.7rem] border border-gold/15 bg-black/35 p-5">
            <ShieldCheck class="h-7 w-7 text-gold" />
            <p class="mt-3 text-lg font-black text-white">اطلاعات تماس</p>
            <p class="muted mt-2 text-sm leading-7">موبایل و ایمیل برای بررسی و بازیابی حساب ثبت می‌شود.</p>
          </div>
          <div class="rounded-[1.7rem] border border-gold/15 bg-black/35 p-5">
            <ShieldCheck class="h-7 w-7 text-gold" />
            <p class="mt-3 text-lg font-black text-white">عکس کارت ملی</p>
            <p class="muted mt-2 text-sm leading-7">تا قبل از آپلود، فقط اسکلتون امن نمایش داده می‌شود.</p>
          </div>
          <div class="rounded-[1.7rem] border border-gold/15 bg-black/35 p-5">
            <ShieldCheck class="h-7 w-7 text-gold" />
            <p class="mt-3 text-lg font-black text-white">ویدیو سلفی</p>
            <p class="muted mt-2 text-sm leading-7">برای تایید زنده بودن و مالکیت حساب استفاده می‌شود.</p>
          </div>
        </div>

        <div class="mt-7 grid gap-5 lg:grid-cols-2">
          <label class="block rounded-[1.7rem] border border-gold/15 bg-black/35 p-5">
            <span class="text-xs font-black text-muted">شماره موبایل</span>
            <input v-model="form.mobile" class="lux-input mt-2" placeholder="مثلاً 0912..." />
          </label>
          <label class="block rounded-[1.7rem] border border-gold/15 bg-black/35 p-5">
            <span class="text-xs font-black text-muted">ایمیل</span>
            <input v-model="form.email" class="lux-input mt-2" placeholder="ایمیل حساب" />
          </label>

          <UploadCard
            v-model="form.national_card_url"
            label="آپلود عکس کارت ملی"
            subtitle="عکس واضح کارت ملی یا مدرک هویتی"
          />

          <div class="rounded-[1.7rem] border border-gold/20 bg-gold/10 p-5 lg:col-span-2">
            <p class="text-xs font-black text-muted">متن الزامی داخل ویدیو سلفی</p>
            <p class="mt-2 rounded-2xl bg-black/45 p-4 text-lg font-black leading-8 text-champagne">{{ challengeText || 'در حال ساخت متن تایید...' }}</p>
            <p class="muted mt-3 text-sm leading-7">در ویدیو سلفی این جمله را واضح بگو تا ادمین بتواند هویت را تایید کند.</p>
          </div>

          <MediaUploadCard
            v-model="form.selfie_video_url"
            type="video"
            label="آپلود ویدیو سلفی"
            subtitle="ویدیو کوتاه برای تایید هویت"
          />
        </div>

        <button v-if="!isApproved" class="lux-btn mt-6 w-full md:w-auto" :disabled="loading" @click="submit">
          {{ hasPending ? 'ارسال نسخه جدید برای بررسی' : 'ارسال برای بررسی ادمین' }}
        </button>
      </div>
    </div>
  </section>
</template>
