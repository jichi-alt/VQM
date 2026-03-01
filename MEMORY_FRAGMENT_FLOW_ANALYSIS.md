# 🧩 记忆碎片弹窗 - 完整代码逻辑分析

## 📋 完整运行流程图

```
用户保存答案
    ↓
触发打卡 checkIn()
    ↓
显示打卡成功弹窗 (showCheckInModal = true)
    ↓
用户点击"继续"按钮
    ↓
┌─────────────────────────────────────────┐
│ CheckInSuccessModal.tsx 第190-220行     │
│                                         │
│ onClick={() => {                        │
│   onClose();                            │  关闭打卡弹窗
│   setTimeout(() => {                    │
│     const hasFragment = onUnlock();    │  调用触发函数
│     if (!hasFragment) {                │
│       跳转到历史页面;                    │
│     }                                   │
│   }, 300);                              │
│ }}                                      │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ QuestionVomitMachine.tsx                │
│ tryTriggerMemoryFragment()              │
│ (第521-567行)                          │
│                                         │
│ 1. 检查第21天 → 最终结局                 │
│ 2. 检查里程碑(7/14天) → 里程碑碎片        │
│ 3. 随机获取当前章节碎片                  │
│                                         │
│ 如果找到碎片:                           │
│   setCurrentMemoryFragment(fragment)   │
│   setShowUnlockModal(true)              │
│   return true                           │
│                                         │
│ 如果没找到:                             │
│   return false                          │
└─────────────────────────────────────────┘
    ↓                    ↓
有碎片                没有碎片
    ↓                       ↓
┌─────────────────────┐   跳转到历史页面
│ UnlockMemoryModal    │
│ (解锁弹窗)            │
│ showUnlockModal=true │
└─────────────────────┘
    ↓
用户点击"解锁记忆碎片"
    ↓
┌─────────────────────────────────────────┐
│ handleUnlockMemory()                    │
│ (第570-595行)                          │
│                                         │
│ setShowUnlockModal(false)               │ 关闭解锁弹窗
│ if (currentMemoryFragment) {           │
│   saveViewedFragment(id)                │
│   setTimeout(() => {                    │
│     setShowMemoryModal(true)            │ 显示记忆碎片
│   }, 100);                              │
│ }                                       │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ MemoryFragmentModal                     │
│ (记忆碎片弹窗)                           │
│ showMemoryModal=true                    │
│                                         │
│ 显示机器人记忆内容                       │
└─────────────────────────────────────────┘
    ↓
用户点击关闭
    ↓
handleMemoryModalClose()
    ↓
跳转到历史页面
```

---

## 🔍 核心代码详解

### 1️⃣ 触发函数 (tryTriggerMemoryFragment)

**位置**: `QuestionVomitMachine.tsx` 第521-567行

```typescript
const tryTriggerMemoryFragment = (): boolean => {
  const currentDay = streakData.currentStreak;

  // 优先级1: 第21天 → 最终结局
  if (currentDay >= 21) {
    const finalFragment = MEMORY_FRAGMENTS.find(f => f.id === 'final');
    if (finalFragment && !viewedFragmentIds.includes('final')) {
      setCurrentMemoryFragment(finalFragment);
      setTimeout(() => setShowUnlockModal(true), 0);
      return true;  // ✅ 成功触发
    }
  }

  // 优先级2: 里程碑天数 (7/14天)
  const milestoneFragment = MEMORY_FRAGMENTS.find(
    f => f.isMilestone && f.minDay === currentDay && !viewedFragmentIds.includes(f.id)
  );
  if (milestoneFragment) {
    setCurrentMemoryFragment(milestoneFragment);
    setTimeout(() => setShowUnlockModal(true), 0);
    return true;  // ✅ 成功触发
  }

  // 优先级3: 随机碎片
  const fragment = getRandomFragment(currentDay, viewedFragmentIds);
  if (fragment) {
    setCurrentMemoryFragment(fragment);
    setTimeout(() => setShowUnlockModal(true), 0);
    return true;  // ✅ 成功触发
  }

  // ❌ 没有可用碎片
  return false;
};
```

---

