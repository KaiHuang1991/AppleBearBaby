import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  buildBlogOgHtml,
  buildBlogSeoFragments,
  buildPageOgHtml,
  buildPageSeoFragments,
  buildProductOgHtml,
  buildProductSeoFragments,
  injectSeoIntoHtml,
  normalizeOgImages,
  optimizeDeliveryImage,
  stripHtml,
} from '../utils/buildOgHtml.js'
import { buildOgShareImages } from '../utils/ogCollage.js'
import {
  findProductBySlugOrId,
  getProductUrlKey,
  isObjectIdString,
} from '../utils/productSlug.js'
import { findBlogBySlugOrId, getBlogUrlKey } from '../utils/blogSlug.js'
import { resolveStaticPageKey, STATIC_PAGE_SEO } from '../utils/pageSeo.js'
import { wholesaleProductDescription } from '../utils/productSnippet.js'
import { findCategoryBySlug, getCategoryLandingSeo, getCategorySlug, slugifyCategory } from '../utils/categorySlug.js'
import { getCategoryProductCounts } from '../utils/categoryProducts.js'
import {
  buildProductAggregateRating,
  buildProductBreadcrumbList,
  buildProductReviewJsonLd,
} from '../utils/productJsonLd.js'
import categoryModel from '../models/categoryModel.js'
import reviewModel from '../models/reviewModel.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const getFrontendOrigin = () =>
  (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '')

const getFrontendDistIndexPath = () => {
  if (process.env.FRONTEND_DIST) {
    return path.resolve(process.env.FRONTEND_DIST, 'index.html')
  }
  return path.resolve(__dirname, '../../frontend/dist/index.html')
}

let cachedDistHtml = null
let cachedDistMtime = 0
let cachedViteHtml = null
let cachedViteAt = 0
const VITE_INDEX_TTL_MS = 10_000
const seoHtmlCache = new Map()
const SEO_HTML_TTL_MS = 5 * 60 * 1000

function getCachedSeoHtml(cacheKey) {
  const hit = seoHtmlCache.get(cacheKey)
  if (!hit) return null
  if (Date.now() - hit.at > SEO_HTML_TTL_MS) {
    seoHtmlCache.delete(cacheKey)
    return null
  }
  return hit.html
}

function setCachedSeoHtml(cacheKey, html) {
  seoHtmlCache.set(cacheKey, { html, at: Date.now() })
  if (seoHtmlCache.size > 200) {
    const oldest = seoHtmlCache.keys().next().value
    seoHtmlCache.delete(oldest)
  }
}

function sendSeoHtml(res, html, cacheState = 'MISS', status = 200) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader(
    'Cache-Control',
    status === 200
      ? 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400'
      : 'no-store'
  )
  res.setHeader('X-SEO-Cache', cacheState)
  return res.status(status).send(html)
}

async function fetchLiveIndexHtml() {
  const frontendOrigin = getFrontendOrigin()
  try {
    const response = await fetch(`${frontendOrigin}/`, {
      headers: { Accept: 'text/html', 'x-seo-shell': '1' },
    })
    if (!response.ok) return null
    return await response.text()
  } catch {
    return null
  }
}

async function fetchLocalViteIndexHtml() {
  const now = Date.now()
  if (cachedViteHtml && now - cachedViteAt < VITE_INDEX_TTL_MS) {
    return cachedViteHtml
  }

  try {
    const response = await fetch('http://127.0.0.1:5173/', {
      signal: AbortSignal.timeout(800),
      headers: { Accept: 'text/html', 'x-seo-shell': '1' },
    })
    if (!response.ok) return null
    const html = await response.text()
    // Only use if this is the Vite source shell (not a static preview of dist)
    if (html.includes('/src/main.') || html.includes('@vite/client')) {
      cachedViteHtml = html
      cachedViteAt = now
      return html
    }
    return null
  } catch {
    return null
  }
}

