# VQM 维护工具集

快速诊断和修复VQM项目的常见问题。

## 🚀 快速开始

### 一键修复（推荐）

当项目出现任何问题时，首先运行：

```bash
./scripts/fix.sh
```

这个脚本会自动：
1. 停止所有Vite进程
2. 清理缓存
3. 验证代码编译
4. 重新启动服务器
5. 验证服务状态

### 诊断检查

如果你想了解项目当前状态：

```bash
./scripts/diagnose.sh
```

输出包括：
- 服务器进程状态
- 端口占用情况
- HTTP连接测试
- 日志错误检查
- TypeScript类型检查
- React Hook规则检查

## 📋 常见问题修复

### 问题1: "Invalid hook call" 错误

**症状**: 浏览器显示"系统故障"

**原因**: useEffect嵌套错误

**快速修复**:
```bash
# 1. 诊断问题
./scripts/diagnose.sh

# 2. 手动检查代码
grep -n "useEffect" components/QuestionVomitMachine.tsx

# 3. 一键修复
./scripts/fix.sh
```

### 问题2: 端口被占用

**症状**: `Error: listen EADDRINUSE: address already in use :::3000`

**修复**:
```bash
# 使用修复脚本
./scripts/fix.sh

# 或者手动修复
pkill -f vite
npm run dev
```

### 问题3: 连接被拒绝

**症状**: `dial tcp 172.17.0.49:3000: connect: connection refused`

**修复**:
```bash
# 1. 检查服务器状态
./scripts/diagnose.sh

# 2. 重启服务器
./scripts/fix.sh
```

### 问题4: 修改代码后无法运行

**修复**:
```bash
# 1. 编译检查
npm run build

# 2. 如果编译失败，检查错误信息
npm run build 2>&1 | grep error

# 3. 修复后重启
./scripts/fix.sh
```

## 🛠️ 维护最佳实践

### 代码修改前

```bash
# 1. 备份文件
cp components/QuestionVomitMachine.tsx components/QuestionVomitMachine.tsx.bak

# 2. 运行诊断
./scripts/diagnose.sh
```

### 代码修改时

**遵循React Hook规则**:
```typescript
// ✅ 正确
function Component() {
  useEffect(() => {}, []);
  return <div />;
}

// ❌ 错误
function Component() {
  useEffect(() => {
    useEffect(() => {}, []); // 嵌套Hook！
  }, []);
  return <div />;
}
```

**类型匹配**:
```typescript
// 确保函数签名匹配
interface Props {
  onUnlock: () => boolean;  // 必须返回boolean
}
```

### 代码修改后

```bash
# 1. 编译检查
npm run build

# 2. 如果成功，重启服务器
./scripts/fix.sh

# 3. 验证功能
# 打开浏览器访问 http://localhost:3000/
# 打开控制台检查错误
```

## 📊 监控命令

### 查看服务器日志
```bash
tail -f logs/vite-server.log
```

### 检查进程状态
```bash
ps aux | grep vite
```

### 检查端口占用
```bash
lsof -i :3000
```

### 测试HTTP连接
```bash
curl -I http://localhost:3000/
```

## 🔧 高级调试

### 启用详细日志

在代码中添加console.log:
```typescript
console.log('[ComponentName] 函数调用:', { state1, state2 });
```

### React DevTools

1. 安装React DevTools浏览器扩展
2. 打开浏览器开发者工具
3. 查看组件树和Props

### TypeScript类型检查

```bash
# 严格模式检查
npx tsc --noEmit --strict
```

## 📁 文件结构

```
workspace/
├── .claude/
│   └── skills/
│       └── vqm-maintenance.md    # 维护技能文档
├── scripts/
│   ├── diagnose.sh                # 诊断脚本
│   ├── fix.sh                     # 修复脚本
│   └── README.md                  # 本文档
└── logs/
    ├── vite-server.log            # 服务器日志
    └── vite-pid.txt               # 进程ID
```

## 🆘 获取帮助

如果自动化工具无法解决问题：

1. **查看日志**: `cat logs/vite-server.log`
2. **运行诊断**: `./scripts/diagnose.sh`
3. **检查控制台**: 打开浏览器F12查看错误
4. **咨询Claude**: 描述问题并提供错误信息

## ⚡ 快速参考

```bash
# 修复所有问题
./scripts/fix.sh

# 检查状态
./scripts/diagnose.sh

# 停止服务器
pkill -f vite

# 启动服务器
npm run dev > logs/vite-server.log 2>&1 &

# 查看日志
tail -f logs/vite-server.log

# 编译检查
npm run build
```

## 💡 预防措施

1. **小步修改**: 每次只修改一个功能点
2. **频繁测试**: 修改后立即测试
3. **使用TypeScript**: 利用类型检查避免错误
4. **查看日志**: 修改后查看编译输出
5. **备份代码**: 修改前备份关键文件

## 📞 联系

如果遇到问题，可以：
- 查看技能文档: `.claude/skills/vqm-maintenance.md`
- 运行诊断: `./scripts/diagnose.sh`
- 一键修复: `./scripts/fix.sh`
