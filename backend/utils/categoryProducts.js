import productModel from '../models/productModel.js'

function categoryKey(value) {
  if (!value) return ''
  if (typeof value === 'object') return String(value._id || value.id || '')
  return String(value)
}

/**
 * Count SKUs for each category, including ancestors of a product's assigned nodes.
 * Matches storefront filtering: a parent tile is "in stock" if any descendant has products.
 */
export async function getCategoryProductCounts(categories = []) {
  const products = await productModel
    .find()
    .select('categoryId subCategoryId thirdCategoryId')
    .lean()

  const byId = new Map()
  for (const cat of categories) {
    const id = categoryKey(cat)
    if (id) byId.set(id, cat)
  }

  const counts = new Map()
  for (const product of products) {
    const seen = new Set()
    for (const raw of [product.categoryId, product.subCategoryId, product.thirdCategoryId]) {
      let id = categoryKey(raw)
      while (id && !seen.has(id)) {
        seen.add(id)
        counts.set(id, (counts.get(id) || 0) + 1)
        const node = byId.get(id)
        id = node ? categoryKey(node.parent) : ''
      }
    }
  }
  return counts
}

export function categoryProductCount(categoryId, counts) {
  return counts.get(String(categoryId || '')) || 0
}
