/**
 * Generate a static sitemap.xml (and robots.txt) for the frontend public folder.
 * Usage: node scripts/generate-sitemap.js
 * Requires MONGODB_URI and FRONTEND_URL (or SITE_URL) in backend/.env
 */
import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import connectDB from '../config/mongodb.js'
import { buildRobotsTxt, collectSitemapEntries, buildSitemapXml } from '../utils/sitemapService.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.resolve(__dirname, '../../frontend/public')

async function main() {
  await connectDB()

  const entries = await collectSitemapEntries()
  const xml = buildSitemapXml(entries)
  const robots = buildRobotsTxt()

  await fs.mkdir(publicDir, { recursive: true })
  await fs.writeFile(path.join(publicDir, 'sitemap.xml'), xml, 'utf8')
  await fs.writeFile(path.join(publicDir, 'robots.txt'), robots, 'utf8')

  const origin = (process.env.SITE_URL || process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '')
  console.log(`✅ Sitemap written (${entries.length} URLs) → frontend/public/sitemap.xml`)
  console.log(`✅ robots.txt written → frontend/public/robots.txt`)
  console.log(`   Public URL: ${origin}/sitemap.xml`)
  process.exit(0)
}

main().catch((err) => {
  console.error('❌ generate-sitemap failed:', err)
  process.exit(1)
})
