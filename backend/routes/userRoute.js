import express from "express"
import {loginUser,registerUser,adminLogin,getUserProfile,verifyEmail,resendVerificationEmail,forgotPassword,resetPassword, updateUserAvatar, logoutUser, getAdminUsers, getAdminUserDetail} from '../controllers/userController.js'
import { googleAuth, googleAuthStart, googleAuthCallback, googleOAuthConfig, facebookAuth } from '../controllers/oauthController.js'
import authUser from '../middleware/auth.js'
import adminAuth from '../middleware/adminAuth.js'
import upload from '../middleware/multer.js'
const userRoute = express.Router()
userRoute.post('/register',registerUser)
userRoute.post('/login',loginUser)
userRoute.get('/auth/google/config', googleOAuthConfig)
userRoute.get('/auth/google/start', googleAuthStart)
userRoute.get('/auth/google/callback', googleAuthCallback)
userRoute.post('/auth/google', googleAuth)
userRoute.post('/auth/facebook', facebookAuth)
userRoute.post('/logout', logoutUser)
userRoute.post('/admin',adminLogin)
userRoute.get('/admin/all', adminAuth, getAdminUsers)
userRoute.get('/admin/:id', adminAuth, getAdminUserDetail)
userRoute.get('/profile', authUser, getUserProfile)
userRoute.put('/avatar', authUser, upload.single('avatar'), updateUserAvatar)
userRoute.get('/verify-email/:token', verifyEmail)
userRoute.post('/resend-verification', resendVerificationEmail)
userRoute.post('/forgot-password', forgotPassword)
userRoute.post('/reset-password/:token', resetPassword)

export default userRoute