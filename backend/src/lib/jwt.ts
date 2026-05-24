import { hmacSha256Hex } from './crypto'

function b64url(input: string) {
  return btoa(input).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

export async function signJwtHS256(secret: string, payload: Record<string, any>, ttlSeconds = 3600) {
  const now = Math.floor(Date.now() / 1000)
  const body = { iat: now, exp: now + ttlSeconds, ...payload }
  const header = { alg: 'HS256', typ: 'JWT' }
  const unsigned = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(body))}`
  const hex = await hmacSha256Hex(secret, unsigned)
  const bytes = new Uint8Array(hex.match(/.{1,2}/g)!.map(b => parseInt(b, 16)))
  let binary = ''
  bytes.forEach(b => binary += String.fromCharCode(b))
  return `${unsigned}.${btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')}`
}
