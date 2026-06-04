/**
 * Google Ads global site tag (gtag.js).
 * Set VITE_GOOGLE_ADS_ID=AW-xxxxxxxx in frontend/.env or .env.production.
 */

const GOOGLE_ADS_ID = import.meta.env.VITE_GOOGLE_ADS_ID?.trim()
const PURCHASE_CONVERSION_LABEL = import.meta.env.VITE_GOOGLE_ADS_PURCHASE_CONVERSION?.trim()
/**
 * 提交潜在客户表单 — 必须与 Google Ads 后台标签完全一致（区分大小写）。
 * 不要依赖 VPS .env 覆盖；错误标签会导致 Tag Assistant 显示「未检测到」。
 */
const LEAD_CONVERSION_LABEL = 'PPkhCIXD7bYcEJ7rk74p'
const SIGNUP_CONVERSION_LABEL = import.meta.env.VITE_GOOGLE_ADS_SIGNUP_CONVERSION?.trim()
const PURCHASE_CURRENCY = import.meta.env.VITE_GOOGLE_ADS_CURRENCY?.trim() || 'USD'
/** 询盘时是否同时上报「购买」；默认 false，避免盖掉「提交潜在客户表单」的测试验收 */
const TRACK_PURCHASE_ON_INQUIRY =
  import.meta.env.VITE_GOOGLE_ADS_TRACK_PURCHASE_ON_INQUIRY === 'true'

let initialized = false

export function getGoogleAdsId() {
  return GOOGLE_ADS_ID || ''
}

/** Load gtag.js once (skipped when env id is empty). */
export function initGoogleAds() {
  if (!GOOGLE_ADS_ID || initialized || typeof window === 'undefined') return
  initialized = true

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', GOOGLE_ADS_ID)

  if (document.querySelector(`script[data-google-ads="${GOOGLE_ADS_ID}"]`)) return

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GOOGLE_ADS_ID)}`
  script.setAttribute('data-google-ads', GOOGLE_ADS_ID)
  document.head.appendChild(script)
}

/**
 * Fire a conversion event (e.g. after checkout).
 * @param {string} conversionLabel - from Google Ads → Goals → conversion action (suffix after AW- id)
 * @param {{ value?: number, currency?: string }} [options]
 */
export function trackGoogleAdsConversion(conversionLabel, options = {}) {
  if (!GOOGLE_ADS_ID || typeof window.gtag !== 'function' || !conversionLabel) return

  const sendTo = conversionLabel.includes('/')
    ? conversionLabel
    : `${GOOGLE_ADS_ID}/${conversionLabel}`

  window.gtag('event', 'conversion', {
    send_to: sendTo,
    ...options,
  })
}

/** Fire the configured “购买” conversion (e.g. after inquiry email is sent). */
export function trackGoogleAdsPurchase({ value, currency = PURCHASE_CURRENCY, transactionId } = {}) {
  if (!PURCHASE_CONVERSION_LABEL) return

  const payload = {
    value: typeof value === 'number' ? value : 1.0,
    currency,
  }
  if (transactionId) {
    payload.transaction_id = String(transactionId)
  }

  trackGoogleAdsConversion(PURCHASE_CONVERSION_LABEL, payload)
}

/** Fire the configured “提交潜在客户表单” conversion (inquiry form submit). */
export function trackGoogleAdsLeadForm({ transactionId } = {}) {
  if (!LEAD_CONVERSION_LABEL || !GOOGLE_ADS_ID) return

  const payload = {
    value: 1.0,
    currency: PURCHASE_CURRENCY,
    transaction_id: String(transactionId || `lead-${Date.now()}`),
  }

  // 显式 send_to，与 Google Ads 后台「提交潜在客户表单」代码段一致
  window.gtag('event', 'conversion', {
    send_to: `${GOOGLE_ADS_ID}/${LEAD_CONVERSION_LABEL}`,
    ...payload,
  })
}

/**
 * Inquiry form: fire lead + purchase after API success (Cart handleInquirySubmit).
 * Use separate transaction_id per action — same id can make Ads count only the first hit.
 */
export function trackInquiryFormConversions({ value, currency = PURCHASE_CURRENCY, transactionId } = {}) {
  const base = transactionId ? String(transactionId) : `guest-${Date.now()}`
  trackGoogleAdsLeadForm({ transactionId: `lead-${base}` })
  if (TRACK_PURCHASE_ON_INQUIRY) {
    trackGoogleAdsPurchase({ value, currency, transactionId: `purchase-${base}` })
  }
}

/** Fire the configured signup conversion (e.g. after user registers). */
export function trackGoogleAdsSignup({ transactionId } = {}) {
  if (!SIGNUP_CONVERSION_LABEL) return

  const payload = {
    value: 1.0,
    currency: PURCHASE_CURRENCY,
  }
  if (transactionId) {
    payload.transaction_id = String(transactionId)
  }

  trackGoogleAdsConversion(SIGNUP_CONVERSION_LABEL, payload)
}
