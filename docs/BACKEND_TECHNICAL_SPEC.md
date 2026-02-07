# VQM Observation Station - 后端技术文档

> 项目版本: v1.1
> 文档更新: 2026-02-07
> 架构类型: 客户端优先 + AI服务集成

---

## 目录

- [架构概述](#架构概述)
- [技术栈](#技术栈)
- [服务模块](#服务模块)
- [数据存储](#数据存储)
- [外部API集成](#外部api集成)
- [类型定义](#类型定义)
- [错误处理](#错误处理)
- [安全考虑](#安全考虑)
- [性能优化](#性能优化)
- [未来扩展](#未来扩展)

---

## 架构概述

### 当前架构

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Client)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   React UI   │  │ localStorage │  │   Services   │  │
│  │              │  │              │  │              │  │
│  │ - Intro      │  │ - qvm_streak │  │ - gemini     │  │
│  │ - Daily      │  │ - qvm_*.     │  │ - memory     │  │
│  │ - History    │  │              │  │              │  │
│  └──────────────┘  └──────────────┘  └──────┬───────┘  │
└─────────────────────────────────────────────┼───────────┘
                                              │
                                              ▼
                                   ┌────────────────────┐
                                   │  Google Gemini API │
                                   │  (AI Question Gen) │
                                   └────────────────────┘
```

### 架构特点

| 特性 | 说明 |
|------|------|
| **部署方式** | 静态站点 (Vite build) |
| **数据存储** | 浏览器 localStorage |
| **API调用** | 客户端直接调用 Google Gemini |
| **认证** | 无需后端认证（API Key 在环境变量） |
| **扩展性** | 轻量级，适合个人项目/MVP |

---

## 技术栈

### 前端框架

```json
{
  "react": "^19.2.3",
  "react-dom": "^19.2.3",
  "typescript": "~5.8.2",
  "vite": "^6.2.0"
}
```

### AI SDK

```json
{
  "@google/genai": "^1.38.0"
}
```

### 动画库

```json
{
  "gsap": "^3.14.2"
}
```

### 图标库

```json
{
  "lucide-react": "^0.563.0",
  "@fortawesome/free-solid-svg-icons": "^7.1.0",
  "@fortawesome/react-fontawesome": "^3.2.0"
}
```

---

## 服务模块

### 1. Gemini Service (`services/geminiService.ts`)

**职责**: 生成哲学思考问题

#### 核心函数

##### `generatePhilosophicalQuestion()`

生成一个基于当前天数的哲学问题。

```typescript
function generatePhilosophicalQuestion(
  day?: number,
  previousQuestions?: string[]
): Promise<QuestionData>
```

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `day` | `number` | 否 | 当前打卡天数（不传则从 localStorage 读取） |
| `previousQuestions` | `string[]` | 否 | 已回答的问题列表（用于去重） |

**返回值**:
```typescript
interface QuestionData {
  id: string;          // 唯一标识 (Math.random())
  text: string;        // 问题文本
  date: string;        // 生成日期 (YYYY-MM-DD)
  ticketNum: string;   // 票据编号 (1000-9999)
  chapter: number;     // 所属章节 (1-4)
  day: number;         // 当前天数
}
```

**流程**:

```
┌─────────────────┐
│  1. 获取天数     │ → 优先使用参数 → 否则从 localStorage 读取
└────────┬────────┘
         ▼
┌─────────────────┐
│  2. 获取章节信息 │ → getChapterInfo(day)
└────────┬────────┘
         ▼
┌─────────────────┐
│  3. 构建 Prompt │ → 包含章节主题、语气、去重列表
└────────┬────────┘
         ▼
┌─────────────────┐
│  4. 检查 API Key│ → 无 Key 则使用备用问题库
└────────┬────────┘
         ▼
┌─────────────────┐
│  5. 调用 Gemini  │ → gemini-2.0-flash-exp 模型
└────────┬────────┘
         ▼
┌─────────────────┐
│  6. 返回结果     │ → 成功: AI生成 / 失败: 备用问题
└─────────────────┘
```

**System Prompt 结构**:

```
你是 VQM（Question Vomit Machine），一个来自遥远星球的机器人。

【你的背景】
你来自一个曾经充满思考的文明。当人们停止思考后，变成了机器人，星球最终毁灭。你逃亡到地球，寻找还在思考的人类。

【当前状态】
- 今天是地球人类的第 {day} 天思考
- 当前章节：{chapterName}（第{chapter}章）
- 章节主题：{theme}
- 语言风格：{tone}

【你的任务】
生成一个能引发人类深度思考的问题。

【要求】
1. 问题要简短有力（15-25字）
2. 要与当前章节主题相关：{theme}
3. 用外星观察者的视角提问，带有一丝好奇和温暖
4. 问题要超现实、富有想象力，但又能引发真实思考
5. 避免陈词滥调和过于抽象
6. 只输出问题本身，不要任何前言或解释

【避免重复】
之前已经问过的问题，不要重复或过于类似：
{answeredQuestions}
```

##### `getChapterInfo()`

获取当前天数对应的章节信息。

```typescript
function getChapterInfo(day: number): ChapterInfo
```

**章节划分**:

| 天数范围 | 章节 | 名称 | 主题 | 语气 |
|---------|------|------|------|------|
| 1-6 | 1 | 起源 | 自我认知与思考的本质 | 好奇、观察、略带困惑 |
| 7-13 | 2 | 观察 | 理解人类的行为与情感 | 温暖、理解、共情 |
| 14-20 | 3 | 希望 | 创造、未来、可能性 | 期待、鼓励、充满希望 |
| 21+ | 4 | 觉醒 | 反思与总结 | 感激、深沉、启程 |

##### `getAnsweredQuestions()` 系列函数

```typescript
// 获取已回答的问题列表
function getAnsweredQuestions(): string[]

// 记录已回答的问题
function saveAnsweredQuestion(questionText: string): void

// 清除已回答问题的记录
function clearAnsweredQuestions(): void
```

**Storage Key**: `qvm_answered_questions`

##### `getFallbackQuestion()` / `getFallbackQuestionText()`

当 AI 调用失败时，返回备用问题库中的问题。

```typescript
function getFallbackQuestion(day: number, answeredQuestions: string[]): QuestionData
function getFallbackQuestionText(day: number, excludeQuestions: string[]): string
```

**备用问题数量**:

| 章节 | 问题数 | 说明 |
|------|--------|------|
| 第1章 | 12 | 第1天专属4个 + 第2-6天8个 |
| 第2章 | 14 | 微观7个 + 宏观7个 |
| 第3章 | 14 | 有趣6个 + 严肃8个 |
| 第4章 | 7 | 回顾与总结 |
| **总计** | **47** | - |

**去重逻辑**:
- 优先返回未回答过的问题
- 如果全部回答过，允许重复（随机返回）

---

### 2. Memory Fragments Service (`services/memoryFragments.ts`)

**职责**: 管理记忆碎片数据（故事内容）

#### 数据结构

```typescript
interface MemoryFragment {
  id: string;              // 唯一标识 (如 'c1-1', 'final')
  chapter: 1 | 2 | 3 | 'final';  // 所属章节
  minDay: number;          // 最早触发天数
  maxDay: number;          // 最晚触发天数
  content: string;         // 碎片文本内容
  isMilestone?: boolean;   // 是否是里程碑（必触发）
}
```

#### 核心函数

##### `getAvailableFragments()`

获取当前可用的记忆碎片列表。

```typescript
function getAvailableFragments(currentDay: number, viewedIds: string[]): MemoryFragment[]
```

**过滤条件**:
1. `currentDay` 在 `[minDay, maxDay]` 范围内
2. `id` 不在 `viewedIds` 中

##### `getRandomFragment()`

随机获取一个可用的记忆碎片。

```typescript
function getRandomFragment(currentDay: number, viewedIds: string[]): MemoryFragment | null
```

**逻辑**:
```typescript
const available = getAvailableFragments(currentDay, viewedIds);
if (available.length === 0) return null;
return available[Math.floor(Math.random() * available.length)];
```

#### 记忆碎片数据

**总数**: 18 个碎片

| 章节 | ID 前缀 | 数量 | 天数范围 | 里程碑 |
|------|---------|------|----------|--------|
| 第1章 | c1-* | 6 | 1-6 | - |
| 第2章 | c2-* | 6 | 7-13 | milestone-7 |
| 第3章 | c3-* | 6 | 14-20 | milestone-14 |
| 最终章 | final | 1 | 21 | final |

**内容变量替换**:
- `{streak}` → 当前打卡天数（如 c3-1）

---

## 数据存储

### localStorage 数据结构

#### 1. 打卡进度 (`qvm_streak`)

```typescript
interface StreakData {
  lastCheckIn: string;      // 上次打卡日期 (YYYY-MM-DD)
  currentStreak: number;    // 当前连续打卡天数
  isCompleted: boolean;     // 是否完成21天
  startDate: string;        // 开始日期 (YYYY-MM-DD)
  checkInHistory: string[]; // 打卡历史 [YYYY-MM-DD, ...]
  longestStreak: number;    // 最长连续天数
}
```

#### 2. 已回答问题 (`qvm_answered_questions`)

```typescript
// 存储已回答的问题文本数组
string[]
```

#### 3. 已看记忆碎片 (`qvm_viewed_fragments`)

```typescript
// 存储已看过的记忆碎片 ID 数组
string[]
```

#### 4. 用户答案 (`qvm_answers`)

```typescript
// 存储用户的回答记录
interface ArchiveItem {
  id: string;          // 唯一标识
  date: string;        // 日期
  tag: string;         // 标签
  tagIcon: string;     // 标签图标
  question: string;    // 问题文本
  count: number;       // 字数统计
}
```

#### 5. 已看前言 (`qvm_seen_prologue`)

```typescript
// 标记是否已看过开场动画
"true" | undefined
```

### 数据操作示例

```typescript
// 读取
const streakData = JSON.parse(localStorage.getItem('qvm_streak') || '{}');

// 写入
localStorage.setItem('qvm_streak', JSON.stringify(newStreakData));

// 删除
localStorage.removeItem('qvm_streak');

// 清空所有
Object.keys(localStorage)
  .filter(key => key.startsWith('qvm_'))
  .forEach(key => localStorage.removeItem(key));
```

---

## 外部API集成

### Google Gemini API

#### 配置

**环境变量**:
```bash
API_KEY=your_gemini_api_key
```

**Vite 环境变量加载** (`vite.config.ts`):
```typescript
export default defineConfig({
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
})
```

#### API 调用

```typescript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const response = await ai.models.generateContent({
  model: 'gemini-2.0-flash-exp',
  contents: systemPrompt,
});

const text = response.text;
```

#### 模型选择

| 模型 | 用途 | 延迟 | 成本 |
|------|------|------|------|
| `gemini-2.0-flash-exp` | 问题生成 | 低 | 低 |

#### 降级策略

```
检查 API Key
    │
    ├─ 无 Key ──────────────────────→ 使用备用问题库
    │
    ├─ 有 Key ── API 调用成功 ──────→ 返回 AI 生成问题
    │
    └─ 有 Key ── API 调用失败 ──────→ 使用备用问题库
```

---

## 类型定义

### 核心类型 (`types.ts`)

```typescript
// 历史记录项
interface ArchiveItem {
  id: string;
  date: string;
  tag: string;
  tagIcon: string;
  question: string;
  count: number;
}

// 问题数据
interface QuestionData {
  id: string;
  text: string;
  date: string;
  ticketNum: string;
  chapter?: number;
  day?: number;
}

// 打卡数据
interface StreakData {
  lastCheckIn: string;
  currentStreak: number;
  isCompleted: boolean;
  startDate: string;
  checkInHistory: string[];
  longestStreak: number;
}

// 记忆碎片
interface MemoryFragment {
  id: string;
  chapter: 1 | 2 | 3 | 'final';
  minDay: number;
  maxDay: number;
  content: string;
  isMilestone?: boolean;
}
```

---

## 错误处理

### 错误类型

| 错误类型 | 处理方式 |
|---------|----------|
| API 调用失败 | 降级到备用问题库 |
| localStorage 满 | 提示用户清理数据 |
| JSON 解析失败 | 返回空数组/默认值 |
| 网络超时 | 重试1次，失败则降级 |

### 错误处理示例

```typescript
// localStorage 错误处理
export const getAnsweredQuestions = (): string[] => {
  try {
    const stored = localStorage.getItem(ANSWERED_QUESTIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Failed to read answered questions:', e);
    return [];  // 返回默认值
  }
};

// API 错误处理
export const generatePhilosophicalQuestion = async (...) => {
  try {
    // API 调用
  } catch (error) {
    console.error("Gemini API Error", error);
    return getFallbackQuestion(day, answeredQuestions);  // 降级
  }
};
```

---

## 安全考虑

### 当前实现

| 安全项 | 状态 | 说明 |
|--------|------|------|
| API Key 保护 | ⚠️ | 硬编码在构建产物中（仅适合私有项目） |
| 数据加密 | ❌ | localStorage 明文存储 |
| 输入验证 | ⚠️ | 基础验证 |
| XSS 防护 | ✅ | React 默认转义 |
| CSRF | N/A | 无后端交互 |

### 建议改进

1. **API Key 保护**:
   - 使用代理服务器转发 API 请求
   - 或使用 Vercel Edge Functions 隐藏 Key

2. **数据加密**:
   - 敏感数据使用 AES 加密后存储

3. **输入验证**:
   - 添加更严格的输入长度限制
   - 防止恶意字符注入

---

## 性能优化

### 已实现的优化

| 优化项 | 方法 | 效果 |
|--------|------|------|
| 问题去重 | localStorage 缓存已回答问题 | 减少 API 调用 |
| 备用问题库 | 预置 47 个问题 | 零延迟降级 |
| 本地存储 | 所有数据存 localStorage | 无网络依赖 |
| 代码分割 | React Lazy Loading | 减少初始加载 |

### 性能指标

| 指标 | 目标 | 实际 |
|------|------|------|
| 首次加载 | < 3s | ~2s |
| API 响应 | < 2s | ~1.5s |
| 备用问题返回 | < 100ms | ~10ms |

---

## 未来扩展

### 短期扩展 (1-2周)

- [ ] 添加数据导出功能 (JSON/CSV)
- [ ] 添加统计数据 API
- [ ] 优化 localStorage 容量管理

### 中期扩展 (1-2月)

- [ ] 迁移到真实后端 (Node.js/Express)
- [ ] 实现用户认证系统
- [ ] 云端数据同步

### 长期扩展 (3-6月)

- [ ] 多语言支持 (i18n)
- [ ] 社区功能 (分享/评论)
- [ ] 移动端 App

### 推荐后端技术栈

如果需要扩展为完整后端应用：

```
Backend:
  - Node.js + Express / Fastify
  - PostgreSQL (用户/打卡数据)
  - Redis (缓存)
  - JWT 认证

Deployment:
  - Vercel / Railway / 飞书云
  - CDN 静态资源
```

---

## 附录

### 环境变量配置

创建 `.env` 文件:

```bash
# Google Gemini API Key
API_KEY=your_gemini_api_key_here

# (未来扩展)
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_here
```

### 常用命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 预览构建结果
npm run preview

# 类型检查
npx tsc --noEmit
```

### 相关文档

- [项目总览](../PROJECT_SUMMARY.md)
- [记忆碎片故事](./memory-fragments-stories.md)
- [Gemini API 文档](https://ai.google.dev/docs)
- [Vite 文档](https://vitejs.dev/)

---

*文档版本: v1.0*
*最后更新: 2026-02-07*
*维护者: VQM Team*
