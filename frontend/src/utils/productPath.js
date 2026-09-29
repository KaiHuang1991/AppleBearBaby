import { getCurrentLocale, withLocale } from '../i18n/locales'

/**
 * Canonical storefront path for a product (prefers SEO slug).
 */
export function getProductUrlKey(productOrId, slug) {
  if (productOrId && typeof productOrId === 'object') {
    return productOrId.slug || productOrId._id || ''
  }
  if (slug) return slug
  return productOrId || ''
}

export function getProductPath(productOrId, slug) {
  const key = getProductUrlKey(productOrId, slug)
  const path = key ? `/product/${key}` : '/collection'
  return withLocale(path, getCurrentLocale())
}

export function isMongoObjectId(value) {
  return typeof value === 'string' && /^[a-fA-F0-9]{24}$/.test(value)
}
