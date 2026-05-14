#!/bin/bash

# 检查环境变量配置脚本

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}检查环境变量配置...${NC}"
echo ""

# 检查后端环境变量
echo -e "${YELLOW}[1] 检查后端环境变量:${NC}"
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✅ backend/.env 文件存在${NC}"
    
    # 检查关键变量
    if grep -q "MONGODB_URI=" backend/.env && ! grep -q "MONGODB_URI=$" backend/.env; then
        MONGODB_URI=$(grep "MONGODB_URI=" backend/.env | head -1 | cut -d '=' -f2-)
        if [ -z "$MONGODB_URI" ] || [ "$MONGODB_URI" = "" ]; then
            echo -e "${RED}❌ MONGODB_URI 未设置或为空${NC}"
        else
            echo -e "${GREEN}✅ MONGODB_URI 已设置${NC}"
            echo "   值: ${MONGODB_URI:0:30}..." # 只显示前30个字符
        fi
    else
        echo -e "${RED}❌ MONGODB_URI 未在 .env 文件中找到${NC}"
    fi
    
    # 检查其他关键变量
    echo ""
    echo "其他关键变量检查:"
    grep -E "^(CLOUDINARY_NAME|JWT_SECRET|PORT|FRONTEND_URL)=" backend/.env | sed 's/=.*/=***/' || echo "未找到"
else
    echo -e "${RED}❌ backend/.env 文件不存在${NC}"
    echo -e "${YELLOW}   需要创建并配置 .env 文件${NC}"
fi

echo ""

# 检查前端环境变量
echo -e "${YELLOW}[2] 检查前端环境变量:${NC}"
if [ -f "frontend/.env" ]; then
    echo -e "${GREEN}✅ frontend/.env 文件存在${NC}"
    cat frontend/.env
else
    echo -e "${YELLOW}⚠️  frontend/.env 文件不存在（可选）${NC}"
fi

echo ""
echo -e "${YELLOW}测试环境变量加载:${NC}"
cd backend
if node -e "require('dotenv').config(); console.log('MONGODB_URI:', process.env.MONGODB_URI ? '已设置 (' + process.env.MONGODB_URI.substring(0, 30) + '...)' : '未设置')" 2>/dev/null; then
    echo -e "${GREEN}✅ 环境变量可以正常加载${NC}"
else
    echo -e "${RED}❌ 环境变量加载失败${NC}"
fi
cd ..












