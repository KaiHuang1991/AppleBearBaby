import 'dotenv/config'

console.log('=== Environment Variables Test ===\n')
console.log('MONGODB_URI:', process.env.MONGODB_URI || 'NOT LOADED')
console.log('CLOUDINARY_NAME:', process.env.CLOUDINARY_NAME || 'NOT LOADED')
console.log('JWT_SECRET:', process.env.JWT_SECRET || 'NOT LOADED')
console.log('\n=== Test Complete ===')

