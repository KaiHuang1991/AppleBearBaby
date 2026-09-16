import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { v2 as cloudinary } from 'cloudinary'
import categoryModel from '../models/categoryModel.js'
import homeCategoryModel from '../models/homeCategoryModel.js'
import { slugifyCategory } from './categorySlug.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const HOME_CATEGORY_DEFAULTS = [
  {
    title: 'Bottle Nipples',
    names: ['Bottle Nipples', 'Nipple', 'Nipples'],
    slugs: ['bottle-nipples', 'nipple'],
    namePattern: /nipple/i,
    imageFile: 'bottle-nipples.png',
  },
  {
    title: 'Bath & Care',
    names: ['Bath & Care', 'Bath and Care'],
    slugs: ['bath-and-care', 'bath-care'],
    create: true,
    imageFile: 'bath-care.png',
  },
  {
    title: 'Sippy Cups',
    names: ['Sippy Cups', 'Sippy Cup'],
    slugs: ['sippy-cups', 'sippy-cup'],
    create: true,
    imageFile: 'sippy-cups.png',
  },
  {
    title: 'Baby Clothing',
    names: ['Baby Clothing'],
    slugs: ['baby-clothing'],
    create: true,
    imageFile: 'baby-clothing.png',
  },
  {
    title: 'Bottle Brushes',
    names: ['Bottle Brushes', 'Bottle Brush'],
    slugs: ['bottle-brush', 'bottle-brushes'],
    namePattern: /brush/i,
    imageFile: 'bottle-brushes.png',
  },
  {
    title: 'Pacifiers & Teethers',
    names: ['Pacifiers & Teethers', 'Pacifier', 'Pacifiers'],
    slugs: ['pacifier', 'pacifiers'],
    namePattern: /pacifier|teether/i,
    imageFile: 'pacifiers-teethers.png',
  },
  {
    title: 'Feeding Sets',
    names: ['Feeding Sets', 'Baby Feeding Bottle Set', 'Feeding Bottles'],
    slugs: ['baby-feeding-bottle-set', 'feeding-sets', 'feeding-bottles'],
    namePattern: /feeding set/i,
    imageFile: 'feeding-sets.png',
  },
  {
    title: 'Breast Pumps',
    names: ['Breast Pumps', 'Breast Pump'],
    slugs: ['breast-pumps', 'breast-pump'],
    create: true,
    imageFile: 'breast-pumps.png',
  },
]

function categoryImagePath(fileName) {
  return path.resolve(__dirname, '../../frontend/src/assets/categories', fileName)
}

function matchCategory(categories, spec) {
  const nameSet = new Set((spec.names || []).map((name) => String(name).toLowerCase()))
  const slugSet = new Set((spec.slugs || []).map((slug) => slugifyCategory(slug)))

  const exactName = categories.find((cat) => nameSet.has(String(cat.name || '').toLowerCase()))
  if (exactName) return exactName

  const exactSlug = categories.find((cat) => slugSet.has(slugifyCategory(cat.slug || cat.name)))
  if (exactSlug) return exactSlug

  if (spec.namePattern) {
    return categories.find((cat) => spec.namePattern.test(String(cat.name || ''))) || null
  }
  return null
}

async function ensureCategory(spec, categories) {
  const existing = matchCategory(categories, spec)
  if (existing) return existing

  try {
    const created = await categoryModel.create({
      name: spec.title,
      slug: slugifyCategory(spec.slugs?.[0] || spec.title),
      parent: null,
      isActive: true,
    })
    const plain = created.toObject()
    categories.push(plain)
    return plain
  } catch (error) {
    if (error.code === 11000) {
      const again = await categoryModel.findOne({ name: spec.title, parent: null }).lean()
      if (again) {
        categories.push(again)
        return again
      }
    }
    throw error
  }
}

async function uploadCategoryImage(fileName) {
  if (!process.env.CLOUDINARY_NAME || !fileName) return ''
  try {
    const filePath = categoryImagePath(fileName)
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'home-categories',
      use_filename: true,
      unique_filename: false,
      overwrite: false,
    })
    return result?.secure_url || result?.url || ''
  } catch (error) {
    console.warn(`home-category image upload skipped (${fileName}):`, error.message)
    return ''
  }
}

/**
 * First-run seed: create missing catalog nodes and homepage tiles for the current 8 cards.
 * Does not overwrite tiles once CMS data exists, unless `forceImages` fills blank imageUrl.
 */
export async function ensureDefaultHomeCategories({ uploadImages = false, fillBlankImages = false } = {}) {
  const config = await homeCategoryModel.getConfig()
  const categories = await categoryModel.find({ isActive: { $ne: false } }).lean()

  if (!config.tiles.length) {
    for (let index = 0; index < HOME_CATEGORY_DEFAULTS.length; index += 1) {
      const spec = HOME_CATEGORY_DEFAULTS[index]
      const category = await ensureCategory(spec, categories)
      const imageUrl = uploadImages ? await uploadCategoryImage(spec.imageFile) : ''
      config.tiles.push({
        categoryId: category._id,
        title: spec.title,
        imageUrl,
        order: index,
        isActive: true,
      })
    }
    await config.save()
    return config
  }

  if (fillBlankImages && uploadImages) {
    let changed = false
    for (const tile of config.tiles) {
      if (tile.imageUrl) continue
      const spec = HOME_CATEGORY_DEFAULTS.find((item) => item.title === tile.title)
      if (!spec?.imageFile) continue
      const imageUrl = await uploadCategoryImage(spec.imageFile)
      if (imageUrl) {
        tile.imageUrl = imageUrl
        changed = true
      }
    }
    if (changed) await config.save()
  }

  return config
}
