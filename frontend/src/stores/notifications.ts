import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../lib/api'

export const useNotificationsStore = defineStore('notifications', () => {
  const alerts = ref<any[]>([])
  const unread = ref(0)
  let timer: number | undefined

  function hasToken() {
    return Boolean(localStorage.getItem('luxora_token'))
  }

  async function load() {
    if (!hasToken()) {
      alerts.value = []
      unread.value = 0
      return
    }

    const { data } = await api.get('/notifications').catch((err) => {
      if (err?.response?.status === 401) {
        alerts.value = []
        unread.value = 0
      }
      return { data: { alerts: [], unread: 0 } }
    })

    alerts.value = data.alerts || []
    unread.value = Number(data.unread || 0)
  }

  async function markRead(id: string) {
    if (!hasToken()) return
    await api.post(`/notifications/${id}/read`)
    await load()
  }

  async function markAllRead() {
    if (!hasToken()) return
    await api.post('/notifications/read-all')
    await load()
  }

  function startPolling() {
    if (timer) window.clearInterval(timer)
    if (!hasToken()) return
    load()
    timer = window.setInterval(() => {
      if (!hasToken()) {
        if (timer) window.clearInterval(timer)
        timer = undefined
        alerts.value = []
        unread.value = 0
        return
      }
      load()
    }, 15000)
  }

  return { alerts, unread, load, markRead, markAllRead, startPolling }
})
