type EmailEnv = Record<string, any>

type EmailOptions = {
  to: string
  subject: string
  title: string
  body: string
  code?: string
  url?: string
  eyebrow?: string
  actionLabel?: string
}

const FONT_STACK = `Vazirmatn, Dana, IRANSansX, IRANSans, Shabnam, Tahoma, Arial, sans-serif`

function esc(v: unknown) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function appUrl(env: EmailEnv) {
  return String(env.APP_URL || 'https://luxora.app').replace(/\/$/, '')
}

function sender(env: EmailEnv) {
  return env.EMAIL_FROM_VERIFIED === '1' && env.EMAIL_FROM
    ? String(env.EMAIL_FROM)
    : 'Luxora <onboarding@resend.dev>'
}

function resendKey(env: EmailEnv) {
  return env.RESEND_API_KEY || env.RESEND_KEY || env.RESEND_TOKEN || env.RESEND_API_TOKEN || ''
}

function html(env: EmailEnv, o: EmailOptions) {
  const base = appUrl(env)
  const logo = `${base}/luxora-logo.svg`
  const fontCss = `
    @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;700;800;900&display=swap');
    body, table, td, p, a, h1, h2, h3, div, span { font-family: ${FONT_STACK} !important; }
    .lux-text { font-family: ${FONT_STACK} !important; letter-spacing: -0.01em; }
    .lux-latin { font-family: Georgia, 'Times New Roman', serif !important; }
  `

  const code = o.code ? `<div class="lux-text" style="margin:30px 0;padding:24px;border:1px solid rgba(214,173,82,.42);border-radius:28px;background:linear-gradient(135deg,rgba(214,173,82,.15),rgba(255,255,255,.035));text-align:center">
    <div style="color:#b9aa80;font-size:13px;font-weight:900">کد تایید اختصاصی</div>
    <div style="direction:ltr;letter-spacing:.34em;margin-top:10px;color:#fff0bd;font-size:44px;font-weight:900;font-family:Arial,sans-serif !important">${esc(o.code)}</div>
    <div style="margin-top:10px;color:#8f805f;font-size:12px;font-weight:700">اعتبار: ۱۵ دقیقه</div>
  </div>` : ''

  const btn = o.url ? `<a class="lux-text" href="${esc(base + o.url)}" style="display:inline-block;margin-top:26px;padding:15px 24px;border-radius:999px;background:linear-gradient(90deg,#d6ad52,#fff0bd,#d6ad52);color:#080502;text-decoration:none;font-weight:900;font-size:15px;box-shadow:0 14px 38px rgba(214,173,82,.22)">${esc(o.actionLabel || 'مشاهده در Luxora')}</a>` : ''

  return `<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <style>${fontCss}</style>
</head>
<body class="lux-text" style="margin:0;background:#020100;color:#fff;font-family:${FONT_STACK};direction:rtl;text-align:right;-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:36px 12px;background:radial-gradient(circle at 85% 0%,rgba(214,173,82,.26),transparent 34%),radial-gradient(circle at 0% 90%,rgba(255,240,189,.10),transparent 30%),linear-gradient(180deg,#020100,#080502 58%,#020100)">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:720px;border:1px solid rgba(214,173,82,.30);border-radius:36px;overflow:hidden;background:linear-gradient(145deg,rgba(255,255,255,.075),rgba(255,255,255,.018));box-shadow:0 34px 120px rgba(214,173,82,.14)">
          <tr>
            <td style="padding:34px;background:linear-gradient(135deg,rgba(214,173,82,.32),rgba(0,0,0,.88))">
              <div style="direction:ltr;text-align:left">
                <img src="${esc(logo)}" alt="Luxora" width="76" style="display:block;width:76px;height:76px;border-radius:20px;margin:0 0 16px 0;object-fit:contain;border:1px solid rgba(255,240,189,.22)" />
              </div>
              <div class="lux-latin" style="direction:ltr;text-align:left;color:#fff0bd;font-size:30px;font-weight:900;letter-spacing:.22em">LUXORA</div>
              <div style="margin-top:6px;color:#a99769;font-size:11px;font-weight:900;letter-spacing:.18em;direction:ltr;text-align:left;font-family:Arial,sans-serif !important">PRIVATE ACCESS</div>
              <div class="lux-text" style="display:inline-block;margin-top:28px;border:1px solid rgba(255,240,189,.28);border-radius:999px;padding:9px 14px;color:#fff0bd;font-size:12px;font-weight:900;background:rgba(0,0,0,.28)">${esc(o.eyebrow || 'LUXORA NOTICE')}</div>
              <h1 class="lux-text" style="margin:22px 0 0;color:#fff0bd;font-size:34px;line-height:1.45;font-weight:900;letter-spacing:-.025em">${esc(o.title)}</h1>
            </td>
          </tr>
          <tr>
            <td class="lux-text" style="padding:34px">
              <p style="margin:0;color:#d8c99d;font-size:17px;line-height:2.12;font-weight:500;letter-spacing:-.015em">${esc(o.body).replace(/\n/g, '<br>')}</p>
              ${code}
              ${btn}
              <div class="lux-text" style="margin-top:34px;padding:18px;border:1px solid rgba(255,255,255,.075);border-radius:22px;background:rgba(255,255,255,.035);color:#8f805f;font-size:12px;line-height:1.95;font-weight:600">
                این پیام به صورت خودکار از Luxora ارسال شده است. اگر این فعالیت را شما انجام نداده‌اید، وارد حساب خود شوید و وضعیت امنیتی حساب را بررسی کنید.
              </div>
            </td>
          </tr>
        </table>
        <div style="margin-top:18px;color:#6f6246;font-size:12px;direction:ltr;font-family:Arial,sans-serif">Luxora · Private booking platform</div>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function sendLuxEmail(env: EmailEnv, o: EmailOptions) {
  if (!o.to) return { ok: false, skipped: true, reason: 'missing_recipient' }
  const key = resendKey(env)
  if (!key) {
    console.log('EMAIL_SKIPPED_NO_RESEND_KEY', { to: o.to, subject: o.subject })
    return { ok: false, skipped: true, reason: 'RESEND_API_KEY_missing' }
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: sender(env), to: [o.to], subject: o.subject, html: html(env, o) })
  })
  const reason = await res.text().catch(() => '')
  if (!res.ok) console.error('EMAIL_SEND_FAILED', res.status, reason)
  return { ok: res.ok, status: res.status, reason }
}

export async function sendVerificationEmail(env: EmailEnv, email: string, code: string) {
  return sendLuxEmail(env, { to: email, subject: 'کد تایید عضویت Luxora', eyebrow: 'EMAIL VERIFICATION', title: 'تایید ایمیل برای ورود به Luxora', body: 'برای کامل شدن ثبت‌نام، کد زیر را در صفحه تایید ایمیل وارد کن. این کد تا ۱۵ دقیقه معتبر است.', code })
}

export async function sendCriticalEmail(env: EmailEnv, to: string, subject: string, title: string, body: string, url?: string) {
  return sendLuxEmail(env, { to, subject, title, body, url, eyebrow: 'CRITICAL ACCOUNT NOTICE' })
}

export async function sendBookingEmail(env: EmailEnv, to: string, event: 'created' | 'accepted' | 'rejected' | 'call_ready' | 'early_request' | 'early_accepted' | 'early_rejected', data: Record<string, any>) {
  const map: Record<string, { subject: string; title: string; eyebrow: string; actionLabel: string; url: string }> = {
    created: { subject: 'رزرو جدید در Luxora', title: 'یک درخواست رزرو جدید داری', eyebrow: 'NEW BOOKING REQUEST', actionLabel: 'مشاهده درخواست', url: '/#/woman/requests' },
    accepted: { subject: 'رزرو شما تایید شد', title: 'رزرو تایید شد', eyebrow: 'BOOKING ACCEPTED', actionLabel: 'ورود به جزئیات رزرو', url: '/#/man/requests' },
    rejected: { subject: 'رزرو شما رد شد', title: 'رزرو رد شد', eyebrow: 'BOOKING REJECTED', actionLabel: 'مشاهده درخواست‌ها', url: '/#/man/requests' },
    call_ready: { subject: 'لینک ورود به کال آماده است', title: 'اتاق ویدیوکال آماده شد', eyebrow: 'VIDEO CALL READY', actionLabel: 'ورود به کال', url: data.call_url || '/#/man/requests' },
    early_request: { subject: 'درخواست پذیرش زودتر', title: 'یک درخواست فوری برای بررسی داری', eyebrow: 'EARLY ACCEPT REQUEST', actionLabel: 'بررسی درخواست', url: '/#/woman/requests' },
    early_accepted: { subject: 'درخواست زودتر پذیرفته شد', title: 'درخواست زودتر تایید شد', eyebrow: 'EARLY REQUEST ACCEPTED', actionLabel: 'مشاهده رزرو', url: '/#/man/requests' },
    early_rejected: { subject: 'درخواست زودتر رد شد', title: 'درخواست زودتر پذیرفته نشد', eyebrow: 'EARLY REQUEST REJECTED', actionLabel: 'مشاهده رزرو', url: '/#/man/requests' },
  }
  const m = map[event]
  const body = `نوع: ${data.type || 'booking'}\nتاریخ: ${data.date || '-'}\nساعت: ${data.time || '-'}\nمبلغ: ${data.amount || 0}\n${data.note || ''}`
  return sendLuxEmail(env, { to, subject: m.subject, title: m.title, body, url: m.url, eyebrow: m.eyebrow, actionLabel: m.actionLabel })
}
