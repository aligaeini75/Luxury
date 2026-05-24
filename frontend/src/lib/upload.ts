import { api } from './api'

export type UploadKind = 'image' | 'audio' | 'video' | 'file'

export async function uploadFile(file: File, kind: UploadKind = 'image'): Promise<string> {
  if (!file) throw new Error('فایلی انتخاب نشده است.')

  const maxMb = kind === 'image' ? 8 : kind === 'audio' ? 35 : 80
  const maxBytes = maxMb * 1024 * 1024
  if (file.size > maxBytes) throw new Error(`حجم فایل نباید بیشتر از ${maxMb} مگابایت باشد.`)

  const form = new FormData()
  form.append('file', file)
  form.append('kind', kind)

  const { data } = await api.post('/uploads', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  if (!data?.url) throw new Error('آدرس فایل از سرور دریافت نشد.')
  return data.url
}

export async function uploadImage(file: File): Promise<string> {
  return uploadFile(file, 'image')
}