async function loadSpaIndexHtml() {
  // Local Vite running → inject into source index so /src/main.jsx works on :5173
  const viteIndex = await fetchLocalViteIndexHtml()
  if (viteIndex) return viteIndex

  try {
    const distPath = getFrontendDistIndexPath()
    const stat = await fs.stat(distPath)
    if (!cachedDistHtml || stat.mtimeMs !== cachedDistMtime) {
      cachedDistHtml = await fs.readFile(distPath, 'utf8')
      cachedDistMtime = stat.mtimeMs
    }
    return cachedDistHtml
  } catch {
    // fall through
  }

  return fetchLiveIndexHtml()
}

const buildKeywords = (product) => {
  const keywordsArray = []
  if (product.name) keywordsArray.push(product.name)
  if (product.modelNumber && String(product.modelNumber).trim()) {
    keywordsArray.push(String(product.modelNumber).trim())
  }
  if (product.category) keywordsArray.push(product.category)
  if (product.subCategory) keywordsArray.push(product.subCategory)
  if (product.thirdCategory) keywordsArray.push(product.thirdCategory)
  keywordsArray.push('wholesale', 'OEM', 'ODM', 'AppleBear Baby')
  return [...new Set(keywordsArray.filter(Boolean))].slice(0, 15).join(', ')
}

export const productOgPage = async (req, res) => {
  try {
    const { productId } = req.params

    if (!productId) {
      return res.status(404).type('text/plain').send('Product not found')
    }

    const product = await findProductBySlugOrId(productId, {
      select: 'name slug description image price modelNumber category subCategory thirdCategory categoryId subCategoryId thirdCategoryId',
      lean: true,
    })

    if (!product) {
      return res.status(404).type('text/plain').send('Product not found')
    }

    const frontendOrigin = getFrontendOrigin()
    const urlKey = getProductUrlKey(product)
    const canonical = `${frontendOrigin}/product/${urlKey}`

    // Prefer semantic slug URLs: ObjectId requests redirect when slug exists
    if (isObjectIdString(productId) && product.slug && product.slug !== productId) {
      res.setHeader('Cache-Control', 'public, max-age=300')
      return res.redirect(301, `/product/${product.slug}`)
    }

    const cacheKey = `product:${urlKey}`
    const cachedHtml = getCachedSeoHtml(cacheKey)
    if (cachedHtml) {
      return sendSeoHtml(res, cachedHtml, 'HIT')
    }

    const title = product.name || 'Product'
    const plainDescription = stripHtml(product.description || '')
    const description = wholesaleProductDescription(product.name, product.description || '')
    const images = normalizeOgImages(product.image, frontendOrigin)
    const shareImages = buildOgShareImages(images, process.env.CLOUDINARY_NAME)
    const lcpImage = optimizeDeliveryImage(images[0] || '', { width: 800 })
    const keywords = buildKeywords(product)
    const sku = product.modelNumber && String(product.modelNumber).trim()
      ? String(product.modelNumber).trim()
      : ''

    const [categories, approvedReviews] = await Promise.all([
      categoryModel.find({ isActive: { $ne: false } }).select('name slug parent').lean(),
      reviewModel
        .find({ productId: product._id, isApproved: true })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('userId', 'name')
        .lean(),
    ])

    const seoInput = {
      title,
      description,
      keywords,
      images: shareImages,
      image: shareImages[0],
      lcpImage,
      canonical,
      siteName: 'AppleBear Baby',
      brand: 'AppleBearBaby',
      sku,
      currency: 'USD',
      fbAppId: process.env.FACEBOOK_APP_ID,
      fullDescription: plainDescription.slice(0, 2000),
      breadcrumb: buildProductBreadcrumbList({
        origin: frontendOrigin,
        categories,
        product,
        canonical,
      }),
      reviews: buildProductReviewJsonLd(approvedReviews),
      aggregateRating: buildProductAggregateRating(approvedReviews),
    }

    const spaIndex = await loadSpaIndexHtml()
    let html
    if (spaIndex) {
      const fragments = buildProductSeoFragments(seoInput)
      html = injectSeoIntoHtml(spaIndex, fragments)
    } else {
      html = buildProductOgHtml(seoInput)
    }

    setCachedSeoHtml(cacheKey, html)
    return sendSeoHtml(res, html, 'MISS')
  } catch (error) {
    console.error('OG product page error:', error)
    return res.status(500).type('text/plain').send('Failed to render preview')
  }
}

