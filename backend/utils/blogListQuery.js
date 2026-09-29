const LIST_CACHE_TTL_MS = Number(process.env.BLOG_LIST_CACHE_MS) || 60_000
const listCache = new Map()

/** Card/list payloads never need article HTML (including translated bodies). */
export const BLOG_LIST_SELECT = [
  '-content',
  '-translations.zh.content',
  '-translations.es.content',
  '-translations.ar.content',
  '-translations.fr.content',
].join(' ')

export function invalidateBlogListCache() {
  listCache.clear()
}

export function getBlogListCache(key) {
  const hit = listCache.get(key)
  if (!hit) return null
  if (Date.now() - hit.at > LIST_CACHE_TTL_MS) {
    listCache.delete(key)
    return null
  }
  return hit.payload
}

export function setBlogListCache(key, payload) {
  listCache.set(key, { at: Date.now(), payload })
}

export function blogListCacheKey({ scope = 'public', category = '', search = '', page, limit }) {
  return JSON.stringify({ scope, category, search, page, limit })
}
