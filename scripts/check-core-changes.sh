#!/bin/bash

# VQM 核心组件改动检查脚本
# 每次修改核心组件后运行此脚本

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   VQM 核心组件改动检查${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# 核心组件列表
CORE_FILES=(
    "components/QuestionVomitMachine.tsx"
    "components/QuestionVomitMachine/modals/CheckInSuccessModal.tsx"
    "components/QuestionVomitMachine/modals/MemoryFragmentModal.tsx"
    "components/QuestionVomitMachine/modals/UnlockMemoryModal.tsx"
    "App.tsx"
)

echo -e "${YELLOW}检查最近修改的文件...${NC}"

# 查找最近5分钟内修改的文件
CHANGED_FILES=()
for file in "${CORE_FILES[@]}"; do
    if [ -f "$file" ]; then
        # 获取文件修改时间（分钟数）
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            MINS=$(( ($(date +%s) - $(stat -f %m "$file")) / 60 ))
        else
            # Linux
            MINS=$(( ($(date +%s) - $(stat -c %Y "$file")) / 60 ))
        fi

        if [ $MINS -lt 5 ]; then
            CHANGED_FILES+=("$file")
            echo -e "${YELLOW}   ✓ ${file} (${MINS}分钟前)${NC}"
        fi
    fi
done

if [ ${#CHANGED_FILES[@]} -eq 0 ]; then
    echo -e "${GREEN}✓ 核心组件最近5分钟内无修改${NC}"
    echo ""
    echo -e "${BLUE}💡 提示: 如果要强制检查所有核心组件，使用:${NC}"
    echo -e "   ${GREEN}./scripts/check-core-changes.sh --force${NC}"
    echo ""
    exit 0
fi

echo ""
echo -e "${YELLOW}发现 ${#CHANGED_FILES[@]} 个文件被修改，开始检查...${NC}"
echo ""

# 检查计数器
CHECKS_PASSED=0
CHECKS_FAILED=0
WARNINGS=0

for file in "${CHANGED_FILES[@]}"; do
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo -e "${BLUE}检查: $file${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}"

    # 检查1: React Hook 规则
    echo -e "${YELLOW}[1/5] React Hook 规则检查...${NC}"
    NESTED_EFFECTS=$(grep -c "useEffect.*{" "$file" 2>/dev/null || echo "0")
    NESTED_USE=$(grep -c "useEffect" "$file" 2>/dev/null || echo "0")

    # 检查是否有嵌套的useEffect（通过缩进判断）
    if grep -E "^\s{8,}useEffect" "$file" >/dev/null 2>&1; then
        echo -e "${RED}   ❌ 可能存在嵌套的 useEffect${NC}"
        grep -n "useEffect" "$file" | head -5
        ((CHECKS_FAILED++))
    else
        echo -e "${GREEN}   ✅ 无嵌套 Hook${NC}"
        ((CHECKS_PASSED++))
    fi

    # 检查2: TypeScript 语法
    echo -e "${YELLOW}[2/5] TypeScript 语法检查...${NC}"
    if npx tsc --noEmit "$file" 2>&1 | grep -q "error"; then
        echo -e "${RED}   ❌ TypeScript 语法错误${NC}"
        npx tsc --noEmit "$file" 2>&1 | grep "error" | head -3
        ((CHECKS_FAILED++))
    else
        echo -e "${GREEN}   ✅ TypeScript 语法正确${NC}"
        ((CHECKS_PASSED++))
    fi

    # 检查3: 导入语句完整性
    echo -e "${YELLOW}[3/5] 导入语句检查...${NC}"
    MISSING_IMPORTS=0

    # 检查是否使用了useState但没导入
    if grep -q "useState" "$file" && ! grep -q "import.*useState" "$file"; then
        echo -e "${RED}   ❌ useState 使用但未导入${NC}"
        ((MISSING_IMPORTS++))
    fi

    # 检查是否使用了useEffect但没导入
    if grep -q "useEffect" "$file" && ! grep -q "import.*useEffect" "$file"; then
        echo -e "${RED}   ❌ useEffect 使用但未导入${NC}"
        ((MISSING_IMPORTS++))
    fi

    if [ $MISSING_IMPORTS -eq 0 ]; then
        echo -e "${GREEN}   ✅ 导入语句完整${NC}"
        ((CHECKS_PASSED++))
    else
        ((CHECKS_FAILED++))
    fi

    # 检查4: Console.log 检查（开发日志）
    echo -e "${YELLOW}[4/5] 开发日志检查...${NC}"
    LOG_COUNT=$(grep -c "console.log" "$file" 2>/dev/null || echo "0")
    if [ $LOG_COUNT -gt 10 ]; then
        echo -e "${YELLOW}   ⚠️  发现 ${LOG_COUNT} 个 console.log（建议清理）${NC}"
        ((WARNINGS++))
    else
        echo -e "${GREEN}   ✅ 日志数量合理 (${LOG_COUNT}个)${NC}"
        ((CHECKS_PASSED++))
    fi

    # 检查5: 文件语法完整性
    echo -e "${YELLOW}[5/5] 文件结构检查...${NC}"

    # 检查是否有未闭合的括号
    OPEN_BRACES=$(grep -o "{" "$file" | wc -l)
    CLOSE_BRACES=$(grep -o "}" "$file" | wc -l)

    if [ $OPEN_BRACES -ne $CLOSE_BRACES ]; then
        echo -e "${RED}   ❌ 括号不匹配 (开:${OPEN_BRACES}, 闭:${CLOSE_BRACES})${NC}"
        ((CHECKS_FAILED++))
    else
        echo -e "${GREEN}   ✅ 文件结构完整${NC}"
        ((CHECKS_PASSED++))
    fi

    echo ""
done

# TypeScript 编译检查（整个项目）
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}全局 TypeScript 编译检查${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${YELLOW}编译检查中...${NC}"

if npm run build >/dev/null 2>&1; then
    echo -e "${GREEN}✅ 项目编译通过${NC}"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}❌ 项目编译失败${NC}"
    npm run build 2>&1 | grep -E "error TS" | head -5
    ((CHECKS_FAILED++))
fi

echo ""

# 总结
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   检查结果汇总${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ 通过: $CHECKS_PASSED${NC}"
echo -e "${RED}❌ 失败: $CHECKS_FAILED${NC}"
echo -e "${YELLOW}⚠️  警告: $WARNINGS${NC}"
echo ""

if [ $CHECKS_FAILED -gt 0 ]; then
    echo -e "${RED}════════════════════════════════════════${NC}"
    echo -e "${RED}   ❌ 检查失败！请修复错误后再提交${NC}"
    echo -e "${RED}════════════════════════════════════════${NC}"
    echo ""
    echo -e "${YELLOW}💡 快速修复:${NC}"
    echo -e "   ${GREEN}./scripts/fix.sh${NC}"
    echo ""
    exit 1
else
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo -e "${GREEN}   ✅ 检查通过！可以继续开发${NC}"
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo ""

    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}💡 注意: 有 ${WARNINGS} 个警告，建议查看${NC}"
    fi

    echo -e "${BLUE}📱 测试应用:${NC}"
    echo -e "   ${GREEN}curl -s http://localhost:3000/ | grep -q '<title>' && echo '服务器正常'${NC}"
    echo ""

    # 询问是否重启服务器
    echo -e "${YELLOW}💡 是否要重启开发服务器？${NC}"
    echo -e "   运行: ${GREEN}./scripts/fix.sh${NC}"
    echo ""

    exit 0
fi
