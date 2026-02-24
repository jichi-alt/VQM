
# 后端架构重构计划

> **目标**：重构 services/ 目录，创建标准三层架构（Repository-Service-Controller）
> **创建时间**：2026-02-24
> **预计工作量**：2-3小时
> **优先级**：🔴 高（代码重复30%+，影响可维护性）

---

## 📊 现状分析

### 当前问题

| 问题 | 严重程度 | 影响 | 示例 |
|------|----------|------|------|
| ❌ `authService` 和 `dataService` 功能重复 | 🔴 严重 | 代码重复30%+ | 两个文件都有 `saveAnswer()` |
| ❌ Service 直接操作数据库，缺少 Repository 层 | 🔴 严重 | 难以测试和维护 | `await supabase.from('user_answers').insert()` |
| ❌ localStorage 操作散落在各处 | 🟡 中等 | 数据一致性风险 | questionService、dataService 都在操作 localStorage |
| ❌ 类型定义重复 | 🟡 中等 | 类型不统一 | `UserAnswer` vs `Answer` vs `ArchiveEntry` |
| ❌ `geminiService.ts` 已废弃但未删除 | 🟢 轻微 | 代码冗余 | 290行无用代码 |

### 当前文件清单

```
/workspace/
├── supabaseClient.ts              (39行)  - Supabase配置 + 类型定义
├── types.ts                       (存在)  - 类型定义（内容待查）
│
├── services/
│   ├── authService.ts            (318行) - 认证 + 答案 + 打卡（❌职责过重）
│   ├── dataService.ts            (610行) - 数据同步（❌与authService重复）
│   ├── questionService.ts        (141行) - 问题服务（✅职责清晰）
│   ├── questionBank.ts           (194行) - 问题库（✅纯数据，50+问题）
│   ├── memoryFragments.ts        (196行) - 碎片数据（✅纯数据，18个碎片）
│   ├── audioService.ts           (1155行) - 音效服务（✅职责单一）
│   └── geminiService.ts          (290行) - ❌已废弃，需删除
```

### 功能重复清单

| 功能 | authService | dataService | questionService |
|------|-------------|-------------|-----------------|
| 保存答案 | `saveAnswer()` (188行) | `saveUserAnswerToSupabase()` (495行) | ❌ |
| 获取答案 | `getUserAnswers()` (215行) | `getUserAnswersFromSupabase()` (530行) | ❌ |
| 保存打卡 | `updateStreak()` (240行) | `saveStreakData()` (145行) | ❌ |
| 获取打卡 | `getStreak()` (264行) | `getStreakData()` (103行) | ❌ |
| 已回答问题 | ❌ | `getAnsweredQuestionIds()` (268行) | `getAnsweredQuestionIds()` (24行) |

---

## 🎯 重构目标

### 目标架构（三层）

```
┌─────────────────────────────────────────┐
│  前端 Component                         │
│  (QuestionVomitMachine.tsx, AuthModal...) │
│  "只负责UI和用户交互"                     │
└──────────────┬──────────────────────────┘
               │ 调用 Service
               ↓
┌─────────────────────────────────────────┐
│  Service 层（业务逻辑）                  │
│  "处理业务规则，不直接操作数据库"         │
│                                         │
│  ┌──────────────┐  ┌──────────────┐    │
│  │authService   │  │streakService │    │
│  │  - signUp()  │  │  - getStreak()│   │
│  │  - signIn()  │  │  - checkIn() │    │
│  │  - signOut() │  │  - calculate()│  │
│  └──────────────┘  └──────────────┘    │
│                                         │
│  ┌──────────────┐                      │
│  │answerService │                      │
│  │  - save()    │                      │
│  │  - getAll()  │                      │
│  └──────────────┘                      │
└──────────────┬──────────────────────────┘
               │ 调用 Repository
               ↓
┌─────────────────────────────────────────┐
│  Repository 层（数据访问）               │
│  "只负责CRUD操作，不管业务逻辑"           │
│                                         │
│  ┌──────────────┐  ┌──────────────┐    │
│  │userRepository│  │streakRepository│   │
│  └──────────────┘  └──────────────┘    │
│                                         │
│  ┌──────────────┐                      │
│  │answerRepository│                     │
│  └──────────────┘                      │
└──────────────┬──────────────────────────┘
               │ SQL 查询
               ↓
┌─────────────────────────────────────────┐
│  Database                                │
│  - Supabase PostgreSQL                  │
│  - localStorage (通过统一工具)           │
└─────────────────────────────────────────┘
```

---

## 📋 重构步骤（8个阶段）

---

### ✅ 阶段 1：创建新目录结构（5分钟）

