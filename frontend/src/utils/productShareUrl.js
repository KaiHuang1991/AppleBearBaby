/**
 * Canonical HTTPS product URL for social sharing (Facebook reads OG from this URL).
 */
export function getSiteOrigin() {
  const fromEnv = import.meta.env.VITE_SITE_URL
  if (fromEnv && typeof fromEnv === 'string') {
    return fromEnv.replace(/\/$/, '')
  }
  if (typeof window !== 'undefined') {
    return window.location.origin.replace(/\/$/, '')
  }
  return ''
}

export function getProductShareUrl(product) {
  const id = product?._id
  if (!id) return ''
  const origin = getSiteOrigin()
  if (!origin) return ''
  return `${origin}/product/${id}`
}

export function buildFacebookShareUrl(productPageUrl) {
  if (!productPageUrl) return 'https://www.facebook.com/'
  // Standard link share: Facebook fetches og:image from productPageUrl and shows a link preview card.
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productPageUrl)}`
}
