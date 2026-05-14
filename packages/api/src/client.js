import axios from 'axios'

/**
 * @param {object} options
 * @param {string} options.baseURL - Origin only, e.g. https://api.example.com (paths start with /api/...)
 * @param {() => string | undefined} [options.getToken] - Return session token for `token` header (native clients)
 * @param {boolean} [options.withCredentials=true] - Send cookies (browser + same-site)
 */
export function createHttpClient({ baseURL, getToken, withCredentials = true }) {
  const client = axios.create({
    baseURL,
    withCredentials,
  })

  client.interceptors.request.use((config) => {
    const t = getToken?.()
    if (typeof t === 'string' && t) {
      config.headers = config.headers || {}
      config.headers.token = t
    }
    return config
  })

  return client
}
