<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { CalendarDays, CheckCircle2, Clock3, ImageIcon, MapPin, MessageCircle, ShieldCheck, Sparkles, Video } from 'lucide-vue-next'
import { faDate, faDateShort, faTimeRange, money } from '../../lib/format'

const props = defineProps<{ woman: any }>()
const emit = defineEmits(['submit'])

const step = ref(1)
const selectedSlotId = ref('')
const form = reactive({
  booking_type: 'date',
  date: '',
  time: '',
  duration_minutes: 60,
  offer_amount: 0,
  message: ''
})

const typeLabels: Record<string, string> = {
  date: 'دیت حضوری',
  chat: 'چت خصوصی',
  video_call: 'ویدیوکال'
}

const typeIcons: Record<string, any> = {
  date: MapPin,
  chat: MessageCircle,
  video_call: Video
}

const slots = computed(() => (props.woman?.availability || []).filter((s: any) => !s.is_booked))
const slotsByType = computed(() => slots.value.filter((s: any) => (s.booking_type || 'date') === form.booking_type))
const selectedSlot = computed(() => slots.value.find((s: any) => s.id === selectedSlotId.value))

function parseJson(v: any) {
  try {
    if (Array.isArray(v)) return v
    if (!v) return []
    return JSON.parse(v)
  } catch {
    return []
  }
}

function slotPrice(slot: any) {
  return Number(slot?.total_price || slot?.price_override || props.woman?.public_price || 0)
}

function slotPhotos(slot: any) {
  return parseJson(slot?.location_photos_json)
}

function slotServices(slot: any) {
  return parseJson(slot?.services_json)
}

function pickType(type: string) {
  form.booking_type = type
  selectedSlotId.value = ''
  form.date = ''
  form.time = ''
  form.offer_amount = 0
}

function pickSlot(slot: any) {
  selectedSlotId.value = slot.id
  form.booking_type = slot.booking_type || 'date'
  form.date = slot.date
  form.time = slot.start_time
  form.duration_minutes = slot.duration_minutes || 60
  form.offer_amount = slotPrice(slot)
}

function next() {
  if (step.value === 2 && !selectedSlotId.value) return
  if (step.value < 4) step.value++
}

function prev() {
  if (step.value > 1) step.value--
}

function submit() {
  emit('submit', {
    woman_id: props.woman?.user_id,
    availability_id: selectedSlotId.value,
    booking_type: form.booking_type,
    date: form.date,
    time: form.time,
    duration_minutes: form.duration_minutes,
    offer_amount: Number(form.offer_amount || 0),
    message: form.message
  })
}
</script>

