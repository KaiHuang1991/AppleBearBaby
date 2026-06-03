const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

export const stripHtml = (html = '') =>
  String(html)
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()

export const ensureAbsoluteUrl = (path = '', baseOrigin = '') => {
  if (!path) return ''
  try {
    return new URL(path).toString()
  } catch {
    const base = (baseOrigin || '').replace(/\/$/, '')
    if (!base) return path
    return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`
  }
}

/** Facebook prefers large HTTPS images (1200×630 recommended). */
export const optimizeOgImage = (url = '') => {
  if (!url || !url.startsWith('https://')) return url
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    return url.replace('/upload/', '/upload/w_1200,h_630,c_limit,q_auto,f_auto/')
  }
  return url
}

export const normalizeOgImages = (rawImages = [], baseOrigin = '', fallback = '/applebear.png') => {
  const list = Array.isArray(rawImages) ? rawImages.filter(Boolean) : []
  const sources = list.length ? list : [fallback]

  const seen = new Set()
  const normalized = []
  for (const src of sources) {
    let url = ensureAbsoluteUrl(src, baseOrigin)
    if (url.startsWith('http://')) {
      url = url.replace(/^http:\/\//i, 'https://')
    }
    if (url && !seen.has(url)) {
      seen.add(url)
      normalized.push(url)
    }
  }
  return normalized
}

const buildOgImageMetaTags = (images = []) => {
  if (!images.length) return ''
  return images
    .map((url) => {
      const safe = escapeHtml(url)
      return `
  <meta property="og:image" content="${safe}" />
  <meta property="og:image:secure_url" content="${safe}" />`
    })
    .join('')
}

/**
 * Minimal HTML document with Open Graph tags for social crawlers (no JS required).
 */
export const buildProductOgHtml = ({
  title,
  description,
  image,
  images,
  canonical,
  siteName = 'AppleBear Baby',
  price,
  currency = 'USD',
  fbAppId,
}) => {
  const safeTitle = escapeHtml(title)
  const safeDescription = escapeHtml(description)
  const safeCanonical = escapeHtml(canonical)
  const safeSite = escapeHtml(siteName)
  const ogImages = Array.isArray(images) && images.length ? images : image ? [image] : []
  const primaryImage = ogImages[0] || ''
  const safePrimaryImage = escapeHtml(primaryImage)
  const ogImageMeta = buildOgImageMetaTags(ogImages)

  const priceMeta =
    price != null && price !== ''
      ? `
  <meta property="product:price:amount" content="${escapeHtml(String(price))}" />
  <meta property="product:price:currency" content="${escapeHtml(currency)}" />`
      : ''

  const fbAppIdMeta =
    fbAppId && String(fbAppId).trim()
      ? `\n  <meta property="fb:app_id" content="${escapeHtml(String(fbAppId).trim())}" />`
      : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDescription}" />
  <link rel="canonical" href="${safeCanonical}" />
  <meta property="og:site_name" content="${safeSite}" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:type" content="product" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDescription}" />${ogImageMeta}
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content="${safeCanonical}" />${priceMeta}${fbAppIdMeta}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDescription}" />
  <meta name="twitter:image" content="${safePrimaryImage}" />
</head>
<body>
  <p><a href="${safeCanonical}">${safeTitle}</a></p>
</body>
</html>`
}
