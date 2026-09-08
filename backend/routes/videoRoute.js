import express from 'express'
import adminAuth from '../middleware/adminAuth.js'
import {
  getAllVideos,
  getAllVideosAdmin,
  getVideoById,
  recordVideoView,
  getVideosByProduct,
  createVideo,
  updateVideo,
  deleteVideo,
  getYouTubeSyncStatus,
  syncYouTubeVideos,
} from '../controllers/videoController.js'

const router = express.Router()

router.get('/all', getAllVideos)
router.get('/admin/all', adminAuth, getAllVideosAdmin)
router.get('/admin/sync-status', adminAuth, getYouTubeSyncStatus)
router.post('/admin/sync-youtube', adminAuth, syncYouTubeVideos)
router.get('/product/:productId', getVideosByProduct)
router.post('/:id/view', recordVideoView)
router.get('/:id', getVideoById)

router.post('/', adminAuth, createVideo)
router.put('/:id', adminAuth, updateVideo)
router.delete('/:id', adminAuth, deleteVideo)

export default router