### 2️⃣ 打卡弹窗继续按钮

**位置**: `CheckInSuccessModal.tsx` 第190-220行

```typescript
<button
  onClick={() => {
    console.log('[CheckInSuccessModal] 点击继续按钮');
    onClose();  // 关闭打卡弹窗

    setTimeout(() => {
      try {
        // 🔑 关键：调用 onUnlock (即 tryTriggerMemoryFragment)
        const hasFragment = onUnlock();  // 返回 boolean

        if (!hasFragment) {
          // 没有碎片，跳转历史页面
          window.dispatchEvent(new CustomEvent('qvm-navigate-to-history'));
        }
        // 如果有碎片，什么都不做，等待解锁弹窗自动显示
      } catch (error) {
        console.error('[CheckInSuccessModal] onUnlock 调用失败:', error);
      }
    }, 300);
  }}
>
  继续
</button>
```

---

### 3️⃣ 解锁弹窗处理

**位置**: `QuestionVomitMachine.tsx` 第570-595行

```typescript
const handleUnlockMemory = () => {
  console.log('[handleUnlockMemory] 被调用');
  playSound('unlock');

  // 先关闭解锁弹窗
  setShowUnlockModal(false);

  if (currentMemoryFragment) {
    saveViewedFragment(currentMemoryFragment.id);

    // 延迟显示记忆碎片弹窗
    setTimeout(() => {
      setShowMemoryModal(true);  // 🔑 显示记忆碎片
    }, 100);
  } else {
    // 碎片为空，跳转历史页面
    setTimeout(() => {
      setView('history');
    }, 100);
  }
};
```

---

### 4️⃣ 记忆碎片弹窗

**位置**: `MemoryFragmentModal.tsx` 第15-35行

```typescript
export const MemoryFragmentModal = ({ isOpen, onClose, content, chapter, currentDay }) => {
  console.log('[MemoryFragmentModal] 渲染，isOpen:', isOpen);

  // 🔑 关键：如果 isOpen 为 false，不渲染任何内容
  if (!isOpen) {
    return null;
  }

  // 显示记忆碎片内容
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      {/* 机器人记忆内容 */}
      <p>{content}</p>
      <button onClick={onClose}>关闭</button>
    </div>
  );
};
```

---

## ⚠️ 可能出问题的地方

### 问题1: 打卡弹窗的 onUnlock 未传入

**检查点**: `QuestionVomitMachine.tsx` 第1379行

```typescript
// ❌ 错误示例
<CheckInSuccessModal
  isOpen={showCheckInModal}
  onUnlock={undefined}  // ❌ 未传入函数
/>

// ✅ 正确示例
<CheckInSuccessModal
  isOpen={showCheckInModal}
  onUnlock={tryTriggerMemoryFragment}  // ✅ 传入函数
/>
```

---

### 问题2: getRandomFragment 返回 null

**检查点**: `src/services/memoryFragments.ts` 第192-196行

```typescript
export function getRandomFragment(currentDay: number, viewedIds: string[]): MemoryFragment | null {
  const available = getAvailableFragments(currentDay, viewedIds);
  if (available.length === 0) return null;  // ❌ 没有可用碎片
  return available[Math.floor(Math.random() * available.length)];
}
```

**可能原因**:
- 所有当前章节的碎片都已观看
- `viewedFragmentIds` 数组包含了所有碎片ID

---

### 问题3: showUnlockModal 设置失败

**检查点**: `tryTriggerMemoryFragment` 中的 setTimeout

```typescript
// ⚠️ 可能的问题
setTimeout(() => setShowUnlockModal(true), 0);

// 如果组件在 setTimeout 执行前已经卸载，状态更新会失败
```

---

### 问题4: currentMemoryFragment 为 null

**检查点**: `handleUnlockMemory` 第578行

```typescript
if (currentMemoryFragment) {
  // 显示记忆碎片
} else {
  // currentMemoryFragment 为 null！
  console.error('[handleUnlockMemory] currentMemoryFragment 为空！');
  // 只能跳转到历史页面
}
```

**原因**:
- `tryTriggerMemoryFragment` 返回了 true，但 `setCurrentMemoryFragment` 还没更新
- React 批量更新导致状态不同步

