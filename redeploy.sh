#!/bin/bash

# 一键重新部署脚本
# 使用方法: chmod +x redeploy.sh && ./redeploy.sh

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  重新部署 AppleBearBaby 项目${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查是否在项目目录
if [ ! -f "ecosystem.config.js" ]; then
    echo -e "${RED}❌ 错误: 请在项目根目录执行此脚本${NC}"
    exit 1
fi

# 1. 停止现有服务
echo -e "${YELLOW}[1/9] 停止现有 PM2 服务...${NC}"
pm2 delete all 2>/dev/null || echo "没有运行中的服务"
echo -e "${GREEN}✅ 服务已停止${NC}"

# 2. 检查环境变量
echo -e "${YELLOW}[2/9] 检查环境变量...${NC}"
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}❌ 警告: backend/.env 文件不存在${NC}"
    echo -e "${YELLOW}   请创建并配置 .env 文件${NC}"
else
    echo -e "${GREEN}✅ 后端环境变量文件存在${NC}"
fi

if [ ! -f "frontend/.env" ]; then
    echo -e "${YELLOW}⚠️  警告: frontend/.env 文件不存在${NC}"
    echo -e "${YELLOW}   将使用默认配置${NC}"
else
    echo -e "${GREEN}✅ 前端环境变量文件存在${NC}"
fi

# 3. 安装依赖
echo -e "${YELLOW}[3/9] 安装依赖...${NC}"
cd backend
npm install
cd ..

cd frontend
npm install
cd ..

cd admin
npm install
cd ..
echo -e "${GREEN}✅ 依赖安装完成${NC}"

# 4. 构建前端项目
echo -e "${YELLOW}[4/9] 构建前端项目...${NC}"
cd frontend
npm run build
cd ..
echo -e "${GREEN}✅ 前端构建完成${NC}"

# 5. 构建管理后台
echo -e "${YELLOW}[5/9] 构建管理后台...${NC}"
cd admin
npm run build
cd ..
echo -e "${GREEN}✅ 管理后台构建完成${NC}"

# 6. 创建日志目录
echo -e "${YELLOW}[6/9] 创建日志目录...${NC}"
mkdir -p logs
echo -e "${GREEN}✅ 日志目录已创建${NC}"

# 7. 配置 Nginx
echo -e "${YELLOW}[7/9] 配置 Nginx...${NC}"
sudo cp nginx.conf /etc/nginx/sites-available/applebearbaby
sudo rm -f /etc/nginx/sites-enabled/applebearbaby
sudo ln -sf /etc/nginx/sites-available/applebearbaby /etc/nginx/sites-enabled/applebearbaby

if sudo nginx -t 2>&1 | grep -q "test is successful"; then
    echo -e "${GREEN}✅ Nginx 配置测试通过${NC}"
    sudo systemctl reload nginx
    echo -e "${GREEN}✅ Nginx 已重新加载${NC}"
else
    echo -e "${RED}❌ Nginx 配置测试失败${NC}"
    echo -e "${YELLOW}   请手动检查配置: sudo nginx -t${NC}"
fi

# 8. 启动 PM2 服务
echo -e "${YELLOW}[8/9] 启动 PM2 服务...${NC}"
pm2 start ecosystem.config.js
pm2 save
echo -e "${GREEN}✅ PM2 服务已启动${NC}"

# 9. 验证部署
echo -e "${YELLOW}[9/9] 验证部署...${NC}"
sleep 2
pm2 list
echo ""

# 测试访问
echo -e "${YELLOW}测试访问...${NC}"
echo "测试根路径:"
curl -s http://localhost/ | head -5 || echo -e "${RED}❌ 无法访问${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ 重新部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${GREEN}服务状态:${NC}"
pm2 list
echo ""
echo -e "${GREEN}常用命令:${NC}"
echo "  - 查看日志: pm2 logs"
echo "  - 查看状态: pm2 list"
echo "  - 重启服务: pm2 restart ecosystem.config.js"
echo "  - 停止服务: pm2 stop ecosystem.config.js"
echo ""

