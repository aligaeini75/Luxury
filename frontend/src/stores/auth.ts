import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../lib/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<any>(null)
  const token = ref(localStorage.getItem('luxora_token') || '')
  const error = ref('')
  const loading = ref(false)

  const isMan = computed(() => user.value?.role === 'man')
  const isWoman = computed(() => user.value?.role === 'woman')
  const isAdmin = computed(() => user.value?.role === 'admin')

  function setToken(v: string) {
    token.value = v
    if (v) localStorage.setItem('luxora_token', v)
    else localStorage.removeItem('luxora_token')
  }

  async function login(payload: any) {
    loading.value = true
    error.value = ''
    try {
      const { data } = await api.post('/auth/login', payload)
      setToken(data.token)
      user.value = data.user
      if (data.user.role === 'admin') window.location.assign('/#/admin')
      else if (data.user.role === 'woman') window.location.assign('/#/woman/studio')
      else window.location.assign('/#/man')
      return true
    } catch (e: any) {
      error.value = e?.response?.data?.error || 'ورود failed'
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
      setToken(data.token)
      user.value = data.user
      if (data.user.role === 'woman') window.location.assign('/#/woman/studio')
      else window.location.assign('/#/man')
      return true
    } catch (e: any) {
      error.value = e?.response?.data?.error || 'Registration failed'
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

  return { user, token, error, loading, isMan, isWoman, isAdmin, login, register, me, logout }
})