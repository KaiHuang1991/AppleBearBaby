export function parseMoqNumber(value) {
  const text = String(value || '').replace(/,/g, '')
  const match = text.match(/(\d+)/)
  if (!match) return 1
  const n = parseInt(match[1], 10)
  return Number.isFinite(n) && n > 0 ? n : 1
}

function isMoqAttribute(attr) {
  const name = String(attr?.name || '').trim().toLowerCase()
  const label = String(attr?.label || '').trim().toLowerCase()
  return name === 'moq' || label === 'moq' || name.includes('moq') || label.includes('moq') || label === '起订量' || name === '起订量'
}

export function getProductMoq(product) {
  if (!product) return 1
  const attrs = Array.isArray(product.attributes) ? product.attributes : []
  for (const entry of attrs) {
    const info = entry?.attribute && typeof entry.attribute === 'object' ? entry.attribute : {}
    if (isMoqAttribute(info)) return parseMoqNumber(entry.value)
  }
  if (product.moq != null && product.moq !== '') return parseMoqNumber(product.moq)
  return 1
}

export function clampQuantityToMoq(quantity, moq, { allowZero = false } = {}) {
  const min = Math.max(1, parseInt(moq, 10) || 1)
  const n = parseInt(quantity, 10)
  if (allowZero && (n === 0 || quantity === 0 || quantity === '0')) return 0
  if (!Number.isFinite(n)) return min
  return Math.max(min, n)
}
