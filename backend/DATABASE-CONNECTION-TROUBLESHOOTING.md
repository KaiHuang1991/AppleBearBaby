# 数据库连接问题诊断指南

## 🔍 问题诊断

当你看到"无法连接到数据库"错误时，请按以下步骤检查：

---

## ✅ 步骤1：检查.env文件

### 1. 确认.env文件存在
在 `backend` 目录下应该有一个 `.env` 文件

### 2. .env文件应包含以下内容：

```env
# MongoDB配置
MONGODB_URI=mongodb://localhost:27017

# 或者使用MongoDB Atlas（云数据库）
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net

# Cloudinary配置
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_SECRET_KEY=your_secret_key

# JWT密钥
JWT_SECRET=your_jwt_secret

# 端口（可选）
PORT=4000
```

### 3. 如果.env文件不存在，创建它：

**在backend目录下创建 `.env` 文件**

---

## ✅ 步骤2：检查MongoDB服务状态

### 选项A：本地MongoDB

#### Windows：
```bash
# 检查MongoDB服务状态
sc query MongoDB

# 如果未运行，启动MongoDB服务
net start MongoDB
```

#### Mac/Linux：
```bash
# 检查MongoDB状态
sudo systemctl status mongod

# 启动MongoDB
sudo systemctl start mongod
```

### 选项B：MongoDB Atlas（云数据库）

如果使用MongoDB Atlas：
1. 登录 https://cloud.mongodb.com
2. 检查集群状态
3. 获取连接字符串
4. 更新.env文件

---

## ✅ 步骤3：测试数据库连接

创建测试脚本 `backend/test-db-connection.js`：

```javascript
import mongoose from 'mongoose';
import 'dotenv/config';

const testConnection = async () => {
  console.log('Testing MongoDB connection...');
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Found' : 'Missing');
  
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/e-commerce`, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB connected successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

testConnection();
```

运行测试：
```bash
cd backend
node test-db-connection.js
```

---

## ✅ 步骤4：常见问题和解决方案

### 问题1：找不到.env文件

**错误**：MONGODB_URI is undefined

**解决**：
```bash
cd backend
# 创建.env文件
echo MONGODB_URI=mongodb://localhost:27017 > .env
```

### 问题2：MongoDB服务未运行

**错误**：connect ECONNREFUSED 127.0.0.1:27017

**解决**：
```bash
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongod
```

### 问题3：MongoDB未安装

**解决**：

#### Windows：
1. 下载：https://www.mongodb.com/try/download/community
2. 安装MongoDB Community Server
3. 启动服务

#### Mac：
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Linux：
```bash
sudo apt-get install mongodb
sudo systemctl start mongod
```

### 问题4：连接字符串格式错误

**错误**：Invalid connection string

**正确格式**：
```
# 本地MongoDB
MONGODB_URI=mongodb://localhost:27017

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net
```

### 问题5：防火墙阻止连接

**解决**：
- 检查防火墙设置
- 确保27017端口开放
- 尝试禁用防火墙测试

### 问题6：网络连接问题（MongoDB Atlas）

**解决**：
1. 检查IP白名单
2. 添加当前IP到白名单
3. 或使用 0.0.0.0/0 允许所有IP（测试用）

---

## ✅ 步骤5：推荐方案 - 使用MongoDB Atlas（免费）

### 为什么选择MongoDB Atlas？
- ✅ 免费512MB存储
- ✅ 无需安装和维护
- ✅ 自动备份
- ✅ 随处访问

### 设置步骤：

1. **注册账号**
   - 访问：https://www.mongodb.com/cloud/atlas/register
   - 创建免费账号

2. **创建集群**
   - 选择FREE tier
   - 选择离你最近的地区
   - 创建集群（需要几分钟）

3. **设置数据库用户**
   - Database Access → Add New Database User
   - 用户名：admin
   - 密码：创建强密码
   - 权限：Read and write to any database

4. **配置网络访问**
   - Network Access → Add IP Address
   - 选择"Allow Access from Anywhere"（测试用）
   - 或添加你的当前IP

5. **获取连接字符串**
   - Clusters → Connect
   - Connect your application
   - 复制连接字符串
   - 示例：`mongodb+srv://admin:password@cluster0.xxxxx.mongodb.net`

6. **更新.env文件**
   ```env
   MONGODB_URI=mongodb+srv://admin:your_password@cluster0.xxxxx.mongodb.net
   ```

---

## ✅ 步骤6：验证连接

启动后端服务器：
```bash
cd backend
npm run server
```

应该看到：
```
Server started on port 4000
DB Connected
```

如果看到错误，查看错误信息并参考上面的解决方案。

---

## 🚀 快速修复命令

```bash
# 1. 进入backend目录
cd backend

# 2. 创建.env文件（如果不存在）
echo MONGODB_URI=mongodb://localhost:27017 > .env

# 3. 启动MongoDB（Windows）
net start MongoDB

# 4. 安装依赖（如果需要）
npm install

# 5. 启动服务器
npm run server
```

---

## 📝 检查清单

- [ ] .env文件存在于backend目录
- [ ] MONGODB_URI已配置
- [ ] MongoDB服务正在运行
- [ ] 网络连接正常
- [ ] 防火墙未阻止连接
- [ ] 端口27017未被占用
- [ ] Node.js和npm已安装
- [ ] 所有依赖已安装（npm install）

---

## 💡 获取帮助

如果以上步骤都无法解决问题，请提供以下信息：

1. **操作系统**：Windows/Mac/Linux
2. **错误信息**：完整的错误日志
3. **MongoDB类型**：本地安装 / MongoDB Atlas
4. **.env内容**（隐藏敏感信息）
5. **运行 `npm run server` 的输出**

我会帮助你进一步诊断！