<template>
  <div class="overflow-hidden rounded-[2.8rem] border border-gold/15 bg-[#070402] shadow-[0_35px_120px_rgba(214,173,82,.10)]">
    <div class="relative min-h-[300px] overflow-hidden border-b border-gold/10 md:min-h-[390px]">
      <img
        v-if="woman?.cover_url"
        :src="woman.cover_url"
        class="absolute inset-0 h-full w-full object-cover opacity-55"
      />
      <img
        v-else
        src="/upload-image-placeholder.svg"
        class="absolute inset-0 h-full w-full object-cover opacity-45"
      />
      <div class="absolute inset-0 bg-gradient-to-l from-black via-black/60 to-black/15"></div>
      <div class="absolute inset-x-0 bottom-0 p-5 md:p-9">
        <div class="badge">رزرو خصوصی</div>
        <h2 class="mt-4 max-w-4xl text-4xl font-black leading-tight md:text-7xl">
          {{ woman?.display_name || 'پروفایل خانم' }}
        </h2>
        <p class="mt-4 max-w-2xl text-sm leading-8 text-muted md:text-base">
          {{ woman?.bio || 'نوع ارتباط، تایم، سرویس و مبلغ نهایی را با یک فلو شفاف انتخاب کن.' }}
        </p>
      </div>

      <div class="absolute left-5 top-5 hidden rounded-[2rem] border border-gold/15 bg-black/55 p-4 backdrop-blur-xl md:block">
        <p class="text-xs text-muted">مرحله فعلی</p>
        <b class="mt-1 block text-3xl text-champagne">{{ step }}/4</b>
      </div>
    </div>

    <div class="grid gap-6 p-4 md:p-7 xl:grid-cols-1">
      <main class="min-w-0 w-full">
        <section v-if="step === 1" class="fade-up">
          <div class="badge">انتخاب نوع ارتباط</div>
          <h2 class="mt-4 text-3xl font-black md:text-5xl">اول مشخص کن چه نوع ارتباطی می‌خوای.</h2>

          <div class="mt-7 grid gap-4 md:grid-cols-3">
            <button
              v-for="type in ['date','chat','video_call']"
              :key="type"
              class="group relative overflow-hidden rounded-[2.2rem] border p-6 text-right transition hover:-translate-y-1"
              :class="form.booking_type === type ? 'border-gold bg-gold/15 shadow-aura' : 'border-white/10 bg-white/[.045]'"
              @click="pickType(type)"
            >
              <div class="absolute -left-12 -top-12 h-36 w-36 rounded-full bg-gold/10 blur-2xl transition group-hover:bg-gold/20"></div>
              <component :is="typeIcons[type]" class="relative h-10 w-10 text-gold" />
              <h3 class="relative mt-6 text-2xl font-black text-white">{{ typeLabels[type] }}</h3>
              <p class="relative mt-3 text-sm leading-7 text-muted">تایم‌های مخصوص {{ typeLabels[type] }} را ببین.</p>
            </button>
          </div>
        </section>

        <section v-if="step === 2" class="fade-up">
          <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div class="badge">تایم‌های {{ typeLabels[form.booking_type] }}</div>
              <h2 class="mt-4 text-3xl font-black md:text-5xl">یکی از کارت‌های تایم را انتخاب کن.</h2>
            </div>
            <p class="text-sm text-muted">{{ slotsByType.length }} تایم آزاد</p>
          </div>

          <div v-if="!slotsByType.length" class="mt-7 rounded-[2rem] border border-dashed border-gold/15 bg-white/[.04] p-10 text-center">
            <CalendarDays class="mx-auto h-10 w-10 text-gold/70" />
            <p class="mt-4 text-xl font-black text-white">برای این نوع، تایمی ثبت نشده</p>
          </div>

          <div class="mt-7 grid gap-5 md:grid-cols-2">
            <button
              v-for="slot in slotsByType"
              :key="slot.id"
              class="group overflow-hidden rounded-[2.2rem] border text-right transition hover:-translate-y-1"
              :class="selectedSlotId === slot.id ? 'border-gold bg-gold/10 shadow-aura' : 'border-white/10 bg-white/[.045]'"
              @click="pickSlot(slot)"
            >
              <div class="relative h-52 overflow-hidden">
                <img
                  v-if="slotPhotos(slot).length"
                  :src="slotPhotos(slot)[0]"
                  class="h-full w-full object-cover opacity-75 transition group-hover:scale-105"
                />
                <div v-else class="h-full w-full bg-[radial-gradient(circle_at_20%_10%,rgba(214,173,82,.22),transparent_35%),linear-gradient(135deg,rgba(255,240,189,.08),rgba(0,0,0,.65))]"></div>
                <div class="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                <div class="absolute bottom-4 right-4 left-4 flex items-end justify-between gap-3">
                  <div>
                    <span class="badge">{{ typeLabels[slot.booking_type || 'date'] }}</span>
                    <h3 class="mt-3 text-2xl font-black text-white">{{ faDateShort(slot.date) }}</h3>
                  </div>
                  <b class="text-3xl text-gold">{{ money(slotPrice(slot)) }}</b>
                </div>
              </div>

              <div class="p-5">
                <div class="grid gap-3 sm:grid-cols-2">
                  <div class="rounded-2xl bg-black/35 p-3">
                    <p class="text-xs text-muted">زمان</p>
                    <b class="mt-1 block text-white">{{ faTimeRange(slot.start_time, slot.end_time) }}</b>
                  </div>
                  <div class="rounded-2xl bg-black/35 p-3">
                    <p class="text-xs text-muted">مدت</p>
                    <b class="mt-1 block text-white">{{ slot.duration_minutes || 60 }} دقیقه</b>
                  </div>
                </div>

                <div v-if="slot.booking_type === 'date'" class="mt-4 rounded-2xl border border-gold/10 bg-black/25 p-4">
                  <p class="flex items-center gap-2 text-sm font-black text-champagne">
                    <MapPin class="h-4 w-4" />
                    {{ slot.location_title || 'لوکیشن اختصاصی ندارد' }}
                  </p>
                  <p class="mt-2 line-clamp-2 text-xs leading-6 text-muted">
                    {{ slot.location_hint || 'برای این تایم لوکیشن یا توضیح اضافه ثبت نشده است.' }}
                  </p>
                </div>

                <div v-if="slotServices(slot).length" class="mt-4 flex flex-wrap gap-2">
                  <span
                    v-for="s in slotServices(slot)"
                    :key="s.title"
                    class="rounded-full bg-gold/10 px-3 py-1 text-xs text-champagne"
                  >
                    {{ s.title }} · {{ money(s.price) }}
                  </span>
                </div>

                <div v-if="selectedSlotId === slot.id" class="mt-4 rounded-2xl bg-gold px-4 py-3 text-center text-sm font-black text-black">
                  این تایم انتخاب شد
                </div>
              </div>
            </button>
          </div>
        </section>

        <section v-if="step === 3" class="fade-up">
          <div class="badge">یادداشت درخواست</div>
          <h2 class="mt-4 text-3xl font-black md:text-5xl">یک توضیح کوتاه برای طرف مقابل بنویس.</h2>
          <textarea v-model="form.message" class="lux-input mt-7 min-h-44" placeholder="متن درخواست..."></textarea>
        </section>

        <section v-if="step === 4" class="fade-up">
          <div class="badge">تایید نهایی</div>
          <h2 class="mt-4 text-3xl font-black md:text-5xl">درخواست را ثبت کن.</h2>

          <div class="mt-7 grid gap-4 md:grid-cols-2">
            <div class="rounded-[2rem] border border-gold/15 bg-white/[.045] p-5">
              <p class="text-xs text-muted">نوع</p>
              <b class="mt-2 block text-2xl text-white">{{ typeLabels[form.booking_type] }}</b>
            </div>
            <div class="rounded-[2rem] border border-gold/15 bg-white/[.045] p-5">
              <p class="text-xs text-muted">تاریخ</p>
              <b class="mt-2 block text-xl text-white">{{ faDate(form.date) }}</b>
            </div>
            <div class="rounded-[2rem] border border-gold/15 bg-white/[.045] p-5">
              <p class="text-xs text-muted">زمان</p>
              <b class="mt-2 block text-2xl text-white">{{ form.time || 'انتخاب نشده' }}</b>
            </div>
            <div class="rounded-[2rem] border border-gold/15 bg-gold/10 p-5">
              <p class="text-xs text-muted">مبلغ نهایی</p>
              <b class="mt-2 block text-3xl text-gold">{{ money(form.offer_amount) }}</b>
            </div>
          </div>

          <div class="mt-6 rounded-[2rem] border border-gold/20 bg-black/35 p-5">
            <ShieldCheck class="h-9 w-9 text-gold" />
            <p class="mt-3 text-xl font-black text-white">بعد از ثبت، درخواست برای خانم ارسال می‌شود.</p>
            <p class="mt-2 text-sm leading-7 text-muted">بعد از تایید، مراحل پرداخت، چت یا ویدیوکال فعال می‌شود.</p>
          </div>
        </section>

        <div class="mt-8 flex items-center justify-between gap-3">
          <button class="lux-btn-dark" :disabled="step === 1" @click="prev">قبلی</button>
          <button v-if="step < 4" class="lux-btn" :disabled="step === 2 && !selectedSlotId" @click="next">ادامه</button>
          <button v-else class="lux-btn" :disabled="!selectedSlotId" @click="submit">
            <CheckCircle2 class="ml-2 h-5 w-5" /> ثبت درخواست
          </button>
        </div>
      </main>
    </div>
  </div>
</template>
