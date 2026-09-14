import categoryModel from '../models/categoryModel.js'

export function slugifyCategory(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getCategorySlug(category) {
  if (!category) return ''
  const fromField = category.slug ? slugifyCategory(category.slug) : ''
  if (fromField) return fromField
  return slugifyCategory(category.name)
}

export function getCategoryLandingSeo(category) {
  const name = String(category?.name || 'Catalog').trim()
  return {
    title: `${name} Wholesale`,
    heading: `${name} — Wholesale OEM Catalog`,
    description: `AppleBear Baby ${name} for OEM, ODM, and wholesale buyers. Factory quotes from Yiwu include MOQ, packing, and destination freight.`,
    keywords: `${name}, wholesale ${name}, OEM baby products, ODM, AppleBearBaby`,
  }
}

export async function findCategoryBySlug(slug) {
  const target = slugifyCategory(slug)
  if (!target) return null

  const categories = await categoryModel
    .find({ isActive: { $ne: false } })
    .select('name slug parent isActive updatedAt')
    .lean()

  return (
    categories.find((category) => {
      const candidates = [category.slug, category.name].map(slugifyCategory).filter(Boolean)
      return candidates.includes(target)
    }) || null
  )
}

export async function listIndexableCategories() {
  return categoryModel
    .find({ isActive: { $ne: false } })
    .select('name slug updatedAt')
    .lean()
}
