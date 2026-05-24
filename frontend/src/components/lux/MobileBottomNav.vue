<script setup lang="ts">
import { Home, Search, Wallet, User } from 'lucide-vue-next'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 z-50 border-t border-gold/15 bg-black/92 px-2 pb-[calc(.55rem+env(safe-area-inset-bottom,0px))] pt-1.5 shadow-[0_-20px_70px_rgba(0,0,0,.60)] backdrop-blur-2xl lg:hidden">
    <div class="mx-auto grid max-w-md grid-cols-4 gap-1 rounded-[1.25rem] border border-gold/15 bg-white/[.04] p-1">
      <RouterLink to="/" class="flex flex-col items-center gap-1 rounded-xl px-1.5 py-2 text-[10px] font-black text-muted transition active:bg-gold/10">
        <Home class="h-4.5 w-4.5 text-gold" /> خانه
      </RouterLink>
      <RouterLink :to="auth.user?.role === 'woman' ? '/woman/requests' : auth.user?.role === 'admin' ? '/admin/bookings' : '/man/discover'" class="flex flex-col items-center gap-1 rounded-xl px-1.5 py-2 text-[10px] font-black text-muted transition active:bg-gold/10">
        <Search class="h-4.5 w-4.5 text-gold" /> پیگیری
      </RouterLink>
      <RouterLink :to="auth.user?.role === 'woman' ? '/woman/wallet' : auth.user?.role === 'admin' ? '/admin/wallets' : '/wallet'" class="flex flex-col items-center gap-1 rounded-xl px-1.5 py-2 text-[10px] font-black text-muted transition active:bg-gold/10">
        <Wallet class="h-4.5 w-4.5 text-gold" /> کیف پول
      </RouterLink>
      <RouterLink :to="auth.user?.role === 'woman' ? '/woman/studio' : auth.user?.role === 'admin' ? '/admin' : '/man'" class="flex flex-col items-center gap-1 rounded-xl px-1.5 py-2 text-[10px] font-black text-muted transition active:bg-gold/10">
        <User class="h-4.5 w-4.5 text-gold" /> پنل
      </RouterLink>
    </div>
  </nav>
</template>
