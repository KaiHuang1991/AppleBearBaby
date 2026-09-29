import { useTranslation } from 'react-i18next'
import { DEFAULT_LOCALE, getCurrentLocale, normalizeLocale } from './locales'

/** Locale that tracks i18n so React re-renders after /zh prefix and language switches. */
export function useShopLocale() {
  const { i18n } = useTranslation()
  return normalizeLocale(i18n.resolvedLanguage || i18n.language || getCurrentLocale())
}

export function hasLocalizedText(value) {
  const text = String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > 0
}

export function localizedField(entity, field, locale = getCurrentLocale()) {
  if (!entity) return ''
  const loc = normalizeLocale(locale)
  if (loc !== DEFAULT_LOCALE) {
    const value = entity?.translations?.[loc]?.[field]
    if (hasLocalizedText(value)) return value
  }
  return entity?.[field] ?? ''
}

export function localizeProduct(product, locale = getCurrentLocale()) {
  if (!product) return product
  return {
    ...product,
    name: localizedField(product, 'name', locale),
    description: localizedField(product, 'description', locale),
  }
}

export function localizeBlog(blog, locale = getCurrentLocale()) {
  if (!blog) return blog
  return {
    ...blog,
    title: localizedField(blog, 'title', locale),
    excerpt: localizedField(blog, 'excerpt', locale),
    content: localizedField(blog, 'content', locale),
  }
}

export function localizeCategory(category, locale = getCurrentLocale()) {
  if (!category) return category
  return {
    ...category,
    name: localizedField(category, 'name', locale),
    title: localizedField(category, 'name', locale) || category.title,
  }
}

function mapGet(map, key) {
  if (!map || key == null) return ''
  const k = String(key)
  if (typeof map.get === 'function') {
    const viaGet = map.get(k) ?? map.get(key)
    if (viaGet != null && viaGet !== '') return viaGet
  }
  return map[k] ?? map[key] ?? ''
}

export function localizedAttrLabel(attr, locale, t) {
  if (!attr) return ''
  const cms = localizedField(attr, 'label', locale)
  if (cms) return cms
  for (const key of [attr.label, attr.name].filter(Boolean)) {
    const translated = t ? t(`attributes.${key}`, { defaultValue: '' }) : ''
    if (hasLocalizedText(translated)) return translated
  }
  return attr.label || attr.name || ''
}

export function localizedAttributeValue(product, attrEntry, locale, t) {
  const attrId = String(attrEntry?.attribute?._id || attrEntry?.attribute || '')
  const english = attrEntry?.value || ''
  const loc = normalizeLocale(locale)
  if (loc !== DEFAULT_LOCALE && attrId) {
    const cms = mapGet(product?.translations?.[loc]?.attributes, attrId)
    if (hasLocalizedText(cms)) return cms
  }
  const translated = t && english ? t(`attributes.${english}`, { defaultValue: '' }) : ''
  if (hasLocalizedText(translated)) return translated
  return english
}

export function localizedSizeLabel(product, size, locale, t) {
  const english = String(size || '')
  const loc = normalizeLocale(locale)
  if (loc !== DEFAULT_LOCALE && english) {
    const cms = mapGet(product?.translations?.[loc]?.sizes, english)
    if (hasLocalizedText(cms)) return cms
  }
  const translated = t && english ? t(`attributes.${english}`, { defaultValue: '' }) : ''
  if (hasLocalizedText(translated)) return translated
  return english
}
