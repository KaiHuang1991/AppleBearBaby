/**
 * Dev: document navigations for product / blog / static pages are proxied
 * to backend SEO HTML (TDK + JSON-LD + visible body in the SPA shell).
 * The backend shell is built from frontend/dist, so hashed /assets/* files
 * 404 under Vite — rewrite them back to /src/main.jsx for local hydration.
 */
const STATIC_PAGE_KEYS = new Set(['collection', 'about', 'contact', 'shipping', 'faq', 'blogs', 'videos'])
const PREFIX_LOCALES = new Set(['zh', 'es', 'ar', 'fr'])

function adaptOgHtmlForVite(html) {
  return String(html)
    .replace(/<script type="module"[^>]*src="\/assets\/[^"]+"><\/script>/gi, '<script type="module" src="/src/main.jsx"></script>')
    .replace(/<link rel="modulepreload"[^>]*>/gi, '')
    .replace(/<link rel="stylesheet"[^>]*href="\/assets\/[^"]+"[^>]*>/gi, '')
}

function resolveOgTarget(urlPath, backendUrl) {
  const parts = String(urlPath || '/').split('/').filter(Boolean)
  let locale = 'en'
  if (parts[0] && PREFIX_LOCALES.has(parts[0])) {
    locale = parts.shift()
  }
  const rest = parts.length ? `/${parts.join('/')}` : '/'
  const localeQuery = locale === 'en' ? '' : `?locale=${locale}`

  const productMatch = rest.match(/^\/product\/([^/]+)\/?$/)
  const blogMatch = rest.match(/^\/blog\/([^/]+)\/?$/)
  const collectionMatch = rest.match(/^\/collection\/([^/]+)\/?$/)
  const staticKey = rest.replace(/^\/|\/$/g, '')

  if (productMatch) {
    return `${backendUrl}/og/product/${encodeURIComponent(productMatch[1])}${localeQuery}`
  }
  if (blogMatch) {
    return `${backendUrl}/og/blog/${encodeURIComponent(blogMatch[1])}${localeQuery}`
  }
  if (collectionMatch) {
    return `${backendUrl}/og/page/collection/${encodeURIComponent(collectionMatch[1])}${localeQuery}`
  }
  if (rest === '/' || rest === '') {
    return `${backendUrl}/og/page/home${localeQuery}`
  }
  if (STATIC_PAGE_KEYS.has(staticKey)) {
    return `${backendUrl}/og/page/${encodeURIComponent(staticKey)}${localeQuery}`
  }
  return null
}

export function socialOgPreview() {
  const backendUrl = (process.env.VITE_OG_BACKEND_URL || 'http://127.0.0.1:4000').replace(/\/$/, '')

  return {
    name: 'seo-prerender',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const accept = req.headers.accept || ''
        const isDocument =
          req.method === 'GET' &&
          (accept.includes('text/html') || accept === '' || accept.includes('*/*'))

        if (!isDocument) {
          return next()
        }

        const urlPath = (req.url || '').split('?')[0]
        if (
          req.headers['x-seo-shell'] === '1' ||
          urlPath.startsWith('/src/') ||
          urlPath.startsWith('/@') ||
          urlPath.startsWith('/node_modules/') ||
          urlPath.startsWith('/assets/') ||
          /\.\w+$/.test(urlPath)
        ) {
          return next()
        }

        const ogUrl = resolveOgTarget(urlPath, backendUrl)
        if (!ogUrl) {
          return next()
        }

        try {
          const response = await fetch(ogUrl, {
            headers: { Accept: 'text/html' },
            redirect: 'manual',
          })

          if (response.status >= 300 && response.status < 400) {
            const location = response.headers.get('location')
            if (location) {
              res.statusCode = response.status
              res.setHeader('Location', location)
              res.end()
              return
            }
          }

          const html = await server.transformIndexHtml(
            urlPath || '/',
            adaptOgHtmlForVite(await response.text())
          )
          res.statusCode = response.status
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.setHeader('Cache-Control', 'no-store')
          res.end(html)
        } catch (error) {
          console.warn('[seo-prerender]', error.message)
          next()
        }
      })
    },
  }
}
