import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../lib/api'

export const useAdminStore = defineStore('admin', () => {
  const overview = ref<any>({ metrics: {}, activity: [], revenue: [] })
  const users = ref<any[]>([])
  const wallets = ref<any[]>([])
  const deposits = ref<any[]>([])
  const withdrawals = ref<any[]>([])
  const escrows = ref<any[]>([])
  const bookings = ref<any[]>([])
  const kyc = ref<any[]>([])
  const media = ref<any[]>([])
  const tickets = ref<any[]>([])
  const risk = ref<any[]>([])

  async function loadOverview() { const { data } = await api.get('/admin/overview'); overview.value = data }
  async function loadUsers() { const { data } = await api.get('/admin/users'); users.value = data.users || [] }
  async function setUserStatus(id: string, status: string) { await api.post(`/admin/users/${id}/status`, { status }); await loadUsers() }
  async function setUserTicketLock(id: string, locked: boolean, note = '') { await api.post(`/admin/users/${id}/ticket-lock`, { locked, note }); await loadUsers() }
  async function setTicketLock(id: string, ticket_locked: boolean) { await api.post(`/admin/users/${id}/ticket-lock`, { ticket_locked }); await loadUsers() }
  async function loadWallets() { const { data } = await api.get('/admin/wallets'); wallets.value = data.wallets || []; deposits.value = data.deposits || []; withdrawals.value = data.withdrawals || []; escrows.value = data.escrows || [] }
  async function markDepositPaid(id: string) { await api.post(`/admin/deposits/${id}/mark-paid`); await loadWallets() }
  async function approveWithdrawal(id: string) { await api.post(`/admin/withdrawals/${id}/approve`); await loadWallets() }
  async function rejectWithdrawal(id: string) { await api.post(`/admin/withdrawals/${id}/reject`); await loadWallets() }
  async function releaseEscrow(id: string) { await api.post(`/admin/escrows/${id}/release`); await loadWallets() }
  async function refundEscrow(id: string) { await api.post(`/admin/escrows/${id}/refund`); await loadWallets() }
  async function loadBookings() { const { data } = await api.get('/admin/bookings'); bookings.value = data.bookings || [] }
  async function loadKyc() { const { data } = await api.get('/admin/kyc'); kyc.value = data.kyc || [] }
  async function reviewKyc(id: string, status: string, note = '') {
    await api.post(`/admin/kyc/${id}/review`, { status, note })
    kyc.value = kyc.value.map((item:any) => item.id === id ? { ...item, status, admin_note: note } : item)
    await loadKyc()
  }
  async function loadMedia() { const { data } = await api.get('/admin/media'); media.value = data.media || [] }
  async function moderateMedia(id: string, status: string) { await api.post(`/admin/media/${id}/moderate`, { status }); await loadMedia() }
  async function loadTickets() { const { data } = await api.get('/admin/tickets'); tickets.value = data.tickets || [] }
  async function replyTicket(id: string, message: string) { await api.post(`/admin/tickets/${id}/reply`, { message }); await loadTickets() }
  async function setTicketStatus(id: string, status: string) { await api.post(`/admin/tickets/${id}/status`, { status }); await loadTickets() }
  async function loadRisk() { const { data } = await api.get('/admin/risk'); risk.value = data.risk || [] }

  return { overview, users, wallets, deposits, withdrawals, escrows, bookings, kyc, media, tickets, risk,
    loadOverview, loadUsers, setUserStatus, setUserTicketLock, setTicketLock, loadWallets, markDepositPaid, approveWithdrawal, rejectWithdrawal, releaseEscrow, refundEscrow,
    loadBookings, loadKyc, reviewKyc, loadMedia, moderateMedia, loadTickets, replyTicket, setTicketStatus, loadRisk }
})