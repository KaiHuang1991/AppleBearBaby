/**
 * Dev: every /product/:key request is proxied to backend SEO HTML
 * (TDK + JSON-LD + visible product body injected into the SPA shell).
 * Matches production nginx behavior.
 */
export function socialOgPreview() {
  const backendUrl = (process.env.VITE_OG_BACKEND_URL || 'http://127.0.0.1:4000').replace(/\/$/, '')

  return {
    name: 'product-seo-prerender',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Only document navigations — let Vite handle module / asset requests
        const accept = req.headers.accept || ''
        const isDocument =
          req.method === 'GET' &&
          (accept.includes('text/html') || accept === '' || accept.includes('*/*'))

        if (!isDocument) {
          return next()
        }

        const urlPath = (req.url || '').split('?')[0]
        const match = urlPath.match(/^\/product\/([^/]+)\/?$/)
        if (!match) {
          return next()
        }

        try {
          const ogUrl = `${backendUrl}/og/product/${encodeURIComponent(match[1])}`
          const response = await fetch(ogUrl, {
            headers: { Accept: 'text/html' },
            redirect: 'manual',
          })

          // Propagate ObjectId → slug redirects
          if (response.status >= 300 && response.status < 400) {
            const location = response.headers.get('location')
            if (location) {
              res.statusCode = response.status
              res.setHeader('Location', location)
              res.end()
              return
            }
          }

          const html = await response.text()
          res.statusCode = response.status
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          if (response.headers.get('cache-control')) {
            res.setHeader('Cache-Control', response.headers.get('cache-control'))
          }
          res.end(html)
        } catch (error) {
          console.warn('[product-seo-prerender]', error.message)
          next()
        }
      })
    },
  }
}
