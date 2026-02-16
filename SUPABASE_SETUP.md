# Supabase 设置指南

## 📋 概述

本项目已迁移到使用 Supabase 作为主要数据存储，同时保留 localStorage 作为离线 fallback。

## 🚀 快速开始

### 1. 执行数据库设置脚本

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **SQL Editor**
4. 复制并执行 `supabase-setup.sql` 文件中的所有 SQL

该脚本会创建：
- ✅ 8 张数据表（profiles, user_streaks, user_answers 等）
- ✅ Row Level Security (RLS) 策略
- ✅ 触发器和自动更新
- ✅ 50+ 个预制问题

### 2. 配置环境变量

复制 `.env.example` 到 `.env.local`：

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入你的 Supabase 凭证：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**获取位置**：Supabase Dashboard → Project → Settings → API

### 3. 安装依赖并运行

```bash
# 安装依赖（如果还没安装）
npm install

# 启动开发服务器
npm run dev
```

## 📊 数据库表结构

### 核心表

| 表名 | 用途 | 关键字段 |
|------|------|----------|
| `profiles` | 用户资料 | id, email, username |
| `user_streaks` | 打卡记录 | current_streak, last_check_in, check_in_history |
| `user_answers` | 用户回答 | question_id, answer, created_at |
| `question_bank` | 问题库 | id, text, chapter, day |
| `answered_questions` | 已回答问题记录 | user_id, question_text |
| `viewed_fragments` | 已查看记忆碎片 | user_id, fragment_id |
| `user_preferences` | 用户偏好设置 | seen_prologue, audio_enabled |
| `daily_states` | 每日状态 | date, question_id, answers |

### RLS 策略

所有表都启用了 Row Level Security，确保：
- ✅ 用户只能读写自己的数据
- ✅ 认证用户可以读取问题库
- ✅ 未认证用户无法访问敏感数据

## 🔑 认证流程

### 注册/登录

用户首次使用时：
1. 点击"登录/注册"按钮
2. 输入邮箱和密码
3. Supabase 自动创建 `auth.users` 记录
4. 触发器自动创建 `profiles` 记录
5. 本地数据自动同步到云端

### 数据同步

登录后会自动执行：
- localStorage → Supabase 数据迁移
- 双写模式：每次操作同时保存到本地和云端
- 离线支持：无网络时使用 localStorage，有网络时自动同步

## 📦 数据存储架构

```
┌─────────────────┐
│  组件层 (UI)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ DataService     │ ← 统一数据访问层
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌──────┐  ┌──────────┐
│ local│  │ Supabase │
│Storage│  │   API    │
└──────┘  └──────────┘
    │         │
    └────┬────┘
         │
    Fallback策略
```

### 读取策略
1. 优先读取 localStorage（快速响应）
2. 如果本地无数据，从 Supabase 获取
3. 获取后同步到本地

### 写入策略
1. 同时写入 localStorage 和 Supabase
2. 如果 Supabase 失败，localStorage 仍可用
3. 下次联网时自动同步

## 🧪 测试 Supabase 连接

### 方式1：使用 Supabase Dashboard

1. 进入 **Table Editor**
2. 查看各表数据是否正常
3. 测试插入一条数据

### 方式2：在浏览器控制台测试

```javascript
// 检查 Supabase 客户端是否初始化
import { supabase } from './supabaseClient';

// 测试连接
const { data, error } = await supabase
  .from('question_bank')
  .select('*')
  .limit(1);

console.log('Supabase 连接测试:', error ? '失败' : '成功');
```

## 🔄 数据迁移（从旧版 localStorage）

如果用户之前使用过 localStorage 版本：

```typescript
import { syncLocalToSupabase } from './services/dataService';

// 在用户登录后调用
const userId = user.id;
const result = await syncLocalToSupabase(userId);
console.log('同步结果:', result);
```

## 🛠️ 常见问题

### Q: 提示 "Missing Supabase environment variables"

**A**: 检查 `.env.local` 文件是否存在，变量是否正确设置。

### Q: 登录后数据不显示

**A**: 打开浏览器控制台，检查是否有 RLS 策略错误。确保执行了完整的 `supabase-setup.sql`。

### Q: 如何重置数据库？

**A**:
1. 在 Supabase Dashboard 执行 `TRUNCATE` 命令清空表
2. 重新执行 `supabase-setup.sql`

### Q: 本地开发和生产环境如何区分？

**A**: 创建 `.env.production` 文件，使用生产环境的 Supabase 项目。

## 📝 下一步

1. ✅ 执行数据库设置脚本
2. ✅ 配置环境变量
3. ✅ 测试登录功能
4. ✅ 验证数据同步
5. 🎉 享受云端数据备份的便利！

## 🔗 相关链接

- [Supabase 官方文档](https://supabase.com/docs)
- [Supabase JavaScript 客户端](https://supabase.com/docs/reference/javascript)
- [Row Level Security 指南](https://supabase.com/docs/guides/auth/row-level-security)
