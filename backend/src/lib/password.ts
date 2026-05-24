const ITERATIONS = 100000

function toHex(bytes: Uint8Array) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

function fromHex(hex: string) {
  const matches = String(hex || '').match(/.{1,2}/g) || []
  return new Uint8Array(matches.map(byte => parseInt(byte, 16)))
}

export async function hashPassword(raw: string) {
  const enc = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const key = await crypto.subtle.importKey('raw', enc.encode(raw), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' }, key, 256)
  return `pbkdf2:${ITERATIONS}:${toHex(salt)}:${toHex(new Uint8Array(bits))}`
}

export async function verifyPassword(raw: string, stored: string) {
  if (!raw || !stored) return false
  const parts = String(stored).split(':')
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false
  const iterations = Math.min(Number(parts[1]) || ITERATIONS, 100000)
  const salt = fromHex(parts[2])
  const expected = parts[3]
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', enc.encode(raw), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, key, 256)
  return toHex(new Uint8Array(bits)) === expected
}
