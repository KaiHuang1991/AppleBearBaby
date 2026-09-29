/**
 * Apply zh/es/ar/fr translations on OEM buyer guides and known category names.
 * Usage: node scripts/patch-oem-i18n.js
 */
import 'dotenv/config'
import connectDB from '../config/mongodb.js'
import blogModel from '../models/blogModel.js'
import categoryModel from '../models/categoryModel.js'
import { PREFIX_LOCALES, withLocale, hasLocalizedText } from '../utils/locales.js'
import { invalidateSitemapCache } from '../utils/sitemapService.js'
import { CATEGORY_NAME_I18N, OEM_BLOG_I18N } from './oem-blog-i18n.js'

function localizeHtml(html, locale) {
  return String(html || '')
    .replace(/href="https:\/\/applebearbaby\.net(\/[^"]*)"/g, (_, path) => `href="https://applebearbaby.net${withLocale(path, locale)}"`)
    .replace(/href="(\/[^"]+)"/g, (_, path) => `href="${withLocale(path, locale)}"`)
}

function buildTranslations(block) {
  const out = {}
  for (const loc of PREFIX_LOCALES) {
    const entry = block[loc]
    if (!entry) continue
    out[loc] = {
      title: entry.title || '',
      excerpt: entry.excerpt || '',
      content: localizeHtml(entry.content, loc),
    }
  }
  return out
}

async function patchBlogs() {
  let changed = 0
  for (const [slug, block] of Object.entries(OEM_BLOG_I18N)) {
    const blog = await blogModel.findOne({ slug })
    if (!blog) {
      console.warn(`Skip missing blog slug: ${slug}`)
      continue
    }
    blog.translations = buildTranslations(block)
    blog.markModified('translations')
    await blog.save()
    changed += 1
    console.log(`Patched blog translations: ${slug}`)
  }
  return changed
}

async function patchCategories() {
  const categories = await categoryModel.find({})
  const lookup = Object.fromEntries(
    Object.entries(CATEGORY_NAME_I18N).map(([name, map]) => [name.toLowerCase(), map])
  )
  let changed = 0
  for (const category of categories) {
    const map = lookup[String(category.name || '').toLowerCase()]
    if (!map) continue
    const translations = { ...(category.translations?.toObject?.() || category.translations || {}) }
    let touched = false
    for (const loc of PREFIX_LOCALES) {
      if (map[loc] && !hasLocalizedText(translations[loc]?.name)) {
        translations[loc] = { ...(translations[loc] || {}), name: map[loc] }
        touched = true
      }
    }
    if (!touched) continue
    category.translations = translations
    category.markModified('translations')
    await category.save()
    changed += 1
    console.log(`Patched category name: ${category.name}`)
  }
  return changed
}

async function main() {
  await connectDB()
  const blogs = await patchBlogs()
  const categories = await patchCategories()
  if (blogs || categories) invalidateSitemapCache()
  console.log(`Done. Blogs: ${blogs}, categories: ${categories}`)
  process.exit(0)
}

main().catch((err) => {
  console.error('patch-oem-i18n failed:', err)
  process.exit(1)
})