---

## 🐛 调试方法

### 在浏览器控制台查看日志

打开浏览器开发者工具 (F12)，查看 Console 标签：

```
✅ 正常流程应该看到：
[CheckInSuccessModal] 点击继续按钮
[CheckInSuccessModal] onClose 已调用，准备触发 onUnlock
[CheckInSuccessModal] 调用 onUnlock
🧩 尝试触发记忆碎片 {currentDay: 1, viewedFragmentIds: [], ...}
✨ 触发随机碎片 c1-1 内容: 我的星球...
[tryTriggerMemoryFragment] 设置 showUnlockModal = true (random)
[UnlockMemoryModal] 渲染，isOpen: true
[handleUnlockMemory] 被调用
[handleUnlockMemory] 等待 100ms 后显示记忆碎片弹窗
[MemoryFragmentModal] 渲染，isOpen: true
```

```
❌ 异常流程可能看到：
⚠️ 没有可用的碎片
可用碎片检查: {currentDay: 1, viewedFragmentIds: ['c1-1', 'c1-2', ...], ...}
// 或者
[handleUnlockMemory] currentMemoryFragment 为空！
```

---

## 🔧 常见问题修复

### 修复1: 确保有可用碎片

```typescript
// 检查碎片数据
console.log('所有碎片:', MEMORY_FRAGMENTS);
console.log('已观看:', viewedFragmentIds);
console.log('当前天数:', currentDay);
```

### 修复2: 强制触发第一个碎片

```typescript
const tryTriggerMemoryFragment = (): boolean => {
  const currentDay = streakData.currentStreak;

  // 🆕 强制返回第一个碎片（测试用）
  if (currentDay === 1 && viewedFragmentIds.length === 0) {
    const firstFragment = MEMORY_FRAGMENTS.find(f => f.minDay === 1);
    if (firstFragment) {
      setCurrentMemoryFragment(firstFragment);
      setShowUnlockModal(true);
      return true;
    }
  }

  // 原有逻辑...
};
```

### 修复3: 同步状态更新

```typescript
// 不使用 setTimeout，直接设置
const tryTriggerMemoryFragment = (): boolean => {
  const fragment = getRandomFragment(currentDay, viewedFragmentIds);
  if (fragment) {
    setCurrentMemoryFragment(fragment);
    setShowUnlockModal(true);  // ✅ 直接设置
    return true;
  }
  return false;
};
```

---

## 📊 关键状态变量

| 变量 | 类型 | 说明 |
|------|------|------|
| `showCheckInModal` | boolean | 打卡成功弹窗是否显示 |
| `showUnlockModal` | boolean | 解锁弹窗是否显示 |
| `showMemoryModal` | boolean | 记忆碎片弹窗是否显示 |
| `currentMemoryFragment` | MemoryFragment \| null | 当前要显示的碎片 |
| `viewedFragmentIds` | string[] | 已观看的碎片ID列表 |
| `streakData.currentStreak` | number | 当前连续天数 |

---

## 🎯 测试步骤

1. **打开浏览器控制台** (F12)
2. **吐一个问题并保存答案**
3. **观察控制台输出**，应该看到：
   ```
   🎉 打卡成功！连续思考第 X 天
   🎬 显示打卡成功弹窗，天数: X
   ```
4. **点击"继续"按钮**
5. **观察控制台**，应该看到：
   ```
   [CheckInSuccessModal] 点击继续按钮
   🧩 尝试触发记忆碎片
   ✨ 触发XX碎片
   [tryTriggerMemoryFragment] 设置 showUnlockModal = true
   ```
6. **应该看到解锁弹窗出现**
7. **点击"解锁记忆碎片"**
8. **应该看到记忆碎片弹窗出现**

---

## 💡 下一步

告诉我你看到了什么控制台输出，我会根据具体情况帮你修复！

特别是这几行日志：
- `🧩 尝试触发记忆碎片` 后面的数据
- `✨ 触发XX碎片` 或 `⚠️ 没有可用的碎片`
- `[UnlockMemoryModal] 渲染，isOpen: true` 或 false
