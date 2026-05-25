import { createRouter, createWebHashHistory } from 'vue-router'
import Landing from '../features/public/Landing.vue'
import Login from '../features/auth/Login.vue'
import Register from '../features/auth/Register.vue'
import VerifyEmail from '../features/auth/VerifyEmail.vue'
import Terms from '../features/legal/Terms.vue'
import WomanPublicProfile from '../features/public/WomanPublicProfile.vue'

import ManDashboard from '../features/man/ManDashboard.vue'
import ManProfileStudio from '../features/man/ManProfileStudio.vue'
import ManDiscover from '../features/man/ManDiscover.vue'
import ManGallery from '../features/man/ManGallery.vue'
import ManInterests from '../features/man/ManInterests.vue'
import ManRequests from '../features/man/ManRequests.vue'
import ManSubscriptions from '../features/man/ManSubscriptions.vue'
import WalletPage from '../features/wallet/WalletPage.vue'
import EscrowPage from '../features/wallet/EscrowPage.vue'
import ChatPage from '../features/chat/ChatPage.vue'
import VideoCallPage from '../features/chat/VideoCallPage.vue'

import WomanStudio from '../features/woman/WomanStudio.vue'
import WomanRequests from '../features/woman/WomanRequests.vue'
import WomanGallery from '../features/woman/WomanGallery.vue'
import WomanServices from '../features/woman/WomanServices.vue'
import WomanLocations from '../features/woman/WomanLocations.vue'
import WomanCalendar from '../features/woman/WomanCalendar.vue'
import WomanWallet from '../features/woman/WomanWallet.vue'

import AdminOverview from '../features/admin/AdminOverview.vue'
import AdminUsers from '../features/admin/AdminUsers.vue'
import AdminWallets from '../features/admin/AdminWallets.vue'
import AdminBookings from '../features/admin/AdminBookings.vue'
import AdminKyc from '../features/admin/AdminKyc.vue'
import AdminMedia from '../features/admin/AdminMedia.vue'
import AdminTickets from '../features/admin/AdminTickets.vue'
import AdminRisk from '../features/admin/AdminRisk.vue'
import AdminAuditLogs from '../features/admin/AdminAuditLogs.vue'
import AdminDisputes from '../features/admin/AdminDisputes.vue'
import AdminUserDetail from '../features/admin/AdminUserDetail.vue'
import AdminProviderSettings from '../features/admin/AdminProviderSettings.vue'
import AdminWalletMonitor from '../features/admin/AdminWalletMonitor.vue'
import AdminMonitoring from '../features/admin/AdminMonitoring.vue'

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: Landing },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/verify-email', component: VerifyEmail },
    { path: '/terms', component: Terms },
    { path: '/women/:id', component: WomanPublicProfile },

    { path: '/man', component: ManDashboard },
    { path: '/man/profile', component: ManProfileStudio },
    { path: '/man/discover', component: ManDiscover },
    { path: '/man/requests', component: ManRequests },
    { path: '/man/subscriptions', component: ManSubscriptions },
    { path: '/man/gallery', component: ManGallery },
    { path: '/man/interests', redirect: '/man' },
    { path: '/wallet', component: WalletPage },
    { path: '/escrow', redirect: '/wallet' },
    { path: '/chat', component: ChatPage },
    { path: '/video-call/:bookingId', component: VideoCallPage },
    { path: '/ویدیو-call/:bookingId', redirect: to => `/video-call/${to.params.bookingId}` },

    { path: '/woman', redirect: '/woman/studio' },
    { path: '/woman/studio', component: WomanStudio },
    { path: '/woman/requests', component: WomanRequests },
    { path: '/woman/gallery', component: WomanGallery },
    { path: '/woman/services', redirect: '/woman/calendar' },
    { path: '/woman/locations', redirect: '/woman/calendar' },
    { path: '/woman/calendar', component: WomanCalendar },
    { path: '/woman/wallet', component: WomanWallet },

    { path: '/admin', component: AdminOverview },
    { path: '/admin/users', component: AdminUsers },
    { path: '/admin/wallets', component: AdminWallets },
    { path: '/admin/bookings', component: AdminBookings },
    { path: '/admin/kyc', component: AdminKyc },
    { path: '/admin/media', redirect: '/admin' },
    { path: '/admin/tickets', component: AdminTickets },
    { path: '/admin/risk', redirect: '/admin' },
    { path: '/admin/audit-logs', redirect: '/admin' },
    { path: '/admin/audit-log', redirect: '/admin/audit-logs' },
    { path: '/admin/disputes', component: AdminDisputes },
    { path: '/admin/users/:id', component: AdminUserDetail },
    { path: '/admin/providers', redirect: '/admin' },
    { path: '/admin/wallet-monitor', redirect: '/admin' },
    { path: '/admin/monitoring', redirect: '/admin' },
  ],
})