# 🚀 快速部署指南

## 5分钟快速部署步骤

### 1. 连接到 VPS

```bash
ssh user@your-server-ip
```

### 2. 安装必要软件

```bash
# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2
sudo npm install -g pm2

# 安装 Nginx
sudo apt install nginx -y
sudo systemctl enable nginx
```

### 3. 上传项目

```bash
# 方法1: Git克隆
git clone <your-repo-url>
cd AppleBearBaby

# 方法2: 使用SCP（在本地电脑执行）
# scp -r ./AppleBearBaby user@server-ip:/home/user/
```

### 4. 配置环境变量

```bash
# 后端配置
cd backend
cp env.example .env
nano .env  # 填写您的配置
cd ..

# 前端配置
cd frontend
cp env.example .env
nano .env  # 设置 VITE_BACKEND_URL=https://your-domain.com/api
cd ..
```

### 5. 一键部署

```bash
chmod +x deploy.sh
./deploy.sh
```

### 6. 配置 Nginx

```bash
# 复制并编辑配置文件
sudo cp nginx.conf /etc/nginx/sites-available/applebearbaby
sudo nano /etc/nginx/sites-available/applebearbaby
# 将 your-domain.com 替换为您的域名

# 启用配置（如果已存在则先删除）
sudo rm -f /etc/nginx/sites-enabled/applebearbaby
sudo ln -s /etc/nginx/sites-available/applebearbaby /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. 配置 SSL（可选但推荐）

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### ✅ 完成！

访问您的网站：
- 前端：`https://your-domain.com`
- 管理后台：`https://your-domain.com/admin`
- API：`https://your-domain.com/api`

## 📊 检查服务状态

```bash
pm2 list          # 查看所有服务
pm2 logs          # 查看日志
sudo nginx -t     # 测试Nginx配置
```

## 🔄 更新代码

```bash
git pull
./deploy.sh
```

