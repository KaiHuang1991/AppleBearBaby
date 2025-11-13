import categoryModel from '../models/categoryModel.js'
import attributeModel from '../models/attributeModel.js'
import productModel from '../models/productModel.js'

const buildTree = (categories, parent = null) => {
  return categories
    .filter(cat => String(cat.parent || null) === String(parent))
    .map(cat => ({
      ...cat,
      children: buildTree(categories, cat._id),
    }))
}

export const createCategory = async (req, res) => {
  try {
    const { name, parentId } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required' })
    }

    const category = new categoryModel({
      name: name.trim(),
      parent: parentId || null,
    })

    await category.save()

    const populatedCategory = await category.populate('attributes')

    res.status(201).json({ success: true, message: 'Category created successfully', category: populatedCategory })
  } catch (error) {
    console.error('Error creating category:', error)
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Category with the same name already exists under the selected parent' })
    }
    res.status(500).json({ success: false, message: error.message })
  }
}

export const listCategories = async (req, res) => {
  try {
    const categories = await categoryModel
      .find({ isActive: true })
      .populate('attributes')
      .sort({ name: 1 })
      .lean()

    const tree = buildTree(categories.map(cat => ({ ...cat, id: cat._id })))

    res.json({ success: true, categories, tree })
  } catch (error) {
    console.error('Error listing categories:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

export const addAttributeToCategory = async (req, res) => {
  try {
    const { id } = req.params
    const { name, label, description, color } = req.body

    if (!name || !label) {
      return res.status(400).json({ success: false, message: 'Attribute name and label are required' })
    }

    const category = await categoryModel.findById(id)
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' })
    }

    let attribute = await attributeModel.findOne({ name: name.trim() })

    if (!attribute) {
      attribute = new attributeModel({
        name: name.trim(),
        label: label.trim(),
        description,
        color,
      })
      await attribute.save()
    } else {
      // Update label/metadata if provided
      attribute.label = label.trim()
      if (description !== undefined) attribute.description = description
      if (color) attribute.color = color
      await attribute.save()
    }

    if (!category.attributes.some(attrId => String(attrId) === String(attribute._id))) {
      category.attributes.push(attribute._id)
      await category.save()
    }

    const populatedCategory = await category.populate('attributes')

    res.json({
      success: true,
      message: 'Attribute linked to category successfully',
      category: populatedCategory,
      attribute,
    })
  } catch (error) {
    console.error('Error adding attribute to category:', error)
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Attribute with the same name already exists' })
    }
    res.status(500).json({ success: false, message: error.message })
  }
}

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params
    const { name, parentId } = req.body

    const category = await categoryModel.findById(id)
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' })
    }

    if (name && name.trim()) {
      category.name = name.trim()
    }

    if (parentId !== undefined) {
      if (!parentId) {
        category.parent = null
      } else {
        if (String(parentId) === String(id)) {
          return res.status(400).json({ success: false, message: 'Category cannot be its own parent' })
        }
        const parentCategory = await categoryModel.findById(parentId)
        if (!parentCategory) {
          return res.status(400).json({ success: false, message: 'Parent category not found' })
        }

        // ensure no cycle
        let current = parentCategory
        while (current) {
          if (String(current._id) === String(id)) {
            return res.status(400).json({ success: false, message: 'Cannot set a child category as parent' })
          }
          if (!current.parent) break
          current = await categoryModel.findById(current.parent)
        }

        category.parent = parentCategory._id
      }
    }

    await category.save()

    // Update products string fields to reflect latest category names
    await productModel.updateMany({ categoryId: category._id }, { category: category.name })
    await productModel.updateMany({ subCategoryId: category._id }, { subCategory: category.name })

    const populated = await category.populate('attributes')

    res.json({ success: true, message: 'Category updated successfully', category: populated })
  } catch (error) {
    console.error('Error updating category:', error)
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'A category with the same name already exists under the selected parent' })
    }
    res.status(500).json({ success: false, message: error.message })
  }
}

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params

    const category = await categoryModel.findById(id)
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' })
    }

    const hasChildren = await categoryModel.exists({ parent: id })
    if (hasChildren) {
      return res.status(400).json({ success: false, message: 'Please remove or reassign sub categories before deleting this category' })
    }

    const linkedProduct = await productModel.exists({
      $or: [{ categoryId: id }, { subCategoryId: id }]
    })
    if (linkedProduct) {
      return res.status(400).json({ success: false, message: 'There are products linked to this category. Please update or remove those products first.' })
    }

    await categoryModel.findByIdAndDelete(id)

    res.json({ success: true, message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Error deleting category:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

export const updateCategoryAttribute = async (req, res) => {
  try {
    const { id, attributeId } = req.params
    const { name, label, description, color } = req.body

    const category = await categoryModel.findById(id)
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' })
    }

    const attribute = await attributeModel.findById(attributeId)
    if (!attribute) {
      return res.status(404).json({ success: false, message: 'Attribute not found' })
    }

    if (!category.attributes.some(attrId => String(attrId) === String(attribute._id))) {
      category.attributes.push(attribute._id)
    }

    if (name && name.trim()) attribute.name = name.trim()
    if (label && label.trim()) attribute.label = label.trim()
    if (description !== undefined) attribute.description = description
    if (color) attribute.color = color

    await attribute.save()
    await category.save()

    const populatedCategory = await category.populate('attributes')

    res.json({
      success: true,
      message: 'Attribute updated successfully',
      category: populatedCategory,
      attribute,
    })
  } catch (error) {
    console.error('Error updating attribute:', error)
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Attribute name must be unique' })
    }
    res.status(500).json({ success: false, message: error.message })
  }
}