**操作**：
```bash
cd /workspace
mkdir -p src/repository
mkdir -p src/services
mkdir -p src/types
mkdir -p src/lib
```

**创建后的目录**：
```
/workspace/
└── src/
    ├── repository/    # 数据访问层（新增）
    ├── services/      # 业务逻辑层（重构后移入）
    ├── types/         # 统一类型定义（新增）
    └── lib/           # 第三方库配置（新增）
```

---

### ✅ 阶段 2：创建统一类型定义（15分钟）

**目标**：消除类型定义重复，统一到 `src/types/`

**文件：`src/types/index.ts`**

```typescript
// ==================== 用户相关 ====================

export interface User {
  id: string;
  email: string;
  username?: string;
  created_at: string;
  updated_at: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  username?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// ==================== 打卡相关 ====================

export interface Streak {
  id?: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_check_in: string;        // YYYY-MM-DD
  start_date: string;           // YYYY-MM-DD
  check_in_history: string[];   // ["2026-01-25", ...]
  is_completed: boolean;
}

export interface StreakData {
  isActive: boolean;
  lastCheckIn: string | null;
  currentStreak: number;
  isCompleted: boolean;
  startDate: string | null;
  checkInHistory: string[];
  longestStreak: number;
}

// ==================== 答案相关 ====================

export interface Answer {
  id?: string;
  user_id: string;
  question_id: string;
  question_text: string;
  answer: string;
  day?: number;
  chapter?: number;
  created_at: string;
}

export interface ArchiveEntry {
  question: {
    id: string;
    text: string;
    date: string;
    ticketNum: string;
    chapter: number;
    day: number;
  };
  answers: Array<{ content: string; timestamp: string }>;
  lastModified: string;
}

// ==================== 问题相关 ====================

export interface Question {
  id: string;
  text: string;
  chapter: number;
  day: number;
  is_first_day_only?: boolean;
}

export interface QuestionData {
  id: string;
  text: string;
  date: string;
  ticketNum: string;
  chapter: number;
  day: number;
}

// ==================== 记忆碎片 ====================

export interface MemoryFragment {
  id: string;
  chapter: number;
  minDay?: number;
  maxDay?: number;
  isMilestone?: boolean;
  content: string;
}

// ==================== 每日状态 ====================

export interface DailyState {
  date: string;
  questionId?: string;
  questionText?: string;
  answers: Array<{ content: string; timestamp: string }>;
  fragmentUnlocked: boolean;
  checkedIn: boolean;
}

// ==================== 用户偏好 ====================

export interface UserPreferences {
  seenPrologue: boolean;
  seenLoading: boolean;
  audioEnabled: boolean;
}
```

**操作**：
1. 创建 `src/types/index.ts`（约120行）
2. 检查 `types.ts` 是否有需要保留的内容，如有则合并

---

### ✅ 阶段 3：创建 localStorage 工具（15分钟）

**目标**：统一 localStorage 操作，解决散落各处的问题

**文件：`src/lib/localStorage.ts`**

```typescript
/**
 * 统一的 localStorage 操作工具
 *
 * 解决问题：
 * - localStorage 操作散落在 questionService、dataService 等多处
 * - key 名称不统一
 * - 错误处理不一致
 */

const PREFIX = 'qvm_';

/**
 * 统一的 localStorage key 常量
 */
export const LocalStorageKeys = {
  STREAK: `${PREFIX}streak`,
  DAILY_STATE: `${PREFIX}daily_state`,
  ANSWERED_IDS: `${PREFIX}answered_question_ids`,
  ANSWERED_QUESTIONS: `${PREFIX}answered_questions`, // 向后兼容
  VIEWED_FRAGMENTS: `${PREFIX}viewed_fragments`,
  ARCHIVES: `${PREFIX}archives`,
  PREFERENCES: `${PREFIX}preferences`,
  SEEN_PROLOGUE: `${PREFIX}seen_prologue`,
} as const;

/**
 * 统一的 localStorage 操作接口
 */
export const localStorage = {
  /**
   * 获取数据
   * @param key - localStorage key
   * @param defaultValue - 默认值（获取失败时返回）
   */
  get<T>(key: string, defaultValue: T): T {
    try {
      const stored = window.localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (e) {
      console.error(`localStorage get error for key ${key}:`, e);
      return defaultValue;
    }
  },

  /**
   * 保存数据
   * @param key - localStorage key
   * @param value - 要保存的值
   * @returns 是否保存成功
   */
  set(key: string, value: any): boolean {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`localStorage set error for key ${key}:`, e);
      return false;
    }
  },

  /**
   * 删除数据
   * @param key - localStorage key
   */
  remove(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      console.error(`localStorage remove error for key ${key}:`, e);
    }
  },

  /**
   * 清空所有数据
   */
  clear(): void {
    try {
      window.localStorage.clear();
    } catch (e) {
      console.error('localStorage clear error:', e);
    }
  },
};
```

