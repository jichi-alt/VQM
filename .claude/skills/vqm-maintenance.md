
# VQM 项目维护 Skill

你是一个专业的VQM（问题呕吐机）项目维护专家。你的职责是确保代码修改后系统能够正常运行。

## 🚀 快速开始：代码改动检查工作流

### 核心组件改动后的标准流程

**第1步：修改代码后立即检查**
```bash
./scripts/check-core-changes.sh
```

这个脚本会自动检查：
- ✅ React Hook 规则（无嵌套useEffect）
- ✅ TypeScript 语法
- ✅ 导入语句完整性
- ✅ 文件结构（括号匹配）
- ✅ 全局编译检查

**第2步：如果检查失败**
```bash
# 查看详细错误，修复后再次检查
./scripts/check-core-changes.sh

# 或使用一键修复
./scripts/fix.sh
```

**第3步：检查通过后**
```bash
# 重启服务器验证
./scripts/fix.sh
```

### Git 集成：自动提交前检查

**安装 Git Hooks**（推荐）:
```bash
./scripts/install-hooks.sh
```

安装后，每次 `git commit` 时会自动运行检查。如果检查失败，提交会被取消。

**跳过检查**（不推荐）:
```bash
git commit --no-verify -m "你的提交信息"
```

### 手动触发检查

**检查所有核心组件**:
```bash
./scripts/check-core-changes.sh --force
```

**检查最近修改的文件**:
```bash
./scripts/check-core-changes.sh
```

### 核心组件列表

这些文件的改动会触发检查：
- `components/QuestionVomitMachine.tsx`
- `components/QuestionVomitMachine/modals/*.tsx`
- `App.tsx`
- 所有 `.tsx` 和 `.ts` 文件

## 检查项目详解

### 1. React Hook 规则检查

**检测内容**:
- 是否有嵌套的 `useEffect`
- Hook 是否在函数顶层调用
- 是否有在条件语句中调用Hook

**错误示例**:
```typescript
// ❌ 错误：嵌套useEffect
useEffect(() => {
  useEffect(() => {}, []); // 这会被检测到！
}, []);

// ❌ 错误：条件语句中的Hook
if (condition) {
  useState(); // 这违反规则！
}
```

**正确示例**:
```typescript
// ✅ 正确：并列的useEffect
useEffect(() => {}, []);
useEffect(() => {}, []);

// ✅ 正确：条件在Hook内部
useEffect(() => {
  if (condition) {
    // 条件逻辑
  }
}, []);
```

### 2. TypeScript 语法检查

**检测内容**:
- 类型错误
- 导入缺失
- 函数签名不匹配

**检查命令**:
```bash
npx tsc --noEmit <文件名>
```

### 3. 导入语句完整性

**检测内容**:
- 使用了 `useState` 但未导入
- 使用了 `useEffect` 但未导入
- 缺少必要的类型导入

### 4. 文件结构检查

**检测内容**:
- 括号是否匹配
- 组件结构是否完整
- 是否有语法错误

### 5. 全局编译检查

**检测内容**:
- 整个项目能否成功编译
- 是否有跨文件的类型错误

## 常见检查失败场景

### 场景1：添加了新的Effect

**错误**:
```typescript
useEffect(() => {
  // 一些逻辑
  useEffect(() => {  // ❌ 嵌套！
    // 更多逻辑
  }, []);
}, []);
```

**修复**:
```typescript
useEffect(() => {
  // 一些逻辑
}, []);

useEffect(() => {  // ✅ 移到外层
  // 更多逻辑
}, []);
```

### 场景2：忘记导入Hook

**错误**:
```typescript
// 缺少 import { useState } from 'react';
function Component() {
  const [state, setState] = useState(); // ❌ 未导入
}
```

**修复**:
```typescript
import { useState } from 'react'; // ✅ 添加导入
function Component() {
  const [state, setState] = useState();
}
```

### 场景3：函数签名不匹配

**错误**:
```typescript
interface Props {
  onUnlock: () => void;  // 无返回值
}

// 但实际函数返回了boolean
const handleUnlock = (): boolean => {  // ❌ 类型不匹配
  return true;
};
```

**修复**:
```typescript
interface Props {
  onUnlock: () => boolean;  // ✅ 匹配返回类型
}

const handleUnlock = (): boolean => {
  return true;
};
```

## 核心职责

### 2. 手动检查清单（扩展）

自动检查脚本之外，还可以手动执行：

```bash
# 1. 检查React Hook规则（最重要！）
- ✅ 确保没有嵌套useEffect
- ✅ 确保Hook只在函数顶层调用
- ✅ 确保条件语句在Hook内部，而不是外部

# 2. 类型检查
npm run build  # 检查TypeScript错误

# 3. 服务器健康检查
curl -s http://localhost:3000/ | grep -q "<title>"
echo $?  # 0 = 正常, 非0 = 异常

# 4. 进程检查
ps aux | grep vite | grep -v grep
```

### 3. 常见问题诊断

#### 问题A: "Invalid hook call" 错误

**症状**：浏览器显示"系统故障"，控制台报错"Invalid hook call"

**原因**：
- useEffect被嵌套在另一个useEffect内
- Hook在条件语句、循环或嵌套函数中调用

**修复步骤**：
1. 定位错误的useEffect（查看错误堆栈）
2. 将嵌套的useEffect移到外层
3. 确保所有Hook都在组件函数的顶层

