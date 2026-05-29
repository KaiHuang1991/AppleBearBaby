/**
 * Google Ads global site tag (gtag.js).
 * Set VITE_GOOGLE_ADS_ID=AW-xxxxxxxx in frontend/.env or .env.production.
 */

const GOOGLE_ADS_ID = import.meta.env.VITE_GOOGLE_ADS_ID?.trim()
const PURCHASE_CONVERSION_LABEL = import.meta.env.VITE_GOOGLE_ADS_PURCHASE_CONVERSION?.trim()
const SIGNUP_CONVERSION_LABEL = import.meta.env.VITE_GOOGLE_ADS_SIGNUP_CONVERSION?.trim()
const PURCHASE_CURRENCY = import.meta.env.VITE_GOOGLE_ADS_CURRENCY?.trim() || 'SGD'

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
