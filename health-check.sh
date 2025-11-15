#!/bin/bash

# 健康检查脚本
# 使用方法: chmod +x health-check.sh && ./health-check.sh

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🏥 开始健康检查..."
echo ""

# 检查PM2服务
echo "📊 PM2 服务状态:"
if pm2 list | grep -q "applebearbaby"; then
    echo -e "${GREEN}✅ PM2 服务运行中${NC}"
    pm2 list | grep applebearbaby
else
    echo -e "${RED}❌ PM2 服务未运行${NC}"
fi
echo ""

# 检查端口
echo "🔌 端口检查:"
check_port() {
    if netstat -tuln 2>/dev/null | grep -q ":$1 " || ss -tuln 2>/dev/null | grep -q ":$1 "; then
        echo -e "${GREEN}✅ 端口 $1 正在监听${NC}"
    else
        echo -e "${RED}❌ 端口 $1 未监听${NC}"
    fi
}

check_port 4000  # 后端
check_port 5173  # 前端
check_port 5174  # 管理后台
check_port 80    # HTTP
check_port 443   # HTTPS
echo ""

# 检查Nginx
echo "🌐 Nginx 状态:"
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx 运行中${NC}"
    if sudo nginx -t 2>&1 | grep -q "successful"; then
        echo -e "${GREEN}✅ Nginx 配置正确${NC}"
    else
        echo -e "${RED}❌ Nginx 配置有误${NC}"
        sudo nginx -t
    fi
else
    echo -e "${RED}❌ Nginx 未运行${NC}"
fi
echo ""

# 检查磁盘空间
echo "💾 磁盘空间:"
df -h / | tail -1 | awk '{print "使用率: " $5 " | 可用: " $4}'
echo ""

# 检查内存
echo "🧠 内存使用:"
free -h | grep Mem | awk '{print "总内存: " $2 " | 已用: " $3 " | 可用: " $7}'
echo ""

# 检查最近的错误日志
echo "📋 最近的错误日志 (最后10行):"
if [ -f "logs/backend-error.log" ]; then
    echo "后端错误:"
    tail -10 logs/backend-error.log 2>/dev/null || echo "无错误"
else
    echo "日志文件不存在"
fi
echo ""

echo "✅ 健康检查完成！"

