#!/bin/bash

# 最终修复 Nginx 配置脚本

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}检查并修复 Nginx 配置...${NC}"

# 1. 查找所有包含 your-domain.com 的配置
echo -e "${YELLOW}[1] 查找包含 your-domain.com 的配置...${NC}"
grep -r "your-domain.com" /etc/nginx/sites-available/ 2>/dev/null && {
    echo -e "${RED}❌ 发现 your-domain.com 引用，需要修复${NC}"
} || {
    echo -e "${GREEN}✅ 未发现 your-domain.com 引用${NC}"
}

# 2. 检查当前启用的配置
echo -e "${YELLOW}[2] 检查启用的配置...${NC}"
ls -la /etc/nginx/sites-enabled/

# 3. 更新主配置
echo -e "${YELLOW}[3] 更新主配置文件...${NC}"
cd /var/www/AppleBearBaby
sudo cp nginx.conf /etc/nginx/sites-available/applebearbaby

# 4. 确保软链接存在
echo -e "${YELLOW}[4] 创建软链接...${NC}"
sudo ln -sf /etc/nginx/sites-available/applebearbaby /etc/nginx/sites-enabled/applebearbaby

# 5. 检查 admin.applebearbaby.net 配置的 server_name
echo -e "${YELLOW}[5] 检查 admin.applebearbaby.net 配置...${NC}"
if [ -f "/etc/nginx/sites-available/admin.applebearbaby.net" ]; then
    SERVER_NAME=$(grep "server_name" /etc/nginx/sites-available/admin.applebearbaby.net | head -1)
    echo "server_name: $SERVER_NAME"
    
    # 如果 server_name 不是 admin.applebearbaby.net，可能需要修复
    if echo "$SERVER_NAME" | grep -q "applebearbaby.net" && ! echo "$SERVER_NAME" | grep -q "admin.applebearbaby.net"; then
        echo -e "${YELLOW}⚠️  警告: admin.applebearbaby.net 配置可能干扰主配置${NC}"
    fi
fi

# 6. 测试配置
echo -e "${YELLOW}[6] 测试 Nginx 配置...${NC}"
if sudo nginx -t 2>&1 | grep -q "test is successful"; then
    echo -e "${GREEN}✅ Nginx 配置测试通过${NC}"
    
    # 7. 重新加载 Nginx
    echo -e "${YELLOW}[7] 重新加载 Nginx...${NC}"
    sudo systemctl reload nginx
    
    # 8. 测试访问
    echo -e "${YELLOW}[8] 测试访问...${NC}"
    echo "测试根路径 /:"
    curl -s http://localhost/ | head -5
    
    echo ""
    echo "测试前端服务 (直接访问):"
    curl -s http://localhost:5173/ | head -5
    
    echo ""
    echo "测试管理后台服务 (直接访问):"
    curl -s http://localhost:5174/ | head -5
    
else
    echo -e "${RED}❌ Nginx 配置测试失败${NC}"
    sudo nginx -t
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ 配置已更新${NC}"
echo -e "${GREEN}========================================${NC}"