export const blogOgPage = async (req, res) => {
  try {
    const { blogKey } = req.params
    if (!blogKey) {
      return res.status(404).type('text/plain').send('Article not found')
    }

    const blog = await findBlogBySlugOrId(blogKey, {
      select: 'title slug excerpt content image author category tags createdAt updatedAt isPublished indexable',
      lean: true,
    })

    if (!blog || blog.isPublished === false) {
      return res.status(404).type('text/plain').send('Article not found')
    }

    const frontendOrigin = getFrontendOrigin()
    const urlKey = getBlogUrlKey(blog)

    if (isObjectIdString(blogKey) && blog.slug && blog.slug !== blogKey) {
      res.setHeader('Cache-Control', 'public, max-age=300')
      return res.redirect(301, `/blog/${blog.slug}`)
    }

    const cacheKey = `blog:${urlKey}`
    const cachedHtml = getCachedSeoHtml(cacheKey)
    if (cachedHtml) {
      return sendSeoHtml(res, cachedHtml, 'HIT')
    }

    const title = blog.title || 'Article'
    const plain = stripHtml(blog.excerpt || blog.content || '')
    const description = plain.slice(0, 160)
    const images = normalizeOgImages(blog.image ? [blog.image] : [], frontendOrigin)
    const shareImages = buildOgShareImages(images, process.env.CLOUDINARY_NAME)
    const lcpImage = optimizeDeliveryImage(images[0] || '', { width: 800 })
    const keywordParts = [title, blog.category, ...(Array.isArray(blog.tags) ? blog.tags : [])]
    const keywords = [...new Set(keywordParts.filter(Boolean))].slice(0, 12).join(', ')
    const canonical = `${frontendOrigin}/blog/${urlKey}`

    const seoInput = {
      title,
      description,
      keywords,
      images: shareImages,
      image: shareImages[0],
      lcpImage,
      canonical,
      siteName: 'AppleBear Baby',
      brand: 'AppleBearBaby',
      author: blog.author || 'AppleBearBaby',
      datePublished: blog.createdAt ? new Date(blog.createdAt).toISOString() : '',
      dateModified: blog.updatedAt
        ? new Date(blog.updatedAt).toISOString()
        : blog.createdAt
          ? new Date(blog.createdAt).toISOString()
          : '',
      fullDescription: stripHtml(blog.content || blog.excerpt || '').slice(0, 2000),
      robots: blog.indexable === false ? 'noindex, follow' : 'index, follow',
    }

    const spaIndex = await loadSpaIndexHtml()
    const html = spaIndex
      ? injectSeoIntoHtml(spaIndex, buildBlogSeoFragments(seoInput))
      : buildBlogOgHtml(seoInput)

    setCachedSeoHtml(cacheKey, html)
    return sendSeoHtml(res, html, 'MISS')
  } catch (error) {
    console.error('OG blog page error:', error)
    return res.status(500).type('text/plain').send('Failed to render preview')
  }
}

