export const DEFAULT_LOCALE = 'en'
export const PREFIX_LOCALES = ['zh', 'es', 'ar', 'fr']
export const SUPPORTED_LOCALES = [DEFAULT_LOCALE, ...PREFIX_LOCALES]

export const LOCALE_META = {
  en: { htmlLang: 'en', dir: 'ltr', ogLocale: 'en_US', hreflang: 'en' },
  zh: { htmlLang: 'zh-Hans', dir: 'ltr', ogLocale: 'zh_CN', hreflang: 'zh-Hans' },
  es: { htmlLang: 'es', dir: 'ltr', ogLocale: 'es_ES', hreflang: 'es' },
  ar: { htmlLang: 'ar', dir: 'rtl', ogLocale: 'ar_SA', hreflang: 'ar' },
  fr: { htmlLang: 'fr', dir: 'ltr', ogLocale: 'fr_FR', hreflang: 'fr' },
}

export function isSupportedLocale(value) {
  return SUPPORTED_LOCALES.includes(String(value || ''))
}

export function normalizeLocale(value) {
  const code = String(value || '').toLowerCase()
  return isSupportedLocale(code) ? code : DEFAULT_LOCALE
}

export function parseLocaleParam(value) {
  return normalizeLocale(value)
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

export function getLocaleFromPath(pathname) {
  const first = String(pathname || '/').split('/').filter(Boolean)[0]
  return PREFIX_LOCALES.includes(first) ? first : DEFAULT_LOCALE
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

export function withLocale(path, locale = DEFAULT_LOCALE) {
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

export function htmlLang(locale = DEFAULT_LOCALE) {
  return LOCALE_META[normalizeLocale(locale)]?.htmlLang || 'en'
}

export function dirFor(locale = DEFAULT_LOCALE) {
  return LOCALE_META[normalizeLocale(locale)]?.dir || 'ltr'
}

export function ogLocaleFor(locale = DEFAULT_LOCALE) {
  return LOCALE_META[normalizeLocale(locale)]?.ogLocale || 'en_US'
}

export function hreflangFor(locale = DEFAULT_LOCALE) {
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

export function buildHreflangHtml(pathname, origin = '') {
  return buildHreflangLinks(pathname, origin)
    .map((link) => `  <link rel="alternate" hreflang="${link.hreflang}" href="${link.href}" />`)
    .join('\n')
}

const PREFIX_SET = new Set(PREFIX_LOCALES)

export function hasLocalizedText(value) {
  const text = String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > 0
}

export function parseTranslations(
  raw,
  fields = ['name', 'description', 'title', 'excerpt', 'content'],
  mapFields = []
) {
  let parsed = raw
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw)
    } catch {
      return undefined
    }
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return undefined

  const out = {}
  for (const loc of PREFIX_LOCALES) {
    const block = parsed[loc]
    if (!block || typeof block !== 'object') continue
    const cleaned = {}
    for (const field of fields) {
      const value = block[field]
      if (typeof value === 'string' && hasLocalizedText(value)) cleaned[field] = value
    }
    for (const mapField of mapFields) {
      const obj = block[mapField]
      if (!obj || typeof obj !== 'object' || Array.isArray(obj)) continue
      const cleanedMap = {}
      const entries = typeof obj.entries === 'function' ? obj.entries() : Object.entries(obj)
      for (const [key, value] of entries) {
        if (typeof value === 'string' && hasLocalizedText(value)) cleanedMap[String(key)] = value
      }
      if (Object.keys(cleanedMap).length) cleaned[mapField] = cleanedMap
    }
    if (Object.keys(cleaned).length) out[loc] = cleaned
  }
  return Object.keys(out).length ? out : undefined
}

export function localizedField(entity, field, locale = DEFAULT_LOCALE) {
  const loc = normalizeLocale(locale)
  if (loc !== DEFAULT_LOCALE) {
    const value = entity?.translations?.[loc]?.[field]
    if (hasLocalizedText(value)) return value
  }
  return entity?.[field] ?? ''
}

export { PREFIX_SET }
