import categoryModel from '../models/categoryModel.js'

export function slugifyCategory(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function categoryId(category) {
  return String(category?.id || category?._id || '')
}

function parentId(category) {
  const parent = category?.parent
  if (!parent) return ''
  if (typeof parent === 'object') return String(parent._id || parent.id || '')
  return String(parent)
}

export function getCategoryAncestors(category, categories = []) {
  if (!category) return []

  const byId = new Map()
  for (const cat of categories) {
    const id = categoryId(cat)
    if (id) byId.set(id, cat)
  }

  const chain = []
  const seen = new Set()
  let current = category
  while (current) {
    const id = categoryId(current)
    if (!id || seen.has(id)) break
    seen.add(id)
    chain.unshift(current)
    const pid = parentId(current)
    current = pid ? byId.get(pid) || null : null
  }
  return chain
}

/** Unique URL slug from the full tree path, so two "Boxed" leaves do not collide. */
export function getCategorySlug(category, categories = []) {
  if (!category) return ''
  const parts = getCategoryAncestors(category, categories)
    .map((cat) => slugifyCategory(cat.name))
    .filter(Boolean)
  if (parts.length) return parts.join('-')
  return slugifyCategory(category.slug || category.name)
}

function leafSlug(category) {
  return [category?.slug, category?.name].map(slugifyCategory).filter(Boolean)
}

export function resolveCategoryFromList(categories, slug) {
  if (!slug || !Array.isArray(categories)) return null
  const target = slugifyCategory(slug)
  if (!target) return null

  const pathHits = categories.filter((cat) => getCategorySlug(cat, categories) === target)
  if (pathHits.length) return pathHits[0]

  const leafHits = categories.filter((cat) => leafSlug(cat).includes(target))
  if (leafHits.length) return leafHits[0]
  return null
}

export function getCategoryLandingSeo(category, categories = []) {
  const names = getCategoryAncestors(category, categories)
    .map((cat) => String(cat?.name || '').trim())
    .filter(Boolean)
  const name = names.length >= 2 ? names.slice(-2).join(' ') : names[0] || String(category?.name || 'Catalog').trim()
  return {
    title: `${name} Wholesale`,
    heading: `${name} — Wholesale OEM Catalog`,
    description: `AppleBear Baby ${name} for OEM, ODM, and wholesale buyers. Factory quotes from Yiwu include MOQ, packing, and destination freight.`,
    keywords: `${name}, wholesale ${name}, OEM baby products, ODM, AppleBearBaby`,
  }
}

export async function findCategoryBySlug(slug) {
  const target = slugifyCategory(slug)
  if (!target) return { category: null, categories: [] }

  const categories = await categoryModel
    .find({ isActive: { $ne: false } })
    .select('name slug parent isActive updatedAt')
    .lean()

  return { category: resolveCategoryFromList(categories, target), categories }
}

export async function listIndexableCategories() {
  return categoryModel
    .find({ isActive: { $ne: false } })
    .select('name slug parent updatedAt')
    .lean()
}
