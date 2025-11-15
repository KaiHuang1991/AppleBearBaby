# AppleBearBaby 项目 VPS 部署指南

本指南将帮助您将 AppleBearBaby 项目部署到 VPS 服务器上。

## 📋 前置要求

- VPS 服务器（推荐 Ubuntu 20.04+ 或 CentOS 7+）
- 域名（可选，但推荐）
- SSH 访问权限
- 基本的 Linux 命令行知识

## 🔧 服务器环境准备

### 1. 更新系统

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

### 2. 安装 Node.js

```bash
# 使用 NodeSource 安装 Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node -v
npm -v
```

### 3. 安装 Nginx

```bash
# Ubuntu/Debian
sudo apt install nginx -y

# CentOS/RHEL
sudo yum install nginx -y

# 启动并设置开机自启
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 4. 安装 PM2（进程管理器）

```bash
sudo npm install -g pm2
```

### 5. 安装 MongoDB（如果使用本地数据库）

```bash
# Ubuntu/Debian
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# 启动 MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

**或者使用 MongoDB Atlas（推荐）**：使用云数据库，无需在服务器上安装 MongoDB。

## 📁 项目部署

### 1. 上传项目到服务器

使用以下方法之一上传项目：

**方法A：使用 Git**
```bash
# 在服务器上克隆项目
git clone <your-repository-url>
cd AppleBearBaby
```

**方法B：使用 SCP**
```bash
# 在本地电脑执行
scp -r /path/to/AppleBearBaby user@your-server-ip:/home/user/
```

**方法C：使用 SFTP 客户端**
使用 FileZilla、WinSCP 等工具上传项目文件夹。

### 2. 配置环境变量

#### 后端环境变量

```bash
cd backend
cp env.example .env
nano .env  # 或使用 vim
```

配置以下变量：
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_SECRET_KEY=your_secret_key
JWT_SECRET=your_very_long_random_secret_key
PORT=4000
FRONTEND_URL=https://your-domain.com
EMAIL_USER=your_email@qq.com
EMAIL_PASSWORD=your_email_app_password
INQUIRY_RECEIVER_EMAIL=your_inquiry_receiver@example.com
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password
```

#### 前端环境变量

```bash
cd ../frontend
cp env.example .env
nano .env
```

配置：
```env
VITE_BACKEND_URL=https://your-domain.com/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key  # 可选
```

### 3. 运行部署脚本

```bash
# 回到项目根目录
cd /path/to/AppleBearBaby

# 给脚本执行权限
chmod +x deploy.sh

# 运行部署脚本
./deploy.sh
```

部署脚本会自动：
- 检查 Node.js 和 PM2
- 安装所有依赖
- 构建前端和管理后台
- 启动 PM2 服务

### 4. 配置 Nginx

```bash
# 复制配置文件
sudo cp nginx.conf /etc/nginx/sites-available/applebearbaby

# 编辑配置文件，替换域名
sudo nano /etc/nginx/sites-available/applebearbaby
# 将 your-domain.com 替换为您的实际域名

# 创建软链接（如果已存在则先删除）
sudo rm -f /etc/nginx/sites-enabled/applebearbaby
sudo ln -s /etc/nginx/sites-available/applebearbaby /etc/nginx/sites-enabled/

# 删除默认配置（可选）
sudo rm -f /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 5. 配置 SSL 证书（HTTPS）

使用 Let's Encrypt 免费 SSL 证书：

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取证书（替换为您的域名和邮箱）
sudo certbot --nginx -d applebearbaby.net -d www.applebearbaby.net --email 1034201254@qq.com

# 证书会自动续期，也可以手动测试
sudo certbot renew --dry-run
```

## 🔍 验证部署

### 检查服务状态

```bash
# 查看 PM2 服务状态
pm2 list

# 查看服务日志
pm2 logs

# 查看特定服务日志
pm2 logs applebearbaby-backend
pm2 logs applebearbaby-frontend
pm2 logs applebearbaby-admin

# 查看 Nginx 状态
sudo systemctl status nginx

# 查看 Nginx 日志
sudo tail -f /var/log/nginx/applebearbaby-access.log
sudo tail -f /var/log/nginx/applebearbaby-error.log
```

### 测试访问

- 前端：`https://your-domain.com`
- 管理后台：`https://your-domain.com/admin`
- API：`https://your-domain.com/api`

## 🛠️ 常用维护命令

### PM2 命令

```bash
# 查看所有服务
pm2 list

# 重启所有服务
pm2 restart ecosystem.config.js

# 重启特定服务
pm2 restart applebearbaby-backend

# 停止所有服务
pm2 stop ecosystem.config.js

# 删除所有服务
pm2 delete ecosystem.config.js

# 查看实时日志
pm2 logs

# 查看监控面板
pm2 monit

# 保存当前进程列表
pm2 save
```

### Nginx 命令

```bash
# 测试配置
sudo nginx -t

# 重新加载配置（不中断服务）
sudo nginx -s reload

# 重启 Nginx
sudo systemctl restart nginx

# 查看状态
sudo systemctl status nginx
```

### 更新代码

```bash
# 拉取最新代码
git pull origin main

# 重新运行部署脚本
./deploy.sh
```

## 🔒 安全建议

1. **防火墙配置**
   ```bash
   # Ubuntu/Debian
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

2. **SSH 安全**
   - 禁用 root 登录
   - 使用 SSH 密钥认证
   - 更改默认 SSH 端口

3. **定期更新**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

4. **备份数据库**
   - 定期备份 MongoDB 数据
   - 使用 MongoDB Atlas 的自动备份功能

## 🐛 故障排查

### 服务无法启动

1. 检查日志：
   ```bash
   pm2 logs
   tail -f logs/backend-error.log
   ```

2. 检查端口占用：
   ```bash
   sudo netstat -tulpn | grep :4000
   ```

3. 检查环境变量：
   ```bash
   cd backend
   node -e "require('dotenv').config(); console.log(process.env.MONGODB_URI)"
   ```

### Nginx 502 错误

- 检查后端服务是否运行：`pm2 list`
- 检查后端日志：`pm2 logs applebearbaby-backend`
- 检查 Nginx 配置：`sudo nginx -t`

### 数据库连接失败

- 检查 MongoDB URI 是否正确
- 检查防火墙是否允许 MongoDB 连接
- 如果使用 MongoDB Atlas，检查 IP 白名单

## 📞 获取帮助

如果遇到问题，请检查：
1. PM2 日志：`pm2 logs`
2. Nginx 日志：`sudo tail -f /var/log/nginx/applebearbaby-error.log`
3. 系统日志：`sudo journalctl -xe`

## 📝 注意事项

- 确保所有环境变量都已正确配置
- 生产环境建议使用 MongoDB Atlas 而不是本地 MongoDB
- 定期备份数据库和重要文件
- 监控服务器资源使用情况
- 设置日志轮转以防止日志文件过大

---

**祝部署顺利！** 🎉