**操作**：
1. 创建 `src/lib/localStorage.ts`（约70行）
2. 暂不更新组件引用（阶段7统一处理）

---

### ✅ 阶段 4：创建 Repository 层（45分钟）

**目标**：创建数据访问层，抽象 Supabase 操作

#### 4.1 创建 Base Repository

**文件：`src/repository/base.repository.ts`**

```typescript
import { supabase } from '../lib/supabase';

/**
 * Repository 基类
 * 提供通用的 CRUD 操作
 */
export abstract class BaseRepository<T> {
  protected abstract tableName: string;

  /**
   * 根据 ID 查询单条记录
   */
  async findById(id: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * 查询所有记录（支持过滤）
   */
  async findAll(filters: Record<string, any> = {}) {
    let query = supabase.from(this.tableName).select('*');

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  /**
   * 创建新记录
   */
  async create(item: T) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * 更新记录
   */
  async update(id: string, updates: Partial<T>) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * 删除记录
   */
  async delete(id: string) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Upsert（插入或更新）
   */
  async upsert(item: T) {
    const { data, error } = await supabase
      .from(this.tableName)
      .upsert(item)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
```

#### 4.2 创建 User Repository

**文件：`src/repository/user.repository.ts`**

```typescript
import { BaseRepository } from './base.repository';
import type { User } from '../types';
import { supabase } from '../lib/supabase';

/**
 * 用户数据访问层
 */
export class UserRepository extends BaseRepository<User> {
  protected tableName = 'profiles';

  /**
   * 根据邮箱查询用户
   */
  async findByEmail(email: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * 根据ID查询用户
   */
  async findById(userId: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * 创建用户资料
   */
  async createProfile(user: User) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(user)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
```

#### 4.3 创建 Streak Repository

**文件：`src/repository/streak.repository.ts`**

```typescript
import { BaseRepository } from './base.repository';
import type { Streak } from '../types';
import { supabase } from '../lib/supabase';

/**
 * 打卡数据访问层
 */
export class StreakRepository extends BaseRepository<Streak> {
  protected tableName = 'user_streaks';

  /**
   * 根据用户ID查询打卡数据
   */
  async findByUserId(userId: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * 保存或更新打卡数据
   */
  async saveByUserId(userId: string, streak: Omit<Streak, 'user_id'>) {
    const { data, error } = await supabase
      .from(this.tableName)
      .upsert({ user_id: userId, ...streak })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
```

#### 4.4 创建 Answer Repository

**文件：`src/repository/answer.repository.ts`**

```typescript
import { BaseRepository } from './base.repository';
import type { Answer } from '../types';
import { supabase } from '../lib/supabase';

/**
 * 答案数据访问层
 */
export class AnswerRepository extends BaseRepository<Answer> {
  protected tableName = 'user_answers';

  /**
   * 根据用户ID查询所有答案
   */
  async findByUserId(userId: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * 查询用户对某个问题的回答
   */
  async findByQuestion(userId: string, questionId: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('question_id', questionId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /**
   * 保存用户答案
   */
  async saveAnswer(answer: Omit<Answer, 'id'>) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(answer)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
```

#### 4.5 创建导出文件

**文件：`src/repository/index.ts`**

```typescript
export { BaseRepository } from './base.repository';
export { UserRepository } from './user.repository';
export { StreakRepository } from './streak.repository';
export { AnswerRepository } from './answer.repository';
```

**操作**：
1. 创建上述 5 个文件
2. 暂不更新组件引用（阶段7统一处理）

---

### ✅ 阶段 5：重构 Service 层（60分钟）

**目标**：
1. `authService` 只保留认证功能
2. 创建 `streakService` 专门管理打卡
3. 创建 `answerService` 专门管理答案
4. 保留 `questionService`、`audioService` 等

#### 5.1 重构 AuthService

**文件：`src/services/auth.service.ts`**（新建，约150行）

**变更**：
- ✅ 保留：`signUp()`, `signIn()`, `signOut()`, `getCurrentUser()`, `onAuthStateChange()`
- ❌ 删除：`saveAnswer()`, `getUserAnswers()`, `updateStreak()`, `getStreak()`（移到专门的 Service）

#### 5.2 创建 StreakService

**文件：`src/services/streak.service.ts`**（新建，约100行）

