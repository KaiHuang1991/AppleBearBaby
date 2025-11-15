#!/bin/bash

# 检查 Nginx 配置脚本

echo "=== 检查所有启用的配置 ==="
ls -la /etc/nginx/sites-enabled/

echo ""
echo "=== 检查 admin.applebearbaby.net 配置 ==="
cat /etc/nginx/sites-available/admin.applebearbaby.net 2>/dev/null || echo "配置文件不存在"

echo ""
echo "=== 检查 applebearbaby 配置 ==="
cat /etc/nginx/sites-available/applebearbaby 2>/dev/null | head -50 || echo "配置文件不存在"

echo ""
echo "=== 测试 Nginx 配置（显示实际生效的配置）==="
sudo nginx -T 2>/dev/null | grep -A 30 "server_name.*applebearbaby" || echo "未找到相关配置"

