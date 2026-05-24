import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export const useToastStore = defineStore('toast', () => {
  const items = ref<Array<{ id: string; type: ToastType; title: string; body?: string }>>([])

  function push(type: ToastType, title: string, body = '') {
    const id = crypto.randomUUID()
    items.value.push({ id, type, title, body })
    window.setTimeout(() => remove(id), 4200)
  }

  function success(title: string, body = '') { push('success', title, body) }
  function error(title: string, body = '') { push('error', title, body) }
  function info(title: string, body = '') { push('info', title, body) }
  function warning(title: string, body = '') { push('warning', title, body) }
  function remove(id: string) { items.value = items.value.filter(x => x.id !== id) }

  return { items, push, success, error, info, warning, remove }
})
