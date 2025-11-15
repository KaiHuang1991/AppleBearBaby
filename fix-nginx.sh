#!/bin/bash

# 修复 Nginx 配置脚本

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}检查 Nginx 配置...${NC}"

# 检查配置文件是否存在
if [ ! -f "/etc/nginx/sites-available/applebearbaby" ]; then
    echo -e "${RED}❌ 配置文件不存在，正在创建...${NC}"
    cd /var/www/AppleBearBaby
    sudo cp nginx.conf /etc/nginx/sites-available/applebearbaby
    echo -e "${GREEN}✅ 配置文件已创建${NC}"
else
    echo -e "${GREEN}✅ 配置文件已存在${NC}"
fi

# 检查软链接是否存在
if [ ! -L "/etc/nginx/sites-enabled/applebearbaby" ]; then
    echo -e "${YELLOW}⚠️  软链接不存在，正在创建...${NC}"
    sudo ln -s /etc/nginx/sites-available/applebearbaby /etc/nginx/sites-enabled/applebearbaby
    echo -e "${GREEN}✅ 软链接已创建${NC}"
else
    echo -e "${GREEN}✅ 软链接已存在${NC}"
fi

# 测试配置
echo -e "${YELLOW}测试 Nginx 配置...${NC}"
if sudo nginx -t; then
    echo -e "${GREEN}✅ Nginx 配置测试通过${NC}"
    
    # 重启 Nginx
    echo -e "${YELLOW}重启 Nginx...${NC}"
    sudo systemctl restart nginx
    
    # 检查状态
    if systemctl is-active --quiet nginx; then
        echo -e "${GREEN}✅ Nginx 已成功重启${NC}"
    else
        echo -e "${RED}❌ Nginx 重启失败${NC}"
        sudo systemctl status nginx
        exit 1
    fi
else
    echo -e "${RED}❌ Nginx 配置测试失败${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Nginx 配置已修复！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "当前启用的配置："
ls -la /etc/nginx/sites-enabled/
echo ""
echo "测试访问："
echo "  curl http://localhost/"
echo "  curl -H 'Host: applebearbaby.net' http://localhost/"

