import express from 'express'
import adminAuth from '../middleware/adminAuth.js'
import {
  createCategory,
  listCategories,
  addAttributeToCategory,
  updateCategory,
  deleteCategory,
  updateCategoryAttribute,
  removeAttributeFromCategory,
  syncCategoriesFromProducts,
  removeAllSubCategories,
} from '../controllers/categoryController.js'

const categoryRoute = express.Router()

categoryRoute.post('/', adminAuth, createCategory)
categoryRoute.get('/', listCategories)
categoryRoute.post('/sync', adminAuth, syncCategoriesFromProducts)
categoryRoute.delete('/sub-categories', adminAuth, removeAllSubCategories)
categoryRoute.post('/:id/attributes', adminAuth, addAttributeToCategory)
categoryRoute.put('/:id', adminAuth, updateCategory)
categoryRoute.delete('/:id', adminAuth, deleteCategory)
categoryRoute.put('/:id/attributes/:attributeId', adminAuth, updateCategoryAttribute)
categoryRoute.delete('/:id/attributes/:attributeId', adminAuth, removeAttributeFromCategory)

export default categoryRoute

