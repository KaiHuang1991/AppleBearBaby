import categoryModel from '../models/categoryModel.js'
import homeCategoryModel from '../models/homeCategoryModel.js'
import { getCategorySlug } from '../utils/categorySlug.js'
import { getCategoryProductCounts } from '../utils/categoryProducts.js'
import { ensureDefaultHomeCategories } from '../utils/homeCategoryDefaults.js'

function tileCategoryId(tile) {
  const value = tile?.categoryId
  if (!value) return ''
  if (typeof value === 'object') return String(value._id || value.id || '')
  return String(value)
}

function serializeTile(tile, categories, counts, { includeInactiveMeta = false } = {}) {
  const categoryId = tileCategoryId(tile)
  const category = categories.find((cat) => String(cat._id) === categoryId) || null
  if (!category) return null
  const productCount = counts.get(categoryId) || 0
  return {
    _id: tile._id,
    categoryId,
    categoryName: category.name,
    title: String(tile.title || '').trim() || category.name,
    imageUrl: tile.imageUrl || '',
    slug: getCategorySlug(category, categories),
    order: tile.order || 0,
    isActive: tile.isActive !== false,
    productCount,
    comingSoon: productCount === 0,
    ...(includeInactiveMeta ? {} : {}),
  }
}

async function loadCategoryContext() {
  const categories = await categoryModel.find({ isActive: { $ne: false } }).lean()
  const counts = await getCategoryProductCounts(categories)
  return { categories, counts }
}

export const listHomeCategories = async (req, res) => {
  try {
    await ensureDefaultHomeCategories()
    const config = await homeCategoryModel.getConfig()
    const { categories, counts } = await loadCategoryContext()
    const tiles = config.tiles
      .filter((tile) => tile.isActive !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((tile) => serializeTile(tile, categories, counts))
      .filter(Boolean)

    res.json({ success: true, tiles })
  } catch (error) {
    console.error('Error listing home categories:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

export const adminListHomeCategories = async (req, res) => {
  try {
    await ensureDefaultHomeCategories()
    const config = await homeCategoryModel.getConfig()
    const { categories, counts } = await loadCategoryContext()
    const tiles = config.tiles
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((tile) => serializeTile(tile, categories, counts, { includeInactiveMeta: true }))
      .filter(Boolean)

    res.json({ success: true, tiles, categories })
  } catch (error) {
    console.error('Error listing admin home categories:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

export const addHomeCategoryTile = async (req, res) => {
  try {
    const { categoryId, title, imageUrl, order, isActive } = req.body
    if (!categoryId) {
      return res.status(400).json({ success: false, message: 'Category is required' })
    }

    const category = await categoryModel.findById(categoryId)
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' })
    }

    const config = await homeCategoryModel.getConfig()
    const already = config.tiles.some((tile) => String(tile.categoryId) === String(categoryId) && tile.isActive !== false)
    if (already) {
      return res.status(409).json({ success: false, message: 'That category is already on the homepage' })
    }

    config.tiles.push({
      categoryId,
      title: String(title || '').trim() || category.name,
      imageUrl: String(imageUrl || '').trim(),
      order: order !== undefined ? Number(order) : config.tiles.length,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    })
    await config.save()

    const tile = config.tiles[config.tiles.length - 1]
    res.json({ success: true, message: 'Homepage category added', tile })
  } catch (error) {
    console.error('Error adding home category tile:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

export const updateHomeCategoryTile = async (req, res) => {
  try {
    const { tileId } = req.params
    const { categoryId, title, imageUrl, order, isActive } = req.body
    const config = await homeCategoryModel.getConfig()
    const tile = config.tiles.id(tileId)
    if (!tile) {
      return res.status(404).json({ success: false, message: 'Homepage category not found' })
    }

    if (categoryId !== undefined) {
      const category = await categoryModel.findById(categoryId)
      if (!category) {
        return res.status(404).json({ success: false, message: 'Category not found' })
      }
      tile.categoryId = categoryId
    }
    if (title !== undefined) tile.title = String(title).trim()
    if (imageUrl !== undefined) tile.imageUrl = String(imageUrl).trim()
    if (order !== undefined) tile.order = Number(order)
    if (isActive !== undefined) tile.isActive = Boolean(isActive)

    await config.save()
    res.json({ success: true, message: 'Homepage category updated', tile })
  } catch (error) {
    console.error('Error updating home category tile:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

export const deleteHomeCategoryTile = async (req, res) => {
  try {
    const { tileId } = req.params
    const config = await homeCategoryModel.getConfig()
    const tile = config.tiles.id(tileId)
    if (!tile) {
      return res.status(404).json({ success: false, message: 'Homepage category not found' })
    }

    config.tiles.pull(tileId)
    await config.save()
    res.json({ success: true, message: 'Removed from homepage. Catalog category was not deleted.' })
  } catch (error) {
    console.error('Error deleting home category tile:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

export const reorderHomeCategoryTiles = async (req, res) => {
  try {
    const { tiles } = req.body
    if (!Array.isArray(tiles)) {
      return res.status(400).json({ success: false, message: 'tiles array is required' })
    }

    const config = await homeCategoryModel.getConfig()
    for (const incoming of tiles) {
      const tile = incoming?._id ? config.tiles.id(incoming._id) : null
      if (!tile) continue
      if (incoming.order !== undefined) tile.order = Number(incoming.order)
    }
    await config.save()
    res.json({ success: true, message: 'Homepage category order saved' })
  } catch (error) {
    console.error('Error reordering home category tiles:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}
