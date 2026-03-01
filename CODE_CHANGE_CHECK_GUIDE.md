# 🔄 核心组件改动检查指南

## 🎯 概述

我已经为你创建了一个**自动化的代码改动检查系统**，每次修改核心组件后都能快速发现问题，避免运行时错误。

---

## 🚀 三种使用方式

### 方式1：自动检查（Git集成）⭐推荐

**安装一次**：
```bash
./scripts/install-hooks.sh
```

**每次提交时自动运行**：
```bash
git add .
git commit -m "修改了XX功能"
# ✅ 自动检查，如果有问题会阻止提交
```

**跳过检查**（紧急情况）：
```bash
git commit --no-verify -m "紧急修复"
```

---

### 方式2：手动检查（推荐习惯）

**每次修改核心组件后运行**：
```bash
./scripts/check-core-changes.sh
```

**输出示例**：
```
════════════════════════════════════════
   VQM 核心组件改动检查
════════════════════════════════════════

检查最近修改的文件...
   ✓ components/QuestionVomitMachine.tsx (2分钟前)

发现 1 个文件被修改，开始检查...

════════════════════════════════════════
检查: components/QuestionVomitMachine.tsx
════════════════════════════════════════

[1/5] React Hook 规则检查...
   ✅ 无嵌套 Hook
[2/5] TypeScript 语法检查...
   ✅ TypeScript 语法正确
[3/5] 导入语句检查...
   ✅ 导入语句完整
[4/5] 开发日志检查...
   ✅ 日志数量合理 (5个)
[5/5] 文件结构检查...
   ✅ 文件结构完整

════════════════════════════════════════
全局 TypeScript 编译检查
════════════════════════════════════════
编译检查中...
✅ 项目编译通过

════════════════════════════════════════
   检查结果汇总
════════════════════════════════════════
✅ 通过: 6
❌ 失败: 0
⚠️  警告: 0

════════════════════════════════════════
   ✅ 检查通过！可以继续开发
════════════════════════════════════════

💡 是否要重启开发服务器？
   运行: ./scripts/fix.sh
```

---

### 方式3：强制检查所有文件

```bash
./scripts/check-core-changes.sh --force
```

---

## 📋 检查内容详解

### 1. React Hook 规则检查

**为什么重要**：违反Hook规则会导致"Invalid hook call"错误

**检查项目**：
- ✅ 无嵌套的 `useEffect`
- ✅ Hook只在顶层调用
- ✅ 不在条件语句中调用Hook

**错误会被检测到**：
```typescript
// ❌ 这会被检测到
useEffect(() => {
  useEffect(() => {}, []);  // 嵌套！
}, []);
```

---

### 2. TypeScript 语法检查

**检查项目**：
- ✅ 类型正确
- ✅ 无语法错误
- ✅ 函数签名匹配

**示例**：
```typescript
// ❌ 会被检测到
interface Props {
  onUnlock: () => void;  // 声明无返回值
}

const handleUnlock = (): boolean => {  // 但实际返回boolean
  return true;
};
```

---

### 3. 导入语句完整性

**检查项目**：
- ✅ `useState` 使用前已导入
- ✅ `useEffect` 使用前已导入
- ✅ 所有必要的类型已导入

---

### 4. 开发日志检查

**检查项目**：
- ✅ console.log 数量合理（<10个）
- ⚠️ 超过10个会警告，建议清理

---

### 5. 文件结构检查

**检查项目**：
- ✅ 括号匹配
- ✅ 组件结构完整
- ✅ 无语法错误

---

### 6. 全局编译检查

**检查项目**：
- ✅ 整个项目编译通过
- ✅ 无跨文件类型错误

---

## 🎓 日常工作流示例

### 场景1：修改记忆碎片功能

```bash
# 1. 修改代码
vim components/QuestionVomitMachine/modals/MemoryFragmentModal.tsx

# 2. 运行检查
./scripts/check-core-changes.sh

# 3. 如果通过，重启服务器
./scripts/fix.sh

# 4. 测试功能
# 打开浏览器 http://localhost:3000/

# 5. 提交代码
git add .
git commit -m "修复记忆碎片弹窗问题"
# ✅ 自动检查通过
```

---

### 场景2：检查失败怎么办

