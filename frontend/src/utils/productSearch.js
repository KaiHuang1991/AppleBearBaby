/**
 * Catalogue search: match title, model, categories, sizes, and product attributes
 * (e.g. Capacity 320ml, Material PP) — not name-only.
 */

export function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function normalizeSearchText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[^a-z0-9\u4e00-\u9fff]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function tokenizeSearchQuery(text) {
  const normalized = normalizeSearchText(String(text || '').slice(0, 80))
  if (!normalized) return []
  return [...new Set(normalized.split(' ').filter(Boolean))].slice(0, 12)
}

function pushPart(parts, value) {
  if (value == null) return
  const s = String(value).trim()
  if (s) parts.push(s)
}

export function collectProductSearchParts(product) {
  const parts = []
  pushPart(parts, product?.name)
  pushPart(parts, product?.modelNumber)
  pushPart(parts, product?.slug)
  pushPart(parts, product?.category)
  pushPart(parts, product?.subCategory)
  pushPart(parts, product?.thirdCategory)
  if (Array.isArray(product?.sizes)) {
    product.sizes.forEach((size) => pushPart(parts, size))
  }
  if (Array.isArray(product?.attributes)) {
    for (const row of product.attributes) {
      pushPart(parts, row?.value)
      const def = row?.attribute
      if (def && typeof def === 'object') {
        pushPart(parts, def.name)
        pushPart(parts, def.label)
      }
    }
  }
  return parts
}

export function productSearchHaystack(product) {
  return normalizeSearchText(collectProductSearchParts(product).join(' '))
}

export function haystackContainsToken(haystack, token) {
  if (!token) return true
  if (!haystack) return false
  if (token.length <= 2 && /^[a-z0-9]+$/.test(token)) {
    return new RegExp(`(?:^| )${escapeRegex(token)}(?: |$)`).test(haystack)
  }
  return haystack.includes(token)
}

export function productMatchesSearch(product, query) {
  const tokens = tokenizeSearchQuery(query)
  if (!tokens.length) return true
  const haystack = productSearchHaystack(product)
  return tokens.every((token) => haystackContainsToken(haystack, token))
}
