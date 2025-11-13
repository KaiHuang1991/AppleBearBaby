import 'dotenv/config'
import mongoose from 'mongoose'

const findDatabases = async () => {
    try {
        // 连接到 MongoDB（不指定数据库）
        const baseUri = process.env.MONGODB_URI.split('/').slice(0, -1).join('/')
        await mongoose.connect(baseUri + '/admin')
        
        console.log('=== Checking all databases ===\n')
        
        // 列出所有数据库
        const admin = mongoose.connection.db.admin()
        const { databases } = await admin.listDatabases()
        
        console.log('Found databases:')
        databases.forEach(db => {
            console.log(`  - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`)
        })
        
        console.log('\n=== Checking products in each database ===\n')
        
        // 检查每个数据库中的产品数量
        for (const db of databases) {
            if (db.name === 'admin' || db.name === 'local') continue
            
            try {
                await mongoose.disconnect()
                await mongoose.connect(baseUri + '/' + db.name)
                
                const collections = await mongoose.connection.db.listCollections().toArray()
                const hasProducts = collections.some(c => c.name === 'products')
                
                if (hasProducts) {
                    const count = await mongoose.connection.db.collection('products').countDocuments()
                    console.log(`✅ ${db.name}: ${count} products`)
                    
                    if (count > 0) {
                        const sample = await mongoose.connection.db.collection('products').findOne()
                        console.log(`   Sample: ${sample.name}`)
                    }
                } else {
                    console.log(`⚪ ${db.name}: no products collection`)
                }
            } catch (error) {
                console.log(`❌ ${db.name}: Error - ${error.message}`)
            }
        }
        
        process.exit(0)
    } catch (error) {
        console.error('Error:', error.message)
        process.exit(1)
    }
}

findDatabases()

