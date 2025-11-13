// 检查 .env 配置的脚本
import 'dotenv/config';

console.log('=================================');
console.log('Environment Variables Check');
console.log('=================================\n');

const envVars = {
  'MONGODB_URI': process.env.MONGODB_URI,
  'CLOUDINARY_NAME': process.env.CLOUDINARY_NAME,
  'CLOUDINARY_API_KEY': process.env.CLOUDINARY_API_KEY,
  'CLOUDINARY_SECRET_KEY': process.env.CLOUDINARY_SECRET_KEY,
  'JWT_SECRET': process.env.JWT_SECRET,
  'PORT': process.env.PORT
};

let hasErrors = false;

console.log('Checking required environment variables:\n');

for (const [key, value] of Object.entries(envVars)) {
  if (value) {
    // 隐藏敏感信息，只显示前几个字符
    let displayValue = value;
    if (key.includes('SECRET') || key.includes('KEY') || key.includes('URI')) {
      if (value.length > 10) {
        displayValue = value.substring(0, 10) + '...' + value.substring(value.length - 3);
      } else {
        displayValue = value.substring(0, 3) + '***';
      }
    }
    console.log(`✅ ${key}: ${displayValue}`);
  } else {
    console.log(`❌ ${key}: MISSING`);
    hasErrors = true;
  }
}

console.log('\n=================================');
if (hasErrors) {
  console.log('❌ Some required variables are missing!');
  console.log('Please check your .env file in the backend directory.');
} else {
  console.log('✅ All required variables are configured!');
}
console.log('=================================');

