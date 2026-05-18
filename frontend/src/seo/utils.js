import { SITE } from './config'

export function stripHtml(html = '') {
  return String(html || '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function truncate(text = '', max = 160) {
  const s = String(text || '').trim()
  if (s.length <= max) return s
  return `${s.slice(0, max - 1).trim()}…`
}

export function toAbsoluteUrl(path = '') {
  if (!path) return ''
  try {
    return new URL(path).toString()
  } catch {
    if (typeof window === 'undefined') return path
    const base = window.location.origin
    if (path.startsWith('/')) return `${base}${path}`
    return `${base}/${path}`
  }
}

export function getCanonicalUrl(override) {
  if (override) return override
  if (typeof window !== 'undefined') return window.location.href
  return ''
}

export function formatPageTitle(title, { includeBrand = true } = {}) {
  if (!title) return SITE.name
  if (!includeBrand) return title
  if (title.includes(SITE.name)) return title
  return `${title} | ${SITE.name}`
}
