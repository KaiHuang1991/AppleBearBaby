import { buildProductOfferExtras, getCommercePolicyOrigin } from './commercePolicy.js'

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

/** Display-sized Cloudinary URL for LCP preload (matches frontend product gallery). */
export const optimizeDeliveryImage = (url = '', { width = 800, height, crop = 'limit' } = {}) => {
  if (!url || typeof url !== 'string') return url
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url

  const afterUpload = url.split('/upload/')[1]
  if (!afterUpload) return url
  const parts = afterUpload.split('/')
  while (parts.length > 1) {
    const head = parts[0]
    if (/^v\d+$/.test(head)) {
      parts.shift()
      break
    }
    if (head.includes(',') || /^[a-z0-9_]+_[a-z0-9_,]+$/i.test(head)) {
      parts.shift()
      continue
    }
    break
  }
  const publicId = parts.join('/').replace(/\.[^/.]+$/, '')
  const cloudMatch = url.match(/res\.cloudinary\.com\/([^/]+)\//i)
  const cloud = cloudMatch ? cloudMatch[1] : null
  if (!cloud || !publicId) {
    const transforms = [`c_${crop}`, `w_${width}`, height ? `h_${height}` : '', 'q_auto', 'f_auto']
      .filter(Boolean)
      .join(',')
    return url.replace('/upload/', `/upload/${transforms}/`)
  }
  const transforms = [`c_${crop}`, `w_${width}`, height ? `h_${height}` : '', 'q_auto', 'f_auto']
    .filter(Boolean)
    .join(',')
  return `https://res.cloudinary.com/${cloud}/image/upload/${transforms}/${publicId}`
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

const formatPageTitle = (title, siteName = 'AppleBear Baby') => {
  const t = String(title || '').trim()
  if (!t) return siteName
  if (t.includes(siteName)) return t
  return `${t} | ${siteName}`
}

const buildProductJsonLd = ({
  title,
  description,
  images,
  canonical,
  brand,
  sku,
  price,
  currency = 'USD',
}) => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title,
    description: description || undefined,
    image: images?.length ? images : undefined,
    brand: {
      '@type': 'Brand',
      name: brand || 'AppleBearBaby',
    },
    url: canonical,
  }
  if (sku) jsonLd.sku = sku
  if (price != null && price !== '' && !Number.isNaN(Number(price))) {
    jsonLd.offers = {
      '@type': 'Offer',
      url: canonical,
      priceCurrency: currency,
      price: String(price),
      availability: 'https://schema.org/InStock',
      ...buildProductOfferExtras({
        origin: getCommercePolicyOrigin(),
        currency,
      }),
    }
  }
  return jsonLd
}

/**
 * Head fragments + visible SEO body for product pages (crawlers + View Source).
 */
export const buildProductSeoFragments = ({
  title,
  description,
  keywords = '',
  image,
  images,
  lcpImage = '',
  canonical,
  siteName = 'AppleBear Baby',
  brand = 'AppleBearBaby',
  sku = '',
  price,
  currency = 'USD',
  fbAppId,
  fullDescription = '',
}) => {
  const pageTitle = formatPageTitle(title, siteName)
  const safeTitle = escapeHtml(pageTitle)
  const safeDescription = escapeHtml(description)
  const safeKeywords = escapeHtml(keywords)
  const safeCanonical = escapeHtml(canonical)
  const safeSite = escapeHtml(siteName)
  const safeBrand = escapeHtml(brand)
  const ogImages = Array.isArray(images) && images.length ? images : image ? [image] : []
  const primaryImage = ogImages[0] || ''
  const safePrimaryImage = escapeHtml(primaryImage)
  const lcpSrc = lcpImage || optimizeDeliveryImage(primaryImage, { width: 800 })
  const safeLcpImage = escapeHtml(lcpSrc)
  const ogImageMeta = buildOgImageMetaTags(ogImages)
  const bodyText = escapeHtml(fullDescription || description || '')
  const h1 = escapeHtml(title || pageTitle)
  const lcpPreload = safeLcpImage
    ? `\n  <link rel="preload" as="image" href="${safeLcpImage}" fetchpriority="high" />`
    : ''

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

  const keywordsMeta = safeKeywords
    ? `\n  <meta name="keywords" content="${safeKeywords}" />`
    : ''

  const jsonLd = buildProductJsonLd({
    title: title || pageTitle,
    description,
    images: ogImages,
    canonical,
    brand,
    sku,
    price,
    currency,
  })

  const headInjection = `
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDescription}" />${keywordsMeta}
  <link rel="canonical" href="${safeCanonical}" />${lcpPreload}
  <meta name="robots" content="index, follow" />
  <meta name="author" content="${safeBrand}" />
  <meta property="og:site_name" content="${safeSite}" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:type" content="product" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDescription}" />${ogImageMeta}
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content="${safeCanonical}" />${priceMeta}
  <meta property="product:availability" content="in stock" />
  <meta property="product:brand" content="${safeBrand}" />${fbAppIdMeta}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDescription}" />
  <meta name="twitter:image" content="${safePrimaryImage}" />
  <script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>
  <style id="seo-content-hide">html.js #seo-content{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}</style>
`

  const imgTag = primaryImage
    ? `\n  <img src="${safePrimaryImage}" alt="${h1}" width="1200" height="630" />`
    : ''

  const bodyInjection = `
<article id="seo-content">
  <h1>${h1}</h1>${imgTag}
  <p>${bodyText}</p>
  <h2>Shipping</h2>
  <p>Samples typically ship by China Post small packet, Alibaba online express, or DHL / FedEx / TNT. Bulk orders go by FCL or LCL sea freight, or by a China freight forwarder the buyer appoints for air, rail, or sea. Freight is quoted with the inquiry.</p>
  <p>Factory defects can be raised within 15 days of arrival. Custom OEM or printed goods are not returnable for a change of mind.</p>
  <p><a href="${safeCanonical}">${h1}</a></p>
</article>
<script>document.documentElement.classList.add('js')</script>
`

  return { pageTitle, headInjection, bodyInjection, jsonLd }
}

