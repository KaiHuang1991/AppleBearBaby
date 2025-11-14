import express from 'express'
import {
  getHeroConfig,
  updateHeroConfig,
  addSlide,
  updateSlide,
  deleteSlide
} from '../controllers/heroController.js'
import adminAuth from '../middleware/adminAuth.js'

const router = express.Router()

// Public route - get hero config (for frontend)
router.get('/', getHeroConfig)

// Admin routes - require authentication
router.put('/', adminAuth, updateHeroConfig)
router.post('/slide', adminAuth, addSlide)
router.put('/slide/:slideId', adminAuth, updateSlide)
router.delete('/slide/:slideId', adminAuth, deleteSlide)

export default router

