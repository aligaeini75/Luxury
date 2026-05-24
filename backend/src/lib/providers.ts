
export async function createNowPaymentsInvoice(env: any, input: { price_amount: number; order_id: string; order_description: string }) {
  const apiKey = env.NOWPAYMENTS_API_KEY
  const appUrl = String(env.APP_URL || 'https://luxora.example').replace(/\/$/, '')
  if (!apiKey) {
    return {
      provider: 'demo',
      provider_payment_id: `demo_${crypto.randomUUID()}`,
      provider_payment_url: `${appUrl}/#/wallet?demo_payment=${input.order_id}`,
      pay_address: env.USDT_DEPOSIT_ADDRESS || 'TRON_DEMO_USDT_ADDRESS_SET_ENV',
      status: 'waiting'
    }
  }

  const payload = {
    price_amount: Number(input.price_amount),
    price_currency: 'usd',
    pay_currency: 'usdttrc20',
    order_id: input.order_id,
    order_description: input.order_description,
    ipn_callback_url: `${appUrl}/api/payments/nowpayments/ipn`,
    success_url: `${appUrl}/#/wallet?payment=success`,
    cancel_url: `${appUrl}/#/wallet?payment=cancelled`
  }

  const res = await fetch('https://api.nowpayments.io/v1/invoice', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  const data: any = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.message || data?.error || 'NOWPayments invoice failed')
  return {
    provider: 'nowpayments',
    provider_payment_id: String(data.id || data.invoice_id || ''),
    provider_payment_url: String(data.invoice_url || data.pay_url || ''),
    pay_address: String(data.pay_address || ''),
    status: 'waiting'
  }
}
