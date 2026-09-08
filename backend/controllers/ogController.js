import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  buildProductOgHtml,
  buildProductSeoFragments,
  injectProductSeoIntoHtml,
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
const productSeoHtmlCache = new Map()
const PRODUCT_SEO_HTML_TTL_MS = 5 * 60 * 1000

function getCachedProductSeoHtml(cacheKey) {
  const hit = productSeoHtmlCache.get(cacheKey)
  if (!hit) return null
  if (Date.now() - hit.at > PRODUCT_SEO_HTML_TTL_MS) {
    productSeoHtmlCache.delete(cacheKey)
    return null
  }
  return hit.html
}

function setCachedProductSeoHtml(cacheKey, html) {
  productSeoHtmlCache.set(cacheKey, { html, at: Date.now() })
  if (productSeoHtmlCache.size > 200) {
    const oldest = productSeoHtmlCache.keys().next().value
    productSeoHtmlCache.delete(oldest)
  }
}

async function fetchLiveIndexHtml() {
  const frontendOrigin = getFrontendOrigin()
  try {
    const response = await fetch(`${frontendOrigin}/`)
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
      select: 'name slug description image price modelNumber category subCategory thirdCategory',
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
    const cachedHtml = getCachedProductSeoHtml(cacheKey)
    if (cachedHtml) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.setHeader(
        'Cache-Control',
        'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400'
      )
      res.setHeader('X-SEO-Cache', 'HIT')
      return res.status(200).send(cachedHtml)
    }

    const title = product.name || 'Product'
    const plainDescription = stripHtml(product.description || '')
    const description = plainDescription.slice(0, 160)
    const images = normalizeOgImages(product.image, frontendOrigin)
    const shareImages = buildOgShareImages(images, process.env.CLOUDINARY_NAME)
    const lcpImage = optimizeDeliveryImage(images[0] || '', { width: 800 })
    const keywords = buildKeywords(product)
    const sku = product.modelNumber && String(product.modelNumber).trim()
      ? String(product.modelNumber).trim()
      : ''

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
      price: product.price,
      currency: 'USD',
      fbAppId: process.env.FACEBOOK_APP_ID,
      fullDescription: plainDescription.slice(0, 2000),
    }

    const spaIndex = await loadSpaIndexHtml()
    let html
    if (spaIndex) {
      const fragments = buildProductSeoFragments(seoInput)
      html = injectProductSeoIntoHtml(spaIndex, fragments)
    } else {
      html = buildProductOgHtml(seoInput)
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader(
      'Cache-Control',
      'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400'
    )
    res.setHeader('X-SEO-Cache', 'MISS')
    setCachedProductSeoHtml(cacheKey, html)
    return res.status(200).send(html)
  } catch (error) {
    console.error('OG product page error:', error)
    return res.status(500).type('text/plain').send('Failed to render preview')
  }
}
