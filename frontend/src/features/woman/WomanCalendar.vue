<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Plus, Trash2, Pencil, X, ImagePlus } from 'lucide-vue-next'
import AppShell from '../../components/layout/AppShell.vue'
import UploadCard from '../../components/lux/UploadCard.vue'
import { useWomanStore } from '../../stores/woman'

const woman = useWomanStore()

const today = new Date()
const viewYear = ref(today.getFullYear())
const viewMonth = ref(today.getMonth())
const modalOpen = ref(false)
const editingId = ref('')
const selectedLabel = ref('')
const serviceTitle = ref('')
const servicePrice = ref(0)
const locationPhoto = ref('')

const form = reactive({
  booking_type: 'date',
  date: '',
  start_time: '20:00',
  end_time: '21:00',
  duration_minutes: 60,
  price_override: 0,
  total_price: 0,
  location_title: '',
  location_hint: '',
  location_photos: [] as string[],
  services: [] as Array<{ title: string; price: number }>,
})

const labels: Record<string, string> = { date: 'دیت حضوری', chat: 'چت خصوصی', video_call: 'ویدیوکال' }

const monthLabel = computed(() =>
  new Intl.DateTimeFormat('fa-IR-u-ca-persian', { month: 'long', year: 'numeric' }).format(new Date(viewYear.value, viewMonth.value, 1))
)

const weekdays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه']

const days = computed(() => {
  const first = new Date(viewYear.value, viewMonth.value, 1)
  const last = new Date(viewYear.value, viewMonth.value + 1, 0)
  const firstWeekday = (first.getDay() + 1) % 7
  const cells: Array<any> = []

  for (let i = 0; i < firstWeekday; i++) cells.push({ empty: true, id: `empty-${i}` })

  for (let day = 1; day <= last.getDate(); day++) {
    const d = new Date(viewYear.value, viewMonth.value, day)
    const iso = toLocalISO(d)
    const items = woman.availability.filter((x: any) => normalizeDate(x.date) === iso)
    cells.push({
      id: iso,
      date: iso,
      label: new Intl.DateTimeFormat('fa-IR-u-ca-persian', { day: 'numeric' }).format(d),
      fullLabel: new Intl.DateTimeFormat('fa-IR-u-ca-persian', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d),
      today: toLocalISO(today) === iso,
      items,
    })
  }

  return cells
})

const sortedSlots = computed(() =>
  [...woman.availability].sort((a: any, b: any) => String(`${normalizeDate(a.date)} ${a.start_time}`).localeCompare(String(`${normalizeDate(b.date)} ${b.start_time}`)))
)

const finalPrice = computed(() => {
  const base = Number(form.price_override || 0)
  const extras = form.services.reduce((sum, s) => sum + Number(s.price || 0), 0)
  return Number(form.total_price || base + extras)
})

