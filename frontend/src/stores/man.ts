import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../lib/api'

export const useManStore = defineStore('man', () => {
  const profile = ref<any>(null)
  const gallery = ref<any[]>([])
  const interests = ref<any[]>([])
  const women = ref<any[]>([])
  const requests = ref<any[]>([])
  const alerts = ref<any[]>([])
  const subscriptions = ref<any[]>([])

  async function loadProfile() {
    const { data } = await api.get('/man/profile')
    profile.value = data.profile
    gallery.value = data.gallery || []
    interests.value = data.interests || []
  }

  async function saveProfile(payload: any) {
    await api.post('/man/profile', payload)
    await loadProfile()
  }

  async function addGallery(payload: any) {
    await api.post('/man/gallery', payload)
    await loadProfile()
  }

  async function setMainPhoto(id: string) {
    await api.post(`/man/gallery/${id}/main`)
    await loadProfile()
  }

  async function saveInterests(items: any[]) {
    await api.post('/man/interests', { items })
    await loadProfile()
  }

  async function discoverWomen() {
    const { data } = await api.get('/man/women')
    women.value = data.women || []
  }

  async function createRequest(payload: any) {
    await api.post('/man/requests', payload)
  }

  async function loadWoman(id: string) {
    const { data } = await api.get(`/man/women/${id}`)
    return data
  }

  async function subscribeGallery(galleryId: string) {
    const { data } = await api.post(`/man/galleries/${galleryId}/subscribe`)
    await loadSubscriptions()
    await loadAlerts()
    return data
  }

  async function loadSubscriptions() {
    const { data } = await api.get('/man/gallery-subscriptions')
    subscriptions.value = data.subscriptions || []
  }

  async function loadAlerts() {
    const { data } = await api.get('/man/alerts')
    alerts.value = data.alerts || []
  }

  async function markAlertRead(id: string) {
    await api.post(`/man/alerts/${id}/read`)
    await loadAlerts()
  }

  async function myRequests() {
    const { data } = await api.get('/man/requests')
    requests.value = data.requests || []
  }

  return { profile, gallery, interests, women, requests, alerts, subscriptions, loadProfile, saveProfile, addGallery, setMainPhoto, saveInterests, discoverWomen, createRequest, loadWoman, subscribeGallery, loadSubscriptions, loadAlerts, markAlertRead, myRequests }
})