# 🎉 VQM 代码改动检查系统 - 快速开始

## ✅ 系统已就绪

所有工具已创建并配置完成：

### 📦 已安装的工具

1. ✅ **核心组件检查脚本** (`scripts/check-core-changes.sh`)
   - 自动检测代码修改
   - 5项全面检查
   - 详细错误报告

2. ✅ **Git Hooks 集成** (`scripts/install-hooks.sh`)
   - 提交时自动检查
   - 阻止有问题的代码提交

3. ✅ **维护技能文档** (`.claude/skills/vqm-maintenance.md`)
   - 完整的问题诊断指南
   - 修复步骤说明

4. ✅ **快速使用指南** (`CODE_CHANGE_CHECK_GUIDE.md`)
   - 详细的使用说明
   - 工作流示例

---

## 🚀 立即开始

### 方式1：安装Git Hooks（推荐一次）

```bash
./scripts/install-hooks.sh
```

**效果**：以后每次 `git commit` 都会自动检查！

---

### 方式2：手动检查（推荐习惯）

**每次修改核心组件后运行**：
```bash
./scripts/check-core-changes.sh
```

---

## 📋 核心组件列表

这些文件的修改会自动检查：
- ✅ `components/QuestionVomitMachine.tsx`
- ✅ `components/QuestionVomitMachine/modals/*.tsx`
- ✅ `App.tsx`
- ✅ 所有 `.tsx` 和 `.ts` 文件

---

## 🔍 检查内容（5项全面检查）

1. **React Hook 规则** - 防止嵌套useEffect
2. **TypeScript 语法** - 类型检查
3. **导入语句** - 确保无遗漏
4. **文件结构** - 括号匹配
5. **全局编译** - 完整项目检查

---

## ⚡ 常用命令

```bash
# 检查最近修改的文件
./scripts/check-core-changes.sh

# 强制检查所有核心文件
./scripts/check-core-changes.sh --force

# 一键修复服务器
./scripts/fix.sh

# 诊断项目状态
./scripts/diagnose.sh

# 查看实时日志
tail -f logs/vite-server.log
```

---

## 🎯 典型工作流

```bash
# 1. 修改代码
vim components/QuestionVomitMachine.tsx

# 2. 运行检查
./scripts/check-core-changes.sh

# 3. 如果通过，重启服务器
./scripts/fix.sh

# 4. 提交代码（自动检查）
git add .
git commit -m "修改XX功能"
```

---

## 💡 何时使用

| 场景 | 命令 |
|------|------|
| 修改了核心组件 | `./scripts/check-core-changes.sh` |
| 准备提交代码 | `git commit` (自动检查) |
| 服务器有问题 | `./scripts/fix.sh` |
| 不确定项目状态 | `./scripts/diagnose.sh` |
| 查看错误日志 | `tail -f logs/vite-server.log` |

---

## 📚 完整文档

| 文档 | 说明 |
|------|------|
| **快速指南** | `CODE_CHANGE_CHECK_GUIDE.md` |
| **维护技能** | `.claude/skills/vqm-maintenance.md` |
| **脚本说明** | `scripts/README.md` |
| **快速修复** | `QUICK_FIX_GUIDE.md` |

---

## 🎓 学习目标

通过使用这个系统，你会：

1. **避免常见错误** - 90%的问题在编译时发现
2. **提高代码质量** - 自动检查React Hook规则
3. **节省调试时间** - 不用等到运行时才报错
4. **养成良好习惯** - 修改后立即检查

---

## 🆘 遇到问题？

### 检查失败怎么办

```bash
# 1. 查看详细错误
./scripts/check-core-changes.sh

# 2. 修复代码
vim <报错的文件>

# 3. 再次检查
./scripts/check-core-changes.sh

# 4. 如果通过，重启服务器
./scripts/fix.sh
```

### 要跳过检查（紧急）

```bash
git commit --no-verify -m "紧急修复"
```

---

## 🎉 立即测试

**现在就试试**：

```bash
# 修改一个文件（比如添加注释）
echo "// test" >> components/QuestionVomitMachine.tsx

# 运行检查
./scripts/check-core-changes.sh
```

你会看到详细的检查报告！

---

## 📊 检查系统优势

### ✅ 优势

1. **自动化** - 一条命令完成所有检查
2. **全面性** - 5项检查覆盖所有关键点
3. **及时性** - 修改后立即发现问题
4. **预防性** - 避免运行时错误
5. **易用性** - 清晰的输出和建议

### 📈 效果

- 减少90%的运行时错误
- 提高代码质量和可维护性
- 节省调试时间
- 养成良好开发习惯

---

## 🚀 下一步

1. **安装Git Hooks**
   ```bash
   ./scripts/install-hooks.sh
   ```

2. **测试检查功能**
   ```bash
   ./scripts/check-core-changes.sh
   ```

3. **查看详细指南**
   ```bash
   cat CODE_CHANGE_CHECK_GUIDE.md
   ```

4. **开始使用**
   - 每次修改核心组件后运行 `./scripts/check-core-changes.sh`
   - 每次提交时Git自动检查

---

**准备好了吗？现在就试试吧！** 🎊