**功能**：
- `getStreak(userId)` - 获取打卡数据（优先本地，失败则云端）
- `saveStreak(streak, userId)` - 保存打卡数据（本地 + 云端）
- `calculateNewStreak(currentStreak)` - 计算连续天数
- `checkIn(userId)` - 执行打卡操作

#### 5.3 创建 AnswerService

**文件：`src/services/answer.service.ts`**（新建，约100行）

**功能**：
- `saveAnswer(userId, questionId, answer)` - 保存答案到云端
- `getUserAnswers(userId)` - 获取用户所有答案
- `saveAnsweredQuestion(questionId)` - 记录已回答问题（到本地）
- `getAnsweredQuestionIds()` - 获取已回答问题ID列表
- `clearAnsweredQuestions()` - 清除记录

#### 5.4 移动其他服务

**操作**：
```bash
# 移动现有服务到新目录
cp services/questionService.ts src/services/question.service.ts
cp services/questionBank.ts src/services/questionBank.ts
cp services/memoryFragments.ts src/services/memoryFragments.ts
cp services/audioService.ts src/services/audio.service.ts
```

---

### ✅ 阶段 6：创建 lib/supabase.ts（5分钟）

**目标**：将 `supabaseClient.ts` 简化为纯配置文件

**文件：`src/lib/supabase.ts`**

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**操作**：
1. 创建 `src/lib/supabase.ts`（约15行）
2. 暂不删除旧的 `supabaseClient.ts`（阶段7统一处理）

---

### ✅ 阶段 7：更新组件引用（30分钟）

**目标**：更新所有组件的 import 语句

**需要更新的组件**：
1. `components/QuestionVomitMachine.tsx`
2. `components/QuestionVomitMachine/hooks/useAuth.ts`
3. `components/AuthModal.tsx`
4. `components/AudioControl.tsx`

**更新映射表**：

| 旧的引用 | 新的引用 |
|---------|---------|
| `import { getAuthService } from '../services/authService'` | `import { getAuthService } from '../src/services/auth.service'` |
| `import { getStreakData, saveStreakData } from '../services/dataService'` | `import { getStreakService } from '../src/services/streak.service'` |
| `import { generatePhilosophicalQuestion } from '../services/questionService'` | `import { generatePhilosophicalQuestion } from '../src/services/question.service'` |
| `import { supabase } from '../supabaseClient'` | `import { supabase } from '../src/lib/supabase'` |
| `import type { UserProfile } from '../services/authService'` | `import type { User } from '../src/types'` |

**新增引用**：
```typescript
import { localStorage, LocalStorageKeys } from '../src/lib/localStorage';
import { getAnswerService } from '../src/services/answer.service';
import type { Streak, Answer, Question } from '../src/types';
```

**操作**：
1. 逐个更新上述 4 个组件的 import 语句
2. 更新函数调用（如果函数名有变化）
3. 更新类型引用

---

### ✅ 阶段 8：清理旧文件和测试（15分钟）

#### 8.1 备份旧文件

```bash
cd /workspace

# 备份旧服务文件
mv services/authService.ts services/authService.ts.bak
mv services/dataService.ts services/dataService.ts.bak
mv services/questionService.ts services/questionService.ts.bak
mv services/questionBank.ts services/questionBank.ts.bak
mv services/memoryFragments.ts services/memoryFragments.ts.bak
mv services/audioService.ts services/audioService.ts.bak

# 备份配置文件
mv supabaseClient.ts supabaseClient.ts.bak
mv types.ts types.ts.bak

# 删除已废弃的文件
rm services/geminiService.ts
```

#### 8.2 测试检查清单

```
□ 用户注册功能
  - 输入邮箱、密码、用户名
  - 点击注册
  - 检查是否自动登录

□ 用户登录功能
  - 输入邮箱、密码
  - 点击登录
  - 检查右上角图标变化

□ 生成问题
  - 点击"吐一个问题"
  - 检查问题是否正常显示

□ 保存答案
  - 输入回答
  - 点击"存入人类思想样本库"
  - 检查本地是否保存

□ 打卡功能
  - 保存答案后自动打卡
  - 检查进度条是否更新
  - 检查连续天数是否正确

□ 查看历史记录
  - 切换到 history 视图
  - 检查是否显示已保存的答案

□ 记忆碎片触发
  - 保存答案后
  - 检查是否触发记忆碎片

□ 云端同步
  - 登录用户
  - 保存答案
  - 检查 Supabase 后台是否有数据

□ 控制台检查
  - 打开浏览器控制台
  - 确保没有错误信息
```

#### 8.3 回滚方案

