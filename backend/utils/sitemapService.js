import productModel from '../models/productModel.js'
import blogModel from '../models/blogModel.js'

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
  if (value == null) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString().slice(0, 10)
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
 */
export async function collectSitemapEntries() {
  const origin = getSiteOrigin()
  const today = toW3CDate(Date.now())

  const staticEntries = INDEXABLE_STATIC_ROUTES.map((route) =>
    normalizeEntry({
      loc: `${origin}${route.path === '/' ? '/' : route.path}`,
      lastmod: today,
      changefreq: route.changefreq,
      priority: route.priority,
    })
  )

  const [products, blogs] = await Promise.all([
    productModel.find().select('_id date').sort({ date: -1 }).lean(),
    blogModel
      .find({ isPublished: true })
      .select('_id updatedAt createdAt')
      .sort({ updatedAt: -1 })
      .lean(),
  ])

  const productEntries = products.map((p) =>
    normalizeEntry({
      loc: `${origin}/product/${p._id}`,
      lastmod: toW3CDate(p.date) || today,
      changefreq: 'weekly',
      priority: '0.8',
    })
  )

  const blogEntries = blogs.map((b) =>
    normalizeEntry({
      loc: `${origin}/blog/${b._id}`,
      lastmod: toW3CDate(b.updatedAt || b.createdAt) || today,
      changefreq: 'monthly',
      priority: '0.7',
    })
  )

  return [...staticEntries, ...productEntries, ...blogEntries]
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
