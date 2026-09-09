/**
 * Backfill SEO slugs for existing blog posts.
 * Usage: node scripts/backfill-blog-slugs.js
 * Requires MONGODB_URI in backend/.env
 */
import 'dotenv/config'
import connectDB from '../config/mongodb.js'
import { backfillMissingBlogSlugs } from '../utils/blogSlug.js'

async function main() {
  await connectDB()

  const { updated, scanned } = await backfillMissingBlogSlugs()
  console.log(`✅ Blog backfill complete: ${updated} updated, ${scanned - updated} already had slug (${scanned} total)`)
  process.exit(0)
}

main().catch((err) => {
  console.error('❌ backfill-blog-slugs failed:', err)
  process.exit(1)
})