function toLocalISO(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function normalizeDate(value: any) {
  const raw = String(value || '')
  if (!raw) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw
  const d = new Date(raw)
  return Number.isNaN(d.getTime()) ? raw : toLocalISO(d)
}

function parseJson(value: any, fallback: any) {
  try {
    if (Array.isArray(value)) return value
    if (!value) return fallback
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

function nextMonth() {
  const d = new Date(viewYear.value, viewMonth.value + 1, 1)
  viewYear.value = d.getFullYear()
  viewMonth.value = d.getMonth()
}

function prevMonth() {
  const d = new Date(viewYear.value, viewMonth.value - 1, 1)
  viewYear.value = d.getFullYear()
  viewMonth.value = d.getMonth()
}

function resetForm(date = '') {
  editingId.value = ''
  Object.assign(form, {
    booking_type: 'date',
    date,
    start_time: '20:00',
    end_time: '21:00',
    duration_minutes: 60,
    price_override: 0,
    total_price: 0,
    location_title: '',
    location_hint: '',
    location_photos: [],
    services: [],
  })
  serviceTitle.value = ''
  servicePrice.value = 0
  locationPhoto.value = ''
}

function openModal(day: any) {
  if (!day?.date) return
  resetForm(day.date)
  selectedLabel.value = day.fullLabel
  modalOpen.value = true
}

function editSlot(slot: any) {
  editingId.value = slot.id
  Object.assign(form, {
    booking_type: slot.booking_type || 'date',
    date: normalizeDate(slot.date),
    start_time: slot.start_time || '20:00',
    end_time: slot.end_time || '21:00',
    duration_minutes: Number(slot.duration_minutes || 60),
    price_override: Number(slot.price_override || slot.total_price || 0),
    total_price: Number(slot.total_price || slot.price_override || 0),
    location_title: slot.location_title || '',
    location_hint: slot.location_hint || '',
    location_photos: parseJson(slot.location_photos_json, []),
    services: parseJson(slot.services_json, []),
  })
  selectedLabel.value = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${normalizeDate(slot.date)}T00:00:00`))
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
}

function addService() {
  if (!serviceTitle.value.trim()) return
  form.services.push({ title: serviceTitle.value.trim(), price: Number(servicePrice.value || 0) })
  serviceTitle.value = ''
  servicePrice.value = 0
  form.total_price = finalPrice.value
}

function removeService(index: number) {
  form.services.splice(index, 1)
  form.total_price = finalPrice.value
}

function addLocationPhoto() {
  if (!locationPhoto.value) return
  form.location_photos.push(locationPhoto.value)
  locationPhoto.value = ''
}

function removePhoto(index: number) {
  form.location_photos.splice(index, 1)
}

async function saveSlot() {
  if (!form.date) return window.alert('لطفاً یک روز معتبر انتخاب کن.')
  if (!form.start_time || !form.end_time) return window.alert('ساعت شروع و پایان را وارد کن.')
  const payload = {
    ...form,
    date: normalizeDate(form.date),
    price_override: Number(form.price_override || 0),
    total_price: Number(finalPrice.value || 0),
    duration_minutes: Number(form.duration_minutes || 60),
  }
  if (editingId.value) await woman.updateAvailability(editingId.value, payload)
  else await woman.addAvailability(payload)
  closeModal()
}

async function deleteSlot(slot: any) {
  if (!confirm('این تایم حذف شود؟')) return
  await woman.deleteAvailability(slot.id)
}

function photoList(slot: any) {
  return parseJson(slot.location_photos_json, [])
}

function serviceList(slot: any) {
  return parseJson(slot.services_json, [])
}

onMounted(() => woman.studio())
</script>

<template>
  <AppShell>
    <section class="px-4 py-8 lg:px-10">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div class="badge">تقویم تایم‌ها</div>
          <h1 class="mt-5 text-4xl font-black leading-tight md:text-7xl">دیت حضوری، چت و ویدیوکال را همین‌جا مدیریت کن.</h1>
          <p class="muted mt-4 max-w-3xl text-base leading-8 md:text-lg">
            سرویس و لوکیشن جدا حذف شد؛ برای دیت حضوری داخل همین پاپ‌آپ عکس‌های لوکیشن، سرویس‌های اضافه و مبلغ نهایی را ثبت کن.
          </p>
        </div>
      </div>

      <div class="mt-8 rounded-[2.5rem] border border-gold/15 bg-white/[.045] p-4 shadow-aura backdrop-blur-2xl md:p-6">
        <div class="mb-6 flex items-center justify-between gap-3">
          <button class="lux-btn-dark" @click="nextMonth">ماه بعد</button>
          <h2 class="text-2xl font-black text-champagne md:text-4xl">{{ monthLabel }}</h2>
          <button class="lux-btn-dark" @click="prevMonth">ماه قبل</button>
        </div>

        <div class="grid grid-cols-7 gap-2 text-center text-xs font-black text-muted md:text-sm">
          <div v-for="w in weekdays" :key="w" class="rounded-2xl border border-gold/10 bg-black/30 py-3">{{ w }}</div>
        </div>

        <div class="mt-2 grid grid-cols-7 gap-2">
          <button
            v-for="day in days"
            :key="day.id"
            class="min-h-24 rounded-2xl border p-2 text-right transition md:min-h-32 md:p-3"
            :class="[
              day.empty ? 'pointer-events-none border-transparent bg-transparent' : 'border-gold/10 bg-black/35 hover:border-gold/45 hover:bg-gold/10',
              day.today ? '!border-gold bg-gold/10' : ''
            ]"
            @click="openModal(day)"
          >
            <template v-if="!day.empty">
              <div class="flex items-center justify-between">
                <span class="text-lg font-black text-white">{{ day.label }}</span>
                <span v-if="day.items.length" class="rounded-full bg-gold px-2 py-1 text-[10px] font-black text-black">{{ day.items.length }} تایم</span>
              </div>
              <div class="mt-3 space-y-1">
                <div v-for="item in day.items.slice(0, 2)" :key="item.id" class="truncate rounded-xl bg-white/[.06] px-2 py-1 text-[11px] text-champagne">
                  {{ labels[item.booking_type] || item.booking_type }} · {{ item.start_time }}
                </div>
                <div v-if="day.items.length > 2" class="text-[11px] text-muted">+{{ day.items.length - 2 }} تایم دیگر</div>
              </div>
            </template>
          </button>
        </div>
      </div>

      <section class="mt-8 rounded-[2.5rem] border border-gold/15 bg-white/[.045] p-5 shadow-aura md:p-6">
        <div class="flex items-center justify-between">
          <div>
            <div class="badge">تایم‌های ساخته شده</div>
            <h2 class="mt-3 text-3xl font-black">ویرایش و حذف تایم‌ها</h2>
          </div>
          <span class="rounded-full bg-gold px-3 py-1 text-sm font-black text-black">{{ sortedSlots.length }}</span>
        </div>

        <div class="mt-6 grid gap-4 lg:grid-cols-2">
          <article v-for="slot in sortedSlots" :key="slot.id" class="overflow-hidden rounded-[2rem] border border-gold/10 bg-black/35">
            <div v-if="photoList(slot).length" class="grid h-44 grid-cols-3 gap-1">
              <img v-for="p in photoList(slot).slice(0,3)" :key="p" :src="p" class="h-full w-full object-cover" />
            </div>
            <div v-else class="skeleton-gold h-44"></div>

            <div class="p-5">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-xl font-black text-white">{{ labels[slot.booking_type] || slot.booking_type }}</p>
                  <p class="mt-1 text-sm text-muted">{{ normalizeDate(slot.date) }} · {{ slot.start_time }} تا {{ slot.end_time }}</p>
                  <p v-if="slot.booking_type === 'date'" class="mt-1 text-sm text-muted">{{ slot.location_title || 'لوکیشن هنوز وارد نشده' }}</p>
                </div>
                <span class="rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-xs font-black text-champagne">
                  {{ Number(slot.total_price || slot.price_override || 0) }} تومان
                </span>
              </div>

              <div v-if="serviceList(slot).length" class="mt-4 flex flex-wrap gap-2">
                <span v-for="s in serviceList(slot)" :key="s.title" class="rounded-full bg-white/[.06] px-3 py-1 text-xs text-muted">
                  {{ s.title }} · {{ Number(s.price || 0) }}
                </span>
              </div>

              <div class="mt-5 grid grid-cols-2 gap-2">
                <button class="lux-btn" :disabled="slot.is_booked" @click="editSlot(slot)">
                  <Pencil class="ml-2 inline h-4 w-4" /> ویرایش
                </button>
                <button class="rounded-full border border-red-300/20 bg-red-500/10 px-4 py-3 font-black text-red-100" :disabled="slot.is_booked" @click="deleteSlot(slot)">
                  <Trash2 class="ml-2 inline h-4 w-4" /> حذف
                </button>
              </div>

              <p v-if="slot.is_booked" class="mt-3 text-xs text-muted">این تایم رزرو شده و قابل ویرایش یا حذف نیست.</p>
            </div>
          </article>

          <div v-if="!sortedSlots.length" class="rounded-2xl border border-gold/10 bg-black/35 p-8 text-muted">
            هنوز تایمی نساختی. از تقویم بالا یک تاریخ انتخاب کن.
          </div>
        </div>
      </section>

      <Teleport to="body">
        <Transition enter-active-class="transition duration-200" leave-active-class="transition duration-150" enter-from-class="opacity-0" leave-to-class="opacity-0">
          <div v-if="modalOpen" class="fixed inset-0 z-[120] bg-black/75 backdrop-blur-sm" @click="closeModal"></div>
        </Transition>

        <Transition enter-active-class="transition duration-300" leave-active-class="transition duration-200" enter-from-class="translate-y-8 opacity-0 scale-95" leave-to-class="translate-y-8 opacity-0 scale-95">
          <div v-if="modalOpen" dir="rtl" class="fixed left-1/2 top-1/2 z-[130] max-h-[92vh] w-[94vw] max-w-5xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[2.3rem] border border-gold/20 bg-[#060301] p-5 text-right text-white shadow-[0_35px_120px_rgba(0,0,0,.75)] md:p-7">
            <button class="absolute left-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-white/[.06]" @click="closeModal">
              <X class="h-5 w-5" />
            </button>

            <div class="badge">{{ editingId ? 'ویرایش تایم' : 'ساخت تایم جدید' }}</div>
            <h2 class="mt-4 text-3xl font-black text-champagne">{{ selectedLabel }}</h2>
            <p class="muted mt-2 text-sm">نوع ارتباط، ساعت، لوکیشن، سرویس‌های اضافه و مبلغ نهایی را مشخص کن.</p>

            <div class="mt-6 grid grid-cols-3 gap-2">
              <button
                v-for="type in ['date','chat','video_call']"
                :key="type"
                class="rounded-2xl border px-3 py-3 text-xs font-black md:text-sm"
                :class="form.booking_type === type ? 'border-gold bg-gold/15 text-champagne' : 'border-white/10 text-muted'"
                @click="form.booking_type = type"
              >
                {{ labels[type] }}
              </button>
            </div>

            <div class="mt-5 grid gap-4 md:grid-cols-4">
              <label class="block">
                <span class="text-xs font-black text-muted">ساعت شروع</span>
                <input v-model="form.start_time" type="time" class="lux-input mt-2" />
              </label>
              <label class="block">
                <span class="text-xs font-black text-muted">ساعت پایان</span>
                <input v-model="form.end_time" type="time" class="lux-input mt-2" />
              </label>
              <label class="block">
                <span class="text-xs font-black text-muted">مدت به دقیقه</span>
                <input v-model="form.duration_minutes" type="number" class="lux-input mt-2" />
              </label>
              <label class="block">
                <span class="text-xs font-black text-muted">قیمت پایه</span>
                <input v-model="form.price_override" type="number" class="lux-input mt-2" placeholder="مثلاً ۱۲۰" />
              </label>
            </div>

            <div v-if="form.booking_type === 'date'" class="mt-6 grid gap-5 lg:grid-cols-[1fr_1fr]">
              <section class="rounded-[1.8rem] border border-gold/15 bg-white/[.035] p-5">
                <div class="badge">لوکیشن دیت حضوری</div>
                <label class="mt-4 block">
                  <span class="text-xs font-black text-muted">عنوان لوکیشن</span>
                  <input v-model="form.location_title" class="lux-input mt-2" placeholder="مثلاً لانژ خصوصی، هتل، کافه..." />
                </label>
                <label class="mt-4 block">
                  <span class="text-xs font-black text-muted">توضیح لوکیشن</span>
                  <textarea v-model="form.location_hint" class="lux-input mt-2 min-h-24" placeholder="آدرس دقیق یا راهنمایی فقط بعد از تایید نمایش داده شود."></textarea>
                </label>

                <UploadCard
                  v-model="locationPhoto"
                  class="mt-4"
                  label="آپلود عکس لوکیشن"
                  subtitle="بعد از آپلود، با دکمه زیر به لیست عکس‌ها اضافه کن."
                />
                <button class="lux-btn-dark mt-3 w-full" :disabled="!locationPhoto" @click="addLocationPhoto">
                  <ImagePlus class="ml-2 inline h-4 w-4" /> افزودن عکس به لوکیشن
                </button>

                <div class="mt-4 grid grid-cols-3 gap-2">
                  <div v-for="(p, i) in form.location_photos" :key="p" class="relative overflow-hidden rounded-2xl border border-gold/10">
                    <img :src="p" class="h-24 w-full object-cover" />
                    <button class="absolute left-1 top-1 rounded-full bg-black/70 px-2 py-1 text-xs" @click="removePhoto(i)">حذف</button>
                  </div>
                </div>
              </section>

              <section class="rounded-[1.8rem] border border-gold/15 bg-white/[.035] p-5">
                <div class="badge">سرویس‌های اضافه</div>
                <p class="muted mt-3 text-sm">هر سرویس اضافه را داخل همین پاپ‌آپ بساز. قیمت‌ها در مبلغ نهایی جمع می‌شوند.</p>
                <div class="mt-4 grid gap-3 sm:grid-cols-[1fr_120px]">
                  <input v-model="serviceTitle" class="lux-input" placeholder="عنوان سرویس اضافه" />
                  <input v-model="servicePrice" type="number" class="lux-input" placeholder="مبلغ" />
                </div>
                <button class="lux-btn-dark mt-3 w-full" @click="addService">
                  <Plus class="ml-2 inline h-4 w-4" /> افزودن سرویس
                </button>

                <div class="mt-4 space-y-2">
                  <div v-for="(s, i) in form.services" :key="`${s.title}-${i}`" class="flex items-center justify-between rounded-2xl bg-black/35 p-3">
                    <span class="font-bold text-white">{{ s.title }}</span>
                    <div class="flex items-center gap-3">
                      <span class="text-champagne">{{ Number(s.price || 0) }} تومان</span>
                      <button class="text-red-200" @click="removeService(i)">حذف</button>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div class="mt-6 rounded-[1.8rem] border border-gold/20 bg-gold/10 p-5">
              <p class="text-sm text-muted">مبلغ نهایی این تایم</p>
              <div class="mt-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <b class="text-4xl text-champagne">{{ finalPrice }} تومان</b>
                <label class="block md:w-64">
                  <span class="text-xs font-black text-muted">اصلاح دستی مبلغ نهایی</span>
                  <input v-model="form.total_price" type="number" class="lux-input mt-2" />
                </label>
              </div>
            </div>

            <div class="mt-6 grid grid-cols-2 gap-3">
              <button class="lux-btn" @click="saveSlot">{{ editingId ? 'ذخیره ویرایش' : 'ثبت تایم' }}</button>
              <button class="lux-btn-dark" @click="closeModal">لغو</button>
            </div>
          </div>
        </Transition>
      </Teleport>
    </section>
  </AppShell>
</template>
