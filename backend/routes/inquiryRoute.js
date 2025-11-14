import express from 'express'
import jwt from 'jsonwebtoken'
import {
  createInquiry,
  getAllInquiries,
  getUserInquiries,
  getInquiryById,
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

// User routes (protected) - userId in URL is optional, will use authenticated user ID
// Use two routes: one with userId, one without (both will use authenticated user ID)
router.get('/user/:userId', authUser, getUserInquiries)
router.get('/user', authUser, getUserInquiries) // Route without userId parameter
router.get('/:id', authUser, getInquiryById)
router.put('/user/:id', authUser, updateUserInquiry)
router.post('/user/:id/resend', authUser, resendUserInquiry)
router.delete('/user/:id', authUser, deleteUserInquiry)

// Admin routes (protected)
router.get('/admin/all', adminAuth, getAllInquiries)
router.put('/admin/:id', adminAuth, updateInquiryStatus)
router.delete('/admin/:id', adminAuth, deleteInquiry)

export default router 