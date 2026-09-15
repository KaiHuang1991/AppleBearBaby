/**
 * Catalogue search: match title, model, categories, sizes, and product attributes.
 */

export function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function compactCode(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '')
}

export function normalizeSearchText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[^a-z0-9\u4e00-\u9fff]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const UNIT_TOKENS = new Set(['ml', 'cc', 'oz', '毫升'])

export function tokenizeSearchQuery(text) {
  const normalized = normalizeSearchText(String(text || '').slice(0, 80))
  if (!normalized) return []
  const raw = normalized.split(' ').filter(Boolean)
  const merged = []
  for (let i = 0; i < raw.length; i += 1) {
    const cur = raw[i]
    const next = raw[i + 1]
    if (next && /^\d+(?:\.\d+)?$/.test(cur) && UNIT_TOKENS.has(next)) {
      merged.push(`${cur}${next === '毫升' ? 'ml' : next}`)
      i += 1
      continue
    }
    merged.push(cur)
  }
  return [...new Set(merged)].slice(0, 12)
}

function pushPart(parts, value) {
  if (value == null) return
  const s = String(value).trim()
  if (s) parts.push(s)
}

const CAPACITY_RE = /(\d+(?:\.\d+)?)\s*(ml|cc|毫升)/gi

export function extractCapacityMlValues(product) {
  const chunks = [product?.name]
  if (Array.isArray(product?.attributes)) {
    for (const row of product.attributes) chunks.push(row?.value)
  }
  const found = []
  for (const chunk of chunks) {
    if (!chunk) continue
    const text = String(chunk)
    CAPACITY_RE.lastIndex = 0
    let match
    while ((match = CAPACITY_RE.exec(text))) {
      const n = Number(match[1])
      if (Number.isFinite(n) && n >= 10 && n <= 2000) found.push(n)
    }
  }
  return [...new Set(found)]
}

export function collectProductSearchParts(product) {
  const parts = []
  pushPart(parts, product?.name)
  pushPart(parts, product?.modelNumber)
  pushPart(parts, compactCode(product?.modelNumber))
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
  for (const ml of extractCapacityMlValues(product)) {
    pushPart(parts, String(ml))
    pushPart(parts, `${ml}ml`)
  }
  return parts
}

export function productSearchHaystack(product) {
  return normalizeSearchText(collectProductSearchParts(product).join(' '))
}

export function haystackContainsToken(haystack, token) {
  if (!token) return true
  if (!haystack) return false
  return new RegExp(`(?:^| )${escapeRegex(token)}(?: |$)`).test(haystack)
}

export function productMatchesSearch(product, query) {
  const raw = String(query || '').trim()
  if (!raw) return true

  const compactQuery = compactCode(raw)
  const compactModel = compactCode(product?.modelNumber)
  if (compactQuery && compactModel && compactModel === compactQuery) return true

  const tokens = tokenizeSearchQuery(raw)
  if (!tokens.length) return true
  const haystack = productSearchHaystack(product)
  return tokens.every((token) => haystackContainsToken(haystack, token))
}
