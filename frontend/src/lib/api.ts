import axios from 'axios'
import { useToastStore } from '../stores/toast'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

function currentBookingIdFromRoute() {
  const hash = String(window.location.hash || '')
  const match = hash.match(/\/video-call\/([^/?#]+)/) || hash.match(/\/bookings\/([^/?#]+)/)
  return match ? decodeURIComponent(match[1]) : ''
}

function normalizeApiUrl(url?: string) {
  let next = String(url || '')
  const bookingId = currentBookingIdFromRoute()

  if (bookingId) {
    next = next
      .replaceAll('{route.params.bookingId}', bookingId)
      .replaceAll('{props.bookingId}', bookingId)
      .replaceAll('%7Broute.params.bookingId%7D', bookingId)
      .replaceAll('%7Bprops.bookingId%7D', bookingId)
  }

  // Prevent accidental raw placeholders from hitting the API and producing noisy 404s.
  next = next.replaceAll('{type}', '')
  next = next.replaceAll('{message}', '')
  next = next.replaceAll('{time}', '')
  return next
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('luxora_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (typeof config.url === 'string') config.url = normalizeApiUrl(config.url)
  return config
})

api.interceptors.response.use(
  (response) => {
    const method = String(response.config.method || '').toLowerCase()
    const url = String(response.config.url || '')
    const silentSuccessUrls = [
      '/signal-http',
      '/quality',
      '/presence',
      '/reconnect',
      '/video/',
      '/notifications',
      '/presence/heartbeat',
    ]
    const silentSuccess = silentSuccessUrls.some((item) => url.includes(item))

    if (!silentSuccess && ['post', 'patch', 'delete'].includes(method)) {
      const data: any = response.data || {}
      if (data.message) useToastStore().success(data.message)
      else if (data.ok || data.success) useToastStore().success('عملیات با موفقیت انجام شد.')
    }
    return response
  },
  (error) => {
    const status = error?.response?.status
    const method = String(error?.config?.method || '').toUpperCase()
    const url = String(error?.config?.url || '')
    const msg = error?.response?.data?.error || error?.response?.data?.message || error?.message || 'خطایی رخ داد.'
    const details = status ? `${msg} · ${status} ${method} ${url}` : msg
    useToastStore().error('عملیات ناموفق بود', details)
    return Promise.reject(error)
  }
)

export function mediaUrl(value?: string | null) {
  return value || ''
}
