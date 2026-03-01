#!/bin/bash

# VQM 项目快速修复脚本
# 使用方法: ./scripts/fix.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   VQM 项目自动修复工具${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# 创建日志目录
mkdir -p logs

echo -e "${YELLOW}[1/5] 停止所有 Vite 进程...${NC}"
pkill -9 -f "vite" 2>/dev/null || echo -e "${GREEN}   没有运行中的进程${NC}"
sleep 2
echo -e "${GREEN}✅ 进程已清理${NC}"
echo ""

echo -e "${YELLOW}[2/5] 清理缓存...${NC}"
rm -rf node_modules/.vite
rm -rf dist
echo -e "${GREEN}✅ 缓存已清理${NC}"
echo ""

echo -e "${YELLOW}[3/5] 验证依赖...${NC}"
if npm run build >/dev/null 2>&1; then
    echo -e "${GREEN}✅ 代码编译通过${NC}"
else
    echo -e "${RED}❌ 编译失败，请检查代码错误${NC}"
    npm run build
    exit 1
fi
echo ""

echo -e "${YELLOW}[4/5] 启动开发服务器...${NC}"
npm run dev > logs/vite-server.log 2>&1 &
VITE_PID=$!
echo "   PID: $VITE_PID"
echo $VITE_PID > logs/vite-pid.txt
sleep 5
echo ""

echo -e "${YELLOW}[5/5] 验证服务器状态...${NC}"
if ps aux | grep -v grep | grep -q "vite"; then
    echo -e "${GREEN}✅ 服务器已启动${NC}"

    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ HTTP 响应正常${NC}"
        TITLE=$(curl -s http://localhost:3000/ | grep -o "<title>.*</title>" | sed 's/<[^>]*>//g')
        echo -e "   页面: $TITLE"
    else
        echo -e "${RED}❌ HTTP 响应异常 ($HTTP_CODE)${NC}"
        echo -e "${YELLOW}   查看日志: tail -f logs/vite-server.log${NC}"
    fi
else
    echo -e "${RED}❌ 服务器启动失败${NC}"
    echo -e "${YELLOW}   查看日志: cat logs/vite-server.log${NC}"
    exit 1
fi
echo ""

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${GREEN}   ✅ 修复完成！${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📱 访问地址:${NC}"
echo -e "   本地: ${GREEN}http://localhost:3000/${NC}"
echo -e "   网络: ${GREEN}http://172.17.0.49:3000/${NC}"
echo ""
echo -e "${BLUE}📋 常用命令:${NC}"
echo -e "   查看日志: ${GREEN}tail -f logs/vite-server.log${NC}"
echo -e "   停止服务: ${GREEN}pkill -f vite${NC}"
echo -e "   诊断检查: ${GREEN}./scripts/diagnose.sh${NC}"
echo ""
