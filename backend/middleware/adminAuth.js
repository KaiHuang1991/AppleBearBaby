import { json } from 'express'
import jwt from 'jsonwebtoken'

const adminAuth = async(req,res,next) =>{
    try {
        // Try to get token from header first, then from cookies
        const token = req.headers?.token || req.cookies?.adminToken
        if(!token){
            console.log('AdminAuth: No token found in headers or cookies')
            return res.status(401).json({success:false,message:"Not Authorized Login Again"})
        }
        const token_decode = jwt.verify(token,process.env.JWT_SECRET) // decode the token to password 
        const expectedValue = process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD
        if(token_decode !== expectedValue){
            console.log('AdminAuth: Token verification failed. Expected:', expectedValue, 'Got:', token_decode)
            return res.status(401).json({success:false,message:"Not Authorized Login Again"})
        }
        console.log('AdminAuth: Token verified successfully')
        next()
    } catch (error) {
        console.log('AdminAuth error:', error.message)
        res.status(401).json({success:false,message:error.message})
    }
}
export default adminAuth