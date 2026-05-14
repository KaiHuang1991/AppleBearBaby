/** Mirrors frontend ShopContext category helpers for Collection / Product. */

export function normalizeId(value) {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  if (typeof value === 'object') {
    if (value._id) return String(value._id)
    if (typeof value.toString === 'function') return value.toString()
  }
  return null
}

export function normalizeCategoryNode(node) {
  if (!node) return null
  const id = normalizeId(node._id || node.id)
  return {
    ...node,
    _id: id,
    id,
    parent: node.parent ? normalizeId(node.parent) : null,
    children: Array.isArray(node.children)
      ? node.children.map((child) => normalizeCategoryNode(child)).filter(Boolean)
      : [],
  }
}

export function getCategoryPathByIds(categoryMap, categoryId, subCategoryId, thirdCategoryId) {
  const deepestId =
    normalizeId(thirdCategoryId) || normalizeId(subCategoryId) || normalizeId(categoryId)
  if (!deepestId) return []

  const path = []
  const visited = new Set()
  let currentId = deepestId
  while (currentId && !visited.has(currentId)) {
    const node = categoryMap[currentId]
    if (!node) break
    path.push({ id: currentId, name: node.name, parent: node.parent || null })
    visited.add(currentId)
    currentId = node.parent || null
  }
  return path.reverse()
}

export function getProductCategoryPath(product, categoryMap) {
  if (!product) return []
  const path = getCategoryPathByIds(
    categoryMap,
    product.categoryId,
    product.subCategoryId,
    product.thirdCategoryId
  )
  if (path.length) return path

  const fallback = []
  const add = (idValue, nameValue) => {
    if (!nameValue) return
    fallback.push({ id: normalizeId(idValue), name: nameValue, parent: null })
  }
  add(product.categoryId, product.category)
  add(product.subCategoryId, product.subCategory)
  add(product.thirdCategoryId, product.thirdCategory)
  return fallback
}

export function getProductCategoryIds(product, categoryMap) {
  if (!product) return []
  const path = getCategoryPathByIds(
    categoryMap,
    product.categoryId,
    product.subCategoryId,
    product.thirdCategoryId
  )
  if (path.length) return path.map((n) => n.id).filter(Boolean)
  const ids = []
  const push = (v) => {
    const id = normalizeId(v)
    if (id && !ids.includes(id)) ids.push(id)
  }
  push(product.categoryId)
  push(product.subCategoryId)
  push(product.thirdCategoryId)
  return ids
}
