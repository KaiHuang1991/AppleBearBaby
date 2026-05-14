import productModel from '../models/productModel.js'

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Same token splitting as helpful fallback when full-string name match returns nothing. */
export function tokenizeForProductSearch(text) {
  if (!text || typeof text !== 'string') return []
  const t = text.trim()
  if (!t) return []
  const parts = t
    .split(/[\s,，。！？、；：]+/)
    .map((p) => p.trim())
    .filter((p) => p.length >= 2)
  const merged = [...new Set(parts)]
  return merged.slice(0, 14)
}

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

function rankByNameTokens(products, tokens) {
  return products
    .map((p) => ({
      p,
      score: tokens.reduce((acc, tok) => {
        if (!tok) return acc
        return acc + (new RegExp(escapeRegex(tok), 'i').test(p.name || '') ? 1 : 0)
      }, 0)
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || (b.p.name || '').length - (a.p.name || '').length)
    .map((x) => x.p)
}

/**
 * Mirrors Collection (/collection) search: substring on product **name** only (case-insensitive).
 * If the full user phrase matches nothing, falls back to OR-matching individual keywords on **name** only.
 */
export async function searchProductsForChat(userMessage, { limit = 16 } = {}) {
  const q = userMessage.trim()
  if (!q) return []

  const populate = { path: 'attributes.attribute', select: 'name label' }

  const fullRx = new RegExp(escapeRegex(q), 'i')
  let raw = await productModel.find({ name: fullRx }).populate(populate).limit(limit).lean()

  if (!raw.length) {
    const tokens = tokenizeForProductSearch(q)
    if (!tokens.length) return []

    const orConditions = tokens.map((tok) => ({
      name: new RegExp(escapeRegex(tok), 'i')
    }))

    const pool = await productModel.find({ $or: orConditions }).populate(populate).limit(80).lean()

    raw = rankByNameTokens(pool, tokens).slice(0, limit)
  }

  return raw.slice(0, limit)
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
      href: `/product/${p._id}`
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
