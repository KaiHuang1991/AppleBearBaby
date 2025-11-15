#!/bin/bash

# 修复 Nginx location 配置

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

CONFIG_FILE="/etc/nginx/sites-available/applebearbaby"

echo -e "${YELLOW}修复 Nginx location 配置...${NC}"

# 1. 备份原配置
echo -e "${YELLOW}[1] 备份原配置...${NC}"
sudo cp "$CONFIG_FILE" "$CONFIG_FILE.backup.$(date +%Y%m%d_%H%M%S)"

# 2. 检查 HTTP server 块中的 location /
echo -e "${YELLOW}[2] 检查当前配置...${NC}"
if grep -A 2 "listen 80" "$CONFIG_FILE" | grep -A 2 "location /" | grep -q "return 301"; then
    echo -e "${RED}❌ 发现 HTTP server 块中的 location / 是重定向，需要修复${NC}"
    
    # 3. 使用 sed 修复 HTTP server 块中的 location /
    echo -e "${YELLOW}[3] 修复 HTTP server 块...${NC}"
    
    # 创建一个临时文件
    TEMP_FILE=$(mktemp)
    
    # 使用 awk 或 sed 来修复
    # 找到 HTTP server 块（listen 80）中的 location /，替换为重定向部分
    awk '
    /listen 80/ { in_http_server=1 }
    /listen 443/ { in_http_server=0 }
    in_http_server && /location \/ \{/ {
        print "    location / {"
        print "        proxy_pass http://frontend;"
        print "        proxy_http_version 1.1;"
        print "        proxy_set_header Upgrade $http_upgrade;"
        print "        proxy_set_header Connection \"upgrade\";"
        print "        proxy_set_header Host $host;"
        print "        proxy_set_header X-Real-IP $remote_addr;"
        print "        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;"
        print "        proxy_set_header X-Forwarded-Proto $scheme;"
        print "        proxy_cache_bypass $http_upgrade;"
        print "        proxy_read_timeout 300s;"
        print "        proxy_connect_timeout 75s;"
        print "    }"
        # 跳过原来的 location / 块
        getline
        while (getline && !/^[[:space:]]*}/) {
            # 跳过原内容
        }
        next
    }
    { print }
    ' "$CONFIG_FILE" > "$TEMP_FILE"
    
    sudo mv "$TEMP_FILE" "$CONFIG_FILE"
    sudo chmod 644 "$CONFIG_FILE"
    
    echo -e "${GREEN}✅ 配置已修复${NC}"
else
    echo -e "${GREEN}✅ HTTP server 块配置正确${NC}"
fi

# 4. 验证修复
echo -e "${YELLOW}[4] 验证修复...${NC}"
if grep -A 2 "listen 80" "$CONFIG_FILE" | grep -A 2 "location /" | grep -q "proxy_pass http://frontend"; then
    echo -e "${GREEN}✅ HTTP server 块中的 location / 已正确配置为代理${NC}"
else
    echo -e "${RED}❌ 修复失败，需要手动检查${NC}"
    exit 1
fi

# 5. 测试配置
echo -e "${YELLOW}[5] 测试 Nginx 配置...${NC}"
if sudo nginx -t; then
    echo -e "${GREEN}✅ Nginx 配置测试通过${NC}"
    
    # 6. 重新加载 Nginx
    echo -e "${YELLOW}[6] 重新加载 Nginx...${NC}"
    if sudo systemctl reload nginx; then
        echo -e "${GREEN}✅ Nginx 已成功重新加载${NC}"
    else
        echo -e "${RED}❌ Nginx 重新加载失败${NC}"
        sudo systemctl status nginx
        exit 1
    fi
else
    echo -e "${RED}❌ Nginx 配置测试失败${NC}"
    sudo nginx -t
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ 配置已修复并重新加载${NC}"
echo -e "${GREEN}========================================${NC}"

