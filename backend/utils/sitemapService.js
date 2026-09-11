import productModel from '../models/productModel.js'
import blogModel from '../models/blogModel.js'
import { backfillMissingProductSlugs, hasUsableProductSlug } from './productSlug.js'
import { backfillMissingBlogSlugs, hasUsableBlogSlug } from './blogSlug.js'

/**
 * Indexable static routes — keep in sync with frontend `src/App.jsx` and `src/seo/config.js`.
 * Only paths with robots: index, follow (or no robots override) belong here.
 */
export const INDEXABLE_STATIC_ROUTES = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/collection', changefreq: 'daily', priority: '0.9' },
  { path: '/about', changefreq: 'monthly', priority: '0.6' },
  { path: '/contact', changefreq: 'monthly', priority: '0.7' },
  { path: '/blogs', changefreq: 'weekly', priority: '0.8' },
  { path: '/videos', changefreq: 'weekly', priority: '0.7' },
]

function getSiteOrigin() {
  const raw = process.env.SITE_URL || process.env.FRONTEND_URL || 'http://localhost:5173'
  return raw.replace(/\/$/, '')
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function toW3CDate(value) {
  if (value == null || value === '') return null
  let raw = value
  if (typeof raw === 'number' && raw > 1e9 && raw < 1e12) {
    raw *= 1000
  }
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString().slice(0, 10)
}

function productLastmod(product, fallback) {
  const updated = toW3CDate(product.updatedAt)
  const created = toW3CDate(product.date)
  if (updated && created) return updated >= created ? updated : created
  return updated || created || fallback
}

function normalizeEntry({ loc, lastmod, changefreq, priority }) {
  return {
    loc,
    lastmod: lastmod || null,
    changefreq: changefreq || 'weekly',
    priority: priority || '0.5',
  }
}

/**
 * Collect all indexable URLs from static routes + MongoDB (products, published blogs).
 * Product locs are slug-only; ObjectId URLs are never emitted.
 */
export async function collectSitemapEntries() {
  const origin = getSiteOrigin()
  const today = toW3CDate(Date.now())

  try {
    await backfillMissingProductSlugs()
  } catch (err) {
    console.error('sitemap product slug backfill:', err)
  }

  try {
    await backfillMissingBlogSlugs()
  } catch (err) {
    console.error('sitemap blog slug backfill:', err)
  }

  const staticEntries = INDEXABLE_STATIC_ROUTES.map((route) =>
    normalizeEntry({
      loc: `${origin}${route.path === '/' ? '/' : route.path}`,
      lastmod: today,
      changefreq: route.changefreq,
      priority: route.priority,
    })
  )

  let products = []
  let blogs = []
  try {
    products = await productModel
      .find()
      .select('_id slug date updatedAt')
      .sort({ updatedAt: -1, date: -1 })
      .lean()
  } catch (err) {
    console.error('sitemap products:', err)
  }
  try {
    blogs = await blogModel
      .find({ isPublished: { $ne: false } })
      .select('_id slug updatedAt createdAt')
      .sort({ updatedAt: -1 })
      .lean()
  } catch (err) {
    console.error('sitemap blogs:', err)
  }

  const productEntries = products
    .filter((p) => hasUsableProductSlug(p.slug))
    .map((p) =>
      normalizeEntry({
        loc: `${origin}/product/${p.slug}`,
        lastmod: productLastmod(p, today),
        changefreq: 'weekly',
        priority: '0.8',
      })
    )

  // Always emit published articles (slug preferred; ObjectId fallback so none are dropped).
  const blogEntries = blogs.map((b) => {
    const key = hasUsableBlogSlug(b.slug) ? b.slug : String(b._id)
    return normalizeEntry({
      loc: `${origin}/blog/${key}`,
      lastmod: toW3CDate(b.updatedAt || b.createdAt) || today,
      changefreq: 'monthly',
      priority: '0.7',
    })
  })

  return [...staticEntries, ...blogEntries, ...productEntries]
}

export function buildSitemapXml(entries) {
  const urlBlocks = entries
    .map((entry) => {
      const lines = [
        '  <url>',
        `    <loc>${escapeXml(entry.loc)}</loc>`,
      ]
      if (entry.lastmod) {
        lines.push(`    <lastmod>${entry.lastmod}</lastmod>`)
      }
      if (entry.changefreq) {
        lines.push(`    <changefreq>${entry.changefreq}</changefreq>`)
      }
      if (entry.priority) {
        lines.push(`    <priority>${entry.priority}</priority>`)
      }
      lines.push('  </url>')
      return lines.join('\n')
    })
    .join('\n')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urlBlocks,
    '</urlset>',
    '',
  ].join('\n')
}

export function buildRobotsTxt() {
  const origin = getSiteOrigin()
  return ['User-agent: *', 'Allow: /', '', `Sitemap: ${origin}/sitemap.xml`, ''].join('\n')
}

let cache = { ts: 0, xml: '', entries: [] }
const TTL_MS = Number(process.env.SITEMAP_CACHE_MS) || 300000

export function invalidateSitemapCache() {
  cache = { ts: 0, xml: '', entries: [] }
}

export async function getSitemapXml({ bypassCache = false } = {}) {
  const now = Date.now()
  if (!bypassCache && cache.xml && now - cache.ts < TTL_MS) {
    return { xml: cache.xml, entries: cache.entries, cached: true }
  }

  const entries = await collectSitemapEntries()
  const xml = buildSitemapXml(entries)
  cache = { ts: now, xml, entries }
  return { xml, entries, cached: false }
}
