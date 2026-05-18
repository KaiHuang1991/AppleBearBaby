import express from 'express'
import adminAuth from '../middleware/adminAuth.js'
import {
  getAllVideos,
  getAllVideosAdmin,
  getVideoById,
  getVideosByProduct,
  createVideo,
  updateVideo,
  deleteVideo,
} from '../controllers/videoController.js'

const router = express.Router()

router.get('/all', getAllVideos)
router.get('/admin/all', adminAuth, getAllVideosAdmin)
router.get('/product/:productId', getVideosByProduct)
router.get('/:id', getVideoById)

router.post('/', adminAuth, createVideo)
router.put('/:id', adminAuth, updateVideo)
router.delete('/:id', adminAuth, deleteVideo)

export default router
