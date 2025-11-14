import express from "express"
import {loginUser,registerUser,adminLogin,getUserProfile,verifyEmail,resendVerificationEmail,forgotPassword,resetPassword, updateUserAvatar, logoutUser} from '../controllers/userController.js'
import authUser from '../middleware/auth.js'
import upload from '../middleware/multer.js'
const userRoute = express.Router()
userRoute.post('/register',registerUser)
userRoute.post('/login',loginUser)
userRoute.post('/logout', logoutUser)
userRoute.post('/admin',adminLogin)
userRoute.get('/profile', authUser, getUserProfile)
userRoute.put('/avatar', authUser, upload.single('avatar'), updateUserAvatar)
userRoute.get('/verify-email/:token', verifyEmail)
userRoute.post('/resend-verification', resendVerificationEmail)
userRoute.post('/forgot-password', forgotPassword)
userRoute.post('/reset-password/:token', resetPassword)

export default userRoute