import jwt from 'jsonwebtoken'

const authUser = async(req,res,next) =>{
    // Try to get token from cookie first, then fallback to header
    const token = req.cookies?.token || req.headers?.token
    
    if(!token){
       return res.json({success:false , message:"Not Authrized please Login"})
    }
    try {
        const token_decode = jwt.verify(token,process.env.JWT_SECRET)
        req.user = { id: token_decode.id }
        next()
    } catch (error) {
        console.log(error);
        res.json({success:false , message:error.message})
    }
}
export default authUser