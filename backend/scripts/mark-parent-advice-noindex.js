/**
 * Hide parent-advice / third-party posts from Google and the public /blogs list.
 * Usage: node scripts/mark-parent-advice-noindex.js
 */
import 'dotenv/config'
import connectDB from '../config/mongodb.js'
import blogModel from '../models/blogModel.js'
import { invalidateSitemapCache } from '../utils/sitemapService.js'

const PARENT_ADVICE_SLUGS = [
  'feeding-your-newborn-tips-for-new-parents',
  'how-to-do-when-a-baby-is-choking',
  'introducing-solid-foods-a-step-by-step-guide',
  'baby-product-safety-what-every-parent-should-know',
  'breastfeeding-positions-finding-what-works-for-you',
  'newborn-baby-essentials-shopping-list-guide-download-our-baby-checklist',
]

async function main() {
  await connectDB()

  const result = await blogModel.updateMany(
    {
      $or: [
        { slug: { $in: PARENT_ADVICE_SLUGS } },
        { title: /mayo clinic|google ai|sassy mama/i },
      ],
    },
    { $set: { indexable: false, author: 'AppleBear Baby' } }
  )

  invalidateSitemapCache()
  console.log(`Marked ${result.modifiedCount} parent-advice posts noindex (matched ${result.matchedCount})`)
  process.exit(0)
}

main().catch((err) => {
  console.error('mark-parent-advice-noindex failed:', err)
  process.exit(1)
})
