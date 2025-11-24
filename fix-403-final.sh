#!/bin/bash

# 最终修复 403 错误

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  修复 403 Forbidden 错误${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 1. 检查 Vite preview 服务
echo -e "${YELLOW}[1] 检查 Vite preview 服务:${NC}"
pm2 list | grep applebearbaby-frontend

# 测试直接访问 Vite preview
echo "测试直接访问 Vite preview (端口 5173):"
curl -I http://localhost:5173/applebear.png 2>&1 | head -10

# 2. 检查文件是否存在
echo -e "${YELLOW}[2] 检查文件:${NC}"
if [ -f "/var/www/AppleBearBaby/frontend/public/applebear.png" ]; then
    echo -e "${GREEN}✅ applebear.png 存在于 public 目录${NC}"
    ls -la /var/www/AppleBearBaby/frontend/public/applebear.png
elif [ -f "/var/www/AppleBearBaby/frontend/dist/applebear.png" ]; then
    echo -e "${GREEN}✅ applebear.png 存在于 dist 目录${NC}"
    ls -la /var/www/AppleBearBaby/frontend/dist/applebear.png
else
    echo -e "${YELLOW}⚠️  applebear.png 文件位置需要确认${NC}"
    find /var/www/AppleBearBaby/frontend -name "applebear.png" 2>/dev/null
fi

# 3. 检查 Vite preview 配置
echo -e "${YELLOW}[3] 检查 Vite 配置:${NC}"
cat /var/www/AppleBearBaby/frontend/vite.config.js

# 4. 检查 PM2 日志
echo -e "${YELLOW}[4] 检查 PM2 日志:${NC}"
pm2 logs applebearbaby-frontend --lines 10 --nostream

# 5. 重启前端服务
echo -e "${YELLOW}[5] 重启前端服务:${NC}"
pm2 restart applebearbaby-frontend
sleep 2

# 6. 再次测试
echo -e "${YELLOW}[6] 再次测试:${NC}"
echo "测试 Vite preview:"
curl -I http://localhost:5173/applebear.png 2>&1 | head -5

echo "测试通过 Nginx:"
curl -I http://localhost/applebear.png 2>&1 | head -5

# 7. 检查 Nginx 错误日志
echo -e "${YELLOW}[7] Nginx 错误日志:${NC}"
sudo tail -10 /var/log/nginx/applebearbaby-error.log 2>/dev/null || \
sudo tail -10 /var/log/nginx/error.log 2>/dev/null | grep -i "403\|applebear" || \
echo "无相关错误"

echo ""
echo -e "${GREEN}========================================${NC}"









