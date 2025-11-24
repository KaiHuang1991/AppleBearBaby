#!/bin/bash

# 修复 Nginx 代理配置

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  修复 Nginx 代理配置${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 1. 检查当前配置
echo -e "${YELLOW}[1] 检查当前 Nginx 配置:${NC}"
sudo grep -A 3 "location.*assets\|location.*\.png" /etc/nginx/sites-available/applebearbaby | head -20

# 2. 检查上游服务器配置
echo -e "${YELLOW}[2] 检查上游服务器配置:${NC}"
sudo grep -A 3 "upstream frontend" /etc/nginx/sites-available/applebearbaby

# 3. 测试上游服务器连接
echo -e "${YELLOW}[3] 测试上游服务器:${NC}"
curl -I http://localhost:5173/applebear.png 2>&1 | head -3
curl -I http://localhost:5173/assets/index-CVqcjJdQ.css 2>&1 | head -3

# 4. 检查 Nginx 错误日志
echo -e "${YELLOW}[4] 检查 Nginx 错误日志:${NC}"
sudo tail -20 /var/log/nginx/applebearbaby-error.log 2>/dev/null | grep -i "403\|forbidden\|denied" || \
sudo tail -20 /var/log/nginx/error.log 2>/dev/null | grep -i "403\|forbidden\|applebearbaby" || \
echo "无相关错误"

# 5. 检查访问日志
echo -e "${YELLOW}[5] 检查访问日志:${NC}"
sudo tail -10 /var/log/nginx/applebearbaby-access.log 2>/dev/null | grep -E "applebear\.png|assets.*css" || \
echo "无相关访问记录"

echo ""
echo -e "${GREEN}========================================${NC}"









