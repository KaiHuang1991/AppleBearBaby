#!/bin/bash

# 诊断脚本 - 检查部署问题
# 使用方法: chmod +x diagnose.sh && ./diagnose.sh

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  部署诊断检查${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 1. 检查 PM2 服务状态
echo -e "${YELLOW}[1] 检查 PM2 服务状态:${NC}"
pm2 list
echo ""

# 2. 检查端口监听
echo -e "${YELLOW}[2] 检查端口监听状态:${NC}"
echo "检查端口 4000 (后端):"
if netstat -tuln 2>/dev/null | grep -q ":4000 " || ss -tuln 2>/dev/null | grep -q ":4000 "; then
    echo -e "${GREEN}✅ 端口 4000 正在监听${NC}"
    netstat -tuln 2>/dev/null | grep ":4000 " || ss -tuln 2>/dev/null | grep ":4000 "
else
    echo -e "${RED}❌ 端口 4000 未监听${NC}"
fi

echo "检查端口 5173 (前端):"
if netstat -tuln 2>/dev/null | grep -q ":5173 " || ss -tuln 2>/dev/null | grep -q ":5173 "; then
    echo -e "${GREEN}✅ 端口 5173 正在监听${NC}"
    netstat -tuln 2>/dev/null | grep ":5173 " || ss -tuln 2>/dev/null | grep ":5173 "
else
    echo -e "${RED}❌ 端口 5173 未监听${NC}"
fi

echo "检查端口 5174 (管理后台):"
if netstat -tuln 2>/dev/null | grep -q ":5174 " || ss -tuln 2>/dev/null | grep -q ":5174 "; then
    echo -e "${GREEN}✅ 端口 5174 正在监听${NC}"
    netstat -tuln 2>/dev/null | grep ":5174 " || ss -tuln 2>/dev/null | grep ":5174 "
else
    echo -e "${RED}❌ 端口 5174 未监听${NC}"
fi

echo "检查端口 80 (HTTP):"
if netstat -tuln 2>/dev/null | grep -q ":80 " || ss -tuln 2>/dev/null | grep -q ":80 "; then
    echo -e "${GREEN}✅ 端口 80 正在监听${NC}"
    netstat -tuln 2>/dev/null | grep ":80 " || ss -tuln 2>/dev/null | grep ":80 "
else
    echo -e "${RED}❌ 端口 80 未监听（Nginx可能未运行）${NC}"
fi

echo "检查端口 443 (HTTPS):"
if netstat -tuln 2>/dev/null | grep -q ":443 " || ss -tuln 2>/dev/null | grep -q ":443 "; then
    echo -e "${GREEN}✅ 端口 443 正在监听${NC}"
    netstat -tuln 2>/dev/null | grep ":443 " || ss -tuln 2>/dev/null | grep ":443 "
else
    echo -e "${YELLOW}⚠️  端口 443 未监听（可能未配置SSL）${NC}"
fi
echo ""

# 3. 检查 Nginx 状态
echo -e "${YELLOW}[3] 检查 Nginx 状态:${NC}"
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx 正在运行${NC}"
    systemctl status nginx --no-pager -l | head -10
else
    echo -e "${RED}❌ Nginx 未运行${NC}"
fi
echo ""

# 4. 检查 Nginx 配置
echo -e "${YELLOW}[4] 检查 Nginx 配置:${NC}"
if [ -f "/etc/nginx/sites-enabled/applebearbaby" ]; then
    echo -e "${GREEN}✅ Nginx 配置文件存在${NC}"
    echo "配置文件内容:"
    cat /etc/nginx/sites-enabled/applebearbaby | head -20
else
    echo -e "${RED}❌ Nginx 配置文件不存在${NC}"
    echo "请运行: sudo cp nginx.conf /etc/nginx/sites-available/applebearbaby"
    echo "然后: sudo ln -s /etc/nginx/sites-available/applebearbaby /etc/nginx/sites-enabled/"
fi
echo ""

# 5. 测试 Nginx 配置
echo -e "${YELLOW}[5] 测试 Nginx 配置:${NC}"
if sudo nginx -t 2>&1; then
    echo -e "${GREEN}✅ Nginx 配置正确${NC}"
else
    echo -e "${RED}❌ Nginx 配置有误${NC}"
fi
echo ""

# 6. 检查防火墙
echo -e "${YELLOW}[6] 检查防火墙状态:${NC}"
if command -v ufw &> /dev/null; then
    echo "UFW 状态:"
    sudo ufw status
elif command -v firewall-cmd &> /dev/null; then
    echo "Firewalld 状态:"
    sudo firewall-cmd --list-all
else
    echo -e "${YELLOW}⚠️  未检测到防火墙管理工具${NC}"
fi
echo ""

# 7. 检查最近的错误日志
echo -e "${YELLOW}[7] 检查最近的错误日志:${NC}"
echo "后端错误日志（最后5行）:"
pm2 logs applebearbaby-backend --lines 5 --nostream --err 2>/dev/null || echo "无错误"
echo ""

# 8. 测试本地连接
echo -e "${YELLOW}[8] 测试本地连接:${NC}"
echo "测试后端 API:"
curl -s http://localhost:4000/ | head -5 || echo -e "${RED}❌ 后端无法访问${NC}"

echo "测试前端:"
curl -s http://localhost:5173/ | head -5 || echo -e "${RED}❌ 前端无法访问${NC}"
echo ""

# 9. 检查域名解析
echo -e "${YELLOW}[9] 检查域名解析:${NC}"
if command -v dig &> /dev/null; then
    echo "applebearbaby.net 的 A 记录:"
    dig +short applebearbaby.net A || echo "无法解析"
else
    echo "使用 nslookup:"
    nslookup applebearbaby.net 2>/dev/null || echo "无法解析"
fi
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}诊断完成${NC}"
echo -e "${GREEN}========================================${NC}"

