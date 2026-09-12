export const BLOG_CATEGORIES = [
  { value: 'wholesale', label: 'Wholesale' },
  { value: 'product-guide', label: 'Product Guide' },
  { value: 'baby-products', label: 'Baby Products' },
  { value: 'baby-feeding', label: 'Baby Feeding' },
  { value: 'baby-nursing', label: 'Baby Nursing' },
  { value: 'baby-care', label: 'Baby Care' },
  { value: 'feeding', label: 'Feeding' },
  { value: 'safety', label: 'Safety' },
  { value: 'sustainability', label: 'Sustainability' },
]

export const BLOG_CATEGORY_VALUES = BLOG_CATEGORIES.map((item) => item.value)

export const getBlogCategoryLabel = (value) =>
  BLOG_CATEGORIES.find((item) => item.value === value)?.label || value
