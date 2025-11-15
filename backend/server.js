import express from "express";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config'
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRoute from "./routes/userRoute.js";
import productRoute from "./routes/productRuote.js";
import cartRouter from "./routes/CartRoute.js";
import blogRoute from "./routes/blogRoute.js";
import commentRoute from "./routes/commentRoute.js";
import inquiryRoute from "./routes/inquiryRoute.js";
import reviewRoute from "./routes/reviewRoute.js";
import categoryRoute from "./routes/categoryRoute.js";
import attributeRoute from "./routes/attributeRoute.js";
import heroRoute from "./routes/heroRoute.js";

// App Config

const app = express()
const port = process.env.PORT || 4000

// Increase body size limits to allow inquiry attachments (kept reasonable)
app.use(express.json({ limit: '12mb' }))
app.use(express.urlencoded({ extended: true, limit: '12mb' }))
// Parse cookies
app.use(cookieParser())

// Configure CORS to support credentials (cookies) and multiple origins
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://localhost:5175'
]

// 从环境变量读取允许的域名（生产环境）
if (process.env.ALLOWED_ORIGINS) {
  const envOrigins = process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  allowedOrigins.push(...envOrigins)
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      // For development, allow any localhost origin
      if (process.env.NODE_ENV !== 'production' && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
        callback(null, true)
      } else {
        // In production, log rejected origins for debugging
        if (process.env.NODE_ENV === 'production') {
          console.warn(`CORS blocked origin: ${origin}`)
        }
        callback(new Error('Not allowed by CORS'))
      }
    }
  },
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'token']
}))


//Api Endpoints
app.use('/api/user',userRoute)
app.use('/api/product',productRoute)
app.use('/api/cart',cartRouter)
app.use('/api/blogs',blogRoute)
app.use('/api/comments',commentRoute)
app.use('/api/inquiries',inquiryRoute)
app.use('/api/reviews',reviewRoute)
app.use('/api/categories', categoryRoute)
app.use('/api/attributes', attributeRoute)
app.use('/api/hero', heroRoute)

app.get('/',(req,res)=>{
   res.send("API Working")
})

// Start server only after DB connection
const startServer = async () => {
    try {
        // Connect to MongoDB first
        await connectDB()
        console.log('✅ MongoDB connected successfully')
        
        // Connect to Cloudinary
        await connectCloudinary()
        console.log('✅ Cloudinary connected successfully')
        
        // Start server after successful connections
        app.listen(port, () => {
            console.log(`🚀 Server started on port ${port}`)
            console.log(`📡 API available at http://localhost:${port}`)
        })
    } catch (error) {
        console.error('❌ Failed to start server:', error.message)
        process.exit(1)
    }
}

startServer()




