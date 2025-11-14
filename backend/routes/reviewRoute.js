import express from 'express'
import {
  addReview,
  deleteReview,
  updateReview,
  getProductReviews
} from '../controllers/reviewController.js'
import authUser from '../middleware/auth.js'
import upload from '../middleware/multer.js'

const router = express.Router()

// Get reviews for a product (public)
router.get('/product/:productId', getProductReviews)

// Review operations (authenticated users)
router.post('/add', authUser, upload.fields([{ name: 'media', maxCount: 10 }]), addReview)
router.put('/update/:id', authUser, updateReview)
router.delete('/delete/:id', authUser, deleteReview)

export default router
















