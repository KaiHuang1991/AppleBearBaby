#!/bin/bash

# 防火墙配置脚本
# 使用方法: chmod +x setup-firewall.sh && sudo ./setup-firewall.sh

set -e

echo "🔥 配置防火墙..."

# 检查是否以root运行
if [ "$EUID" -ne 0 ]; then 
    echo "❌ 请使用 sudo 运行此脚本"
    exit 1
fi

# 检测防火墙类型
if command -v ufw &> /dev/null; then
    echo "✅ 检测到 UFW，正在配置..."
    
    # 允许SSH（重要！先允许SSH，避免被锁在外面）
    ufw allow 22/tcp
    
    # 允许HTTP和HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # 如果使用本地MongoDB，允许MongoDB端口（可选）
    # ufw allow 27017/tcp
    
    # 启用防火墙
    ufw --force enable
    
    # 显示状态
    ufw status
    
elif command -v firewall-cmd &> /dev/null; then
    echo "✅ 检测到 firewalld，正在配置..."
    
    # 允许SSH
    firewall-cmd --permanent --add-service=ssh
    
    # 允许HTTP和HTTPS
    firewall-cmd --permanent --add-service=http
    firewall-cmd --permanent --add-service=https
    
    # 如果使用本地MongoDB
    # firewall-cmd --permanent --add-port=27017/tcp
    
    # 重新加载防火墙
    firewall-cmd --reload
    
    # 显示状态
    firewall-cmd --list-all
    
else
    echo "⚠️  未检测到防火墙，请手动配置"
    echo "推荐使用 UFW (Ubuntu) 或 firewalld (CentOS)"
fi

echo "✅ 防火墙配置完成！"

