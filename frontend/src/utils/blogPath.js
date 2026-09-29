import { getCurrentLocale, withLocale } from '../i18n/locales'

/**
 * Canonical storefront path for a blog article (prefers SEO slug).
 */
export function getBlogUrlKey(blogOrId, slug) {
  if (blogOrId && typeof blogOrId === 'object') {
    return blogOrId.slug || blogOrId._id || ''
  }
  if (slug) return slug
  return blogOrId || ''
}

export function getBlogPath(blogOrId, slug) {
  const key = getBlogUrlKey(blogOrId, slug)
  const path = key ? `/blog/${key}` : '/blogs'
  return withLocale(path, getCurrentLocale())
}

export function isMongoObjectId(value) {
  return typeof value === 'string' && /^[a-fA-F0-9]{24}$/.test(value)
}
