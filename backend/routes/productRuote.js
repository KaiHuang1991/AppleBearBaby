import express from "express"
import {addProduct,listProduct,removeProduct,singleProduct,updateImg,updateProduct,uploadDescriptionImage} from '../controllers/productController.js'
import adminAuth from "../middleware/adminAuth.js"
import upload from "../middleware/multer.js"
import authUser from '../middleware/auth.js'
import { submitComment,commentsList } from "../controllers/productController.js"

const productRoute = express.Router()

productRoute.post('/add',adminAuth,upload.fields([{name:'image1',maxCount:1},{name:'image2',maxCount:1},{name:'image3',maxCount:1},{name:'image4',maxCount:1}]),addProduct)
productRoute.post('/remove',adminAuth,removeProduct)
productRoute.get('/list',listProduct)
productRoute.post('/single',adminAuth,singleProduct)
productRoute.post('/updateImg',adminAuth,upload.fields([{name:'ImageObject',maxCount:1}]),updateImg)
productRoute.post('/update',adminAuth,upload.fields([{name:'image1',maxCount:1},{name:'image2',maxCount:1},{name:'image3',maxCount:1},{name:'image4',maxCount:1}]),updateProduct)
productRoute.post('/comment',authUser,submitComment)
productRoute.post('/listcomment',commentsList)
productRoute.post('/upload-description-image',adminAuth,upload.single('image'),uploadDescriptionImage)

export default productRoute 