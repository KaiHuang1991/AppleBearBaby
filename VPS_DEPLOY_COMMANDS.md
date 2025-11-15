# VPS 部署命令清单

如果您已经通过 SSH 连接到 VPS，请按顺序执行以下命令：

## 📋 快速部署步骤

### 1. 进入项目目录
```bash
cd /var/www/AppleBearBaby
```

### 2. 检查项目文件
```bash
ls -la
# 确认能看到 backend/, frontend/, admin/, ecosystem.config.js 等文件
```

### 3. 检查环境变量文件
```bash
# 检查后端环境变量
ls -la backend/.env
# 如果没有，需要创建：
# cd backend && cp env.example .env && nano .env

# 检查前端环境变量
ls -la frontend/.env
# 如果没有，需要创建：
# cd frontend && cp env.example .env && nano .env
```

### 4. 执行一键部署脚本
```bash
chmod +x deploy-on-vps.sh
./deploy-on-vps.sh
```

## 🔧 手动部署步骤（如果脚本失败）

### 步骤 1: 安装依赖
```bash
# 后端依赖
cd /var/www/AppleBearBaby/backend
npm install

# 前端依赖
cd /var/www/AppleBearBaby/frontend
npm install

# 管理后台依赖
cd /var/www/AppleBearBaby/admin
npm install
```

### 步骤 2: 构建前端项目
```bash
cd /var/www/AppleBearBaby/frontend
npm run build

cd /var/www/AppleBearBaby/admin
npm run build
```

### 步骤 3: 创建日志目录
```bash
cd /var/www/AppleBearBaby
mkdir -p logs
```

### 步骤 4: 启动 PM2 服务
```bash
cd /var/www/AppleBearBaby

# 停止现有服务（如果有）
pm2 delete ecosystem.config.js || true

# 启动服务
pm2 start ecosystem.config.js

# 保存配置
pm2 save

# 查看状态
pm2 list
pm2 logs
```

### 步骤 5: 配置 Nginx（如果还没配置）
```bash
# 复制配置文件
sudo cp /var/www/AppleBearBaby/nginx.conf /etc/nginx/sites-available/applebearbaby

# 编辑配置文件，替换域名
sudo nano /etc/nginx/sites-available/applebearbaby
# 将 your-domain.com 替换为 applebearbaby.net

# 创建软链接
sudo rm -f /etc/nginx/sites-enabled/applebearbaby
sudo ln -s /etc/nginx/sites-available/applebearbaby /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 步骤 6: 配置 SSL（如果还没配置）
```bash
sudo certbot --nginx -d applebearbaby.net -d www.applebearbaby.net --email 1034201254@qq.com
```

## 🔍 验证部署

```bash
# 检查 PM2 服务状态
pm2 list

# 检查端口监听
sudo netstat -tulpn | grep -E '4000|5173|5174'

# 检查 Nginx 状态
sudo systemctl status nginx

# 查看日志
pm2 logs
```

## 🐛 故障排查

如果遇到问题：

1. **查看 PM2 日志**
   ```bash
   pm2 logs
   pm2 logs applebearbaby-backend --lines 50
   ```

2. **检查服务状态**
   ```bash
   pm2 list
   pm2 monit
   ```

3. **重启服务**
   ```bash
   pm2 restart ecosystem.config.js
   ```

4. **检查环境变量**
   ```bash
   cd backend
   node -e "require('dotenv').config(); console.log('MONGODB_URI:', process.env.MONGODB_URI ? '已设置' : '未设置')"
   ```

