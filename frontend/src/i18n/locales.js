export const DEFAULT_LOCALE = 'en'
export const PREFIX_LOCALES = ['zh', 'es', 'ar', 'fr']
export const SUPPORTED_LOCALES = [DEFAULT_LOCALE, ...PREFIX_LOCALES]
export const LOCALE_STORAGE_KEY = 'abb-locale'

export const LOCALE_META = {
  en: { htmlLang: 'en', dir: 'ltr', ogLocale: 'en_US', hreflang: 'en', label: 'EN', native: 'English', dateLocale: 'en-US' },
  zh: { htmlLang: 'zh-Hans', dir: 'ltr', ogLocale: 'zh_CN', hreflang: 'zh-Hans', label: '中文', native: '中文', dateLocale: 'zh-CN' },
  es: { htmlLang: 'es', dir: 'ltr', ogLocale: 'es_ES', hreflang: 'es', label: 'ES', native: 'Español', dateLocale: 'es-ES' },
  ar: { htmlLang: 'ar', dir: 'rtl', ogLocale: 'ar_SA', hreflang: 'ar', label: 'AR', native: 'العربية', dateLocale: 'ar-SA' },
  fr: { htmlLang: 'fr', dir: 'ltr', ogLocale: 'fr_FR', hreflang: 'fr', label: 'FR', native: 'Français', dateLocale: 'fr-FR' },
}

let currentLocale = DEFAULT_LOCALE

export function isSupportedLocale(value) {
  return SUPPORTED_LOCALES.includes(String(value || ''))
}

export function normalizeLocale(value) {
  const code = String(value || '').toLowerCase()
  return isSupportedLocale(code) ? code : DEFAULT_LOCALE
}

export function getLocaleFromPath(pathname) {
  const first = String(pathname || '/').split('/').filter(Boolean)[0]
  return PREFIX_LOCALES.includes(first) ? first : DEFAULT_LOCALE
}

if (typeof window !== 'undefined') {
  currentLocale = getLocaleFromPath(window.location.pathname)
}

export function setCurrentLocale(locale) {
  currentLocale = normalizeLocale(locale)
  return currentLocale
}

export function getCurrentLocale() {
  return currentLocale
}

export function splitPath(path) {
  const raw = String(path || '/')
  const hashIndex = raw.indexOf('#')
  const hash = hashIndex >= 0 ? raw.slice(hashIndex) : ''
  const withoutHash = hashIndex >= 0 ? raw.slice(0, hashIndex) : raw
  const queryIndex = withoutHash.indexOf('?')
  const search = queryIndex >= 0 ? withoutHash.slice(queryIndex) : ''
  const pathname = (queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash) || '/'
  return { pathname, search, hash }
}

export function stripLocale(pathname) {
  const raw = String(pathname || '/')
  const parts = raw.split('/').filter(Boolean)
  if (PREFIX_LOCALES.includes(parts[0])) {
    const rest = parts.slice(1)
    return rest.length ? `/${rest.join('/')}` : '/'
  }
  return raw.startsWith('/') ? raw : `/${raw}`
}

export function withLocale(path, locale = getCurrentLocale()) {
  const { pathname, search, hash } = splitPath(path)
  const stripped = stripLocale(pathname)
  const loc = normalizeLocale(locale)
  const next =
    loc === DEFAULT_LOCALE
      ? stripped || '/'
      : stripped === '/'
        ? `/${loc}`
        : `/${loc}${stripped}`
  return `${next}${search}${hash}`
}

export function isHomePath(pathname) {
  return stripLocale(pathname) === '/'
}

export function htmlLang(locale = getCurrentLocale()) {
  return LOCALE_META[normalizeLocale(locale)]?.htmlLang || 'en'
}

export function dirFor(locale = getCurrentLocale()) {
  return LOCALE_META[normalizeLocale(locale)]?.dir || 'ltr'
}

export function ogLocaleFor(locale = getCurrentLocale()) {
  return LOCALE_META[normalizeLocale(locale)]?.ogLocale || 'en_US'
}

export function dateLocaleFor(locale = getCurrentLocale()) {
  return LOCALE_META[normalizeLocale(locale)]?.dateLocale || 'en-US'
}

export function hreflangFor(locale = getCurrentLocale()) {
  return LOCALE_META[normalizeLocale(locale)]?.hreflang || locale
}

export function absoluteUrl(origin, path) {
  const base = String(origin || '').replace(/\/$/, '')
  const next = path || '/'
  if (!base) return next
  return next.startsWith('/') ? `${base}${next}` : `${base}/${next}`
}

export function buildHreflangLinks(pathname, origin = '') {
  const stripped = stripLocale(pathname || '/')
  const links = SUPPORTED_LOCALES.map((locale) => ({
    hreflang: hreflangFor(locale),
    href: absoluteUrl(origin, withLocale(stripped, locale)),
  }))
  links.push({
    hreflang: 'x-default',
    href: absoluteUrl(origin, withLocale(stripped, DEFAULT_LOCALE)),
  })
  return links
}

export function applyDocumentLocale(locale) {
  if (typeof document === 'undefined') return
  const loc = normalizeLocale(locale)
  document.documentElement.lang = htmlLang(loc)
  document.documentElement.dir = dirFor(loc)
}

export function readStoredLocale() {
  if (typeof window === 'undefined') return null
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    return isSupportedLocale(stored) ? stored : null
  } catch {
    return null
  }
}

export function writeStoredLocale(locale) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, normalizeLocale(locale))
  } catch {
    /* ignore quota / private mode */
  }
}
