import { getCategorySlug } from '../utils/categorySlug'

export function reviewAuthorName(review, fallback = 'Verified buyer') {
  const populated = review?.userId
  if (populated && typeof populated === 'object' && populated.name) {
    return String(populated.name).trim() || fallback
  }
  return fallback
}

export function buildProductReviewJsonLd(reviews = [], names = []) {
  return reviews
    .filter((review) => review && (review.rating || review.comment))
    .map((review, index) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: names[index] || reviewAuthorName(review),
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

export function buildProductAggregateRating(reviews = [], averageRating) {
  if (!reviews.length) return undefined
  const numeric = reviews.map((review) => Number(review.rating)).filter((value) => value > 0)
  const avg = numeric.length
    ? numeric.reduce((sum, value) => sum + value, 0) / numeric.length
    : Number(averageRating)
  if (!avg) return undefined
  return {
    '@type': 'AggregateRating',
    ratingValue: Number(avg.toFixed(1)),
    reviewCount: reviews.length,
    bestRating: 5,
    worstRating: 1,
  }
}

export function buildProductBreadcrumbList({ origin = '', categoryPath = [], categories = [], productName, canonical }) {
  const site = String(origin || '').replace(/\/$/, '')
  const elements = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Catalog',
      item: site ? `${site}/collection` : '/collection',
    },
  ]

  categoryPath.forEach((node, index) => {
    const slug = getCategorySlug(node, categories)
    elements.push({
      '@type': 'ListItem',
      position: index + 2,
      name: node?.name || 'Category',
      item: slug ? (site ? `${site}/collection/${slug}` : `/collection/${slug}`) : (site ? `${site}/collection` : '/collection'),
    })
  })

  if (productName && canonical) {
    elements.push({
      '@type': 'ListItem',
      position: elements.length + 1,
      name: productName,
      item: canonical,
    })
  }

  return {
    '@type': 'BreadcrumbList',
    itemListElement: elements,
  }
}
