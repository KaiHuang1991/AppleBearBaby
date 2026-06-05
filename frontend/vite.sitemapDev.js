/** Keep in sync with backend/utils/sitemapService.js INDEXABLE_STATIC_ROUTES */
const STATIC_ROUTES = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/collection', changefreq: 'daily', priority: '0.9' },
  { path: '/about', changefreq: 'monthly', priority: '0.6' },
  { path: '/contact', changefreq: 'monthly', priority: '0.7' },
  { path: '/blogs', changefreq: 'weekly', priority: '0.8' },
  { path: '/videos', changefreq: 'weekly', priority: '0.7' },
]

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function buildStaticSitemapXml(origin) {
  const today = new Date().toISOString().slice(0, 10)
  const urlBlocks = STATIC_ROUTES.map((route) => {
    const loc = `${origin}${route.path === '/' ? '/' : route.path}`
    return [
      '  <url>',
      `    <loc>${escapeXml(loc)}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      `    <changefreq>${route.changefreq}</changefreq>`,
      `    <priority>${route.priority}</priority>`,
      '  </url>',
    ].join('\n')
  }).join('\n')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urlBlocks,
    '</urlset>',
    '',
  ].join('\n')
}

function buildRobotsTxt(origin) {
  return ['User-agent: *', 'Allow: /', '', `Sitemap: ${origin}/sitemap.xml`, ''].join('\n')
}

/**
 * Dev: serve /sitemap.xml and /robots.txt.
 * Tries backend first (full DB URLs); falls back to static routes when backend is down.
 */
export function sitemapDev() {
  const backendUrl = (process.env.VITE_BACKEND_URL || 'http://127.0.0.1:4000').replace(/\/$/, '')
  const siteOrigin = (process.env.VITE_SITE_URL || 'http://localhost:5173').replace(/\/$/, '')

  return {
    name: 'sitemap-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = req.url?.split('?')[0]
        if (path !== '/sitemap.xml' && path !== '/robots.txt') {
          return next()
        }

        if (path === '/robots.txt') {
          try {
            const response = await fetch(`${backendUrl}/robots.txt`)
            if (response.ok) {
              res.setHeader('Content-Type', 'text/plain; charset=utf-8')
              res.end(await response.text())
              return
            }
          } catch {
            // fallback below
          }
          res.setHeader('Content-Type', 'text/plain; charset=utf-8')
          res.end(buildRobotsTxt(siteOrigin))
          return
        }

        try {
          const response = await fetch(`${backendUrl}/sitemap.xml`)
          if (response.ok) {
            res.setHeader('Content-Type', 'application/xml; charset=utf-8')
            res.end(await response.text())
            return
          }
        } catch {
          console.warn('[sitemap-dev] Backend unavailable — serving static routes only. Start backend for full sitemap.')
        }

        res.setHeader('Content-Type', 'application/xml; charset=utf-8')
        res.setHeader('X-Sitemap-Source', 'static-fallback')
        res.end(buildStaticSitemapXml(siteOrigin))
      })
    },
  }
}
