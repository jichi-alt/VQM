# Vercel 部署问题诊断指南

## 问题症状

- **Vercel 构建日志显示**: `✓ 2个模块已转换`
- **本地构建显示**: `✓ 1766 modules transformed`
- **浏览器控制台**: 仍然显示 `cdn.tailwindcss.com should not be used in production`
- **页面状态**: 空白页面

这说明 Vercel 正在部署旧代码，而不是最新的提交。

---

## 根本原因分析

### 1. Git 远程仓库
```
origin: https://cnb.cool/wxy.star/VQM.git
```

**问题**: 您使用的是自定义 Git 主机 (`cnb.cool`)，而不是 GitHub。

Vercel 的自动部署通常直接与 GitHub/GitLab/Bitbucket 集成。如果使用自定义 Git 主机，Vercel 可能无法正确获取最新提交。

---

## 解决方案

### 方案 A: 重新配置 Vercel 项目（推荐）

#### 步骤 1: 检查 Vercel 项目设置

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 找到您的项目（应该叫 `vqm-observation-station` 或类似名称）
3. 进入 **Settings** → **Git**

检查以下内容：
- **Git Repository**: 应该显示 `cnb.cool/wxy.star/VQM` 或类似
- **Branch**: 应该是 `main`
- **Root Directory**: 应该是 `./` 或留空（如果填写了其他目录如 `/src`，会导致问题）
- **Build Command**: 应该是 `npm run build`
- **Output Directory**: 应该是 `dist`

#### 步骤 2: 清除 Vercel 缓存

在 Vercel 项目中：

1. 进入 **Deployments** 标签
2. 找到最新的部署
3. 点击右侧的 **⋮** 菜单（三个点）
4. 选择 **Redeploy**（不是 "Cancel Deployment"）
5. **重要**: 勾选 "Use existing cache" 的 **反选项**（即清除缓存）
6. 点击 **Redeploy**

#### 步骤 3: 如果方案 A 不奏效，尝试方案 B

---

### 方案 B: 通过 Vercel CLI 部署

如果 Vercel 无法正确集成您的 Git 主机，可以使用 Vercel CLI 直接部署：

```bash
# 安装 Vercel CLI（如果还没有安装）
npm i -g vercel

# 在项目目录下登录
cd /workspace
vercel login

# 部署到生产环境
vercel --prod
```

这将直接从本地文件系统部署，绕过 Git 集成问题。

---

### 方案 C: 迁移到 GitHub（如果需要长期使用）

如果您希望长期使用 Vercel 的自动部署功能：

1. 在 GitHub 创建新仓库（例如 `wxy-star/vqm-observation-station`）
2. 更换 Git 远程地址：

```bash
cd /workspace
git remote add github https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push github main
```

3. 在 Vercel 中重新连接到 GitHub 仓库

---

## 快速验证命令

### 检查本地是否有正确的代码

```bash
# 在 /workspace 目录下运行
grep -c "tailwindcss" index.html
# 应该返回 0（表示没有 Tailwind CDN）

grep -n "@google/genai" index.html
# 应该返回 "No @google/genai reference found"

npm run build
# 应该显示 "✓ 1766 modules transformed"
```

### 如果本地验证通过，但 Vercel 仍然显示旧代码

这证实了是 Vercel 集成问题，使用 **方案 B**（Vercel CLI 部署）是最快的解决方案。

---

## 预期结果

部署成功后，您应该看到：

1. **Vercel 构建日志**: `✓ 1766 modules transformed`（而不是 2 个）
2. **页面正常加载**: 不再是空白页
3. **控制台无错误**: 没有 Tailwind CDN 警告
4. **样式正常显示**: 深色主题、琥珀色按钮、科技感边框

---

## 联系 Vercel 支持

如果以上方案都不奏效，可能是 Vercel 与自定义 Git 主机的集成问题。

在 Vercel Dashboard 中，点击右下角的 **Support** → **New Chat**，说明：
- 使用自定义 Git 主机 `cnb.cool`
- Git push 成功，但 Vercel 不获取最新提交
- 本地构建正常，但 Vercel 构建使用旧代码

---

最后更新: 2026-02-17
