#!/bin/bash

# 修复 403 Forbidden 错误脚本

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  修复 403 Forbidden 错误${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 1. 检查静态文件目录是否存在
echo -e "${YELLOW}[1] 检查静态文件目录:${NC}"
if [ -d "/var/www/AppleBearBaby/frontend/dist" ]; then
    echo -e "${GREEN}✅ 前端 dist 目录存在${NC}"
    ls -la /var/www/AppleBearBaby/frontend/dist/ | head -10
else
    echo -e "${RED}❌ 前端 dist 目录不存在${NC}"
    echo -e "${YELLOW}   需要重新构建前端项目${NC}"
fi

if [ -d "/var/www/AppleBearBaby/admin/dist" ]; then
    echo -e "${GREEN}✅ 管理后台 dist 目录存在${NC}"
else
    echo -e "${RED}❌ 管理后台 dist 目录不存在${NC}"
fi
echo ""

# 2. 检查文件权限
echo -e "${YELLOW}[2] 检查文件权限:${NC}"
echo "前端 dist 目录权限:"
ls -ld /var/www/AppleBearBaby/frontend/dist

echo "管理后台 dist 目录权限:"
ls -ld /var/www/AppleBearBaby/admin/dist

# 修复权限（如果需要）
echo -e "${YELLOW}修复文件权限...${NC}"
sudo chown -R www-data:www-data /var/www/AppleBearBaby/frontend/dist
sudo chown -R www-data:www-data /var/www/AppleBearBaby/admin/dist
sudo chmod -R 755 /var/www/AppleBearBaby/frontend/dist
sudo chmod -R 755 /var/www/AppleBearBaby/admin/dist
echo -e "${GREEN}✅ 权限已修复${NC}"
echo ""

# 3. 检查 Nginx 配置中的静态文件处理
echo -e "${YELLOW}[3] 检查 Nginx 配置:${NC}"
echo "检查静态文件 location 配置:"
sudo grep -A 5 "location.*assets\|location.*\.(js\|css\|png)" /etc/nginx/sites-available/applebearbaby | head -20

# 4. 检查 Nginx 用户权限
echo -e "${YELLOW}[4] 检查 Nginx 用户:${NC}"
NGINX_USER=$(ps aux | grep nginx | grep -v grep | head -1 | awk '{print $1}')
echo "Nginx 运行用户: $NGINX_USER"

# 5. 测试静态文件访问
echo -e "${YELLOW}[5] 测试静态文件访问:${NC}"
if [ -f "/var/www/AppleBearBaby/frontend/dist/assets/index-CVqcjJdQ.css" ]; then
    echo "测试 CSS 文件:"
    sudo -u www-data cat /var/www/AppleBearBaby/frontend/dist/assets/index-CVqcjJdQ.css | head -1 || echo -e "${RED}❌ 无法读取文件${NC}"
fi

# 6. 检查 Nginx 错误日志
echo -e "${YELLOW}[6] 检查 Nginx 错误日志:${NC}"
if [ -f "/var/log/nginx/applebearbaby-error.log" ]; then
    echo "最近的 403 错误:"
    sudo tail -20 /var/log/nginx/applebearbaby-error.log | grep -i "403\|forbidden\|permission" || echo "无相关错误"
elif [ -f "/var/log/nginx/error.log" ]; then
    sudo tail -20 /var/log/nginx/error.log | grep -i "403\|forbidden\|permission\|applebearbaby" || echo "无相关错误"
fi
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}诊断完成${NC}"
echo -e "${GREEN}========================================${NC}"












