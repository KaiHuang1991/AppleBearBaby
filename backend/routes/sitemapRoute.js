import express from 'express'
import { buildRobotsTxt, getSitemapXml } from '../utils/sitemapService.js'

const sitemapRoute = express.Router()

sitemapRoute.get('/sitemap.xml', async (req, res) => {
  try {
    const { xml, entries } = await getSitemapXml()
    res.set('Content-Type', 'application/xml; charset=utf-8')
    res.set('Cache-Control', 'public, max-age=3600')
    res.set('X-Sitemap-Url-Count', String(entries.length))
    res.send(xml)
  } catch (err) {
    console.error('sitemap.xml:', err)
    res.status(500).send('Sitemap generation failed')
  }
})

sitemapRoute.get('/robots.txt', (req, res) => {
  res.set('Content-Type', 'text/plain; charset=utf-8')
  res.set('Cache-Control', 'public, max-age=86400')
  res.send(buildRobotsTxt())
})

export default sitemapRoute
