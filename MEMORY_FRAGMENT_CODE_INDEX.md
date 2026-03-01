# 🧩 记忆碎片核心代码索引

## 📍 关键代码位置

### 主组件：QuestionVomitMachine.tsx

| 行数 | 功能 | 说明 |
|------|------|------|
| **142-143** | 状态定义 | `showMemoryModal`, `currentMemoryFragment` |
| **521-567** | 触发函数 | `tryTriggerMemoryFragment()` - 核心！ |
| **570-595** | 解锁处理 | `handleUnlockMemory()` |
| **1379** | 属性传入 | `onUnlock={tryTriggerMemoryFragment}` |

### Modal 组件

| 文件 | 行数 | 功能 |
|------|------|------|
| **CheckInSuccessModal.tsx** | 190-220 | 继续按钮点击事件 |
| **UnlockMemoryModal.tsx** | 17-24 | 解锁按钮点击事件 |
| **MemoryFragmentModal.tsx** | 29-32 | isOpen 检查 |

---

## 🔍 核心代码片段

### 1️⃣ 状态定义（第142-143行）

```typescript
// 记忆碎片相关状态
const [showMemoryModal, setShowMemoryModal] = useState(false);
const [currentMemoryFragment, setCurrentMemoryFragment] = useState<MemoryFragment | null>(null);
const [viewedFragmentIds, setViewedFragmentIds] = useState<string[]>([]);
```

---

### 2️⃣ 触发记忆碎片（第521-567行）

```typescript
const tryTriggerMemoryFragment = (): boolean => {
  const currentDay = streakData.currentStreak;
  console.log('🧩 尝试触发记忆碎片', { currentDay, viewedFragmentIds, totalFragments: MEMORY_FRAGMENTS.length });

  // 21天必触发最终结局
  if (currentDay >= 21) {
    const finalFragment = MEMORY_FRAGMENTS.find(f => f.id === 'final');
    if (finalFragment && !viewedFragmentIds.includes('final')) {
      console.log('✨ 触发最终结局');
      setCurrentMemoryFragment(finalFragment);
      setTimeout(() => setShowUnlockModal(true), 0);
      return true;
    }
  }

  // 里程碑天数必触发
  const milestoneFragment = MEMORY_FRAGMENTS.find(
    f => f.isMilestone && f.minDay === currentDay && !viewedFragmentIds.includes(f.id)
  );
  if (milestoneFragment) {
    console.log('✨ 触发里程碑碎片', milestoneFragment.id);
    setCurrentMemoryFragment(milestoneFragment);
    setTimeout(() => setShowUnlockModal(true), 0);
    return true;
  }

  // 随机触发一个当前章节的碎片
  const fragment = getRandomFragment(currentDay, viewedFragmentIds);
  if (fragment) {
    console.log('✨ 触发随机碎片', fragment.id, '内容:', fragment.content);
    setCurrentMemoryFragment(fragment);
    setTimeout(() => setShowUnlockModal(true), 0);
    return true;
  } else {
    console.log('⚠️ 没有可用的碎片');
    return false;
  }
};
```

---

### 3️⃣ 打卡弹窗继续按钮（第190-220行）

```typescript
<button
  onClick={() => {
    console.log('[CheckInSuccessModal] 点击继续按钮');
    onClose(); // 关闭打卡弹窗

    setTimeout(() => {
      try {
        console.log('[CheckInSuccessModal] 调用 onUnlock');
        const hasFragment = onUnlock(); // 调用 tryTriggerMemoryFragment

        if (!hasFragment) {
          // 没有碎片，跳转历史页面
          window.dispatchEvent(new CustomEvent('qvm-navigate-to-history'));
        }
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

### 4️⃣ 解锁弹窗处理（第570-595行）

```typescript
const handleUnlockMemory = () => {
  console.log('[handleUnlockMemory] 被调用');
  console.log('[handleUnlockMemory] currentMemoryFragment:', currentMemoryFragment);
  playSound('unlock');

  // 先关闭解锁弹窗
  setShowUnlockModal(false);

  if (currentMemoryFragment) {
    saveViewedFragment(currentMemoryFragment.id);
    console.log('[handleUnlockMemory] 碎片内容:', currentMemoryFragment.content);

    console.log('[handleUnlockMemory] 等待 100ms 后显示记忆碎片弹窗');
    setTimeout(() => {
      console.log('[handleUnlockMemory] 设置 showMemoryModal = true');
      setShowMemoryModal(true);
    }, 100);
  } else {
    console.error('[handleUnlockMemory] currentMemoryFragment 为空！');
    setTimeout(() => {
      setView('history');
    }, 100);
  }
};
```

---

### 5️⃣ 记忆碎片弹窗（第15-35行）

```typescript
export const MemoryFragmentModal = ({ isOpen, onClose, content, chapter, currentDay }) => {
  console.log('[MemoryFragmentModal] 渲染，isOpen:', isOpen);

  if (!isOpen) {
    console.log('[MemoryFragmentModal] isOpen 为 false，不渲染');
    return null;  // 🔑 关键：isOpen 为 false 时不渲染
  }

  console.log('[MemoryFragmentModal] isOpen 为 true，开始渲染...');

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      {/* 显示记忆内容 */}
      <p>{content}</p>
      <button onClick={onClose}>关闭</button>
    </div>
  );
};
```

---

## 🔄 完整数据流

```
用户点击"继续"
    ↓