/**
 * Inject SEO fragments into the Vite/SPA index.html shell.
 */
export const injectSeoIntoHtml = (indexHtml, fragments) => {
  let html = String(indexHtml || '')
  if (!html) return ''

  const { headInjection, bodyInjection } = fragments

  // Drop default title / description so injected tags win
  html = html.replace(/<title>[^<]*<\/title>\s*/i, '')
  html = html.replace(/<meta\s+name=["']description["'][^>]*>\s*/gi, '')
  html = html.replace(/<meta\s+name=["']robots["'][^>]*>\s*/gi, '')

  if (/<\/head>/i.test(html)) {
    html = html.replace(/<\/head>/i, `${headInjection}</head>`)
  } else {
    html = `${headInjection}${html}`
  }

  if (/<div\s+id=["']root["'][^>]*>\s*<\/div>/i.test(html)) {
    html = html.replace(
      /<div\s+id=["']root["'][^>]*>\s*<\/div>/i,
      `${bodyInjection}<div id="root"></div>`
    )
  } else if (/<body[^>]*>/i.test(html)) {
    html = html.replace(/<body([^>]*)>/i, `<body$1>${bodyInjection}`)
  } else {
    html = `${bodyInjection}${html}`
  }

  return html
}

export const injectProductSeoIntoHtml = injectSeoIntoHtml

/**
 * Head fragments + visible SEO body for blog articles.
 */
export const buildBlogSeoFragments = ({
  title,
  description,
  keywords = '',
  image,
  images,
  lcpImage = '',
  canonical,
  siteName = 'AppleBear Baby',
  brand = 'AppleBearBaby',
  author = '',
  datePublished = '',
  dateModified = '',
  fullDescription = '',
}) => {
  const pageTitle = formatPageTitle(title, siteName)
  const safeTitle = escapeHtml(pageTitle)
  const safeDescription = escapeHtml(description)
  const safeKeywords = escapeHtml(keywords)
  const safeCanonical = escapeHtml(canonical)
  const safeSite = escapeHtml(siteName)
  const safeBrand = escapeHtml(brand)
  const ogImages = Array.isArray(images) && images.length ? images : image ? [image] : []
  const primaryImage = ogImages[0] || ''
  const safePrimaryImage = escapeHtml(primaryImage)
  const lcpSrc = lcpImage || optimizeDeliveryImage(primaryImage, { width: 800 })
  const safeLcpImage = escapeHtml(lcpSrc)
  const ogImageMeta = buildOgImageMetaTags(ogImages)
  const bodyText = escapeHtml(fullDescription || description || '')
  const h1 = escapeHtml(title || pageTitle)
  const lcpPreload = safeLcpImage
    ? `\n  <link rel="preload" as="image" href="${safeLcpImage}" fetchpriority="high" />`
    : ''
  const keywordsMeta = safeKeywords
    ? `\n  <meta name="keywords" content="${safeKeywords}" />`
    : ''

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title || pageTitle,
    description: description || undefined,
    image: ogImages.length ? ogImages : undefined,
    datePublished: datePublished || undefined,
    dateModified: dateModified || datePublished || undefined,
    author: { '@type': 'Organization', name: brand || siteName },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      logo: { '@type': 'ImageObject', url: 'https://applebearbaby.net/applebear.png' },
    },
    mainEntityOfPage: canonical,
  }

  const headInjection = `
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDescription}" />${keywordsMeta}
  <link rel="canonical" href="${safeCanonical}" />${lcpPreload}
  <meta name="robots" content="index, follow" />
  <meta name="author" content="${escapeHtml(author || brand)}" />
  <meta property="og:site_name" content="${safeSite}" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDescription}" />${ogImageMeta}
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content="${safeCanonical}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDescription}" />
  <meta name="twitter:image" content="${safePrimaryImage}" />
  <script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>
  <style id="seo-content-hide">html.js #seo-content{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}</style>
`

  const imgTag = primaryImage
    ? `\n  <img src="${safePrimaryImage}" alt="${h1}" width="1200" height="630" />`
    : ''

  const bodyInjection = `
<article id="seo-content">
  <h1>${h1}</h1>${imgTag}
  <p>${bodyText}</p>
  <p><a href="${safeCanonical}">${h1}</a></p>
</article>
<script>document.documentElement.classList.add('js')</script>
`

  return { pageTitle, headInjection, bodyInjection, jsonLd }
}

export const buildBlogOgHtml = (input) => {
  const fragments = buildBlogSeoFragments(input)
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" type="image/png" href="/applebear.png" />
${fragments.headInjection}
</head>
<body>
${fragments.bodyInjection}
</body>
</html>`
}

/**
 * Head fragments for static marketing pages (home, collection, about, …).
 */
export const buildPageSeoFragments = ({
  title,
  description,
  keywords = '',
  canonical,
  siteName = 'AppleBear Baby',
  brand = 'AppleBearBaby',
  ogType = 'website',
  robots = 'index, follow',
  heading = '',
  image = '',
  jsonLd,
}) => {
  const pageTitle = formatPageTitle(title, siteName)
  const safeTitle = escapeHtml(pageTitle)
  const safeDescription = escapeHtml(description)
  const safeKeywords = escapeHtml(keywords)
  const safeCanonical = escapeHtml(canonical)
  const safeSite = escapeHtml(siteName)
  const h1 = escapeHtml(heading || title || siteName)
  const ogImages = image ? [image] : []
  const ogImageMeta = buildOgImageMetaTags(ogImages)
  const keywordsMeta = safeKeywords
    ? `\n  <meta name="keywords" content="${safeKeywords}" />`
    : ''
  const graph = jsonLd || {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: pageTitle,
    description,
    url: canonical,
    isPartOf: { '@type': 'WebSite', name: siteName, url: canonical.replace(/\/[^/]*$/, '/') },
  }

  const headInjection = `
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDescription}" />${keywordsMeta}
  <link rel="canonical" href="${safeCanonical}" />
  <meta name="robots" content="${escapeHtml(robots)}" />
  <meta name="author" content="${escapeHtml(brand)}" />
  <meta property="og:site_name" content="${safeSite}" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:type" content="${escapeHtml(ogType)}" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDescription}" />${ogImageMeta}
  <meta property="og:url" content="${safeCanonical}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDescription}" />
  <script type="application/ld+json">${JSON.stringify(graph).replace(/</g, '\\u003c')}</script>
  <style id="seo-content-hide">html.js #seo-content{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}</style>
`

  const bodyInjection = `
<article id="seo-content">
  <h1>${h1}</h1>
  <p>${safeDescription}</p>
  <p><a href="${safeCanonical}">${safeSite}</a></p>
</article>
<script>document.documentElement.classList.add('js')</script>
`

  return { pageTitle, headInjection, bodyInjection, jsonLd: graph }
}

export const buildPageOgHtml = (input) => {
  const fragments = buildPageSeoFragments(input)
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" type="image/png" href="/applebear.png" />
${fragments.headInjection}
</head>
<body>
${fragments.bodyInjection}
</body>
</html>`
}

/**
 * Standalone HTML fallback when SPA index.html is unavailable.
 */
export const buildProductOgHtml = ({
  title,
  description,
  keywords = '',
  image,
  images,
  lcpImage = '',
  canonical,
  siteName = 'AppleBear Baby',
  brand = 'AppleBearBaby',
  sku = '',
  price,
  currency = 'USD',
  fbAppId,
  fullDescription = '',
}) => {
  const fragments = buildProductSeoFragments({
    title,
    description,
    keywords,
    image,
    images,
    lcpImage,
    canonical,
    siteName,
    brand,
    sku,
    price,
    currency,
    fbAppId,
    fullDescription,
  })

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" type="image/png" href="/applebear.png" />
${fragments.headInjection}
</head>
<body>
${fragments.bodyInjection}
</body>
</html>`
}
