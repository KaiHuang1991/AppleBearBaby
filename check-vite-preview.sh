#!/bin/bash

# 检查 Vite preview 服务

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  检查 Vite Preview 服务${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 1. 检查 PM2 服务状态
echo -e "${YELLOW}[1] PM2 服务状态:${NC}"
pm2 list | grep applebearbaby-frontend
echo ""

# 2. 检查端口监听
echo -e "${YELLOW}[2] 检查端口 5173:${NC}"
sudo netstat -tuln | grep 5173 || sudo ss -tuln | grep 5173
echo ""

# 3. 测试直接访问 Vite preview
echo -e "${YELLOW}[3] 测试直接访问 Vite preview:${NC}"
echo "测试根路径:"
curl -I http://localhost:5173/ 2>&1 | head -5

echo ""
echo "测试 applebear.png:"
curl -I http://localhost:5173/applebear.png 2>&1 | head -5

echo ""
echo "测试 CSS 文件:"
curl -I http://localhost:5173/assets/index-CVqcjJdQ.css 2>&1 | head -5
echo ""

# 4. 检查文件是否存在
echo -e "${YELLOW}[4] 检查文件:${NC}"
echo "查找 applebear.png:"
find /var/www/AppleBearBaby/frontend -name "applebear.png" 2>/dev/null

echo ""
echo "检查 dist/assets 目录:"
ls -la /var/www/AppleBearBaby/frontend/dist/assets/ 2>/dev/null | head -10 || echo "dist/assets 目录不存在"

echo ""
echo "检查 public 目录:"
ls -la /var/www/AppleBearBaby/frontend/public/ 2>/dev/null | head -10 || echo "public 目录不存在"
echo ""

# 5. 检查 PM2 日志
echo -e "${YELLOW}[5] PM2 日志（最后20行）:${NC}"
pm2 logs applebearbaby-frontend --lines 20 --nostream
echo ""

# 6. 检查 Vite 配置
echo -e "${YELLOW}[6] Vite 配置:${NC}"
cat /var/www/AppleBearBaby/frontend/vite.config.js
echo ""

# 7. 检查文件权限
echo -e "${YELLOW}[7] 文件权限:${NC}"
ls -ld /var/www/AppleBearBaby/frontend/dist
ls -ld /var/www/AppleBearBaby/frontend/public 2>/dev/null || echo "public 目录不存在"









