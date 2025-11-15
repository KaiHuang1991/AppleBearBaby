#!/bin/bash

# AppleBearBaby VPS 一键部署脚本
# 在VPS上执行: chmod +x deploy-on-vps.sh && ./deploy-on-vps.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  AppleBearBaby 项目部署${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查是否在项目目录
if [ ! -f "ecosystem.config.js" ]; then
    echo -e "${RED}❌ 错误: 请在项目根目录执行此脚本${NC}"
    echo "当前目录: $(pwd)"
    exit 1
fi

# 1. 检查并安装 Node.js
echo -e "${YELLOW}[1/7] 检查 Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js 未安装，请先安装 Node.js${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js 版本: $(node -v)${NC}"

# 2. 检查并安装 PM2
echo -e "${YELLOW}[2/7] 检查 PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠️  PM2 未安装，正在安装...${NC}"
    npm install -g pm2
fi
echo -e "${GREEN}✅ PM2 已安装${NC}"

# 3. 创建日志目录
echo -e "${YELLOW}[3/7] 创建日志目录...${NC}"
mkdir -p logs
echo -e "${GREEN}✅ 日志目录已创建${NC}"

# 4. 安装后端依赖
echo -e "${YELLOW}[4/7] 安装后端依赖...${NC}"
cd backend
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  警告: backend/.env 文件不存在${NC}"
    echo -e "${YELLOW}   请确保已创建并配置 .env 文件${NC}"
fi
npm install
cd ..
echo -e "${GREEN}✅ 后端依赖安装完成${NC}"

# 5. 安装前端依赖并构建
echo -e "${YELLOW}[5/7] 安装前端依赖并构建...${NC}"
cd frontend
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  警告: frontend/.env 文件不存在${NC}"
    echo -e "${YELLOW}   请确保已创建并配置 .env 文件${NC}"
fi
npm install
npm run build
cd ..
echo -e "${GREEN}✅ 前端构建完成${NC}"

# 6. 安装管理后台依赖并构建
echo -e "${YELLOW}[6/7] 安装管理后台依赖并构建...${NC}"
cd admin
npm install
npm run build
cd ..
echo -e "${GREEN}✅ 管理后台构建完成${NC}"

# 7. 启动/重启 PM2 服务
echo -e "${YELLOW}[7/7] 启动 PM2 服务...${NC}"
if pm2 list | grep -q "applebearbaby"; then
    echo -e "${YELLOW}⚠️  停止现有服务...${NC}"
    pm2 delete ecosystem.config.js || true
fi

pm2 start ecosystem.config.js
pm2 save

# 设置开机自启（如果需要）
echo -e "${YELLOW}设置 PM2 开机自启...${NC}"
pm2 startup | grep -v "PM2" | bash || echo -e "${YELLOW}⚠️  开机自启设置可能需要手动执行${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ 部署完成！${NC}"
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

