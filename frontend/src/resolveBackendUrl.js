function isLocalhostOrigin(url) {
  try {
    const withScheme = /^https?:\/\//i.test(url) ? url : `http://${url}`
    const host = new URL(withScheme).hostname
    return host === 'localhost' || host === '127.0.0.1'
  } catch {
    return /localhost|127\.0\.0\.1/i.test(url)
  }
}

/**
 * Axios baseURL for shop API. Paths in @applebear/api already start with /api/...
 * - Dev: VITE_BACKEND_URL or http://localhost:4000
 * - Prod: VITE_BACKEND_URL, or same-origin '' when unset / mistakenly set to localhost
 */
export function resolveBackendUrl() {
  const fromEnv = import.meta.env.VITE_BACKEND_URL?.trim()
  if (fromEnv) {
    const normalized = fromEnv.replace(/\/+$/, '')
    if (import.meta.env.PROD && isLocalhostOrigin(normalized)) {
      return ''
    }
    return normalized
  }

  if (import.meta.env.PROD) {
    return ''
  }

  return 'http://localhost:4000'
}
