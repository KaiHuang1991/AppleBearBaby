/**
 * Wholesale product meta description: strip CMS headings, split glued words, no catalog unit price.
 */
export function wholesaleProductDescription(name = '', html = '', max = 160) {
  const productName = String(name || '').trim()
  let text = String(html || '')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[#*_`]+/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()

  text = text.replace(
    /^(Product Highlights|What'?s Included|What is Included|Key Features|Specifications)\s*/i,
    ''
  )

  if (productName && text) {
    const nameWords = productName.split(/\s+/).filter(Boolean)
    const textWords = text.split(/\s+/)
    let matched = 0
    while (
      matched < nameWords.length &&
      matched < textWords.length &&
      nameWords[matched].toLowerCase() === textWords[matched].toLowerCase()
    ) {
      matched += 1
    }
    if (matched >= 3) {
      text = textWords.slice(matched).join(' ').trim()
    }
  }

  const fallback = `${productName || 'This SKU'} — wholesale OEM/ODM from AppleBear Baby in Yiwu. Factory price quoted on inquiry (MOQ, packing, destination).`
  if (!text || text.length < 24) {
    text = fallback
  } else if (productName) {
    text = `${productName} — ${text}`
  }

  if (text.length <= max) return text
  const cut = text.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim()}…`
}
