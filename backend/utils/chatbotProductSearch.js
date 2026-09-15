import productModel from '../models/productModel.js'
import {
  buildProductSearchFilter,
  productMatchesSearch,
  tokenizeSearchQuery,
} from './productSearch.js'

export { tokenizeSearchQuery as tokenizeForProductSearch }

/** Heuristic: only show “Matching products” when the user is asking about products, not pure site/FAQ chat. */
const PRODUCT_HINT =
  /(\d|\bml\b|\boz\b|\bcc\b|bottle|nipple|pacifier|feeding|teat|flange|breast|pump|diaper|wipe|bib|bowl|spoon|cup|soother|dummy|neck|standard|wide|mouth|product|catalog|sku|item|variant|browse|shop|buy|price|stock|glass|ppsu|silicone|批发|商品|奶瓶|奶嘴|毫升|标口|宽口|水杯|餐具|尿布|湿巾|吸管|配件)/i

function looksLikePureSiteHelp(t) {
  const s = t.trim()
  return (
    (/^(how\s+do\s+i|how\s+to|where\s+(do\s+i|is|can)|what\s+is(\s+the)?(\s+difference)?)/i.test(s) ||
      /^(hi|hello|hey|thanks|thank\s+you)\b/i.test(s) ||
      /^(你好|您好|谢谢|感谢)|请问.{0,10}(怎么|如何).{0,10}(联系|登录|注册|询盘|密码|页面)/.test(s)) &&
    !PRODUCT_HINT.test(s) &&
    !/\d/.test(s)
  )
}

export function shouldAttachProductResults(raw) {
  const t = String(raw || '').trim()
  if (t.length < 4) return false
  if (PRODUCT_HINT.test(t) || /\d/.test(t)) return true
  if (looksLikePureSiteHelp(t)) return false
  if (/[\u4e00-\u9fff]{3,}/.test(t)) return true
  return false
}

function attrSummary(attrs) {
  if (!Array.isArray(attrs)) return ''
  return attrs
    .map((a) => {
      const n = a.attribute?.name || a.attribute?.label || ''
      const v = (a.value || '').trim()
      if (!v) return ''
      return n ? `${n}: ${v}` : v
    })
    .filter(Boolean)
    .join('; ')
}

/**
 * Mirrors Collection (/collection) search: name, model, categories, sizes, and attributes.
 */
export async function searchProductsForChat(userMessage, { limit = 16 } = {}) {
  const q = userMessage.trim()
  if (!q) return []

  const populate = { path: 'attributes.attribute', select: 'name label' }
  const filter = await buildProductSearchFilter(q)
  if (!Object.keys(filter).length) return []

  const pool = await productModel.find(filter).populate(populate).limit(80).lean()
  return pool.filter((p) => productMatchesSearch(p, q)).slice(0, limit)
}

export function formatProductsForClient(products) {
  return products.map((p) => {
    const imgs = Array.isArray(p.image) ? p.image : []
    return {
      id: String(p._id),
      name: p.name || 'Product',
      modelNumber: p.modelNumber && String(p.modelNumber).trim() ? String(p.modelNumber).trim() : '',
      price: typeof p.price === 'number' ? p.price : Number(p.price) || 0,
      image: imgs[0] || '',
      href: `/product/${p.slug || p._id}`
    }
  })
}

export function formatCatalogForPrompt(products) {
  return products.map((p) => {
    const imgs = Array.isArray(p.image) ? p.image : []
    return {
      id: String(p._id),
      name: p.name,
      modelNumber: p.modelNumber && String(p.modelNumber).trim() ? String(p.modelNumber).trim() : '',
      price: p.price,
      sizes: p.sizes || [],
      attributes: attrSummary(p.attributes || []),
      categoryPath: [p.category, p.subCategory, p.thirdCategory].filter(Boolean).join(' > '),
      image: imgs[0] || ''
    }
  })
}
