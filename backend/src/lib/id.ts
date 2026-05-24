export function id(prefix = 'id') {
  return `${prefix}_${crypto.randomUUID().replaceAll('-', '')}`
}
export function now() {
  return new Date().toISOString()
}
