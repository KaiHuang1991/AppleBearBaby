# 🔒 安全检查和敏感信息移除清单

## ✅ 已完成的修复

### 1. 移除硬编码的Google OAuth凭证
**文件**: `backend/script/googleAPIToken.js`
- ❌ **移除**: 硬编码的Google OAuth客户端ID和密钥
- ✅ **修复**: 改为从环境变量读取 (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`)

### 2. 移除硬编码的Google Maps API密钥
**文件**: `fronted/context/ShopContext.jsx`
- ❌ **移除**: 硬编码的Google Maps API密钥 `AIzaSyCI4KCRxc10tpJLV2ojoygQe9BTtvI7PIQ`
- ✅ **修复**: 改为从环境变量读取 (`VITE_GOOGLE_MAPS_API_KEY`)

### 3. 移除硬编码的邮箱地址
**文件**: 
- `backend/controllers/inquiryController.js` - 移除硬编码的收件邮箱
- `backend/controllers/cartController.js` - 移除硬编码的收件邮箱
- ✅ **修复**: 改为从环境变量读取 (`INQUIRY_RECEIVER_EMAIL`)

### 4. 创建根目录.gitignore
**文件**: `.gitignore`
- ✅ 确保所有 `.env` 文件不会被提交到Git
- ✅ 包含常见的敏感文件和目录

### 5. 更新环境变量示例文件
**文件**: 
- `backend/env.example` - 添加了所有必需的环境变量
- `fronted/env.example` - 添加了Google Maps API密钥配置

## 📋 环境变量清单

### Backend (.env)
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017

# Cloudinary
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_SECRET_KEY=your_secret_key

# JWT
JWT_SECRET=your_very_long_random_secret_key_here

# Server
PORT=4000
FRONTEND_URL=http://localhost:5173

# Email
EMAIL_USER=your_email@qq.com
EMAIL_PASSWORD=your_email_app_password
INQUIRY_RECEIVER_EMAIL=your_inquiry_receiver@example.com

# Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password

# Google OAuth (可选)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000
REFRESH_TOKEN=your_refresh_token
```

### Frontend (.env)
```env
VITE_BACKEND_URL=http://localhost:4000
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## ⚠️ 重要提醒

### 上传到GitHub前请确认：

1. ✅ **检查是否有实际的.env文件**
   ```bash
   # 检查是否有.env文件（不应该存在）
   find . -name ".env" -not -path "./node_modules/*"
   ```

2. ✅ **确认.gitignore已生效**
   ```bash
   git status
   # 不应该看到任何.env文件
   ```

3. ✅ **如果.env文件已提交到Git历史**
   ```bash
   # 需要从Git历史中移除（如果之前已提交）
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch backend/.env fronted/.env admin/.env" \
     --prune-empty --tag-name-filter cat -- --all
   ```

4. ✅ **重新生成所有密钥和令牌**
   - Google OAuth客户端ID和密钥（如果已泄露）
   - Google Maps API密钥（如果已泄露）
   - JWT_SECRET（如果已泄露）
   - 邮箱密码（如果已泄露）

## 📝 注意事项

### 前端公开联系信息
以下文件包含公开的联系信息（邮箱和电话），这些**不是敏感信息**，可以保留：
- `fronted/componets/ContactSidebar.jsx` - 联系侧边栏组件
- `fronted/pages/Contact.jsx` - 联系页面

这些是公开的业务联系方式，不是API密钥或密码，可以正常显示。

## 🚀 下一步操作

1. **创建实际的.env文件**（不要提交到Git）
   ```bash
   cd backend
   cp env.example .env
   # 然后填写实际值
   
   cd ../fronted
   cp env.example .env
   # 然后填写实际值
   ```

2. **验证.gitignore**
   ```bash
   git status
   # 确认.env文件不在待提交列表中
   ```

3. **提交更改**
   ```bash
   git add .
   git commit -m "移除敏感信息，添加.gitignore和环境变量配置"
   ```

4. **推送到GitHub**
   ```bash
   git push origin main
   ```

## 🔐 安全最佳实践

- ✅ 永远不要将 `.env` 文件提交到版本控制
- ✅ 使用 `env.example` 作为模板
- ✅ 定期轮换API密钥和密码
- ✅ 使用强密码和长随机字符串作为JWT_SECRET
- ✅ 在生产环境中使用环境变量管理服务（如AWS Secrets Manager）

