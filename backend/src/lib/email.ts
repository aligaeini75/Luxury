import type { Env } from '../index'

type EmailButton = { label: string; url: string }

type EmailOptions = {
  to: string
  subject: string
  preheader?: string
  badge?: string
  title: string
  body: string
  button?: EmailButton
  code?: string
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function appUrl(env: Env) {
  return String(env.APP_URL || 'https://luxora.app').replace(/\/$/, '')
}

function fromAddress(env: Env) {
  return String(env.EMAIL_FROM || 'Luxora <noreply@luxora.app>')
}

export function luxEmailHtml(env: Env, options: EmailOptions) {
  const brandUrl = appUrl(env)
  const safeTitle = escapeHtml(options.title)
  const safeBody = escapeHtml(options.body).replace(/\n/g, '<br />')
  const preheader = escapeHtml(options.preheader || options.subject)
  const badge = escapeHtml(options.badge || 'LUXORA PRIVATE ACCESS')
  const code = options.code ? escapeHtml(options.code) : ''
  const button = options.button
  return `<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(options.subject)}</title>
</head>
<body style="margin:0;background:#020100;color:#fff;font-family:Tahoma,Arial,sans-serif;direction:rtl;text-align:right;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:radial-gradient(circle at 85% 0%,rgba(214,173,82,.28),transparent 34%),linear-gradient(180deg,#020100,#080502 55%,#020100);padding:34px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;border:1px solid rgba(214,173,82,.28);border-radius:34px;overflow:hidden;background:linear-gradient(145deg,rgba(255,255,255,.075),rgba(255,255,255,.018));box-shadow:0 30px 110px rgba(214,173,82,.16);">
          <tr>
            <td style="padding:0;">
              <div style="min-height:190px;background:radial-gradient(circle at 50% 0%,rgba(255,240,189,.32),transparent 32%),linear-gradient(135deg,rgba(214,173,82,.32),rgba(0,0,0,.82));padding:34px 34px 30px;">
                <div style="display:inline-block;border:1px solid rgba(255,240,189,.28);border-radius:999px;background:rgba(0,0,0,.36);padding:10px 16px;color:#fff0bd;font-size:12px;font-weight:900;letter-spacing:.12em;">${badge}</div>
                <h1 style="margin:28px 0 0;color:#fff0bd;font-size:34px;line-height:1.25;font-weight:900;">${safeTitle}</h1>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:34px;">
              <p style="margin:0;color:#d8c99d;font-size:17px;line-height:2;">${safeBody}</p>
              ${code ? `<div style="margin:30px 0;padding:24px;border:1px solid rgba(214,173,82,.35);border-radius:26px;background:rgba(214,173,82,.10);text-align:center;"><div style="color:#b9aa80;font-size:13px;font-weight:700;">کد تایید شما</div><div style="direction:ltr;letter-spacing:.38em;margin-top:10px;color:#fff0bd;font-size:42px;font-weight:900;">${code}</div><div style="margin-top:10px;color:#9d8d68;font-size:12px;">این کد تا ۱۵ دقیقه معتبر است.</div></div>` : ''}
              ${button ? `<a href="${escapeHtml(button.url)}" style="display:inline-block;margin-top:26px;text-decoration:none;background:linear-gradient(90deg,#d6ad52,#fff0bd,#d6ad52);color:#080502;padding:15px 24px;border-radius:999px;font-weight:900;font-size:15px;">${escapeHtml(button.label)}</a>` : ''}
              <div style="margin-top:34px;padding-top:22px;border-top:1px solid rgba(255,255,255,.08);color:#8f805f;font-size:12px;line-height:1.8;">این پیام به صورت خودکار از Luxora ارسال شده است. اگر این درخواست را شما انجام نداده‌اید، وارد حساب خود نشوید و پیام را نادیده بگیرید.</div>
            </td>
          </tr>
        </table>
        <div style="margin-top:18px;color:#6f6246;font-size:12px;">Luxora · Private booking platform · ${escapeHtml(brandUrl)}</div>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function sendLuxEmail(env: Env, options: EmailOptions) {
  if (!options.to) return { ok: false, skipped: true, reason: 'missing recipient' }
  const html = luxEmailHtml(env, options)
  const resendKey = env.RESEND_API_KEY
  if (!resendKey) {
    console.log('EMAIL_SKIPPED_NO_RESEND_KEY', { to: options.to, subject: options.subject })
    return { ok: false, skipped: true, reason: 'RESEND_API_KEY missing' }
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: fromAddress(env), to: [options.to], subject: options.subject, html })
  })
  if (!res.ok) console.error('EMAIL_SEND_FAILED', res.status, await res.text().catch(() => ''))
  return { ok: res.ok, status: res.status }
}

export async function sendVerificationEmail(env: Env, email: string, code: string) {
  return sendLuxEmail(env, {
    to: email,
    subject: 'کد تایید عضویت Luxora',
    preheader: `کد تایید شما: ${code}`,
    badge: 'EMAIL VERIFICATION',
    title: 'ورود به لانژ خصوصی Luxora',
    body: 'برای کامل شدن ثبت‌نام، کد زیر را در صفحه تایید ایمیل وارد کن. تا قبل از تایید ایمیل، حساب فعال نمی‌شود و ورود کامل انجام نمی‌شود.',
    code,
    button: { label: 'بازگشت به Luxora', url: `${appUrl(env)}/#/register` }
  })
}

export async function sendCriticalEmail(env: Env, to: string, subject: string, title: string, body: string, url?: string) {
  return sendLuxEmail(env, {
    to,
    subject,
    preheader: body,
    badge: 'CRITICAL LUXORA ALERT',
    title,
    body,
    button: url ? { label: 'مشاهده در Luxora', url: `${appUrl(env)}${url}` } : undefined
  })
}
