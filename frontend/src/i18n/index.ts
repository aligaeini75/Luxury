import { fa } from './fa'
function getByPath(obj: any, path: string): string | undefined { return path.split('.').reduce((acc, key) => acc?.[key], obj) }
export function t(path: string, fallback?: string): string { return getByPath(fa, path) ?? fallback ?? path }
export function statusLabel(status?: string | null): string { if (!status) return 'نامشخص'; return getByPath((fa as any).statuses, status) ?? status.replaceAll('_', ' ') }
export function bookingTypeLabel(type?: string | null): string { if (!type) return 'نامشخص'; return getByPath((fa as any).bookingTypes, type) ?? type.replaceAll('_', ' ') }
export function roleLabel(role?: string | null): string { if (!role) return 'کاربر'; return getByPath((fa as any).roles, role) ?? role }
export function money(value?: number | string | null, currency = '$'): string { if (value === undefined || value === null || value === '') return '-'; const n = Number(value); return Number.isNaN(n) ? `${value} ${currency}` : `${new Intl.NumberFormat('fa-IR').format(n)} ${currency}` }
export function faDate(value?: string | number | Date | null): string { if (!value) return '-'; try { return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) } catch { return String(value) } }