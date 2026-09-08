import { getProductPath } from './productPath.js'

/**
 * Prefer VITE_SITE_URL for SEO/social; fall back to window origin for local share UI.
 */
export function getSiteOrigin({ allowLocalhost = true } = {}) {
  const fromEnv = import.meta.env.VITE_SITE_URL
  if (fromEnv && typeof fromEnv === 'string' && fromEnv.trim()) {
    return fromEnv.replace(/\/$/, '')
  }
  if (typeof window !== 'undefined') {
    const origin = window.location.origin.replace(/\/$/, '')
    if (
      !allowLocalhost &&
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)
    ) {
      return ''
    }
    return origin
  }
  return ''
}

/** Absolute product URL for share buttons (may be localhost in local dev). */
export function getProductShareUrl(product) {
  const path = getProductPath(product)
  if (!path || path === '/collection') return ''
  const origin = getSiteOrigin({ allowLocalhost: true })
  if (!origin) return ''
  return `${origin}${path}`
}

/**
 * Canonical URL for Helmet. Empty on localhost without VITE_SITE_URL
 * so the server-injected production canonical is not overwritten.
 */
export function getProductCanonicalUrl(product) {
  const path = getProductPath(product)
  if (!path || path === '/collection') return ''
  const origin = getSiteOrigin({ allowLocalhost: false })
  if (!origin) return ''
  return `${origin}${path}`
}

export function buildFacebookShareUrl(productPageUrl) {
  if (!productPageUrl) return 'https://www.facebook.com/'
  // Standard link share: Facebook fetches og:image from productPageUrl and shows a link preview card.
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productPageUrl)}`
}