export const pageOgPage = async (req, res) => {
  try {
    const pageKey = resolveStaticPageKey(req.params.pageKey)
    if (!pageKey) {
      return res.status(404).type('text/plain').send('Page not found')
    }

    const page = STATIC_PAGE_SEO[pageKey]
    const cacheKey = `page:${pageKey}`
    const cachedHtml = getCachedSeoHtml(cacheKey)
    if (cachedHtml) {
      return sendSeoHtml(res, cachedHtml, 'HIT')
    }

    const frontendOrigin = getFrontendOrigin()
    const canonical = `${frontendOrigin}${page.path}`
    const seoInput = {
      title: page.title,
      description: page.description,
      keywords: page.keywords,
      canonical,
      heading: page.heading,
      siteName: 'AppleBear Baby',
      brand: 'AppleBearBaby',
      image: `${frontendOrigin}/applebear.png`,
      jsonLd:
        pageKey === 'home'
          ? {
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  name: 'AppleBear Baby',
                  url: frontendOrigin,
                  logo: `${frontendOrigin}/applebear.png`,
                },
                {
                  '@type': 'WebSite',
                  name: 'AppleBear Baby',
                  url: frontendOrigin,
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: `${frontendOrigin}/collection?search={search_term_string}`,
                    'query-input': 'required name=search_term_string',
                  },
                },
              ],
            }
          : undefined,
    }

    const spaIndex = await loadSpaIndexHtml()
    const html = spaIndex
      ? injectSeoIntoHtml(spaIndex, buildPageSeoFragments(seoInput))
      : buildPageOgHtml(seoInput)

    setCachedSeoHtml(cacheKey, html)
    return sendSeoHtml(res, html, 'MISS')
  } catch (error) {
    console.error('OG static page error:', error)
    return res.status(500).type('text/plain').send('Failed to render preview')
  }
}

export const collectionCategoryOgPage = async (req, res) => {
  try {
    const slug = String(req.params.slug || '')
    const { category, categories } = await findCategoryBySlug(slug)
    if (!category) {
      const frontendOrigin = getFrontendOrigin()
      const spaIndex = await loadSpaIndexHtml()
      const seoInput = {
        title: 'Page Not Found',
        description:
          'The page you requested could not be found on AppleBear Baby. Browse our wholesale catalog or contact the factory for a quote.',
        robots: 'noindex, follow',
        heading: 'Page not found',
        canonical: `${frontendOrigin}/collection/${slugifyCategory(slug)}`,
        siteName: 'AppleBear Baby',
        brand: 'AppleBearBaby',
      }
      const html = spaIndex
        ? injectSeoIntoHtml(spaIndex, buildPageSeoFragments(seoInput))
        : buildPageOgHtml(seoInput)
      return sendSeoHtml(res, html, 'MISS', 404)
    }

    const frontendOrigin = getFrontendOrigin()
    const canonicalSlug = getCategorySlug(category, categories) || slugifyCategory(slug)
    if (canonicalSlug && canonicalSlug !== slugifyCategory(slug)) {
      return res.redirect(301, `/collection/${canonicalSlug}`)
    }

    const seo = getCategoryLandingSeo(category, categories)
    const counts = await getCategoryProductCounts(categories)
    const productCount = counts.get(String(category._id)) || 0
    const comingSoon = productCount === 0
    const canonical = `${frontendOrigin}/collection/${canonicalSlug}`
    const cacheKey = `page:collection:${canonicalSlug}:${comingSoon ? 'soon' : 'live'}`
    const cachedHtml = getCachedSeoHtml(cacheKey)
    if (cachedHtml) {
      return sendSeoHtml(res, cachedHtml, 'HIT')
    }

    const seoInput = {
      title: comingSoon ? `${seo.title.replace(/ Wholesale$/, '')} Coming Soon` : seo.title,
      description: comingSoon
        ? `AppleBear Baby ${category.name} OEM line is coming soon. Request a wholesale quote to be notified when SKUs are listed.`
        : seo.description,
      keywords: seo.keywords,
      canonical,
      heading: comingSoon ? `${category.name} — Coming soon` : seo.heading,
      siteName: 'AppleBear Baby',
      brand: 'AppleBearBaby',
      image: `${frontendOrigin}/applebear.png`,
      robots: comingSoon ? 'noindex, follow' : 'index, follow',
    }

    const spaIndex = await loadSpaIndexHtml()
    const html = spaIndex
      ? injectSeoIntoHtml(spaIndex, buildPageSeoFragments(seoInput))
      : buildPageOgHtml(seoInput)

    setCachedSeoHtml(cacheKey, html)
    return sendSeoHtml(res, html, 'MISS')
  } catch (error) {
    console.error('OG collection category error:', error)
    return res.status(500).type('text/plain').send('Failed to render preview')
  }
}

