const SOCIAL_CRAWLER_REGEX =
  /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|Slackbot|TelegramBot|Discordbot|Pinterestbot/i

/**
 * Dev-only: when a social crawler requests /product/:id, proxy to backend OG HTML.
 */
export function socialOgPreview() {
  const backendUrl = (process.env.VITE_OG_BACKEND_URL || 'http://127.0.0.1:4000').replace(/\/$/, '')

  return {
    name: 'social-og-preview',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const userAgent = req.headers['user-agent'] || ''
        if (!SOCIAL_CRAWLER_REGEX.test(userAgent)) {
          return next()
        }

        const match = req.url?.match(/^\/product\/([^/?#]+)/)
        if (!match) {
          return next()
        }

        try {
          const ogUrl = `${backendUrl}/og/product/${match[1]}`
          const response = await fetch(ogUrl)
          const html = await response.text()
          res.statusCode = response.status
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.end(html)
        } catch (error) {
          console.warn('[social-og-preview]', error.message)
          next()
        }
      })
    },
  }
}
