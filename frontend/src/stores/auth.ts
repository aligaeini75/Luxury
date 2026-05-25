import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../lib/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<any>(null)
  const token = ref(localStorage.getItem('luxora_token') || '')
  const error = ref('')
  const loading = ref(false)
  const pendingVerificationEmail = ref(localStorage.getItem('luxora_pending_email') || '')

  const isMan = computed(() => user.value?.role === 'man')
  const isWoman = computed(() => user.value?.role === 'woman')
  const isAdmin = computed(() => user.value?.role === 'admin')

  function setToken(v: string) {
    token.value = v
    if (v) localStorage.setItem('luxora_token', v)
    else localStorage.removeItem('luxora_token')
  }

  function redirectForRole(role: string) {
    if (role === 'admin') window.location.assign('/#/admin')
    else if (role === 'woman') window.location.assign('/#/woman/studio')
    else window.location.assign('/#/man')
  }

  function apiError(e: any, fallback: string) {
    const data = e?.response?.data
    return data?.message || data?.error || data?.details || e?.message || fallback
  }

  async function login(payload: any) {
    loading.value = true
    error.value = ''
    try {
      const { data } = await api.post('/auth/login', payload)
      setToken(data.token)
      user.value = data.user
      redirectForRole(data.user.role)
      return true
    } catch (e: any) {
      const data = e?.response?.data
      if (data?.verification_required && data?.email) {
        pendingVerificationEmail.value = data.email
        localStorage.setItem('luxora_pending_email', data.email)
        window.location.assign('/#/verify-email')
        return false
      }
      error.value = apiError(e, 'ورود ناموفق بود')
      return false
    } finally {
      loading.value = false
    }
  }

  async function register(payload: any) {
    loading.value = true
    error.value = ''
    try {
      const { data } = await api.post('/auth/register', payload)
      if (data.verification_required) {
        pendingVerificationEmail.value = data.email || payload.email
        localStorage.setItem('luxora_pending_email', pendingVerificationEmail.value)
        window.location.assign('/#/verify-email')
        return true
      }
      setToken(data.token)
      user.value = data.user
      redirectForRole(data.user.role)
      return true
    } catch (e: any) {
      error.value = apiError(e, 'ثبت‌نام ناموفق بود')
      return false
    } finally {
      loading.value = false
    }
  }

  async function verifyEmail(code: string) {
    loading.value = true
    error.value = ''
    try {
      const { data } = await api.post('/auth/verify-email', { email: pendingVerificationEmail.value, code })
      setToken(data.token)
      user.value = data.user
      localStorage.removeItem('luxora_pending_email')
      pendingVerificationEmail.value = ''
      redirectForRole(data.user.role)
      return true
    } catch (e: any) {
      error.value = apiError(e, 'کد تایید نامعتبر است')
      return false
    } finally {
      loading.value = false
    }
  }

  async function resendEmailCode() {
    if (!pendingVerificationEmail.value) return false
    loading.value = true
    error.value = ''
    try {
      await api.post('/auth/resend-email-code', { email: pendingVerificationEmail.value })
      return true
    } catch (e: any) {
      error.value = apiError(e, 'ارسال دوباره کد ناموفق بود')
      return false
    } finally {
      loading.value = false
    }
  }

  async function me() {
    if (!token.value) return null
    const { data } = await api.get('/auth/me')
    user.value = data.user
    return data.user
  }

  function logout() {
    setToken('')
    user.value = null
    window.location.assign('/#/login')
  }

  return { user, token, error, loading, pendingVerificationEmail, isMan, isWoman, isAdmin, login, register, verifyEmail, resendEmailCode, me, logout }
})
