# QuestionVomitMachine 组件拆分计划

## 📊 当前状态
- **文件大小**: 2088 行
- **问题**: 难以维护、测试困难、职责不清晰
- **目标**: 拆分为多个小文件，每个文件职责单一

## 🎯 拆分策略

### Phase 1: 提取 Modal 组件
优先级: 🔴 高

| 组件名 | 源文件 | 目标文件 | 说明 |
|--------|--------|----------|------|
| `SilentObserverModal` | QVM.tsx | `modals/SilentObserverModal.tsx` | 确认弹窗 |
| `CheckInSuccessModal` | QVM.tsx | `modals/CheckInSuccessModal.tsx` | 打卡成功弹窗 |
| `UnlockMemoryModal` | QVM.tsx | `modals/UnlockMemoryModal.tsx` | 解锁记忆碎片弹窗 |
| `LoginPromptModal` | QVM.tsx | `modals/LoginPromptModal.tsx` | 登录提示弹窗 |
| `MemoryFragmentModal` | QVM.tsx | `modals/MemoryFragmentModal.tsx` | 记忆碎片展示弹窗 |

### Phase 2: 提取自定义 Hooks
优先级: 🔴 高

| Hook名 | 职责 | 状态管理 |
|--------|------|----------|
| `useAuth` | 用户认证状态 | currentUser, showAuthModal |
| `useStreak` | 打卡数据管理 | streakData, checkInDay |
| `useQuestions` | 问题生成和管理 | currentQuestion, remainingRerolls |
| `useDailyState` | 每日状态管理 | hasVomitedToday, userInput |
| `useViewedFragments` | 记忆碎片管理 | viewedFragmentIds |
| `useArchives` | 回答记录管理 | archives |

### Phase 3: 提取子组件
优先级: 🟡 中

| 组件名 | 职责 |
|--------|------|
| `QuestionCard` | 显示当前问题 |
| `AnswerInput` | 回答输入区域 |
| `StreakProgress` | 打卡进度显示 |
| `ArchiveList` | 历史记录列表 |
| `PrologueScene` | 前言场景（已存在） |

### Phase 4: 简化主组件
优先级: 🟢 低

- 主组件只负责：
  - 组合子组件
  - 路由/视图切换
  - 全局状态协调

## 📁 目标目录结构

```
components/
├── QuestionVomitMachine/
│   ├── index.tsx                    # 主组件（简化后）
│   ├── hooks/                       # 自定义 hooks
│   │   ├── useAuth.ts
│   │   ├── useStreak.ts
│   │   ├── useQuestions.ts
│   │   ├── useDailyState.ts
│   │   ├── useViewedFragments.ts
│   │   └── useArchives.ts
│   ├── modals/                      # 弹窗组件
│   │   ├── CheckInSuccessModal.tsx
│   │   ├── UnlockMemoryModal.tsx
│   │   ├── LoginPromptModal.tsx
│   │   ├── MemoryFragmentModal.tsx
│   │   └── SilentObserverModal.tsx
│   ├── QuestionCard.tsx             # 问题卡片
│   ├── AnswerInput.tsx              # 回答输入
│   ├── StreakProgress.tsx           # 进度显示
│   └── ArchiveList.tsx              # 历史记录
```

## 🚀 实施步骤

### Step 1: 创建目录结构
```bash
mkdir -p components/QuestionVomitMachine/{hooks,modals}
```

### Step 2: 提取 Modal 组件（零风险）
- 纯展示组件，无副作用
- 可以直接复制到新文件

### Step 3: 提取 Hooks（中风险）
- 逐步将状态逻辑移到 hooks
- 保持接口不变
- 每次提取后测试

### Step 4: 提取子组件（低风险）
- 基于已提取的 hooks
- 组件树结构更清晰

### Step 5: 简化主组件
- 移除内联逻辑
- 只保留组合代码

## ✅ 验证标准

每个步骤完成后确保：
- ✅ 功能完全一致
- ✅ 无 console 警告/错误
- ✅ TypeScript 类型正确
- ✅ 测试通过（如果有）

## 📝 注意事项

1. **保持向后兼容**: 每次改动后确保功能正常
2. **渐进式重构**: 不要一次性大改
3. **及时测试**: 每个阶段都要验证
4. **保留备份**: 使用 Git 分支管理

## 🎯 预期成果

- 主组件从 2088 行减少到 ~300 行
- 每个文件 < 200 行
- 职责清晰，易于维护
- 便于单元测试
