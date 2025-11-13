// 产品描述图片上传API示例
// 这个文件展示如何在后端处理描述中的图片上传
// 请将此代码添加到你的 productController.js 中

import { v2 as cloudinary } from 'cloudinary';

// 上传产品描述中的图片
const uploadDescriptionImage = async (req, res) => {
  try {
    // 检查是否有图片文件
    if (!req.files || !req.files.image) {
      return res.json({ 
        success: false, 
        message: "No image file provided" 
      });
    }

    const imageFile = req.files.image;

    // 上传到Cloudinary
    const result = await cloudinary.uploader.upload(imageFile.tempFilePath, {
      resource_type: "image",
      folder: "product-descriptions", // 单独的文件夹存储描述图片
    });

    res.json({
      success: true,
      message: "Image uploaded successfully",
      imageUrl: result.secure_url
    });

  } catch (error) {
    console.log(error);
    res.json({ 
      success: false, 
      message: error.message 
    });
  }
};

export { uploadDescriptionImage };


// ===================================
// 如何集成到你的项目中：
// ===================================

// 1. 在 routes/productRoute.js 中添加路由：
/*
import express from 'express';
import { uploadDescriptionImage } from '../controllers/productController.js';
import adminAuth from '../middleware/adminAuth.js';

const productRouter = express.Router();

// 添加这个路由
productRouter.post('/upload-description-image', adminAuth, uploadDescriptionImage);

export default productRouter;
*/

// 2. 确保你的服务器配置了 express-fileupload 中间件：
/*
import fileUpload from 'express-fileupload';

app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));
*/

// 3. 确保 Cloudinary 已配置：
/*
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY
});
*/

