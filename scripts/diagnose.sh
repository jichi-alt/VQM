#!/bin/bash

# VQM 项目快速诊断脚本
# 使用方法: ./scripts/diagnose.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   VQM 项目诊断工具${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# 1. 检查服务器进程
echo -e "${YELLOW}[1/6] 检查服务器进程...${NC}"
if ps aux | grep -v grep | grep -q "vite"; then
    echo -e "${GREEN}✅ Vite 服务器正在运行${NC}"
    ps aux | grep -v grep | grep "vite" | awk '{print "   PID:", $2, "启动时间:", $9}'
else
    echo -e "${RED}❌ Vite 服务器未运行${NC}"
fi
echo ""

# 2. 检查端口占用
echo -e "${YELLOW}[2/6] 检查端口状态...${NC}"
if lsof -i :3000 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ 端口 3000 已被占用（服务器正在监听）${NC}"
    lsof -i :3000 | tail -n +2 | awk '{print "   PID:", $2, "进程:", $1}'
else
    echo -e "${RED}❌ 端口 3000 未被占用（服务器可能未启动）${NC}"
fi
echo ""

# 3. 测试HTTP连接
echo -e "${YELLOW}[3/6] 测试 HTTP 连接...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ HTTP 200 OK - 服务器响应正常${NC}"
    TITLE=$(curl -s http://localhost:3000/ | grep -o "<title>.*</title>" | sed 's/<[^>]*>//g')
    echo -e "   页面标题: $TITLE"
else
    echo -e "${RED}❌ HTTP $HTTP_CODE - 服务器响应异常${NC}"
fi
echo ""

# 4. 检查日志中的错误
echo -e "${YELLOW}[4/6] 检查最近的错误日志...${NC}"
if [ -f "logs/vite-server.log" ]; then
    ERRORS=$(tail -100 logs/vite-server.log | grep -i "error\|failed\|cannot" | wc -l)
    if [ "$ERRORS" -gt 0 ]; then
        echo -e "${RED}⚠️  发现 $ERRORS 个错误${NC}"
        echo -e "${BLUE}最近的 5 条错误:${NC}"
        tail -100 logs/vite-server.log | grep -i "error\|failed\|cannot" | tail -5
    else
        echo -e "${GREEN}✅ 未发现错误日志${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  日志文件不存在 (logs/vite-server.log)${NC}"
fi
echo ""

# 5. TypeScript 类型检查
echo -e "${YELLOW}[5/6] TypeScript 类型检查...${NC}"
if npm run build >/dev/null 2>&1; then
    echo -e "${GREEN}✅ TypeScript 编译通过${NC}"
else
    echo -e "${RED}❌ TypeScript 编译失败${NC}"
    echo -e "${BLUE}错误详情:${NC}"
    npm run build 2>&1 | grep -E "error|Error" | head -5
fi
echo ""

# 6. React Hook 规则检查
echo -e "${YELLOW}[6/6] React Hook 规则检查...${NC}"
NESTED_HOOKS=$(grep -r "useEffect.*{" components/QuestionVomitMachine.tsx 2>/dev/null | wc -l)
if [ "$NESTED_HOOKS" -gt 2 ]; then
    echo -e "${RED}❌ 可能存在嵌套的 useEffect (发现 $NESTED_HOOKS 个)${NC}"
    echo -e "${BLUE}useEffect 位置:${NC}"
    grep -n "useEffect" components/QuestionVomitMachine.tsx | head -10
else
    echo -e "${GREEN}✅ React Hook 结构正常${NC}"
fi
echo ""

# 总结
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   诊断完成${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# 修复建议
if ! ps aux | grep -v grep | grep -q "vite"; then
    echo -e "${YELLOW}💡 建议: 服务器未运行，执行以下命令启动：${NC}"
    echo -e "   mkdir -p logs && npm run dev > logs/vite-server.log 2>&1 &"
    echo ""
fi

if [ "$HTTP_CODE" != "200" ]; then
    echo -e "${YELLOW}💡 建议: HTTP 响应异常，尝试重启服务器：${NC}"
    echo -e "   pkill -f vite && npm run dev > logs/vite-server.log 2>&1 &"
    echo ""
fi

# 一键修复命令
echo -e "${BLUE}🔧 快速修复命令:${NC}"
echo -e "   ${GREEN}./scripts/fix.sh${NC} (自动修复常见问题)"
echo ""
