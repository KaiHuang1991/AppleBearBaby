#!/bin/bash

# 修复静态资源 403 错误

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  修复静态资源 403 错误${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 1. 检查 Vite preview 服务是否运行
echo -e "${YELLOW}[1] 检查 Vite preview 服务:${NC}"
if pm2 list | grep -q "applebearbaby-frontend.*online"; then
    echo -e "${GREEN}✅ 前端服务正在运行${NC}"
    pm2 list | grep applebearbaby-frontend
else
    echo -e "${RED}❌ 前端服务未运行${NC}"
    echo -e "${YELLOW}   重启前端服务...${NC}"
    pm2 restart applebearbaby-frontend
fi

# 2. 测试直接访问 Vite preview 服务
echo -e "${YELLOW}[2] 测试直接访问 Vite preview:${NC}"
echo "测试 http://localhost:5173/assets/index-CVqcjJdQ.css"
curl -I http://localhost:5173/assets/index-CVqcjJdQ.css 2>/dev/null | head -5 || echo -e "${RED}❌ 无法访问${NC}"

# 3. 检查文件是否存在
echo -e "${YELLOW}[3] 检查静态文件:${NC}"
if [ -f "/var/www/AppleBearBaby/frontend/dist/assets/index-CVqcjJdQ.css" ]; then
    echo -e "${GREEN}✅ CSS 文件存在于 dist 目录${NC}"
    ls -la /var/www/AppleBearBaby/frontend/dist/assets/ | head -5
else
    echo -e "${YELLOW}⚠️  文件在 dist 目录，但 Vite preview 应该从 dist 提供服务${NC}"
fi

# 4. 检查 Nginx 配置
echo -e "${YELLOW}[4] 检查 Nginx 配置:${NC}"
echo "检查 location /assets 配置:"
sudo grep -A 5 "location.*assets\|location.*\.(js\|css)" /etc/nginx/sites-available/applebearbaby | head -15

# 5. 检查 server_name 配置
echo -e "${YELLOW}[5] 检查 server_name:${NC}"
sudo grep "server_name" /etc/nginx/sites-available/applebearbaby

# 6. 修复文件权限
echo -e "${YELLOW}[6] 修复文件权限:${NC}"
sudo chown -R www-data:www-data /var/www/AppleBearBaby
sudo chmod -R 755 /var/www/AppleBearBaby
echo -e "${GREEN}✅ 权限已修复${NC}"

# 7. 检查 Nginx 错误日志
echo -e "${YELLOW}[7] 检查 Nginx 错误日志:${NC}"
sudo tail -20 /var/log/nginx/applebearbaby-error.log 2>/dev/null | grep -i "403\|forbidden\|assets" || \
sudo tail -20 /var/log/nginx/error.log 2>/dev/null | grep -i "403\|forbidden\|assets" || \
echo "无相关错误"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}诊断完成${NC}"
echo -e "${GREEN}========================================${NC}"












