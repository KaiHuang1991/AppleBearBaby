# 📋 部署检查清单

在部署到 VPS 之前，请确保完成以下所有步骤：

## ✅ 服务器准备

- [ ] VPS 服务器已购买并可以 SSH 连接
- [ ] 域名已购买并解析到服务器 IP（可选但推荐）
- [ ] 服务器系统已更新（`sudo apt update && sudo apt upgrade`）
- [ ] Node.js 20.x 已安装（`node -v`）
- [ ] Nginx 已安装并运行（`sudo systemctl status nginx`）
- [ ] PM2 已全局安装（`pm2 -v`）
- [ ] 防火墙已配置（允许 22, 80, 443 端口）

## ✅ 项目配置

- [ ] 项目代码已上传到服务器
- [ ] 后端 `.env` 文件已创建并配置：
  - [ ] `MONGODB_URI` - MongoDB 连接字符串
  - [ ] `CLOUDINARY_NAME` - Cloudinary 云名称
  - [ ] `CLOUDINARY_API_KEY` - Cloudinary API 密钥
  - [ ] `CLOUDINARY_SECRET_KEY` - Cloudinary 密钥
  - [ ] `JWT_SECRET` - JWT 密钥（长随机字符串）
  - [ ] `PORT` - 后端端口（默认 4000）
  - [ ] `FRONTEND_URL` - 前端 URL
  - [ ] `ALLOWED_ORIGINS` - 允许的域名（生产环境）
  - [ ] `EMAIL_USER` - 邮箱账号
  - [ ] `EMAIL_PASSWORD` - 邮箱密码
  - [ ] `INQUIRY_RECEIVER_EMAIL` - 询盘接收邮箱
  - [ ] `ADMIN_EMAIL` - 管理员邮箱
  - [ ] `ADMIN_PASSWORD` - 管理员密码
- [ ] 前端 `.env` 文件已创建并配置：
  - [ ] `VITE_BACKEND_URL` - 后端 API 地址（生产环境使用 HTTPS）
  - [ ] `VITE_GOOGLE_MAPS_API_KEY` - Google Maps API 密钥（可选）

## ✅ 数据库配置

- [ ] MongoDB Atlas 账户已创建（推荐）
- [ ] MongoDB 数据库已创建
- [ ] 数据库连接字符串已配置
- [ ] IP 白名单已添加（如果使用 MongoDB Atlas）
- [ ] 数据库用户已创建并配置权限

## ✅ 云服务配置

- [ ] Cloudinary 账户已创建
- [ ] Cloudinary API 密钥已配置
- [ ] Cloudinary 上传预设已配置（如果需要）

## ✅ 部署执行

- [ ] 已运行 `chmod +x deploy.sh`
- [ ] 已运行 `./deploy.sh`
- [ ] PM2 服务已启动（`pm2 list`）
- [ ] 所有服务状态正常（`pm2 logs`）
- [ ] 前端和管理后台已构建成功

## ✅ Nginx 配置

- [ ] `nginx.conf` 已复制到 `/etc/nginx/sites-available/applebearbaby`
- [ ] 配置文件中的域名已更新
- [ ] 软链接已创建（`sudo ln -s /etc/nginx/sites-available/applebearbaby /etc/nginx/sites-enabled/`）
- [ ] Nginx 配置测试通过（`sudo nginx -t`）
- [ ] Nginx 已重启（`sudo systemctl restart nginx`）

## ✅ SSL 证书（HTTPS）

- [ ] Certbot 已安装
- [ ] SSL 证书已申请（`sudo certbot --nginx -d your-domain.com`）
- [ ] 证书自动续期已配置
- [ ] HTTPS 访问正常

## ✅ 安全配置

- [ ] 防火墙已配置（`sudo ./setup-firewall.sh`）
- [ ] SSH 密钥认证已配置
- [ ] root 登录已禁用（可选但推荐）
- [ ] 定期备份计划已设置

## ✅ 测试验证

- [ ] 前端网站可以访问（`https://your-domain.com`）
- [ ] 管理后台可以访问（`https://your-domain.com/admin`）
- [ ] API 可以访问（`https://your-domain.com/api`）
- [ ] 用户注册功能正常
- [ ] 用户登录功能正常
- [ ] 产品展示正常
- [ ] 购物车功能正常
- [ ] 支付功能正常（如果已配置）
- [ ] 邮件发送功能正常

## ✅ 监控和维护

- [ ] PM2 监控已设置（`pm2 monit`）
- [ ] 日志轮转已配置
- [ ] 健康检查脚本已测试（`./health-check.sh`）
- [ ] 备份策略已制定
- [ ] 更新流程已熟悉

## 📝 部署后注意事项

1. **定期检查日志**
   ```bash
   pm2 logs
   sudo tail -f /var/log/nginx/applebearbaby-error.log
   ```

2. **监控资源使用**
   ```bash
   pm2 monit
   htop
   ```

3. **定期更新**
   ```bash
   sudo apt update && sudo apt upgrade
   npm update
   ```

4. **备份数据库**
   - MongoDB Atlas 自动备份
   - 或手动备份：`mongodump --uri="your-connection-string"`

5. **更新代码**
   ```bash
   git pull
   ./deploy.sh
   ```

---

**完成所有检查项后，您的项目应该已经成功部署！** 🎉

