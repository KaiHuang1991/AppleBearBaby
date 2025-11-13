import mongoose from 'mongoose';
import 'dotenv/config';

console.log('=================================');
console.log('MongoDB Connection Test');
console.log('=================================\n');

// 检查环境变量
console.log('1. Checking environment variables...');
console.log('   MONGODB_URI:', process.env.MONGODB_URI ? '✅ Found' : '❌ Missing');

if (!process.env.MONGODB_URI) {
  console.log('\n❌ Error: MONGODB_URI not found in .env file');
  console.log('   Please create a .env file in the backend directory');
  console.log('   Example: MONGODB_URI=mongodb://localhost:27017');
  process.exit(1);
}

console.log('   Connection String:', process.env.MONGODB_URI.replace(/\/\/.*:.*@/, '//***:***@'));
console.log('');

// 测试连接
const testConnection = async () => {
  console.log('2. Attempting to connect to MongoDB...');
  console.log('   Please wait...\n');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ SUCCESS! MongoDB connected successfully!');
    console.log('   Database:', mongoose.connection.name);
    console.log('   Host:', mongoose.connection.host);
    console.log('   Port:', mongoose.connection.port);
    console.log('');
    console.log('=================================');
    console.log('Your database connection is working!');
    console.log('You can now start your server.');
    console.log('=================================');
    
    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.log('❌ FAILED! MongoDB connection error');
    console.log('');
    console.log('Error Details:');
    console.log('   Type:', error.name);
    console.log('   Message:', error.message);
    console.log('');
    
    // 提供具体的解决建议
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Possible solutions:');
      console.log('   1. MongoDB service is not running');
      console.log('      Windows: net start MongoDB');
      console.log('      Mac/Linux: sudo systemctl start mongod');
      console.log('   2. Wrong port number (default is 27017)');
      console.log('   3. Firewall blocking the connection');
    } else if (error.message.includes('authentication failed')) {
      console.log('💡 Possible solutions:');
      console.log('   1. Wrong username or password');
      console.log('   2. Check your MongoDB Atlas credentials');
      console.log('   3. Update MONGODB_URI in .env file');
    } else if (error.message.includes('Invalid connection string')) {
      console.log('💡 Possible solutions:');
      console.log('   1. Check MONGODB_URI format in .env');
      console.log('   2. Local: mongodb://localhost:27017');
      console.log('   3. Atlas: mongodb+srv://user:pass@cluster.mongodb.net');
    } else if (error.message.includes('querySrv ENOTFOUND')) {
      console.log('💡 Possible solutions:');
      console.log('   1. Check your internet connection');
      console.log('   2. Verify MongoDB Atlas cluster address');
      console.log('   3. DNS resolution issue');
    }
    
    console.log('');
    console.log('=================================');
    console.log('Need more help?');
    console.log('Check: DATABASE-CONNECTION-TROUBLESHOOTING.md');
    console.log('=================================');
    
    process.exit(1);
  }
};

testConnection();