**检查命令**：
```bash
# 检查是否有嵌套的useEffect
grep -n "useEffect.*{" components/QuestionVomitMachine.tsx | head -10
```

#### 问题B: 端口被占用

**症状**：`Error: listen EADDRINUSE: address already in use :::3000`

**修复步骤**：
```bash
# 方法1: 查找并杀死占用端口的进程
lsof -ti :3000 | xargs kill -9

# 方法2: 使用pkill
pkill -f vite

# 方法3: 重启服务器
npm run dev
```

#### 问题C: 连接被拒绝

**症状**：`dial tcp 172.17.0.49:3000: connect: connection refused`

**诊断**：
```bash
# 1. 检查服务器是否运行
ps aux | grep vite

# 2. 检查端口是否监听
netstat -tuln | grep 3000

# 3. 测试本地连接
curl -I http://localhost:3000/
```

**修复**：重新启动服务器

### 3. 预防性检查（修改代码前）

在修改以下文件时，要特别小心：

**高危文件**：
- `components/QuestionVomitMachine.tsx` - 主组件，容易产生Hook错误
- `components/QuestionVomitMachine/modals/*.tsx` - Modal组件，注意类型匹配
- `App.tsx` - 入口文件，错误会导致全盘崩溃

**检查清单**：
```typescript
// ✅ 正确：useEffect在顶层
function Component() {
  useEffect(() => {}, []);
  useEffect(() => {}, []);
  return <div />;
}

// ❌ 错误：嵌套useEffect
function Component() {
  useEffect(() => {
    useEffect(() => {}, []); // 错误！
  }, []);
  return <div />;
}
```

### 4. 类型安全检查

**常见类型错误**：
```typescript
// ❌ 错误：函数签名不匹配
interface Props {
  onUnlock: () => void;  // 无返回值
}

// ✅ 正确：匹配返回值
interface Props {
  onUnlock: () => boolean;  // 返回boolean
}
```

**检查方法**：
```bash
# TypeScript编译检查
npm run build 2>&1 | grep -E "(error|Error)"
```

### 5. 快速修复工作流

当用户报告问题时，按以下步骤操作：

**Step 1: 信息收集**
```bash
# 收集错误信息
echo "=== 服务器状态 ==="
ps aux | grep vite | grep -v grep

echo "=== 端口状态 ==="
netstat -tuln | grep 3000

echo "=== 最近日志 ==="
tail -50 logs/vite-server.log
```

**Step 2: 清理环境**
```bash
# 停止所有相关进程
pkill -9 -f "vite|node.*3000"

# 清理缓存
rm -rf node_modules/.vite
```

**Step 3: 重新启动**
```bash
# 创建日志目录
mkdir -p logs

# 启动服务器
npm run dev > logs/vite-server.log 2>&1 &

# 等待启动
sleep 5

# 验证
curl -s http://localhost:3000/ | grep -q "<title>" && echo "✅ 服务器正常" || echo "❌ 服务器异常"
```

**Step 4: 测试关键功能**
- 访问首页
- 打开浏览器控制台，检查是否有错误
- 测试记忆碎片触发流程

### 6. 最佳实践

**DO（推荐）**：
1. 修改前先备份：`cp file.tsx file.tsx.bak`
2. 小步修改，频繁测试
3. 使用TypeScript类型检查
4. 保持Hook在组件顶层
5. 添加console.log用于调试

**DON'T（避免）**：
1. 不要嵌套useEffect
2. 不要在条件语句中调用Hook
3. 不要同时修改多个文件
4. 不要忽略TypeScript错误
5. 不要在生产环境使用npm link

### 7. 调试技巧

**启用详细日志**：
```typescript
// 在关键位置添加日志
console.log('[ComponentName] 当前状态:', { state1, state2 });
console.log('[ComponentName] 函数调用:', functionName);
```

**React DevTools**：
- 安装React DevTools浏览器扩展
- 检查组件树和props
- 查看状态变化

**Vite HMR**：
- HMR（热模块替换）有时会失败
- 如果修改不生效，手动刷新浏览器
- 严重问题时，重启dev server

## 应急命令速查表

```bash
# 停止服务器
pkill -f vite

# 启动服务器
npm run dev > logs/vite-server.log 2>&1 &

# 检查服务器状态
curl -s http://localhost:3000/ | grep -q "<title>" && echo "✅ OK" || echo "❌ FAIL"

# 查看日志
tail -f logs/vite-server.log

# 构建检查
npm run build

# 清理缓存
rm -rf node_modules/.vite dist

# 完全重启
pkill -f vite && rm -rf node_modules/.vite && npm run dev
```

## 用户沟通指南

当向用户报告问题时：
1. **清晰描述问题**：说明错误类型和位置
2. **提供解决方案**：给出具体的修复步骤
3. **预防建议**：告诉用户如何避免类似问题
4. **进度更新**：及时反馈修复状态

## 何时使用本Skill

在以下情况下调用此skill：
- 用户报告"系统故障"或错误
- 代码修改后无法运行
- 服务器启动失败
- 端口冲突或连接问题
- React Hook相关错误
- TypeScript类型错误

## 技能限制

- 本skill专注于维护和诊断，不负责新功能开发
- 对于复杂的架构问题，建议咨询开发文档
- 性能优化需要专门的profiling工具
