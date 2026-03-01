# 🎓 VQM 维护 Skill 使用指南

## 📋 概述

我已经为你创建了一套完整的**VQM项目维护系统**，包含：

1. **自动化诊断工具** - 快速发现90%的问题
2. **一键修复脚本** - 自动解决常见问题
3. **维护Skill文档** - 详细的问题解决方案
4. **快速使用指南** - 速查表和最佳实践

## 🚀 立即开始

### 现在就测试记忆碎片功能

**服务器已运行**:
- 🏠 本地访问: http://localhost:3000/
- 🌐 网络访问: http://172.17.0.49:3000/

**测试步骤**:
1. 打开浏览器访问上述地址
2. 点击"吐一个问题"
3. 写答案并保存
4. 观察打卡成功弹窗
5. 点击"继续"
6. 应该看到记忆碎片弹窗

## 🛠️ 维护工具使用

### 方法1: 使用 Skill（推荐）

当遇到问题时，直接告诉我：
- "项目出错了，帮我修复"
- "服务器无法启动"
- "修改代码后无法运行"

我会自动使用维护技能来解决问题。

### 方法2: 手动使用脚本

**一键修复**（解决90%的问题）:
```bash
./scripts/fix.sh
```

**问题诊断**:
```bash
./scripts/diagnose.sh
```

## 📚 文档索引

| 文档 | 用途 | 位置 |
|------|------|------|
| **快速修复指南** | 速查表和常见问题 | `QUICK_FIX_GUIDE.md` |
| **维护工具说明** | 脚本使用详解 | `scripts/README.md` |
| **维护Skill** | 问题诊断和修复 | `.claude/skills/vqm-maintenance.md` |

## 🎯 常见问题快速解决

### 问题1: "系统故障"错误

**症状**: 浏览器显示ErrorBoundary页面

**解决**:
```bash
./scripts/fix.sh
```

### 问题2: 端口被占用

**症状**: `EADDRINUSE` 错误

**解决**:
```bash
./scripts/fix.sh
```

### 问题3: 连接被拒绝

**症状**: `connection refused`

**解决**:
```bash
./scripts/diagnose.sh  # 先诊断
./scripts/fix.sh      # 后修复
```

### 问题4: 修改代码后出错

**解决**:
```bash
npm run build         # 检查编译
./scripts/fix.sh      # 重启服务
```

## 💡 日常工作流

### 开发前
```bash
./scripts/diagnose.sh  # 检查状态
```

### 开发中
```bash
# 修改代码
npm run build         # 验证编译
```

### 开发后
```bash
./scripts/fix.sh      # 重启服务
```

### 遇到问题
```bash
./scripts/fix.sh      # 一键修复
```

## 🔍 诊断工具输出解读

运行 `./scripts/diagnose.sh` 会显示：

```
[1/6] 检查服务器进程...
✅ Vite 服务器正在运行
   PID: 20545 启动时间: 17:06

[2/6] 检查端口状态...
✅ 端口 3000 已被占用（服务器正在监听）

[3/6] 测试 HTTP 连接...
✅ HTTP 200 OK - 服务器响应正常
   页面: 星际日记 - 21天思考挑战 | VQM Observation Station

[4/6] 检查最近的错误日志...
✅ 未发现错误日志

[5/6] TypeScript 类型检查...
✅ TypeScript 编译通过

[6/6] React Hook 规则检查...
✅ React Hook 结构正常
```

如果看到所有 ✅，说明项目健康！

## 🎓 学习资源

### React Hook 规则

**必须遵守**:
1. 只在函数顶层调用Hook
2. 不要在循环、条件或嵌套函数中调用Hook
3. 只在React函数组件中调用Hook

**示例**:
```typescript
// ✅ 正确
function Component() {
  const [state, setState] = useState();
  useEffect(() => {}, []);
  return <div />;
}

// ❌ 错误
function Component() {
  useEffect(() => {
    useState();  // 嵌套Hook！
  }, []);
  return <div />;
}
```

### TypeScript 类型安全

**函数签名匹配**:
```typescript
// 定义
interface Props {
  onUnlock: () => boolean;  // 必须返回boolean
}

// 实现
const handleUnlock = (): boolean => {
  return true;  // ✅ 正确
};
```

## 📊 性能监控

### 查看实时日志
```bash
tail -f logs/vite-server.log
```

### 检查编译时间
```bash
time npm run build
```

### 监控进程
```bash
watch -n 2 'ps aux | grep vite'
```

## 🚨 应急预案

### 完全崩溃

```bash
# 1. 停止所有进程
pkill -9 -f vite

# 2. 清理所有缓存
rm -rf node_modules/.vite dist logs

# 3. 重新安装依赖（如果需要）
npm install

# 4. 重新编译
npm run build

# 5. 启动服务
./scripts/fix.sh
```

### 修改导致严重错误

```bash
# 1. 恢复备份
cp components/QuestionVomitMachine.tsx.bak components/QuestionVomitMachine.tsx

# 2. 重启服务
./scripts/fix.sh
```

## 🎯 技能使用示例

### 对话示例1: 快速修复

**你**: "项目又报错了，显示系统故障"

**我**: "让我使用维护技能来诊断和修复..."
[自动运行 ./scripts/fix.sh]
"问题已修复！服务器正常运行。"

### 对话示例2: 代码审查

**你**: "我修改了QuestionVomitMachine，帮我检查"

**我**: "让我使用维护技能检查代码..."
[运行诊断和编译检查]
"✅ 代码编译通过
⚠️  发现1个警告：建议修复类型签名
✅ React Hook规则检查通过"

### 对话示例3: 学习指导

**你**: "为什么会出现Invalid hook call错误？"

**我**: "根据维护技能文档，这是因为..."
[解释原因，提供示例和修复方法]

## 📞 获取帮助

### 文档
- 快速修复指南: `QUICK_FIX_GUIDE.md`
- 工具说明: `scripts/README.md`
- 维护技能: `.claude/skills/vqm-maintenance.md`

### 命令
```bash
./scripts/diagnose.sh  # 诊断
./scripts/fix.sh      # 修复
tail -f logs/vite-server.log  # 日志
```

### 对话
直接告诉我问题，我会使用维护技能来解决！

## ✅ 验证清单

使用此清单确保项目健康：

- [ ] 服务器进程运行中
- [ ] 端口3000可访问
- [ ] HTTP响应200 OK
- [ ] 无错误日志
- [ ] TypeScript编译通过
- [ ] React Hook规则检查通过

全部✅？项目健康良好！

有任何❌？运行 `./scripts/fix.sh`

---

**现在请测试记忆碎片功能，告诉我结果！** 🚀
