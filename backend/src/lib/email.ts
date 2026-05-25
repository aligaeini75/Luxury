type EmailEnv = Record<string, any>

type EmailOptions = {
  to: string
  subject: string
  title: string
  body: string
  code?: string
  url?: string
}

function esc(v: unknown) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function appUrl(env: EmailEnv) {
  return String(env.APP_URL || 'https://luxora.app').replace(/\/$/, '')
}

function html(env: EmailEnv, o: EmailOptions) {
  const code = o.code ? `<div style="margin:28px 0;padding:22px;border:1px solid rgba(214,173,82,.35);border-radius:24px;background:rgba(214,173,82,.10);text-align:center"><div style="color:#b9aa80;font-size:13px">کد تایید</div><div style="direction:ltr;letter-spacing:.32em;color:#fff0bd;font-size:40px;font-weight:900">${esc(o.code)}</div></div>` : ''
  const btn = o.url ? `<a href="${esc(appUrl(env) + o.url)}" style="display:inline-block;margin-top:24px;padding:14px 22px;border-radius:999px;background:linear-gradient(90deg,#d6ad52,#fff0bd,#d6ad52);color:#080502;text-decoration:none;font-weight:900">مشاهده در Luxora</a>` : ''
  return `<!doctype html><html lang="fa" dir="rtl"><body style="margin:0;background:#020100;color:#fff;font-family:Tahoma,Arial,sans-serif;direction:rtl;text-align:right"><table width="100%" cellpadding="0" cellspacing="0" style="padding:34px 12px;background:linear-gradient(180deg,#020100,#080502)"><tr><td align="center"><table width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;border:1px solid rgba(214,173,82,.28);border-radius:34px;overflow:hidden;background:#090603"><tr><td style="padding:34px;background:linear-gradient(135deg,rgba(214,173,82,.34),rgba(0,0,0,.84))"><div style="display:inline-block;border:1px solid rgba(255,240,189,.28);border-radius:999px;padding:9px 14px;color:#fff0bd;font-size:12px;font-weight:900">LUXORA PRIVATE ACCESS</div><h1 style="margin:24px 0 0;color:#fff0bd;font-size:32px;line-height:1.3">${esc(o.title)}</h1></td></tr><tr><td style="padding:34px"><p style="margin:0;color:#d8c99d;font-size:17px;line-height:2">${esc(o.body).replace(/\n/g, '<br>')}</p>${code}${btn}<div style="margin-top:30px;padding-top:18px;border-top:1px solid rgba(255,255,255,.08);color:#8f805f;font-size:12px">این پیام به صورت خودکار از Luxora ارسال شده است.</div></td></tr></table></td></tr></table></body></html>`
}

export async function sendLuxEmail(env: EmailEnv, o: EmailOptions) {
  if (!o.to) return { ok: false, skipped: true, reason: 'missing_recipient' }
  if (!env.RESEND_API_KEY) {
    console.log('EMAIL_SKIPPED_NO_RESEND_KEY', { to: o.to, subject: o.subject })
    return { ok: false, skipped: true, reason: 'RESEND_API_KEY_missing' }
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.EMAIL_FROM || 'Luxora <onboarding@resend.dev>', to: [o.to], subject: o.subject, html: html(env, o) })
  })
  const reason = await res.text().catch(() => '')
  if (!res.ok) console.error('EMAIL_SEND_FAILED', res.status, reason)
  return { ok: res.ok, status: res.status, reason }
}

export async function sendVerificationEmail(env: EmailEnv, email: string, code: string) {
  return sendLuxEmail(env, { to: email, subject: 'کد تایید عضویت Luxora', title: 'تایید ایمیل برای ورود به Luxora', body: 'برای کامل شدن ثبت‌نام، کد زیر را در صفحه تایید ایمیل وارد کن. این کد تا ۱۵ دقیقه معتبر است.', code })
}

export async function sendCriticalEmail(env: EmailEnv, to: string, subject: string, title: string, body: string, url?: string) {
  return sendLuxEmail(env, { to, subject, title, body, url })
}
