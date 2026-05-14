#!/bin/bash

# HTTPS 访问诊断脚本

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  HTTPS 访问诊断${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 1. 检查 SSL 证书
echo -e "${YELLOW}[1] 检查 SSL 证书:${NC}"
if [ -f "/etc/letsencrypt/live/applebearbaby.net/fullchain.pem" ]; then
    echo -e "${GREEN}✅ SSL 证书文件存在${NC}"
    sudo certbot certificates 2>/dev/null | grep -A 5 "applebearbaby.net" || echo "证书信息获取失败"
else
    echo -e "${RED}❌ SSL 证书文件不存在${NC}"
    echo -e "${YELLOW}   需要配置 SSL 证书${NC}"
fi
echo ""

# 2. 检查端口监听
echo -e "${YELLOW}[2] 检查端口监听:${NC}"
echo "端口 80 (HTTP):"
if sudo netstat -tuln 2>/dev/null | grep -q ":80 " || sudo ss -tuln 2>/dev/null | grep -q ":80 "; then
    echo -e "${GREEN}✅ 端口 80 正在监听${NC}"
    sudo netstat -tuln 2>/dev/null | grep ":80 " || sudo ss -tuln 2>/dev/null | grep ":80 "
else
    echo -e "${RED}❌ 端口 80 未监听${NC}"
fi

echo "端口 443 (HTTPS):"
if sudo netstat -tuln 2>/dev/null | grep -q ":443 " || sudo ss -tuln 2>/dev/null | grep -q ":443 "; then
    echo -e "${GREEN}✅ 端口 443 正在监听${NC}"
    sudo netstat -tuln 2>/dev/null | grep ":443 " || sudo ss -tuln 2>/dev/null | grep ":443 "
else
    echo -e "${RED}❌ 端口 443 未监听（可能未配置 SSL）${NC}"
fi
echo ""

# 3. 检查 Nginx 配置
echo -e "${YELLOW}[3] 检查 Nginx 配置:${NC}"
if sudo nginx -t 2>&1 | grep -q "test is successful"; then
    echo -e "${GREEN}✅ Nginx 配置测试通过${NC}"
else
    echo -e "${RED}❌ Nginx 配置测试失败${NC}"
    sudo nginx -t
fi

# 检查 HTTPS server 块是否启用
if sudo nginx -T 2>&1 | grep -q "listen 443"; then
    echo -e "${GREEN}✅ HTTPS server 块已配置${NC}"
    echo "HTTPS server 配置:"
    sudo nginx -T 2>&1 | grep -A 5 "listen 443" | head -10
else
    echo -e "${YELLOW}⚠️  HTTPS server 块未配置或已注释${NC}"
fi
echo ""

# 4. 检查防火墙
echo -e "${YELLOW}[4] 检查防火墙:${NC}"
if command -v ufw &> /dev/null; then
    echo "UFW 状态:"
    sudo ufw status | grep -E "80|443" || echo "端口未在防火墙规则中"
elif command -v firewall-cmd &> /dev/null; then
    echo "Firewalld 状态:"
    sudo firewall-cmd --list-all | grep -E "80|443" || echo "端口未在防火墙规则中"
fi
echo ""

# 5. 检查域名解析
echo -e "${YELLOW}[5] 检查域名解析:${NC}"
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip 2>/dev/null)
DOMAIN_IP=$(dig +short applebearbaby.net A 2>/dev/null | head -1)

echo "服务器 IP: $SERVER_IP"
echo "域名解析 IP: $DOMAIN_IP"

if [ "$SERVER_IP" = "$DOMAIN_IP" ]; then
    echo -e "${GREEN}✅ 域名解析正确${NC}"
else
    echo -e "${RED}❌ 域名解析不匹配${NC}"
    echo -e "${YELLOW}   域名可能未正确解析到服务器 IP${NC}"
fi
echo ""

# 6. 测试本地访问
echo -e "${YELLOW}[6] 测试本地访问:${NC}"
echo "HTTP (端口 80):"
HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/ 2>/dev/null)
if [ "$HTTP_RESPONSE" = "200" ] || [ "$HTTP_RESPONSE" = "301" ] || [ "$HTTP_RESPONSE" = "302" ]; then
    echo -e "${GREEN}✅ HTTP 可以访问 (状态码: $HTTP_RESPONSE)${NC}"
else
    echo -e "${RED}❌ HTTP 无法访问 (状态码: $HTTP_RESPONSE)${NC}"
fi

echo "HTTPS (端口 443):"
HTTPS_RESPONSE=$(curl -s -k -o /dev/null -w "%{http_code}" https://localhost/ 2>/dev/null)
if [ "$HTTPS_RESPONSE" = "200" ] || [ "$HTTPS_RESPONSE" = "301" ] || [ "$HTTPS_RESPONSE" = "302" ]; then
    echo -e "${GREEN}✅ HTTPS 可以访问 (状态码: $HTTPS_RESPONSE)${NC}"
else
    echo -e "${RED}❌ HTTPS 无法访问 (状态码: $HTTPS_RESPONSE)${NC}"
fi
echo ""

# 7. 检查 Nginx 错误日志
echo -e "${YELLOW}[7] 最近的 Nginx 错误日志:${NC}"
if [ -f "/var/log/nginx/applebearbaby-error.log" ]; then
    sudo tail -10 /var/log/nginx/applebearbaby-error.log
elif [ -f "/var/log/nginx/error.log" ]; then
    sudo tail -10 /var/log/nginx/error.log | grep -i "applebearbaby\|443\|ssl" || echo "无相关错误"
else
    echo "错误日志文件不存在"
fi
echo ""

# 8. 检查 PM2 服务状态
echo -e "${YELLOW}[8] 检查 PM2 服务状态:${NC}"
pm2 list
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}诊断完成${NC}"
echo -e "${GREEN}========================================${NC}"












