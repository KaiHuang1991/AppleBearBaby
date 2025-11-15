# 🔧 故障排查指南

如果部署成功但无法访问网站，请按以下步骤排查：

## 📋 快速检查清单

### 1. 检查 PM2 服务状态
```bash
pm2 list
pm2 logs
```

所有服务应该显示为 `online` 状态。

### 2. 检查端口监听
```bash
# 检查所有相关端口
sudo netstat -tuln | grep -E '4000|5173|5174|80|443'
# 或使用 ss
sudo ss -tuln | grep -E '4000|5173|5174|80|443'
```

应该看到：
- 4000: 后端服务
- 5173: 前端服务
- 5174: 管理后台
- 80: Nginx HTTP
- 443: Nginx HTTPS（如果配置了SSL）

### 3. 检查 Nginx 状态
```bash
sudo systemctl status nginx
```

如果未运行：
```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 4. 检查 Nginx 配置
```bash
# 检查配置文件是否存在
ls -la /etc/nginx/sites-enabled/applebearbaby

# 测试配置
sudo nginx -t

# 查看配置内容
cat /etc/nginx/sites-enabled/applebearbaby
```

**重要**：确保配置文件中的域名已更新为 `applebearbaby.net`

### 5. 检查防火墙
```bash
# UFW (Ubuntu/Debian)
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Firewalld (CentOS/RHEL)
sudo firewall-cmd --list-all
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 6. 检查域名解析
```bash
# 检查域名是否解析到服务器IP
dig applebearbaby.net +short
# 或
nslookup applebearbaby.net

# 检查服务器IP
curl ifconfig.me
```

确保域名解析的IP与服务器IP一致。

### 7. 测试本地连接
```bash
# 测试后端
curl http://localhost:4000/

# 测试前端
curl http://localhost:5173/

# 测试管理后台
curl http://localhost:5174/
```

如果本地可以访问但外部无法访问，问题可能在 Nginx 或防火墙。

### 8. 检查 Nginx 日志
```bash
# 访问日志
sudo tail -f /var/log/nginx/applebearbaby-access.log

# 错误日志
sudo tail -f /var/log/nginx/applebearbaby-error.log
```

### 9. 检查 SSL 证书（如果使用HTTPS）
```bash
# 检查证书
sudo certbot certificates

# 如果证书有问题，重新申请
sudo certbot --nginx -d applebearbaby.net -d www.applebearbaby.net
```

## 🚀 快速修复命令

### 如果 Nginx 未配置：
```bash
cd /var/www/AppleBearBaby

# 复制配置文件
sudo cp nginx.conf /etc/nginx/sites-available/applebearbaby

# 编辑配置文件，替换域名
sudo nano /etc/nginx/sites-available/applebearbaby
# 将所有 your-domain.com 替换为 applebearbaby.net

# 创建软链接
sudo rm -f /etc/nginx/sites-enabled/applebearbaby
sudo ln -s /etc/nginx/sites-available/applebearbaby /etc/nginx/sites-enabled/

# 测试并重启
sudo nginx -t
sudo systemctl restart nginx
```

### 如果使用 HTTP（未配置SSL）：
编辑 `/etc/nginx/sites-available/applebearbaby`，注释掉 HTTPS 部分，只保留 HTTP：

```nginx
server {
    listen 80;
    server_name applebearbaby.net www.applebearbaby.net;
    
    # ... 其他配置
}
```

然后：
```bash
sudo nginx -t
sudo systemctl restart nginx
```

### 如果端口未监听：
```bash
# 重启 PM2 服务
pm2 restart ecosystem.config.js

# 检查日志
pm2 logs
```

## 🔍 使用诊断脚本

运行诊断脚本自动检查所有问题：

```bash
cd /var/www/AppleBearBaby
chmod +x diagnose.sh
./diagnose.sh
```

## 📞 常见问题

### 问题1: 502 Bad Gateway
**原因**：后端服务未运行或端口不对
**解决**：
```bash
pm2 restart applebearbaby-backend
pm2 logs applebearbaby-backend
```

### 问题2: 404 Not Found
**原因**：Nginx 配置错误或文件路径不对
**解决**：检查 Nginx 配置和文件路径

### 问题3: Connection Refused
**原因**：防火墙阻止或服务未监听
**解决**：检查防火墙和端口监听

### 问题4: SSL 证书错误
**原因**：证书未配置或过期
**解决**：
```bash
sudo certbot --nginx -d applebearbaby.net -d www.applebearbaby.net
```

## ✅ 验证部署

部署成功后，应该能够访问：
- 前端：`http://applebearbaby.net` 或 `https://applebearbaby.net`
- 管理后台：`http://applebearbaby.net/admin` 或 `https://applebearbaby.net/admin`
- API：`http://applebearbaby.net/api` 或 `https://applebearbaby.net/api`

