import blogModel from '../models/blogModel.js'
import { isObjectIdString, slugifyProduct } from './productSlug.js'

export function slugifyBlog(value) {
  return slugifyProduct(value)
}

export async function ensureUniqueBlogSlug(title, { excludeId = null } = {}) {
  const base = slugifyBlog(title) || 'article'
  let candidate = base
  let n = 2

  while (true) {
    const query = { slug: candidate }
    if (excludeId) {
      query._id = { $ne: excludeId }
    }
    const existing = await blogModel.findOne(query).select('_id').lean()
    if (!existing) return candidate
    candidate = `${base}-${n}`
    n += 1
    if (n > 500) {
      const suffix = excludeId ? String(excludeId).slice(-6) : Date.now().toString(36)
      return `${base}-${suffix}`
    }
  }
}

export function hasUsableBlogSlug(slug) {
  const value = String(slug || '').trim()
  return Boolean(value) && !isObjectIdString(value)
}

export async function backfillMissingBlogSlugs() {
  const blogs = await blogModel.find().select('_id title slug').lean()
  let updated = 0

  for (const blog of blogs) {
    if (hasUsableBlogSlug(blog.slug)) continue

    try {
      const slug = await ensureUniqueBlogSlug(blog.title, { excludeId: blog._id })
      await blogModel.updateOne({ _id: blog._id }, { $set: { slug } })
      updated += 1
      console.log(`blog slug backfill: ${blog._id} → ${slug}`)
    } catch (err) {
      console.error(`blog slug backfill failed for ${blog._id}:`, err.message)
    }
  }

  return { updated, scanned: blogs.length }
}

export function getBlogUrlKey(blog) {
  if (!blog) return ''
  if (blog.slug) return blog.slug
  return String(blog._id || '')
}

export function getBlogPath(blog) {
  const key = getBlogUrlKey(blog)
  return key ? `/blog/${key}` : '/blogs'
}

export async function findBlogBySlugOrId(param, { select, lean = false } = {}) {
  if (!param) return null

  let query
  if (isObjectIdString(param)) {
    query = blogModel.findById(param)
  } else {
    query = blogModel.findOne({ slug: slugifyBlog(param) || param })
  }

  if (select) query = query.select(select)
  if (lean) query = query.lean()

  return query.exec()
}
