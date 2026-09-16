import { getCategoryAncestors, getCategorySlug } from './categorySlug.js'

export function buildProductReviewJsonLd(reviews = []) {
  return reviews
    .filter((review) => review && (review.rating || review.comment))
    .map((review) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: String(review.userId?.name || '').trim() || 'Verified buyer',
      },
      datePublished: review.createdAt || undefined,
      reviewBody: review.comment || undefined,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: Number(review.rating) || 0,
        bestRating: 5,
        worstRating: 1,
      },
    }))
}

export function buildProductAggregateRating(reviews = []) {
  if (!reviews.length) return undefined
  const numeric = reviews.map((review) => Number(review.rating)).filter((value) => value > 0)
  if (!numeric.length) return undefined
  const avg = numeric.reduce((sum, value) => sum + value, 0) / numeric.length
  return {
    '@type': 'AggregateRating',
    ratingValue: Number(avg.toFixed(1)),
    reviewCount: reviews.length,
    bestRating: 5,
    worstRating: 1,
  }
}

export function buildProductBreadcrumbList({ origin = '', categories = [], product, canonical }) {
  const site = String(origin || '').replace(/\/$/, '')
  const deepestId = product?.thirdCategoryId || product?.subCategoryId || product?.categoryId
  const deepest = categories.find((cat) => String(cat._id) === String(deepestId || '')) || null
  const path = deepest ? getCategoryAncestors(deepest, categories) : []

  const elements = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Catalog',
      item: `${site}/collection`,
    },
  ]

  path.forEach((node, index) => {
    const slug = getCategorySlug(node, categories)
    elements.push({
      '@type': 'ListItem',
      position: index + 2,
      name: node?.name || 'Category',
      item: slug ? `${site}/collection/${slug}` : `${site}/collection`,
    })
  })

  if (product?.name && canonical) {
    elements.push({
      '@type': 'ListItem',
      position: elements.length + 1,
      name: product.name,
      item: canonical,
    })
  }

  return {
    '@type': 'BreadcrumbList',
    itemListElement: elements,
  }
}
