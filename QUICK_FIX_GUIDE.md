# 🚀 VQM 项目快速修复指南

## ⚡ 一键修复（解决90%的问题）

```bash
./scripts/fix.sh
```

**这个命令会自动完成**：
- ✅ 停止所有冲突进程
- ✅ 清理缓存
- ✅ 验证代码编译
- ✅ 重启服务器
- ✅ 验证服务状态

## 🔍 问题诊断

不知道问题在哪？运行诊断：

```bash
./scripts/diagnose.sh
```

## 📋 常见问题速查表

| 问题症状 | 快速解决 | 查看详情 |
|---------|---------|---------|
| 浏览器显示"系统故障" | `./scripts/fix.sh` | [查看原因](#原因分析) |
| 端口被占用 | `./scripts/fix.sh` | [手动修复](#手动修复端口) |
| 连接被拒绝 | `./scripts/fix.sh` | [检查服务](#检查服务状态) |
| 修改代码后无法运行 | `npm run build` | [编译检查](#编译检查) |

## 🔧 手动修复步骤

### 原因分析

**问题**: "Invalid hook call" 错误
**原因**: useEffect被嵌套在另一个useEffect内
**位置**: `components/QuestionVomitMachine.tsx`

**错误示例**:
```typescript
// ❌ 错误
useEffect(() => {
  useEffect(() => {}, []);  // 嵌套！
}, []);
```

**正确示例**:
```typescript
// ✅ 正确
useEffect(() => {}, []);
useEffect(() => {}, []);  // 并列，不嵌套
```

### 手动修复端口

```bash
# 查找占用进程
lsof -i :3000

# 杀死进程
kill -9 <PID>

# 重启
npm run dev
```

### 检查服务状态

```bash
# 检查进程
ps aux | grep vite

# 检查端口
netstat -tuln | grep 3000

# 测试HTTP
curl -I http://localhost:3000/
```

### 编译检查

```bash
# 完整编译
npm run build

# 查看错误
npm run build 2>&1 | grep error
```

## 📊 监控命令

```bash
# 实时查看日志
tail -f logs/vite-server.log

# 检查最近100行日志
tail -100 logs/vite-server.log

# 查找错误日志
grep -i error logs/vite-server.log
```

## 🛡️ 预防措施

### 代码修改前

```bash
# 1. 备份
cp components/QuestionVomitMachine.tsx components/QuestionVomitMachine.tsx.bak

# 2. 诊断
./scripts/diagnose.sh
```

### 修改时注意

1. **React Hook规则**
   - 只在函数顶层调用Hook
   - 不要嵌套useEffect
   - 不要在条件语句中调用Hook

2. **类型匹配**
   - 确保函数签名正确
   - 返回值类型要匹配

3. **小步修改**
   - 一次只改一个功能
   - 改完立即测试

### 修改后验证

```bash
# 1. 编译检查
npm run build

# 2. 如果通过，重启
./scripts/fix.sh

# 3. 打开浏览器测试
# 访问 http://localhost:3000/
# 打开F12控制台检查错误
```

## 🎯 最佳实践

### ✅ DO (推荐)

```bash
# 每次修改后运行
./scripts/diagnose.sh

# 出问题时运行
./scripts/fix.sh

# 定期查看日志
tail -f logs/vite-server.log
```

### ❌ DON'T (避免)

```bash
# 不要同时修改多个文件
# 不要忽略TypeScript错误
# 不要在条件语句中使用Hook
# 不要嵌套useEffect
# 不要跳过编译检查
```

## 📚 详细文档

- [维护工具说明](scripts/README.md)
- [维护技能文档](.claude/skills/vqm-maintenance.md)
- [项目计划](docs/PLAN.md)

## 🆘 快速命令参考

```bash
# 一键修复
./scripts/fix.sh

# 诊断检查
./scripts/diagnose.sh

# 停止服务
pkill -f vite

# 启动服务
npm run dev > logs/vite-server.log 2>&1 &

# 查看日志
tail -f logs/vite-server.log

# 编译检查
npm run build

# 完全重启
pkill -f vite && rm -rf node_modules/.vite && ./scripts/fix.sh
```

## 💡 技巧

1. **使用别名**: 在 `~/.bashrc` 或 `~/.zshrc` 中添加
   ```bash
   alias vqm-fix='./scripts/fix.sh'
   alias vqm-check='./scripts/diagnose.sh'
   alias vqm-log='tail -f logs/vite-server.log'
   ```

2. **创建快捷键**: 在IDE中配置快捷键运行脚本

3. **保存日志**: 定期备份 `logs/` 目录

## 🎉 成功标志

运行 `./scripts/fix.sh` 后，你应该看到：

```
✅ 进程已清理
✅ 缓存已清理
✅ 代码编译通过
✅ 服务器已启动
✅ HTTP 响应正常
✅ 修复完成！

📱 访问地址:
   本地: http://localhost:3000/
   网络: http://172.17.0.49:3000/
```

## 🔗 相关链接

- 项目根目录: `/workspace`
- 服务器日志: `logs/vite-server.log`
- 诊断脚本: `scripts/diagnose.sh`
- 修复脚本: `scripts/fix.sh`
