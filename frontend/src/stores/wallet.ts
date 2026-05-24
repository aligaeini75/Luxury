import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../lib/api'

export const useWalletStore = defineStore('wallet', () => {
  const wallet = ref<any>({ balance: 0, locked_balance: 0 })
  const transactions = ref<any[]>([])
  const deposits = ref<any[]>([])
  const withdrawals = ref<any[]>([])
  const escrows = ref<any[]>([])
  const lastDeposit = ref<any>(null)

  async function load() {
    const { data } = await api.get('/wallet/me')
    wallet.value = data.wallet
    transactions.value = data.transactions || []
    deposits.value = data.deposits || []
    withdrawals.value = data.withdrawals || []
    escrows.value = data.escrows || []
  }
  async function createDeposit(amount: number, gateway = 'iran_bank') {
    const { data } = await api.post('/wallet/deposits', { amount, gateway, method: 'iran_bank' })
    lastDeposit.value = data
    await load()
    return data
  }
  async function requestWithdrawal(amount: number, card_number: string, card_holder = '') {
    await api.post('/wallet/withdrawals', { amount, card_number, card_holder, payout_address: card_number })
    await load()
  }
  async function createEscrow(payload: any) { await api.post('/wallet/escrows', payload); await load() }

  return { wallet, transactions, deposits, withdrawals, escrows, lastDeposit, load, createDeposit, requestWithdrawal, createEscrow }
})