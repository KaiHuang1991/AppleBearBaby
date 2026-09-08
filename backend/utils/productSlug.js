import mongoose from 'mongoose'
import productModel from '../models/productModel.js'

export function slugifyProduct(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Build a unique slug from a product name. Excludes `excludeId` when updating.
 */
export async function ensureUniqueProductSlug(name, { excludeId = null } = {}) {
  const base = slugifyProduct(name) || 'product'
  let candidate = base
  let n = 2

  while (true) {
    const query = { slug: candidate }
    if (excludeId) {
      query._id = { $ne: excludeId }
    }
    const existing = await productModel.findOne(query).select('_id').lean()
    if (!existing) return candidate
    candidate = `${base}-${n}`
    n += 1
    if (n > 500) {
      const suffix = excludeId ? String(excludeId).slice(-6) : Date.now().toString(36)
      return `${base}-${suffix}`
    }
  }
}

export function isObjectIdString(value) {
  return Boolean(value) && mongoose.Types.ObjectId.isValid(value) && String(value).length === 24
}

/** True when the stored slug is safe to put in a public product URL. */
export function hasUsableProductSlug(slug) {
  const value = String(slug || '').trim()
  return Boolean(value) && !isObjectIdString(value)
}

/**
 * Persist SEO slugs for products that still use ObjectId URLs or an empty slug.
 * Safe to call from sitemap generation; skips products that already have a slug.
 */
export async function backfillMissingProductSlugs() {
  const products = await productModel.find().select('_id name slug').lean()
  let updated = 0

  for (const product of products) {
    if (hasUsableProductSlug(product.slug)) continue

    const slug = await ensureUniqueProductSlug(product.name, { excludeId: product._id })
    await productModel.updateOne(
      { _id: product._id },
      { $set: { slug, updatedAt: Date.now() } }
    )
    updated += 1
    console.log(`product slug backfill: ${product._id} → ${slug}`)
  }

  return { updated, scanned: products.length }
}

/**
 * Resolve a product by SEO slug or MongoDB ObjectId.
 */
export async function findProductBySlugOrId(param, { select, lean = false, populate } = {}) {
  if (!param) return null

  let query
  if (isObjectIdString(param)) {
    query = productModel.findById(param)
  } else {
    query = productModel.findOne({ slug: slugifyProduct(param) || param })
  }

  if (select) query = query.select(select)
  if (populate) query = query.populate(populate)
  if (lean) query = query.lean()

  return query.exec()
}

export function getProductUrlKey(product) {
  if (!product) return ''
  if (product.slug) return product.slug
  return String(product._id || '')
}

export function getProductPath(product) {
  const key = getProductUrlKey(product)
  return key ? `/product/${key}` : ''
}
