/**
 * Backfill SEO slugs for existing products.
 * Usage: node scripts/backfill-product-slugs.js
 * Requires MONGODB_URI in backend/.env
 */
import 'dotenv/config'
import connectDB from '../config/mongodb.js'
import { backfillMissingProductSlugs } from '../utils/productSlug.js'

async function main() {
  await connectDB()

  const { updated, scanned } = await backfillMissingProductSlugs()
  console.log(`✅ Backfill complete: ${updated} updated, ${scanned - updated} already had slug (${scanned} total)`)
  process.exit(0)
}

main().catch((err) => {
  console.error('❌ backfill-product-slugs failed:', err)
  process.exit(1)
})