```bash
# 1. 运行检查
./scripts/check-core-changes.sh

# 2. 看到错误
❌ TypeScript 语法错误
   Line 42: Type 'string' is not assignable to type 'number'

# 3. 修复代码
vim components/QuestionVomitMachine.tsx
# 修复第42行

# 4. 再次检查
./scripts/check-core-changes.sh
# ✅ 现在通过了

# 5. 重启服务器
./scripts/fix.sh
```

---

### 场景3：批量修改多个文件

```bash
# 1. 修改了多个文件
vim components/QuestionVomitMachine.tsx
vim components/QuestionVomitMachine/modals/*.tsx

# 2. 运行检查（自动检测所有修改的文件）
./scripts/check-core-changes.sh

# 3. 查看结果
# 会逐个检查每个修改的文件

# 4. 如果全部通过，提交
git add .
git commit -m "重构Modal组件"
# ✅ Git hook也会再检查一次
```

---

## ⚡ 快速命令参考

```bash
# 检查最近修改的文件
./scripts/check-core-changes.sh

# 强制检查所有核心文件
./scripts/check-core-changes.sh --force

# 一键修复服务器
./scripts/fix.sh

# 诊断项目状态
./scripts/diagnose.sh

# 安装Git hooks（只需一次）
./scripts/install-hooks.sh
```

---

## 🔍 核心组件列表

这些文件的修改会触发检查：

**主要组件**：
- `components/QuestionVomitMachine.tsx`
- `components/QuestionVomitMachine/modals/CheckInSuccessModal.tsx`
- `components/QuestionVomitMachine/modals/MemoryFragmentModal.tsx`
- `components/QuestionVomitMachine/modals/UnlockMemoryModal.tsx`
- `App.tsx`

**自动检测**：
- 最近5分钟内修改的文件
- 所有 `.tsx` 和 `.ts` 文件

---

## 💡 最佳实践

### ✅ 推荐做法

1. **修改前备份**
   ```bash
   cp file.tsx file.tsx.bak
   ```

2. **小步修改**
   ```bash
   # 修改一个文件
   vim file.tsx

   # 立即检查
   ./scripts/check-core-changes.sh

   # 通过后再继续
   ```

3. **提交前检查**
   ```bash
   git add .
   git commit -m "功能描述"
   # ✅ Git hook自动检查
   ```

4. **定期运行诊断**
   ```bash
   ./scripts/diagnose.sh
   ```

### ❌ 避免做法

1. **不要跳过检查**
   ```bash
   # 避免
   git commit --no-verify -m "跳过检查"
   ```

2. **不要批量修改不检查**
   ```bash
   # 避免
   vim *.tsx  # 修改多个文件
   git commit -m "批量修改"  # 不检查就提交
   ```

3. **不要忽略警告**
   ```bash
   # 看到⚠️警告要重视
   # 不要继续开发，先修复
   ```

---

## 🎯 学习目标

通过使用这个检查系统，你会：

1. **了解React Hook规则**
   - 每次检查都会验证Hook使用
   - 错误会被立即发现

2. **养成良好习惯**
   - 修改后立即检查
   - 提交前自动验证

3. **提高代码质量**
   - 减少运行时错误
   - 避免类型错误

4. **节省调试时间**
   - 问题在编译时发现
   - 不用等到运行时才报错

---

## 📞 获取帮助

### 查看详细文档
```bash
cat SKILL_USAGE_GUIDE.md
cat scripts/README.md
cat .claude/skills/vqm-maintenance.md
```

### 手动运行各项检查
```bash
# TypeScript编译
npm run build

# React Hook检查（手动）
grep -n "useEffect" components/QuestionVomitMachine.tsx

# 服务器状态
./scripts/diagnose.sh
```

### 让AI帮忙
直接告诉我：
- "检查我的代码修改"
- "修复这个错误"
- "为什么会检查失败"

---

## 🎉 开始使用

**立即体验**：

```bash
# 1. 安装Git hooks（只需一次）
./scripts/install-hooks.sh

# 2. 修改一个核心组件
vim components/QuestionVomitMachine.tsx

# 3. 运行检查
./scripts/check-core-changes.sh

# 4. 如果通过，提交代码
git add .
git commit -m "我的修改"
# ✅ 自动检查！
```

---

**祝你编码愉快！** 🚀
