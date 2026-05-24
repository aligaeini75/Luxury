import axios from 'axios'
import { useToastStore } from '../stores/toast'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('luxora_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
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
    const msg = error?.response?.data?.error || error?.response?.data?.message || error?.message || 'خطایی رخ داد.'
    useToastStore().error('عملیات ناموفق بود', msg)
    return Promise.reject(error)
  }
)

export function mediaUrl(value?: string | null) {
  return value || ''
}
