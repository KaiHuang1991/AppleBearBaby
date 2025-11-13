import 'dotenv/config'
import mongoose from 'mongoose'
import productModel from '../models/productModel.js'

const testProduct = {
    name: "Test Baby Bottle - 测试奶瓶",
    description: "This is a test product to verify the system is working. 这是一个测试产品，用于验证系统正常工作。",
    price: 29.99,
    category: "Bottle",
    subCategory: "Standard Mouth",
    sizes: ["240ml"],
    bestseller: true,
    image: [
        "https://res.cloudinary.com/demo/image/upload/sample.jpg"
    ],
    date: Date.now()
}

const addTestProduct = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('✅ Connected to MongoDB')
        
        const product = new productModel(testProduct)
        await product.save()
        
        console.log('✅ Test product added successfully!')
        console.log('   Name:', product.name)
        console.log('   ID:', product._id)
        
        const count = await productModel.countDocuments()
        console.log(`\n📊 Total products in database: ${count}`)
        
        process.exit(0)
    } catch (error) {
        console.error('❌ Error:', error.message)
        process.exit(1)
    }
}

addTestProduct()

