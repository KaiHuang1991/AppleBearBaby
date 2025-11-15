#!/bin/bash

# AppleBearBaby 项目部署脚本
# 使用方法: chmod +x deploy.sh && ./deploy.sh

set -e  # 遇到错误立即退出

echo "🚀 开始部署 AppleBearBaby 项目..."

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查Node.js和npm
check_node() {
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js 未安装，请先安装 Node.js${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Node.js 版本: $(node -v)${NC}"
}

# 检查PM2
check_pm2() {
    if ! command -v pm2 &> /dev/null; then
        echo -e "${YELLOW}⚠️  PM2 未安装，正在安装...${NC}"
        npm install -g pm2
    fi
    echo -e "${GREEN}✅ PM2 已安装${NC}"
}

# 安装依赖
install_dependencies() {
    echo -e "${YELLOW}📦 安装后端依赖...${NC}"
    cd backend
    npm install --production
    cd ..
    
    echo -e "${YELLOW}📦 安装前端依赖...${NC}"
    cd frontend
    npm install
    cd ..
    
    echo -e "${YELLOW}📦 安装管理后台依赖...${NC}"
    cd admin
    npm install
    cd ..
}

# 构建前端项目
build_frontend() {
    echo -e "${YELLOW}🔨 构建前端项目...${NC}"
    cd frontend
    npm run build
    cd ..
    
    echo -e "${YELLOW}🔨 构建管理后台...${NC}"
    cd admin
    npm run build
    cd ..
}

# 创建日志目录
create_logs_dir() {
    if [ ! -d "logs" ]; then
        mkdir -p logs
        echo -e "${GREEN}✅ 创建日志目录${NC}"
    fi
}

# 启动/重启PM2服务
start_pm2() {
    echo -e "${YELLOW}🔄 启动PM2服务...${NC}"
    
    # 如果已经运行，先停止
    if pm2 list | grep -q "applebearbaby"; then
        echo -e "${YELLOW}⚠️  停止现有服务...${NC}"
        pm2 delete ecosystem.config.js || true
    fi
    
    # 启动服务
    pm2 start ecosystem.config.js
    
    # 保存PM2配置
    pm2 save
    
    # 设置开机自启
    pm2 startup
    
    echo -e "${GREEN}✅ PM2 服务已启动${NC}"
    pm2 list
}

# 主函数
main() {
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  AppleBearBaby 项目部署脚本${NC}"
    echo -e "${GREEN}========================================${NC}"
    
    check_node
    check_pm2
    create_logs_dir
    install_dependencies
    build_frontend
    start_pm2
    
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✅ 部署完成！${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo "📝 常用命令："
    echo "  - 查看服务状态: pm2 list"
    echo "  - 查看日志: pm2 logs"
    echo "  - 重启服务: pm2 restart ecosystem.config.js"
    echo "  - 停止服务: pm2 stop ecosystem.config.js"
    echo ""
}

# 运行主函数
main

