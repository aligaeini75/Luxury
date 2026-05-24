<script setup lang="ts">
import KycProfileCard from '../../components/lux/KycProfileCard.vue'
import { onMounted } from 'vue'
import AppShell from '../../components/layout/AppShell.vue'
import ProfileHeroUltra from '../../components/lux/ProfileHeroUltra.vue'
import { useManStore } from '../../stores/man'
const man = useManStore()
onMounted(() => man.loadProfile())
</script>
<template>
  <AppShell>
    <section class="px-6 py-10 lg:px-10">
      <ProfileHeroUltra :profile="man.profile" role="man" />
      <KycProfileCard />
      <div class="mt-8 grid gap-5 md:grid-cols-3">
        <RouterLink to="/man/discover" class="lux-panel p-8 motion-card"><div class="badge">کشف</div><h3 class="mt-4 text-3xl font-black">کشف لوکس</h3></RouterLink>
        <RouterLink to="/man/subscriptions" class="lux-panel p-8 motion-card"><div class="badge">گالری‌های ماهانه</div><h3 class="mt-4 text-3xl font-black">عکس‌های بازشده خانم‌ها</h3><p class="muted mt-3">اشتراک‌های فعال و اعلان عکس‌های جدید را ببین.</p></RouterLink>
        <RouterLink to="/man/interests" class="lux-panel p-8 motion-card"><div class="badge">درخواست‌ها</div><h3 class="mt-4 text-3xl font-black">پیگیری رزروها</h3></RouterLink>
      </div>
    </section>
  </AppShell>
</template>
