import express from 'express'
import adminAuth from '../middleware/adminAuth.js'
import {
  addHomeCategoryTile,
  adminListHomeCategories,
  deleteHomeCategoryTile,
  listHomeCategories,
  reorderHomeCategoryTiles,
  updateHomeCategoryTile,
} from '../controllers/homeCategoryController.js'

const homeCategoryRoute = express.Router()

homeCategoryRoute.get('/', listHomeCategories)
homeCategoryRoute.get('/admin', adminAuth, adminListHomeCategories)
homeCategoryRoute.put('/reorder', adminAuth, reorderHomeCategoryTiles)
homeCategoryRoute.post('/tile', adminAuth, addHomeCategoryTile)
homeCategoryRoute.put('/tile/:tileId', adminAuth, updateHomeCategoryTile)
homeCategoryRoute.delete('/tile/:tileId', adminAuth, deleteHomeCategoryTile)

export default homeCategoryRoute
