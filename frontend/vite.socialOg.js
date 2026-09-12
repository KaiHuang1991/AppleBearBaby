/**
 * Dev: document navigations for product / blog / static pages are proxied
 * to backend SEO HTML (TDK + JSON-LD + visible body in the SPA shell).
 * The backend shell is built from frontend/dist, so hashed /assets/* files
 * 404 under Vite — rewrite them back to /src/main.jsx for local hydration.
 */
const STATIC_PAGE_KEYS = new Set(['collection', 'about', 'contact', 'shipping', 'blogs', 'videos'])

function adaptOgHtmlForVite(html) {
  return String(html)
    .replace(/<script type="module"[^>]*src="\/assets\/[^"]+"><\/script>/gi, '<script type="module" src="/src/main.jsx"></script>')
    .replace(/<link rel="modulepreload"[^>]*>/gi, '')
    .replace(/<link rel="stylesheet"[^>]*href="\/assets\/[^"]+"[^>]*>/gi, '')
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
          urlPath.startsWith('/src/') ||
          urlPath.startsWith('/@') ||
          urlPath.startsWith('/node_modules/') ||
          urlPath.startsWith('/assets/') ||
          /\.\w+$/.test(urlPath)
        ) {
          return next()
        }

        let ogUrl = null

        const productMatch = urlPath.match(/^\/product\/([^/]+)\/?$/)
        const blogMatch = urlPath.match(/^\/blog\/([^/]+)\/?$/)
        const staticKey = urlPath.replace(/^\/|\/$/g, '')

        if (productMatch) {
          ogUrl = `${backendUrl}/og/product/${encodeURIComponent(productMatch[1])}`
        } else if (blogMatch) {
          ogUrl = `${backendUrl}/og/blog/${encodeURIComponent(blogMatch[1])}`
        } else if (urlPath === '/' || urlPath === '') {
          ogUrl = `${backendUrl}/og/page/home`
        } else if (STATIC_PAGE_KEYS.has(staticKey)) {
          ogUrl = `${backendUrl}/og/page/${encodeURIComponent(staticKey)}`
        }

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
