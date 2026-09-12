function isLocalhostOrigin(url) {
  try {
    const withScheme = /^https?:\/\//i.test(url) ? url : `http://${url}`
    const host = new URL(withScheme).hostname
    return host === 'localhost' || host === '127.0.0.1'
  } catch {
    return /localhost|127\.0\.0\.1/i.test(url)
  }
}

const PRODUCTION_STORE = 'https://applebearbaby.net'

/**
 * Storefront origin for admin "View on site" links.
 * - Dev: VITE_STORE_URL / VITE_FRONTEND_URL, or http://localhost:5173
 * - Prod: env value, or https://applebearbaby.net (never localhost)
 */
export function resolveStoreUrl() {
  const fromEnv = (import.meta.env.VITE_STORE_URL || import.meta.env.VITE_FRONTEND_URL)?.trim()
  if (fromEnv) {
    const normalized = fromEnv.replace(/\/+$/, '')
    if (import.meta.env.PROD && isLocalhostOrigin(normalized)) {
      return PRODUCTION_STORE
    }
    return normalized
  }

  if (import.meta.env.PROD) {
    return PRODUCTION_STORE
  }

  return 'http://localhost:5173'
}

export const storeUrl = resolveStoreUrl()
