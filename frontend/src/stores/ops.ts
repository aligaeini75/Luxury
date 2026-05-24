import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../lib/api'

export const useOpsStore = defineStore('ops', () => {
  const adminUserDetail = ref<any>(null)
  const auditLogs = ref<any[]>([])
  const rateLimits = ref<any[]>([])
  const disputes = ref<any[]>([])
  const loading = ref(false)

  async function loadUserDetail(id: string) {
    loading.value = true
    try {
      const { data } = await api.get(`/admin/users/${id}`)
      adminUserDetail.value = data
    } finally {
      loading.value = false
    }
  }

  async function loadAuditLogs() {
    const { data } = await api.get('/admin/audit-logs')
    auditLogs.value = data.logs || []
  }

  async function loadRateLimits() {
    const { data } = await api.get('/admin/rate-limits')
    rateLimits.value = data.items || []
  }

  async function loadDisputes() {
    const { data } = await api.get('/admin/disputes')
    disputes.value = data.disputes || []
  }

  async function decideDispute(id: string, action: 'release' | 'refund' | 'split', amount?: number) {
    await api.post(`/admin/disputes/${id}/decide`, { action, amount })
    await loadDisputes()
  }

  async function revokeSessions(userId: string) {
    await api.post(`/admin/users/${userId}/revoke-sessions`)
    await loadUserDetail(userId)
  }

  return { adminUserDetail, auditLogs, rateLimits, disputes, loading, loadUserDetail, loadAuditLogs, loadRateLimits, loadDisputes, decideDispute, revokeSessions }
})