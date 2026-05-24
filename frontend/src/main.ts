import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import { t, statusLabel, bookingTypeLabel, roleLabel, money, faDate } from './i18n'

document.documentElement.lang = 'fa'
document.documentElement.dir = 'rtl'
import { registerPwa } from './lib/pwa'

createApp(App).use(createPinia()).use(router).mount('#app')

registerPwa()
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}))
