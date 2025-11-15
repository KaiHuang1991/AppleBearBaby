# 🔄 重新部署指南

## 📋 完整重新部署步骤

### 步骤 1: 停止现有服务

```bash
cd /var/www/AppleBearBaby

# 停止所有 PM2 服务
pm2 delete all

# 或者只停止项目相关服务
pm2 delete ecosystem.config.js
```

### 步骤 2: 更新代码（如果使用 Git）

```bash
# 拉取最新代码
git pull origin main

# 或者如果有冲突，强制拉取
# git fetch origin
# git reset --hard origin/main
```

### 步骤 3: 检查环境变量

```bash
# 检查后端环境变量
ls -la backend/.env
cat backend/.env | grep -E "MONGODB_URI|CLOUDINARY|JWT_SECRET" | head -5

# 检查前端环境变量
ls -la frontend/.env
cat frontend/.env
```

如果 `.env` 文件不存在或需要更新：
```bash
# 后端
cd backend
cp env.example .env
nano .env  # 编辑并保存配置
cd ..

# 前端
cd frontend
cp env.example .env
nano .env  # 设置 VITE_BACKEND_URL=https://applebearbaby.net/api
cd ..
```

### 步骤 4: 重新安装依赖（可选，如果 package.json 有更新）

```bash
cd /var/www/AppleBearBaby

# 后端依赖
cd backend
npm install
cd ..

# 前端依赖
cd frontend
npm install
cd ..

# 管理后台依赖
cd admin
npm install
cd ..
```

### 步骤 5: 重新构建前端项目

```bash
cd /var/www/AppleBearBaby

# 构建前端
cd frontend
npm run build
cd ..

# 构建管理后台
cd admin
npm run build
cd ..
```

### 步骤 6: 创建日志目录

```bash
cd /var/www/AppleBearBaby
mkdir -p logs
```

### 步骤 7: 配置 Nginx（重要！）

```bash
cd /var/www/AppleBearBaby

# 1. 复制配置文件
sudo cp nginx.conf /etc/nginx/sites-available/applebearbaby

# 2. 编辑配置文件，确保域名正确
sudo nano /etc/nginx/sites-available/applebearbaby

# 在 nano 中检查：
# - server_name 应该是 applebearbaby.net www.applebearbaby.net
# - HTTP server 块中的 location / 应该是 proxy_pass http://frontend;（不是 return 301）
# - 确保 HTTPS server 块被注释掉（如果还没有 SSL 证书）

# 3. 创建软链接
sudo rm -f /etc/nginx/sites-enabled/applebearbaby
sudo ln -s /etc/nginx/sites-available/applebearbaby /etc/nginx/sites-enabled/applebearbaby

# 4. 测试配置
sudo nginx -t

# 5. 如果测试通过，重新加载 Nginx
sudo systemctl reload nginx
```

### 步骤 8: 启动 PM2 服务

```bash
cd /var/www/AppleBearBaby

# 启动所有服务
pm2 start ecosystem.config.js

# 保存 PM2 配置
pm2 save

# 查看服务状态
pm2 list

# 查看日志
pm2 logs
```

### 步骤 9: 验证部署

```bash
# 1. 检查 PM2 服务状态
pm2 list
# 所有服务应该显示为 online

# 2. 检查端口监听
sudo netstat -tuln | grep -E '4000|5173|5174|80|443'

# 3. 测试本地访问
curl http://localhost/ | head -10
curl http://localhost/api/ | head -10
curl http://localhost/admin/ | head -10

# 4. 测试通过域名访问（如果域名已解析）
curl http://applebearbaby.net/ | head -10

# 5. 检查 Nginx 日志
sudo tail -f /var/log/nginx/applebearbaby-access.log
sudo tail -f /var/log/nginx/applebearbaby-error.log
```

### 步骤 10: 配置 SSL（可选，推荐）

如果还没有配置 SSL 证书：

```bash
# 安装 Certbot（如果还没安装）
sudo apt install certbot python3-certbot-nginx -y

# 申请 SSL 证书
sudo certbot --nginx -d applebearbaby.net -d www.applebearbaby.net --email 1034201254@qq.com

# 证书会自动配置 Nginx，然后重新加载
```

## 🚀 一键重新部署脚本

您也可以使用部署脚本：

```bash
cd /var/www/AppleBearBaby

# 停止服务
pm2 delete all

# 运行部署脚本
chmod +x deploy-on-vps.sh
./deploy-on-vps.sh

# 配置 Nginx（如果还没配置）
sudo cp nginx.conf /etc/nginx/sites-available/applebearbaby
sudo ln -sf /etc/nginx/sites-available/applebearbaby /etc/nginx/sites-enabled/applebearbaby
sudo nginx -t
sudo systemctl reload nginx
```

## ⚠️ 常见问题

### 问题 1: PM2 服务启动失败

```bash
# 查看详细日志
pm2 logs applebearbaby-backend --lines 50
pm2 logs applebearbaby-frontend --lines 50

# 检查环境变量
cd backend
node -e "require('dotenv').config(); console.log('MONGODB_URI:', process.env.MONGODB_URI ? '已设置' : '未设置')"
```

### 问题 2: Nginx 配置错误

```bash
# 查看详细错误
sudo nginx -t

# 查看 Nginx 错误日志
sudo tail -50 /var/log/nginx/error.log
```

### 问题 3: 端口被占用

```bash
# 检查端口占用
sudo lsof -i :4000
sudo lsof -i :5173
sudo lsof -i :5174

# 如果被占用，杀死进程
sudo kill -9 <PID>
```

### 问题 4: 前端构建失败

```bash
# 清理并重新构建
cd frontend
rm -rf dist node_modules
npm install
npm run build
```

## 📝 部署后检查清单

- [ ] PM2 服务全部在线（`pm2 list`）
- [ ] 端口正常监听（`netstat -tuln`）
- [ ] Nginx 配置测试通过（`sudo nginx -t`）
- [ ] 本地访问正常（`curl http://localhost/`）
- [ ] 域名访问正常（`curl http://applebearbaby.net/`）
- [ ] API 可以访问（`curl http://applebearbaby.net/api/`）
- [ ] 管理后台可以访问（`curl http://applebearbaby.net/admin/`）
- [ ] 日志无错误（`pm2 logs` 和 `sudo tail /var/log/nginx/applebearbaby-error.log`）

---

**完成以上步骤后，您的项目应该已经成功重新部署！** 🎉