export const removeAttributeFromCategory = async (req, res) => {
  try {
    const { id, attributeId } = req.params

    const category = await categoryModel.findById(id)
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' })
    }

    category.attributes = category.attributes.filter(attrId => String(attrId) !== String(attributeId))
    await category.save()

    await productModel.updateMany(
      { attributes: { $elemMatch: { attribute: attributeId } } },
      { $pull: { attributes: { attribute: attributeId } } }
    )

    const populatedCategory = await category.populate('attributes')

    res.json({ success: true, message: 'Attribute removed from category', category: populatedCategory })
  } catch (error) {
    console.error('Error removing attribute from category:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

export const syncCategoriesFromProducts = async (req, res) => {
  try {
    const products = await productModel.find({}, 'category').lean()

    const existingMain = await categoryModel.find({ parent: null })
    const mainMap = new Map(existingMain.map(cat => [cat.name.trim().toLowerCase(), cat]))

    let createdMain = 0

    for (const product of products) {
      const catName = (product.category || '').trim()
      if (!catName) continue

      const key = catName.toLowerCase()
      if (!mainMap.has(key)) {
        const categoryDoc = new categoryModel({ name: catName })
        await categoryDoc.save()
        mainMap.set(key, categoryDoc)
        createdMain += 1
      }
    }

    const categories = await categoryModel
      .find({ isActive: true })
      .populate('attributes')
      .sort({ name: 1 })
      .lean()
    const tree = buildTree(categories.map(cat => ({ ...cat, id: cat._id })))

    res.json({ success: true, created: { main: createdMain }, categories, tree })
  } catch (error) {
    console.error('Error syncing categories:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

export const removeAllSubCategories = async (req, res) => {
  try {
    const subCategories = await categoryModel.find({ parent: { $ne: null } })
    if (!subCategories.length) {
      return res.json({ success: true, message: 'No sub categories found', removed: 0, updatedProducts: 0 })
    }

    const subCategoryIds = subCategories.map(cat => cat._id)

    const productUpdateResult = await productModel.updateMany(
      { subCategoryId: { $in: subCategoryIds } },
      { $set: { subCategoryId: null, subCategory: '' } }
    )

    const deleteResult = await categoryModel.deleteMany({ _id: { $in: subCategoryIds } })

    res.json({
      success: true,
      message: 'Sub categories removed successfully',
      removed: deleteResult.deletedCount || 0,
      updatedProducts: productUpdateResult.modifiedCount || 0,
    })
  } catch (error) {
    console.error('Error removing sub categories:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}


