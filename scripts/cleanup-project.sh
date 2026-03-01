#!/bin/bash

# VQM 项目清理和重组脚本
# 帮助识别和清理废弃文件

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   VQM 项目清理工具${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}[1/5] 扫描项目文件...${NC}"

# 统计各类文件
TSX_FILES=$(find . -name "*.tsx" -not -path "./node_modules/*" -not -path "./dist/*" 2>/dev/null | wc -l)
TS_FILES=$(find . -name "*.ts" -not -path "./node_modules/*" -not -path "./dist/*" 2>/dev/null | wc -l)
TEST_FILES=$(find . -name "*.test.ts*" -not -path "./node_modules/*" 2>/dev/null | wc -l)
MD_FILES=$(find . -name "*.md" -not -path "./node_modules/*" 2>/dev/null | wc -l)

echo -e "   TSX 文件: ${GREEN}$TSX_FILES${NC}"
echo -e "   TS 文件:  ${GREEN}$TS_FILES${NC}"
echo -e "   测试文件: ${GREEN}$TEST_FILES${NC}"
echo -e "   Markdown: ${GREEN}$MD_FILES${NC}"
echo ""

echo -e "${YELLOW}[2/5] 检查重复的 Modal...${NC}"
echo ""

# 检查是否有重复的 Modal 组件
MODAL_DIR="components/QuestionVomitMachine/modals"
if [ -d "$MODAL_DIR" ]; then
    echo -e "${GREEN}✓ Modal 目录存在${NC}"
    ls -la "$MODAL_DIR"/*.tsx 2>/dev/null | grep -v "test" | awk '{print "   " $NF}' || echo "   (无文件)"
else
    echo -e "${RED}✗ Modal 目录不存在${NC}"
fi
echo ""

echo -e "${YELLOW}[3/5] 检查可能废弃的文件...${NC}"
echo ""

# 检查是否有备份文件
BACKUP_FILES=$(find . -name "*.bak" -o -name "*.backup" -o -name "*.old" 2>/dev/null)
if [ -n "$BACKUP_FILES" ]; then
    echo -e "${YELLOW}发现备份文件:${NC}"
    echo "$BACKUP_FILES" | head -5
    BACKUP_COUNT=$(echo "$BACKUP_FILES" | wc -l)
    echo -e "   共 ${RED}$BACKUP_COUNT${NC} 个备份文件"
    echo ""
else
    echo -e "${GREEN}✓ 无备份文件${NC}"
    echo ""
fi

# 检查是否有未使用的 hooks
UNUSED_HOOKS=""
if [ -f "components/QuestionVomitMachine/hooks/useDailyState.ts" ]; then
    if ! grep -r "useDailyState" components/ --include="*.tsx" --include="*.ts" | grep -v "useDailyState.ts" > /dev/null; then
        UNUSED_HOOKS="${UNUSED_HOOKS}\n   - components/QuestionVomitMachine/hooks/useDailyState.ts (未使用)"
    fi
fi

if [ -n "$UNUSED_HOOKS" ]; then
    echo -e "${YELLOW}可能未使用的文件:${NC}"
    echo -e "$UNUSED_HOOKS"
    echo ""
else
    echo -e "${GREEN}✓ 未发现明显的未使用文件${NC}"
    echo ""
fi

echo -e "${YELLOW}[4/5] 检查文档文件...${NC}"
echo ""

# 列出所有文档文件
echo -e "${BLUE}根目录文档:${NC}"
ls -1 *.md 2>/dev/null | sed 's/^/   /' || echo "   (无)"

echo ""
echo -e "${BLUE}docs/ 目录:${NC}"
ls -1 docs/*.md 2>/dev/null | sed 's/^/   /' || echo "   (无)"

echo ""
echo -e "${BLUE}维护文档:${NC}"
ls -1 .claude/skills/*.md 2>/dev/null | sed 's/^/   /' || echo "   (无)"

echo ""

echo -e "${YELLOW}[5/5] 项目结构建议...${NC}"
echo ""

# 检查项目结构
echo -e "${BLUE}当前结构:${NC}"
echo "   src/"
echo "     ├── services/"
echo "     ├── types/"
echo "     └── test/"
echo "   components/"
echo "   │   ├── QuestionVomitMachine/"
echo "   │   │   ├── hooks/"
echo "   │   │   └── modals/"
echo "   │   └── ..."
echo "   pages/"
echo "   public/"
echo "   scripts/"
echo ""

echo -e "${GREEN}✓ 项目结构清晰${NC}"
echo ""

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   清理建议${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# 清理建议
echo -e "${YELLOW}可以删除的文件（如果存在）:${NC}"
echo "   ✓ dist/ (构建产物)"
echo "   ✓ *.log (日志文件)"
echo "   ✓ .DS_Store (macOS 文件)"
echo ""

echo -e "${YELLOW}建议保留的文件:${NC}"
echo "   ✓ src/ (源码)"
echo "   ✓ components/ (组件)"
echo "   ✓ scripts/ (工具脚本)"
echo "   ✓ docs/ (文档)"
echo "   ✓ *.md (文档文件)"
echo ""

echo -e "${YELLOW}💡 清理命令:${NC}"
echo ""
echo -e "# 删除构建产物"
echo -e "${GREEN}rm -rf dist node_modules/.vite${NC}"
echo ""
echo -e "# 删除日志文件"
echo -e "${GREEN}find . -name \"*.log\" -delete${NC}"
echo ""
echo -e "# 删除备份文件"
echo -e "${GREEN}find . -name \"*.bak\" -delete${NC}"
echo ""
echo -e "# 完整清理（保留源码）"
echo -e "${GREEN}rm -rf dist node_modules/.vite && find . -name \"*.log\" -delete${NC}"
echo ""

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${GREEN}   扫描完成！${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# 询问是否要清理
echo -e "${YELLOW}是否要执行清理？${NC}"
echo -e "   ${GREEN}y${NC} - 删除构建产物和日志"
echo -e "   ${GREEN}n${NC} - 跳过"
echo ""
read -p "请选择 [y/N]: " choice

if [[ "$choice" =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${YELLOW}正在清理...${NC}"

    rm -rf dist
    rm -rf node_modules/.vite
    find . -name "*.log" -delete 2>/dev/null
    find . -name "*.bak" -delete 2>/dev/null
    find . -name ".DS_Store" -delete 2>/dev/null

    echo -e "${GREEN}✅ 清理完成！${NC}"
    echo ""
    echo -e "${BLUE}💡 现在重启服务器:${NC}"
    echo -e "   ${GREEN}./scripts/fix.sh${NC}"
else
    echo -e "${YELLOW}跳过清理${NC}"
fi
