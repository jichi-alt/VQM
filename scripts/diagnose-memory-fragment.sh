#!/bin/bash

# 记忆碎片功能诊断脚本

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   记忆碎片功能诊断工具${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# 1. 检查记忆碎片数据
echo -e "${YELLOW}[1/6] 检查记忆碎片数据...${NC}"
if grep -q "export const MEMORY_FRAGMENTS" src/services/memoryFragments.ts; then
    FRAGMENT_COUNT=$(grep -c "id:" src/services/memoryFragments.ts || echo "0")
    echo -e "${GREEN}   ✅ 找到 ${FRAGMENT_COUNT} 个记忆碎片${NC}"
else
    echo -e "${RED}   ❌ 未找到记忆碎片数据${NC}"
fi
echo ""

# 2. 检查核心函数
echo -e "${YELLOW}[2/6] 检查核心函数...${NC}"

# 检查 tryTriggerMemoryFragment
if grep -q "const tryTriggerMemoryFragment" components/QuestionVomitMachine.tsx; then
    echo -e "${GREEN}   ✅ tryTriggerMemoryFragment 函数存在${NC}"
else
    echo -e "${RED}   ❌ tryTriggerMemoryFragment 函数缺失${NC}"
fi

# 检查 handleUnlockMemory
if grep -q "const handleUnlockMemory" components/QuestionVomitMachine.tsx; then
    echo -e "${GREEN}   ✅ handleUnlockMemory 函数存在${NC}"
else
    echo -e "${RED}   ❌ handleUnlockMemory 函数缺失${NC}"
fi
echo ""

# 3. 检查 Modal 组件
echo -e "${YELLOW}[3/6] 检查 Modal 组件...${NC}"

MODALS=(
    "components/QuestionVomitMachine/modals/CheckInSuccessModal.tsx"
    "components/QuestionVomitMachine/modals/UnlockMemoryModal.tsx"
    "components/QuestionVomitMachine/modals/MemoryFragmentModal.tsx"
)

for modal in "${MODALS[@]}"; do
    if [ -f "$modal" ]; then
        echo -e "${GREEN}   ✅ $(basename $modal)${NC}"
    else
        echo -e "${RED}   ❌ $(basename $modal) 缺失${NC}"
    fi
done
echo ""

# 4. 检查状态变量
echo -e "${YELLOW}[4/6] 检查状态变量定义...${NC}"

VARIABLES=(
    "showCheckInModal"
    "showUnlockModal"
    "showMemoryModal"
    "currentMemoryFragment"
    "viewedFragmentIds"
)

for var in "${VARIABLES[@]}"; do
    if grep -q "useState.*$var\|const \[$var" components/QuestionVomitMachine.tsx; then
        echo -e "${GREEN}   ✅ $var${NC}"
    else
        echo -e "${RED}   ❌ $var 未定义${NC}"
    fi
done
echo ""

# 5. 检查函数调用链
echo -e "${YELLOW}[5/6] 检查函数调用链...${NC}"

# 检查 CheckInSuccessModal 是否调用 onUnlock
if grep -q "onUnlock()" components/QuestionVomitMachine/modals/CheckInSuccessModal.tsx; then
    echo -e "${GREEN}   ✅ CheckInSuccessModal 调用 onUnlock()${NC}"
else
    echo -e "${RED}   ❌ CheckInSuccessModal 未调用 onUnlock()${NC}"
fi

# 检查是否传入 onUnlock 属性
if grep -q "onUnlock={tryTriggerMemoryFragment}" components/QuestionVomitMachine.tsx; then
    echo -e "${GREEN}   ✅ CheckInSuccessModal 传入了 onUnlock${NC}"
else
    echo -e "${RED}   ❌ CheckInSuccessModal 未传入 onUnlock${NC}"
fi
echo ""

# 6. 检查关键代码片段
echo -e "${YELLOW}[6/6] 检查关键代码片段...${NC}"

# 检查 setShowUnlockModal 调用
if grep -q "setShowUnlockModal(true)" components/QuestionVomitMachine.tsx; then
    echo -e "${GREEN}   ✅ setShowUnlockModal(true) 存在${NC}"
    # 显示位置
    grep -n "setShowUnlockModal(true)" components/QuestionVomitMachine.tsx | head -3
else
    echo -e "${RED}   ❌ setShowUnlockModal(true) 未找到${NC}"
fi
echo ""

# 总结
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   诊断完成${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}💡 下一步:${NC}"
echo ""
echo -e "${BLUE}1. 打开浏览器控制台 (F12)${NC}"
echo -e "${BLUE}2. 吐一个问题并保存答案${NC}"
echo -e "${BLUE}3. 点击\"继续\"按钮${NC}"
echo -e "${BLUE}4. 查看控制台输出${NC}"
echo ""
echo -e "${YELLOW}应该看到的关键日志:${NC}"
echo -e "   🧩 尝试触发记忆碎片"
echo -e "   ✨ 触发XX碎片"
echo -e "   [tryTriggerMemoryFragment] 设置 showUnlockModal = true"
echo -e "   [UnlockMemoryModal] 渲染，isOpen: true"
echo ""
echo -e "${YELLOW}如果看不到这些日志，请把控制台输出发给我！${NC}"
echo ""
