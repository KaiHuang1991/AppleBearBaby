/**
 * Apply wholesale Name / Model number / Description from docs/oem-product-copy.md.
 * Does not change slug.
 * Usage: node scripts/apply-oem-product-copy.js
 *        node scripts/apply-oem-product-copy.js --dry-run
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import 'dotenv/config'
import mongoose from 'mongoose'
import connectDB from '../config/mongodb.js'
import productModel from '../models/productModel.js'
import { invalidateSitemapCache } from '../utils/sitemapService.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const MD_PATH = path.resolve(__dirname, '../../docs/oem-product-copy.md')
const DRY_RUN = process.argv.includes('--dry-run')

function parseCopyDoc(markdown) {
  const headerRe = /^### (\d+)\. .+$/gm
  const starts = []
  let match
  while ((match = headerRe.exec(markdown))) {
    starts.push({ n: Number(match[1]), index: match.index })
  }

  return starts.map((start, i) => {
    const end = i + 1 < starts.length ? starts[i + 1].index : markdown.length
    const body = markdown.slice(start.index, end)
    const id = body.match(/\/admin\/single\/([a-f0-9]{24})/)?.[1] || ''
    const slug = body.match(/\*\*Slug（勿改）：\*\*\s*`([^`]+)`/)?.[1] || ''
    const name = body.match(/\*\*新标题：\*\*\s*`([^`]+)`/)?.[1] || ''
    const newModel = body.match(/\*\*新型号：\*\*\s*`([^`]+)`/)
    const listedModel = body.match(/\*\*型号：\*\*\s*`([^`]+)`/)
    const modelNumber = (newModel?.[1] || listedModel?.[1] || '').trim()
    const description = (body.match(/```html\r?\n([\s\S]*?)```/)?.[1] || '').trim()
    return { n: start.n, id, slug, name, modelNumber, description }
  })
}

async function main() {
  const markdown = await fs.readFile(MD_PATH, 'utf8')
  const rows = parseCopyDoc(markdown)
  const invalid = rows.filter((row) => !row.id || !row.name || !row.description)
  if (invalid.length) {
    console.error('Parse failed for:', invalid.map((row) => row.n).join(', '))
    process.exit(1)
  }
  if (rows.length !== 34) {
    console.error(`Expected 34 SKUs, parsed ${rows.length}`)
    process.exit(1)
  }

  await connectDB()

  let updated = 0
  let missing = 0
  let slugMismatch = 0

  for (const row of rows) {
    const product = await productModel.findById(row.id).select('name slug modelNumber')
    if (!product) {
      missing += 1
      console.warn(`#${row.n} missing ${row.id} — ${row.name}`)
      continue
    }
    if (row.slug && product.slug && product.slug !== row.slug) {
      slugMismatch += 1
      console.warn(`#${row.n} slug mismatch db=${product.slug} doc=${row.slug} (slug left unchanged)`)
    }
    if (DRY_RUN) {
      console.log(`#${row.n} ${product.slug || product._id}`)
      console.log(`  name: ${product.name} → ${row.name}`)
      console.log(`  model: ${product.modelNumber || '(empty)'} → ${row.modelNumber || '(empty)'}`)
      continue
    }

    await productModel.updateOne(
      { _id: row.id },
      {
        $set: {
          name: row.name,
          modelNumber: row.modelNumber,
          description: row.description,
          updatedAt: Date.now(),
        },
      }
    )
    updated += 1
    console.log(`#${row.n} updated ${row.name}`)
  }

  if (!DRY_RUN) {
    invalidateSitemapCache()
  }

  console.log(
    DRY_RUN
      ? `Dry run: ${rows.length} SKUs parsed, ${missing} missing`
      : `Done: ${updated} updated, ${missing} missing, ${slugMismatch} slug notes`
  )
  await mongoose.disconnect()
  process.exit(missing ? 1 : 0)
}

main().catch((err) => {
  console.error('apply-oem-product-copy failed:', err)
  process.exit(1)
})
