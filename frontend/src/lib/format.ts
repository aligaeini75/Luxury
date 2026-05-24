export function faDate(value?: string | null) {
  if (!value) return 'تاریخ نامشخص'
  const d = new Date(String(value).includes('T') ? String(value) : `${value}T00:00:00`)
  if (Number.isNaN(d.getTime())) return String(value)
  return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

export function faDateShort(value?: string | null) {
  if (!value) return 'نامشخص'
  const d = new Date(String(value).includes('T') ? String(value) : `${value}T00:00:00`)
  if (Number.isNaN(d.getTime())) return String(value)
  return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    month: 'short',
    day: 'numeric',
  }).format(d)
}

export function faTimeRange(start?: string | null, end?: string | null) {
  if (!start && !end) return 'زمان نامشخص'
  if (start && end) return `${start} تا ${end}`
  return start || end || 'زمان نامشخص'
}

export function money(value: any) {
  const n = Number(value || 0)
  return new Intl.NumberFormat('fa-IR').format(n)
}
