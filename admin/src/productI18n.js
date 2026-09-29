export const PREFIX_LOCALES = ['zh', 'es', 'ar', 'fr']

export function emptyProductTranslations() {
  return Object.fromEntries(
    PREFIX_LOCALES.map((loc) => [loc, { name: '', description: '', attributes: {}, sizes: {} }])
  )
}

export function plainMap(value) {
  if (!value) return {}
  if (typeof value.get === 'function' && typeof value.entries === 'function') {
    return Object.fromEntries(value.entries())
  }
  if (typeof value.toObject === 'function') {
    try {
      return { ...value.toObject() }
    } catch {
      /* ignore */
    }
  }
  return { ...value }
}

export function hydrateProductTranslations(product) {
  const next = emptyProductTranslations()
  for (const loc of PREFIX_LOCALES) {
    const block = product?.translations?.[loc] || {}
    next[loc] = {
      name: block.name || '',
      description: block.description || '',
      attributes: plainMap(block.attributes),
      sizes: plainMap(block.sizes),
    }
  }
  return next
}

export function setTranslationMapValue(prev, locale, mapField, key, value) {
  const locBlock = prev[locale] || { name: '', description: '', attributes: {}, sizes: {} }
  const map = { ...(locBlock[mapField] || {}) }
  const trimmed = String(value || '').trim()
  if (trimmed) map[key] = trimmed
  else delete map[key]
  return { ...prev, [locale]: { ...locBlock, [mapField]: map } }
}
