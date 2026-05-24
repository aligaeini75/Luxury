import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../lib/api'

export const useChatStore = defineStore('chat', () => {
  const rooms = ref<any[]>([])
  const activeRoom = ref<any>(null)
  const messages = ref<any[]>([])
  const unreadTotal = computed(() => rooms.value.reduce((s, r) => s + Number(r.unread_count || 0), 0))

  async function loadRooms() {
    const { data } = await api.get('/chat/rooms')
    rooms.value = data.rooms || []
    if (!activeRoom.value && rooms.value[0]) await openRoom(rooms.value[0].id)
  }

  async function openRoom(id: string) {
    const { data } = await api.get(`/chat/rooms/${id}`)
    activeRoom.value = data.room
    messages.value = data.messages || []
    await api.post(`/chat/rooms/${id}/read`)
  }

  async function sendMessage(body: string, type = 'text') {
    if (!activeRoom.value || !body.trim()) return
    const { data } = await api.post(`/chat/rooms/${activeRoom.value.id}/messages`, { body, type })
    messages.value.push(data.message)
    await loadRooms()
  }

  return { rooms, activeRoom, messages, unreadTotal, loadRooms, openRoom, sendMessage }
})