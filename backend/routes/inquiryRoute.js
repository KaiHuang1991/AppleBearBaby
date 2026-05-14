import express from 'express'
import jwt from 'jsonwebtoken'
import {
  createInquiry,
  getAllInquiries,
  getAdminInquiryUnreadCount,
  getUserInquiryUnreadCount,
  getUserInquiries,
  getInquiryById,
  getAdminInquiryThread,
  postUserInquiryMessage,
  postAdminInquiryMessage,
  updateInquiryStatus,
  deleteInquiry,
  deleteUserInquiry,
  updateUserInquiry,
  resendUserInquiry
} from '../controllers/inquiryController.js'
import adminAuth from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'

const router = express.Router()

// Public routes (but try to use authenticated user if available)
// Use optional auth middleware - if token exists, req.user will be set
const optionalAuth = async (req, res, next) => {
  // Try to authenticate, but don't fail if no token
  const token = req.cookies?.token || req.headers?.token
  if (!token) {
    return next() // No token, continue without authentication
  }
  
  // Token exists, try to authenticate
  try {
    const token_decode = jwt.verify(token, process.env.JWT_SECRET)
    req.user = { id: token_decode.id }
    next()
  } catch (error) {
    // Invalid token, continue without authentication
    next()
  }
}

router.post('/create', optionalAuth, createInquiry) // Can be called with or without auth
router.put('/email-status/:id', updateInquiryStatus) // Public route for updating email status

// User thread (must be before /user/:userId so "thread" is not captured as userId)
router.get('/user/thread/:id', authUser, getInquiryById)
router.post('/user/thread/:id/messages', authUser, postUserInquiryMessage)
router.get('/user/unread-count', authUser, getUserInquiryUnreadCount)

// User routes (protected) - userId in URL is optional, will use authenticated user ID
router.get('/user', authUser, getUserInquiries)
router.get('/user/:userId', authUser, getUserInquiries)
router.put('/user/:id', authUser, updateUserInquiry)
router.post('/user/:id/resend', authUser, resendUserInquiry)
router.delete('/user/:id', authUser, deleteUserInquiry)

// Admin routes (protected)
router.get('/admin/unread-count', adminAuth, getAdminInquiryUnreadCount)
router.get('/admin/all', adminAuth, getAllInquiries)
router.get('/admin/thread/:id', adminAuth, getAdminInquiryThread)
router.post('/admin/thread/:id/messages', adminAuth, postAdminInquiryMessage)
router.put('/admin/:id', adminAuth, updateInquiryStatus)
router.delete('/admin/:id', adminAuth, deleteInquiry)

// Single inquiry by id (owner only; same handler as user/thread/:id)
router.get('/:id', authUser, getInquiryById)

export default router 