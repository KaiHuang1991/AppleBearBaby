/**
 * Seed the 8 homepage category tiles (creates missing catalog nodes).
 * Usage: node scripts/seed-home-categories.js
 */
import 'dotenv/config'
import connectDB from '../config/mongodb.js'
import connectCloudinary from '../config/cloudinary.js'
import { ensureDefaultHomeCategories } from '../utils/homeCategoryDefaults.js'

async function main() {
  await connectDB()
  await connectCloudinary()
  const config = await ensureDefaultHomeCategories({ uploadImages: true, fillBlankImages: true })
  console.log(`Homepage category tiles: ${config.tiles.length}`)
  for (const tile of config.tiles.sort((a, b) => (a.order || 0) - (b.order || 0))) {
    console.log(`- ${tile.title} (${tile.categoryId}) image=${tile.imageUrl ? 'yes' : 'no'}`)
  }
  process.exit(0)
}

main().catch((error) => {
  console.error('seed-home-categories failed:', error)
  process.exit(1)
})
