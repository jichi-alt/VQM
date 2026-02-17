# 星际日记 - 全栈部署教程

> 本教程展示如何将一个全栈 React 应用从本地开发环境部署到生产环境
>
> **技术栈**：React 19 + Vite + Supabase + TypeScript + Tailwind CSS
>
> **部署方案**：Vercel（托管）+ 腾讯云 CDN（国内加速）

---

## 📚 教程目录

- [第一部分：准备阶段](#第一部分准备阶段)
- [第二部分：部署到 Vercel](#第二部分部署到-vercel)
- [第三部分：配置腾讯云 CDN](#第三部分配置腾讯云-cdn)
- [第四部分：域名配置（可选）](#第四部分域名配置可选)
- [第五部分：验证与监控](#第五部分验证与监控)
- [常见问题](#常见问题)

---

## 第一部分：准备阶段

### 1.1 检查项目配置

在开始部署前，确保以下文件已经配置正确：

```bash
# 检查环境变量模板
cat .env.example

# 检查 Vercel 配置
cat vercel.json

# 检查构建脚本
cat package.json | grep "build"
```

**预期输出**：
- `.env.example` 包含 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`
- `vercel.json` 存在并正确配置
- `package.json` 有 `"build": "vite build"`

### 1.2 准备 Supabase 凭证

登录 [Supabase 控制台](https://supabase.com/dashboard)：

1. 选择你的项目
2. 进入 **Settings** → **API**
3. 复制以下信息：
   - **Project URL**（格式：`https://xxx.supabase.co`）
   - **anon public** 密钥（以 `eyJ` 或 `sb_publishable_` 开头）

⚠️ **重要**：保管好你的凭证，不要提交到 Git 仓库！

### 1.3 推送代码到 GitHub

```bash
# 提交当前更改
git add .
git commit -m "准备部署"

# 推送到 GitHub
git push origin main
```

确保你的代码在 GitHub 上是公开或私有的（都可以部署）。

---

## 第二部分：部署到 Vercel

### 2.1 注册 Vercel 账号

1. 访问 [vercel.com](https://vercel.com)
2. 点击 **Sign Up**
3. 使用 **GitHub** 账号登录（推荐，方便导入仓库）

### 2.2 导入项目

1. 登录后，点击 **"New Project"**
2. 选择 **"Import Git Repository"**
3. 选择你的 `vqm-observation-station` 仓库
4. 点击 **"Import"**

### 2.3 配置项目

Vercel 会自动检测到这是一个 Vite 项目，但我们需要配置环境变量：

**环境变量配置**：

| 名称 | 值 | 说明 |
|------|-----|------|
| `VITE_SUPABASE_URL` | 你的 Supabase URL | 例如：`https://msfifonrgyxlysngguyu.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | 你的 Supabase Anon Key | 例如：`sb_publishable_-4YZCuSJ715fSUH0XskVFw_xJ5SWxKo` |

**配置步骤**：
1. 在 **Environment Variables** 部分点击 **"Add New"**
2. 填写上面的两个变量
3. 点击 **"Add"** 保存

### 2.4 开始部署

1. 检查配置是否正确：
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

2. 点击 **"Deploy"**

3. 等待部署完成（通常 1-2 分钟）

4. 部署成功后，你会得到一个 URL：
   ```
   https://vqm-observation-station.vercel.app
   ```

### 2.5 验证部署

1. 访问你的 Vercel URL
2. 测试核心功能：
   - ✅ 页面能正常加载
   - ✅ 生成哲学问题
   - ✅ 保存答案到 Supabase
   - ✅ 用户注册/登录
   - ✅ 21天打卡功能

---

## 第三部分：配置腾讯云 CDN

### 3.1 为什么需要 CDN？

**问题**：Vercel 服务器在海外，国内访问速度可能较慢

**解决方案**：使用腾讯云 CDN 加速，将静态资源缓存到国内节点

### 3.2 开通腾讯云 CDN 服务

1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/)
2. 搜索 **"CDN"** 并进入 CDN 服务
3. 如果是首次使用，需要开通服务（免费开通）

### 3.3 添加加速域名

**选项 A：使用 Vercel 自带域名（快速体验）**

1. 在 CDN 控制台，点击 **"域名管理"** → **"新增域名"**
2. 输入加速域名：
   ```
   vqm-observation-station.vercel.app
   ```
3. 源站类型选择 **"有主域名"**
4. 源站地址填写：
   ```
   vqm-observation-station.vercel.app
   ```
5. 业务类型选择 **"动态加速"**
6. 点击 **"提交"**

**选项 B：使用自己的域名（推荐，见第四部分）**

### 3.4 配置 CNAME

添加域名后，腾讯云会提供一个 **CNAME 记录**：

```
例如：vqm-observation-station.vercel.app.cdn.dnsv1.com
```

如果你使用自己的域名，需要在域名服务商处添加 CNAME 记录。

**配置示例**（以腾讯云为例）：

1. 进入 **DNS 解析 DNSPod**
2. 添加记录：
   - 主机记录：`@` 或 `www`
   - 记录类型：`CNAME`
   - 记录值：`(腾讯云提供的 CNAME)`
   - TTL：`600`

### 3.5 配置缓存规则

在 CDN 控制台，进入你的域名配置：

**访问控制** → **缓存配置**

**缓存规则配置**：

| 规则名称 | 匹配内容 | 缓存时间 |
|----------|----------|----------|
| 静态资源 | `*.js` `*.css` `*.png` `*.jpg` `*.svg` | 30天 |
| HTML文件 | `*.html` | 不缓存 |
| API接口 | `/api/*` | 不缓存 |

### 3.6 开启 HTTPS

1. 进入 **域名管理** → **HTTPS 配置**
2. 选择 **"免费证书"**（腾讯云提供）
3. 点击 **"提交申请"**
4. 等待证书下发（通常几分钟）

---

## 第四部分：域名配置（可选）

### 4.1 购买域名

**推荐域名服务商**：
- 腾讯云 [dnspod.cn](https://dnspod.cn)
- 阿里云 [wanwang.aliyun.com](https://wanwang.aliyun.com)
- Cloudflare [cloudflare.com](https://cloudflare.com)（国际）

### 4.2 在 Vercel 添加自定义域名

1. 进入 Vercel 项目设置
2. 点击 **"Settings"** → **"Domains"**
3. 点击 **"Add"**，输入你的域名：
   ```
   your-domain.com
   www.your-domain.com
   ```
4. Vercel 会提供配置信息

### 4.3 配置 DNS

在你的域名服务商处添加记录：

**根域名（your-domain.com）**：

| 主机记录 | 记录类型 | 记录值 |
|----------|----------|--------|
| `@` | A | `76.76.21.21`（Vercel 提供的 IP） |

**www 子域名**：

| 主机记录 | 记录类型 | 记录值 |
|----------|----------|--------|
| `www` | CNAME | `cname.vercel-dns.com` |

### 4.4 验证域名配置

1. 等待 DNS 生效（通常 10-30 分钟）
2. 在 Vercel 控制台检查域名状态
3. 访问你的自定义域名

---

## 第五部分：验证与监控

### 5.1 部署检查清单

```bash
# ✅ 1. 测试国际访问
curl -I https://your-project.vercel.app

# ✅ 2. 测试国内访问（配置 CDN 后）
curl -I https://your-domain.com

# ✅ 3. 检查 HTTPS
curl -I https://your-domain.com | grep -i "strict-transport-security"

# ✅ 4. 测试 API 连接
# 在浏览器控制台运行
fetch('/api/health')
```

### 5.2 性能测试

**使用 Chrome DevTools**：

1. 打开你的网站
2. 按 `F12` 打开开发者工具
3. 切换到 **"Lighthouse"** 标签
4. 选择 **"Performance"** 和 **"Best Practices"**
5. 点击 **"Analyze page load"**

**目标分数**：
- Performance: > 90
- Best Practices: > 90
- Accessibility: > 90
- SEO: > 90

### 5.3 Vercel 监控

在 Vercel 控制台：

1. 查看 **Analytics**（访问统计）
2. 查看 **Deployments**（部署历史）
3. 查看 **Logs**（错误日志）

### 5.4 腾讯云 CDN 监控

在腾讯云 CDN 控制台：

1. 查看 **流量统计**
2. 查看 **命中率**（应该 > 90%）
3. 查看 **响应时间**（国内应该 < 100ms）

---

## 常见问题

### Q1: Vercel 部署失败怎么办？

**错误**：`Build failed with error`

**解决方案**：
```bash
# 1. 本地测试构建
npm run build

# 2. 检查错误日志
# 在 Vercel 控制台查看详细错误信息

# 3. 常见问题
# - 环境变量未配置 → 检查 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY
# - 依赖安装失败 → 删除 node_modules 和 package-lock.json，重新 npm install
# - TypeScript 错误 → 运行 npm run type-check 检查
```

### Q2: Supabase 连接失败？

**症状**：可以访问网站，但无法保存数据

**解决方案**：
1. 检查环境变量是否正确
2. 检查 Supabase 项目是否暂停
3. 检查 Supabase RLS 策略是否正确配置
4. 在浏览器控制台查看错误信息

### Q3: CDN 配置后访问更慢了？

**可能原因**：
- CDN 节点选择错误
- 缓存配置不当
- 回源路径配置错误

**解决方案**：
1. 检查 CDN 配置是否正确
2. 清空 CDN 缓存
3. 联系腾讯云技术支持

### Q4: 域名配置后无法访问？

**检查步骤**：
1. 使用 `nslookup` 检查 DNS 解析：
   ```bash
   nslookup your-domain.com
   ```
2. 检查域名是否备案（国内域名需要）
3. 检查 DNS 记录是否正确
4. 等待 DNS 生效（最多 48 小时）

### Q5: 如何更新部署？

**Vercel 自动部署**：
```bash
# 只需推送代码到 GitHub
git add .
git commit -m "更新功能"
git push origin main

# Vercel 会自动检测到推送并重新部署
```

---

## 🎓 扩展学习

### 相关技术文档

- [Vercel 官方文档](https://vercel.com/docs)
- [腾讯云 CDN 文档](https://cloud.tencent.com/document/product/228)
- [Supabase 文档](https://supabase.com/docs)
- [Vite 构建优化](https://vitejs.dev/guide/build.html)

### 进阶配置

- **自动化测试**：在部署前运行 `npm test`
- **环境隔离**：配置 Production/Staging/Development 环境
- **错误监控**：集成 Sentry 错误追踪
- **性能监控**：集成 Google Analytics 或 Plausible

---

## 📝 总结

本教程涵盖了：

✅ **代码管理**：Git + GitHub
✅ **CI/CD**：Vercel 自动部署
✅ **环境配置**：环境变量管理
✅ **内容分发**：CDN 加速
✅ **域名管理**：DNS + HTTPS
✅ **监控运维**：性能测试 + 日志查看

这就是一个完整的现代化全栈部署流程！

---

**祝部署顺利！** 🚀

如有问题，请查阅：
- [项目仓库](https://github.com/your-username/vqm-observation-station)
- [Vercel 社区](https://github.com/vercel/vercel/discussions)
- [腾讯云工单系统](https://console.cloud.tencent.com/workorder)
