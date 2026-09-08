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
  return key ? `/product/${key}` : '/collection'
}

export function isMongoObjectId(value) {
  return typeof value === 'string' && /^[a-fA-F0-9]{24}$/.test(value)
}
