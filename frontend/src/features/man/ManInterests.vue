<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppShell from '../../components/layout/AppShell.vue'
import InterestDeck from '../../components/lux/InterestDeck.vue'
import { useManStore } from '../../stores/man'

const man = useManStore()
const general = ref<string[]>([])
const dateInterests = ref<string[]>([])

onMounted(async () => {
  await man.loadProfile()
  general.value = man.interests.filter((x:any) => x.scope === 'general').map((x:any) => x.key)
})

async function save() {
  await man.saveInterests(general.value.map(key => ({ key, scope: 'general' })))
}
</script>

<template>
  <AppShell>
    <section class="px-6 py-10 lg:px-10">
      <div class="badge">علایق</div>
      <h1 class="mt-5 text-7xl font-black">بدون فرم خشک؛ انتخاب‌های بصری و جذاب.</h1>

      <div class="lux-panel mt-10 p-8">
        <div class="badge">سبک زندگی عمومی</div>
        <h2 class="mt-4 text-5xl font-black">چه چیزی سبک تو را مشخص می‌کند؟</h2>
        <InterestDeck v-model="general" class="mt-6" />
        <button class="lux-btn mt-6" @click="save">ذخیره علایق</button>
      </div>

      <div class="lux-panel mt-8 p-8">
        <div class="badge">علایق مخصوص دیت</div>
        <h2 class="mt-4 text-5xl font-black">داخل فرم ساخت درخواست استفاده می‌شود.</h2>
        <InterestDeck v-model="dateInterests" class="mt-6" />
      </div>
    </section>
  </AppShell>
</template>
