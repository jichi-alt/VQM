# 星际日记 - 腾讯云CloudBase部署教程

## 📋 部署前检查清单

### 1. 环境变量配置 ✅
- [x] `.env.local` 文件已配置
- [x] Supabase URL和API密钥已填写

### 2. 构建项目 ✅
```bash
npm run build
```

### 3. 检查dist文件夹 ✅
```
dist/
├── index.html
├── manifest.json
├── robots.txt
├── sitemap.xml
├── background-voice.mp3
├── space.mp3
└── assets/
    ├── js/
    └── ...
```

---

## 🚀 腾讯云CloudBase部署步骤

### 第1步：开通云开发服务

1. 访问：https://console.cloud.tencent.com/tcb
2. 登录你的腾讯账号
3. 选择 **"按量付费"** 或使用免费额度
4. 开通 **"云开发"** 服务

---

### 第2步：创建静态网站托管

1. 进入左侧菜单：**"静态网站托管"**
2. 点击 **"新建应用"**
3. 填写应用信息：
   ```
   应用名称: vqm-station
   运行环境: pre-production
   应用描述: 21天思考挑战（可选）
   ```
4. 点击 **"确定"** 创建

---

### 第3步：上传项目文件

#### 方法A：拖拽上传（推荐）
```
直接拖拽 /workspace/dist 文件夹到上传区域
```

#### 方法B：文件夹上传
```
1. 点击 "上传文件夹"
2. 选择 /workspace/dist
3. 等待上传完成
```

#### 文件结构验证
上传完成后应显示：
```
✅ index.html
✅ assets/
✅ manifest.json
✅ robots.txt
✅ sitemap.xml
✅ *.mp3 音频文件
```

---

### 第4步：配置环境变量（重要！）

1. 在应用详情页，点击 **"环境配置"** 或 **"环境变量"**
2. 点击 **"添加变量"**
3. 添加以下两个变量：

```bash
# 变量1
名称: VITE_SUPABASE_URL
值: https://msfifonrgyxlysngguyu.supabase.co

# 变量2
名称: VITE_SUPABASE_ANON_KEY
值: sb_publishable_-4YZCuSJ715fSUH0XskVFw_xJ5SWxKo
```

4. 点击 **"保存"**

---

### 第5步：部署并发布

1. 点击 **"部署"** 或 **"发布"** 按钮
2. 等待部署完成（通常1-2分钟）
3. 获得访问地址：
   ```
   https://xxx.tcb.qcloud.la
   ```
   或
   ```
   https://xxx.tcb.qcloud.la/app/vqm-station/
   ```

---

## 🔧 Supabase数据库配置

### 第1步：创建数据库表

1. 访问：https://supabase.com/dashboard
2. 进入你的项目
3. 点击左侧：**"SQL Editor"**
4. 点击 **"New Query"**
5. 粘贴以下SQL并点击 **"Run"**：

```sql
-- 用户资料表
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  username TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 用户答案表
CREATE TABLE IF NOT EXISTS user_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 用户打卡数据表
CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_check_in TIMESTAMP,
  start_date DATE,
  check_in_history TEXT[] DEFAULT '{}'
);
```

---

## 🌐 配置自定义域名（可选）

### 第1步：添加域名

1. 在腾讯云CloudBase应用详情页
2. 点击 **"域名管理"**
3. 点击 **"添加域名"**

### 第2步：DNS配置

#### 方法A：使用免费子域名（推荐）
```
xxx.tcb.qcloud.la
```
自动配置，无需额外操作

#### 方法B：使用自己的域名

1. **如果你有域名**（如：vqm-diary.com）
2. 在域名DNS管理添加CNAME记录：
   ```
   类型: CNAME
   主机记录: @
   记录值: xxx.tcb.qcloud.la
   TTL: 600
   ```

3. 在腾讯云CloudBase绑定域名
4. 等待DNS生效（最多48小时）

---

## ✅ 部署后检查清单

### 功能测试

- [ ] 访问首页是否正常
- [ ] 点击"吐一个问题"是否生成问题
- [ ] 登录功能是否正常
- [ ] 保存答案是否成功
- [ ] 打卡功能是否正常
- [ ] 记忆碎片是否触发

### SEO检查

- [ ] 浏览器标签页显示正确标题
- [ ] 分享到微信显示预览图
- [ ] robots.txt可访问：https://your-domain.com/robots.txt
- [ ] sitemap.xml可访问：https://your-domain.com/sitemap.xml

### 性能检查

- [ ] 首屏加载时间 < 3秒
- [ ] 页面切换流畅
- [ ] 音频播放正常
- [ ] 移动端显示正常

---

## 🔄 更新部署

### 修改代码后重新部署

```bash
# 1. 修改代码
# 2. 重新构建
npm run build

# 3. 上传新的 dist 文件夹
# （拖拽或选择文件夹上传）
```

### 自动部署（Git集成，可选）

腾讯云CloudBase支持Git集成：
```
1. 连接GitHub/GitLab仓库
2. 配置构建命令：npm run build
3. 配置输出目录：dist
4. 推送代码自动触发部署
```

---

## 📊 监控和分析

### 免费额度

| 资源 | 免费额度 |
|------|---------|
| 存储空间 | 5GB |
| CDN流量 | 5GB/月 |
| 请求次数 | 详见官网 |

### 查看用量

```
腾讯云控制台 → 云开发 → 用量统计
```

---

## ❓ 常见问题

### Q1: 部署后页面404
**A**: 检查是否上传了dist文件夹
**A**: 检查index.html在根目录

### Q2: 登录失败
**A**: 检查环境变量是否正确配置
**A**: 检查Supabase项目是否启用了RLS（Row Level Security）

### Q3: 音频无法播放
**A**: 浏览器可能阻止了自动播放
**A**: 用户需要点击页面一次才能播放音频

### Q4: 更新后没生效
**A**: 清除浏览器缓存
**A**: 使用无痕模式测试

---

## 📞 需要帮助？

- 腾讯云文档：https://cloud.tencent.com/document/product/233
- Supabase文档：https://supabase.com/docs
- GitHub问题：https://github.com/anthropics/claude-code/issues

---

## ✨ 完成！

部署完成后，你将拥有：
- ✅ 一个可访问的网站
- ✅ 云端数据库
- ✅ 用户认证系统
- ✅ 21天打卡功能
- ✅ 记忆碎片故事

**开始你的21天思考之旅吧！** 🚀
