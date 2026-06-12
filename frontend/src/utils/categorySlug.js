export function slugifyCategory(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function resolveCategoryIdFromSlug(categories, slug) {
  if (!slug || !Array.isArray(categories)) return null

  const target = slugifyCategory(slug)
  if (!target) return null

  for (const cat of categories) {
    const id = String(cat?.id || cat?._id || '')
    if (!id) continue

    const candidates = [cat.slug, cat.name, ...(cat.aliases || [])]
      .map(slugifyCategory)
      .filter(Boolean)

    if (candidates.includes(target)) return id
  }

  return null
}

export function getCategorySlug(category) {
  if (!category) return ''
  const fromField = category.slug ? slugifyCategory(category.slug) : ''
  if (fromField) return fromField
  return slugifyCategory(category.name)
}
