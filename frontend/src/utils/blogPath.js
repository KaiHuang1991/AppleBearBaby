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
  return key ? `/blog/${key}` : '/blogs'
}

export function isMongoObjectId(value) {
  return typeof value === 'string' && /^[a-fA-F0-9]{24}$/.test(value)
}