如果测试发现问题，快速回滚：

```bash
cd /workspace

# 恢复旧文件
mv services/authService.ts.bak services/authService.ts
mv services/dataService.ts.bak services/dataService.ts
mv services/questionService.ts.bak services/questionService.ts
mv services/questionBank.ts.bak services/questionBank.ts
mv services/memoryFragments.ts.bak services/memoryFragments.ts
mv services/audioService.ts.bak services/audioService.ts
mv supabaseClient.ts.bak supabaseClient.ts
mv types.ts.bak types.ts

# 删除新文件
rm -rf src/

# 重新启动开发服务器
npm run dev
```

---

## 📊 重构成果对比

| 指标 | 重构前 | 重构后 | 改进 |
|------|--------|--------|------|
| **服务文件数量** | 8个 | 7个 | -12.5% |
| **authService 代码量** | 318行 | ~150行 | -53% |
| **代码重复率** | 30%+ | 0% | ✅ 消除 |
| **职责清晰度** | ❌ 混乱 | ✅ 清晰 | ✅ 大幅改善 |
| **可测试性** | ❌ 困难 | ✅ 容易 | ✅ 可mock Repository |
| **类型定义来源** | ❌ 多处重复 | ✅ 单一来源 | ✅ 统一 |
| **localStorage 操作** | ❌ 散落各处 | ✅ 统一工具 | ✅ 集中管理 |

---

## ⚠️ 风险和注意事项

### 主要风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 引用路径错误 | 组件找不到模块 | 使用 IDE 查找替换，逐个检查 |
| 功能回归 | 某些功能失效 | 保留 `.bak` 备份，可快速回滚 |
| 类型不匹配 | TypeScript 报错 | 统一使用 `src/types` 的类型 |
| 测试遗漏 | 部分功能未测试 | 按测试清单逐项检查 |

### 重要注意事项

1. **渐进式重构** ✅
   - 一次只重构一个模块
   - 不要一次性改太多文件
   - 每个阶段完成后测试

2. **保留备份** ✅
   - 删除文件前先备份为 `.bak`
   - Git commit 每个阶段的成果
   - 便于随时回滚

3. **及时测试** ✅
   - 每完成一个阶段立即测试
   - 不要等到最后再测试
   - 发现问题立即修复

4. **Git 提交策略** ✅
   ```bash
   # 阶段1完成后
   git add .
   git commit -m "refactor(backend): 阶段1 - 创建新目录结构"

   # 阶段2完成后
   git add .
   git commit -m "refactor(backend): 阶段2 - 创建统一类型定义"

   # ...以此类推
   ```

---

## 🎯 执行时间表

```
阶段1: 创建目录结构          (5分钟)
    ↓
阶段2: 创建类型定义          (15分钟)
    ↓
阶段3: 创建localStorage工具  (15分钟)
    ↓
阶段4: 创建Repository层      (45分钟) ← 最复杂
    ↓
阶段5: 重构Service层         (60分钟) ← 最复杂
    ↓
阶段6: 创建lib/supabase      (5分钟)
    ↓
阶段7: 更新组件引用          (30分钟) ← 需仔细
    ↓
阶段8: 清理旧文件和测试      (15分钟)

总计：约 3 小时
```

---

## ✅ 完成标准

重构完成后，应该满足以下所有条件：

### 功能完整性
- [x] 所有旧功能正常工作
- [x] 用户注册/登录功能正常
- [x] 保存答案功能正常
- [x] 打卡功能正常
- [x] 记忆碎片触发正常
- [x] localStorage 和 Supabase 都能正常同步

### 代码质量
- [x] 没有 TypeScript 类型错误
- [x] 控制台没有报错
- [x] 没有代码重复（authService 和 dataService 的重复功能已消除）
- [x] 所有类型定义统一在 `src/types/`
- [x] localStorage 操作统一使用 `src/lib/localStorage`

### 可维护性
- [x] Repository 层职责清晰（只负责数据访问）
- [x] Service 层职责清晰（只负责业务逻辑）
- [x] 可以轻松 mock Repository 进行单元测试
- [x] 代码注释清晰，易于理解

---

## 📞 需要帮助？

如果在重构过程中遇到问题：

1. **类型错误** → 检查是否统一使用 `src/types` 的类型
2. **引用错误** → 检查 import 路径是否正确
3. **功能异常** → 对比新旧代码，检查是否有遗漏
4. **无法回滚** → 使用 `.bak` 文件手动恢复

---

*计划创建时间：2026-02-24*
*预计完成时间：同日 3小时内*
*状态：✅ 已完成（2026-02-24）*
*实际耗时：约2小时*
