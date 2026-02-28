# 🎯 VQM 项目上线计划

> 基于：登录功能问题已修复，准备 Vercel 部署

---

## ✅ 已完成的修复（2025-02-28）

### 问题 1：登录后状态不更新
- ✅ 修复 `window.location.reload()` 刷新问题
- ✅ 正确更新 `currentUser` 状态
- ✅ 优化认证状态监听

### 问题 2：登录一直"处理中"
- ✅ 修复 `onAuthSuccess()` 未被 await 的问题
- ✅ 添加 profile 查询失败的 fallback
- ✅ 增强错误处理逻辑

### 数据库配置
- ✅ Supabase 环境变量配置
- ✅ 数据库表创建（8张表）
- ✅ RLS 策略配置
- ✅ 问题库初始化（49个问题）

---

## 📋 下一步必要执行计划（按顺序）

### 🔴 **阶段 1：修复验证（30分钟）**

#### 任务 1.1：测试登录修复
- [ ] 刷新浏览器（Ctrl+F5 强制刷新）
- [ ] 测试登录功能
- [ ] 验证右上角显示邮箱（不再是登录图标）
- [ ] 测试登出功能

**验证标准：**
- 登录后立即显示用户邮箱
- 不再出现"处理中"卡住
- 状态持久化（刷新页面仍然登录）

---

#### 任务 1.2：添加登录成功提示（20分钟）

**当前问题：** 登录成功后没有明显反馈

**改进方案：**
```tsx
// 添加 Toast 提示
const [toast, setToast] = useState({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error'
});

// 在 handleAuthSuccess 中
setToast({
  show: true,
  message: '登录成功！欢迎回来',
  type: 'success'
});
setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
```

**文件：** `components/QuestionVomitMachine.tsx`

---

#### 任务 1.3：改进错误提示（15分钟）

**当前问题：** 技术错误消息不友好

**改进方案：**
```tsx
// 在 AuthModal.tsx 中添加
const getFriendlyError = (error: string): string => {
  if (error.includes('Invalid login credentials'))
    return '邮箱或密码错误';
  if (error.includes('User already registered'))
    return '该邮箱已注册';
  if (error.includes('Email not confirmed'))
    return '请先确认邮箱';
  return error;
};
```

**文件：** `components/AuthModal.tsx`

---

### 🟡 **阶段 2：核心功能测试（1小时）**

#### 任务 2.1：测试用户注册流程
- [ ] 新用户注册
- [ ] 验证 profile 自动创建
- [ ] 检查数据库中用户数据
- [ ] 测试登录

#### 任务 2.2：测试每日问题功能
- [ ] 点击"吐一个问题"
- [ ] 验证问题显示正确
- [ ] 测试重抽功能
- [ ] 测试答案保存

#### 任务 2.3：测试打卡功能
- [ ] 保存答案后自动打卡
- [ ] 验证连续天数统计
- [ ] 测试打卡成功弹窗
- [ ] 验证进度条更新

#### 任务 2.4：测试记忆碎片
- [ ] 触发记忆碎片
- [ ] 查看碎片内容
- [ ] 验证碎片状态保存

---

### 🟠 **阶段 3：Vercel 部署准备（30分钟）**

#### 任务 3.1：检查环境变量

**Vercel 需要配置的环境变量：**
```bash
VITE_SUPABASE_URL=https://msfifonrgyxlysngguyu.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_-4YZCuSJ715fSUH0XskVFw_xJ5SWxKo
```

**操作步骤：**
1. 访问 Vercel Dashboard
2. 进入项目 → Settings → Environment Variables
3. 添加上述变量

---

#### 任务 3.2：检查构建配置

**验证 `vercel.json` 配置：**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite"
}
```

---

#### 任务 3.3：本地构建测试

**命令：**
```bash
npm run build
npm run preview
```

**验证：**
- [ ] 构建成功无错误
- [ ] 预览模式正常访问
- [ ] 所有功能正常工作

---

### 🟢 **阶段 4：部署到 Vercel（15分钟）**

#### 任务 4.1：推送代码到 Git
```bash
git add .
git commit -m "fix: 修复登录状态更新问题，准备上线"
git push
```

#### 任务 4.2：连接 Vercel
1. 在 Vercel 导入项目
2. 连接 Git 仓库
3. 选择 `main` 分支

#### 任务 4.3：部署
1. 点击 "Deploy"
2. 等待构建完成
3. 访问部署的 URL

---

### 🔵 **阶段 5：线上验证（15分钟）**

#### 任务 5.1：功能验证清单
- [ ] 页面正常加载（无白屏）
- [ ] 登录/注册功能正常
- [ ] 每日问题功能正常
- [ ] 打卡功能正常
- [ ] 移动端显示正常

#### 任务 5.2：性能检查
- [ ] 首屏加载时间 < 3秒
- [ ] 页面交互流畅
- [ ] 无控制台错误

---

## 🚨 常见问题预案

### 问题 1：Vercel 部署后白屏
**可能原因：**
- 环境变量未配置
- 路由配置问题
- 构建失败

**解决方案：**
1. 检查 Vercel 构建日志
2. 验证环境变量已配置
3. 检查 `vercel.json` 配置

---

### 问题 2：登录功能不工作
**可能原因：**
- Supabase CORS 配置
- 环境变量错误

**解决方案：**
1. 在 Supabase 设置中添加 Vercel 域名到 CORS
2. 验证环境变量正确

---

### 问题 3：问题库为空
**可能原因：**
- 数据库未初始化

**解决方案：**
在 Supabase SQL Editor 重新执行 `init-questions-supabase.sql`

---

## 📊 时间估算

| 阶段 | 任务 | 预计时间 | 状态 |
|------|------|----------|------|
| 1 | 修复验证 | 30分钟 | ⏳ 待开始 |
| 2 | 核心功能测试 | 1小时 | ⏳ 待开始 |
| 3 | Vercel 部署准备 | 30分钟 | ⏳ 待开始 |
| 4 | 部署到 Vercel | 15分钟 | ⏳ 待开始 |
| 5 | 线上验证 | 15分钟 | ⏳ 待开始 |
| **总计** | | **2.5小时** | |

---

## 🎯 今日目标

### 必须完成：
1. ✅ 修复登录状态更新问题
2. ⏳ 测试所有核心功能
3. ⏳ 本地构建测试
4. ⏳ 准备 Vercel 环境变量

### 建议完成：
5. ⏳ 添加登录成功提示
6. ⏳ 改进错误提示

### 可选：
7. ⏳ 部署到 Vercel（建议明天完成，因为需要充分测试）

---

## 💪 执行建议

### 当前立即执行：
```bash
# 1. 强制刷新浏览器
# 按 Ctrl+F5 (Windows) 或 Cmd+Shift+R (Mac)

# 2. 测试登录
# 使用你的测试账号登录，验证右上角显示邮箱

# 3. 如果还有问题
# 打开浏览器控制台 (F12)，查看错误信息
```

### 如果问题解决：
立即进入**阶段 2**（核心功能测试）

### 如果问题未解决：
把控制台的错误信息告诉我，我会继续诊断

---

**下一步你想要：**
- 回复 **"测试完成"** - 我帮你进入阶段2
- 回复 **"还有问题"** + 错误信息 - 我继续诊断
- 回复 **"继续改进"** - 我先添加提示功能
