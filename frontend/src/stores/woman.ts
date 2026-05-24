import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../lib/api'

export const useWomanStore = defineStore('woman', () => {
  const profile = ref<any>(null)
  const services = ref<any[]>([])
  const locations = ref<any[]>([])
  const availability = ref<any[]>([])
  const requests = ref<any[]>([])
  const gallery = ref<any[]>([])
  const wallet = ref<any>({ balance: 0, locked_balance: 0, transactions: [], withdrawals: [] })

  async function studio() {
    const { data } = await api.get('/woman/studio')
    profile.value = data.profile
    services.value = data.services || []
    locations.value = data.locations || []
    availability.value = data.availability || []
    requests.value = data.requests || []
    gallery.value = data.gallery || []
    wallet.value = data.wallet || wallet.value
  }

  async function savePricing(payload: any) { await api.post('/woman/pricing', payload); await studio() }
  async function addAvailability(payload: any) { await api.post('/woman/availability', payload); await studio() }
  async function updateAvailability(id: string, payload: any) { await api.patch(`/woman/availability/${id}`, payload); await studio() }
  async function deleteAvailability(id: string) { await api.delete(`/woman/availability/${id}`); await studio() }
  async function addService(payload: any) { await api.post('/woman/services', payload); await studio() }
  async function addLocation(payload: any) { await api.post('/woman/locations', payload); await studio() }
  async function addGalleryAlbum(payload: any) { const { data } = await api.post('/woman/galleries', payload); await studio(); return data }
  async function addGallery(payload: any) { return addGalleryAlbum({ title: payload.title, price: payload.price, cover_url: payload.url || payload.cover_url }) }
  async function addGalleryMedia(galleryId: string, payload: any) { await api.post(`/woman/galleries/${galleryId}/media`, payload); await studio() }
  async function respondRequest(id: string, action: string, counterAmount?: number) { await api.post(`/woman/requests/${id}/respond`, { action, counterAmount }); await studio() }

  return { profile, services, locations, availability, requests, gallery, wallet, studio, savePricing, addAvailability, updateAvailability, deleteAvailability, addService, addLocation, addGallery, addGalleryAlbum, addGalleryMedia, respondRequest }
})