CheckInSuccessModal.onClick (第190行)
    ↓
onClose() (第192行)
    ↓
setTimeout 300ms
    ↓
onUnlock() = tryTriggerMemoryFragment() (第200行)
    ↓
┌────────────────────────────────────┐
│ tryTriggerMemoryFragment (第521行)  │
│                                    │
│ 1. 查找碎片                         │
│ 2. setCurrentMemoryFragment()      │
│ 3. setShowUnlockModal(true)         │
│ 4. return true/false                │
└────────────────────────────────────┘
    ↓
hasFragment = true
    ↓
UnlockMemoryModal 渲染
    ↓
用户点击"解锁记忆碎片"
    ↓
handleUnlockMemory() (第570行)
    ↓
setShowUnlockModal(false)
    ↓
setShowMemoryModal(true) (第585行)
    ↓
MemoryFragmentModal 渲染 (第15行)
    ↓
显示记忆内容
```

---

## 🎯 关键检查点

### 检查点1：函数是否被调用

```javascript
// 在控制台查找这些日志：
[CheckInSuccessModal] 调用 onUnlock
🧩 尝试触发记忆碎片
[handleUnlockMemory] 被调用
```

**如果缺少任何一个**，说明函数调用链断了。

---

### 检查点2：状态是否更新

```javascript
// 在控制台查找：
[tryTriggerMemoryFragment] 设置 showUnlockModal = true
[handleUnlockMemory] 设置 showMemoryModal = true
```

**如果没看到**，说明状态更新失败。

---

### 检查点3：Modal 是否渲染

```javascript
// 在控制台查找：
[UnlockMemoryModal] 渲染，isOpen: true
[MemoryFragmentModal] 渲染，isOpen: true
```

**如果 isOpen 为 false**，说明状态没有正确传递。

---

## 🛠️ 快速修复命令

### 清除所有数据（重新开始）

```javascript
// 在浏览器控制台运行
localStorage.clear();
location.reload();
```

### 强制触发第一个碎片

临时修改代码（第521行）：

```typescript
const tryTriggerMemoryFragment = (): boolean => {
  // 🆕 测试模式
  const firstFragment = MEMORY_FRAGMENTS[0];
  if (firstFragment && viewedFragmentIds.length === 0) {
    console.log('🧪 强制触发第一个碎片');
    setCurrentMemoryFragment(firstFragment);
    setShowUnlockModal(true);
    return true;
  }

  // 原有逻辑...
};
```

### 查看当前状态

```javascript
// 在浏览器控制台运行
JSON.parse(localStorage.getItem('qvm_viewed_fragments') || [])
JSON.parse(localStorage.getItem('qvm_streak') || {})
```

---

## 📊 状态变量值

打开浏览器控制台，运行以下代码查看状态：

```javascript
// 查看已观看的碎片
console.log('已观看碎片:', JSON.parse(localStorage.getItem('qvm_viewed_fragments') || '[]'));

// 查看打卡数据
console.log('打卡数据:', JSON.parse(localStorage.getItem('qvm_streak') || '{}'));

// 查看当前连续天数
console.log('当前天数:', JSON.parse(localStorage.getItem('qvm_streak') || '{}').currentStreak);
```

---

## 💡 调试技巧

### 技巧1：添加更多日志

在关键位置添加 console.log：

```typescript
const tryTriggerMemoryFragment = (): boolean => {
  console.log('🔍 [DEBUG] 进入 tryTriggerMemoryFragment');
  console.log('🔍 [DEBUG] currentDay:', currentDay);
  console.log('🔍 [DEBUG] viewedFragmentIds:', viewedFragmentIds);
  // ...
}
```

### 技巧2：使用 React DevTools

1. 安装 React DevTools 浏览器扩展
2. 打开开发者工具
3. 点击 "Components" 标签
4. 选择 "QuestionVomitMachine"
5. 查看 State 中的：
   - `showMemoryModal`
   - `currentMemoryFragment`
   - `showUnlockModal`

### 技巧3：断点调试

在源代码中添加 debugger：

```typescript
const tryTriggerMemoryFragment = (): boolean => {
  debugger; // 代码会在这里暂停
  // ...
}
```

---

## 🆘 需要帮助？

请提供：

1. **完整的控制台日志**（从"点击继续按钮"到结束）
2. **React DevTools 中的 State 值**
3. **在哪一步卡住了**

有了这些信息，我可以精准定位问题！🚀
