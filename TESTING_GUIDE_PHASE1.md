# 🧪 阶段1测试指南

## 📋 测试步骤

### 第1步：打开浏览器控制台

1. 访问 http://localhost:3000/
2. 按 **F12** 打开开发者工具
3. 点击 **Console** 标签

---

### 第2步：检查现有数据

**复制粘贴以下代码到控制台，按回车运行**：

```javascript
// 检查所有记忆碎片相关数据
console.log('════════════════════════════════════════');
console.log('   记忆碎片数据检查');
console.log('════════════════════════════════════════');

// 1. 旧格式数据
console.log('\n[1] 旧格式数据 (qvm_viewed_fragments):');
const oldData = localStorage.getItem('qvm_viewed_fragments');
if (oldData) {
  const parsed = JSON.parse(oldData);
  console.log('✅ 找到旧数据:', parsed);
  console.log('   数量:', parsed.length, '个碎片');
} else {
  console.log('⚪  没有旧数据');
}

// 2. 新格式数据
console.log('\n[2] 新格式数据 (qvm_memory_v2):');
const newData = localStorage.getItem('qvm_memory_v2');
if (newData) {
  const parsed = JSON.parse(newData);
  console.log('✅ 找到新数据');
  console.log('   碎片数量:', Object.keys(parsed.fragments).length);
  console.log('   当前章节:', parsed.currentChapter);
  console.log('   已解锁ID:', Object.keys(parsed.fragments));
} else {
  console.log('⚪  没有新数据（还没使用过新服务）');
}

// 3. 打卡数据
console.log('\n[3] 打卡数据 (qvm_streak):');
const streakData = localStorage.getItem('qvm_streak');
if (streakData) {
  const parsed = JSON.parse(streakData);
  console.log('✅ 当前连续天数:', parsed.currentStreak);
  console.log('✅ 是否完成21天:', parsed.isCompleted);
} else {
  console.log('⚪  没有打卡数据');
}

console.log('\n════════════════════════════════════════');
console.log('   数据检查完成');
console.log('════════════════════════════════════════');
```

---

### 第3步：理解现有数据

你会看到类似这样的输出：

#### 情况A：全新用户（没有数据）
```
[1] 旧格式数据:
⚪  没有旧数据

[2] 新格式数据:
⚪  没有新数据（还没使用过新服务）

[3] 打卡数据:
⚪  没有打卡数据
```

**含义**：你是全新用户，还没有任何数据。

---

#### 情况B：老用户（有旧数据）
```
[1] 旧格式数据:
✅ 找到旧数据: ["c1-1", "c1-2", "c1-3"]
   数量: 3 个碎片

[2] 新格式数据:
⚪  没有新数据（还没使用过新服务）

[3] 打卡数据:
✅ 当前连续天数: 3
✅ 是否完成21天: false
```

**含义**：你已经有3个碎片数据了，会在下次使用新服务时自动迁移。

---

#### 情况C：已经使用过新服务
```
[1] 旧格式数据:
⚪  没有旧数据

[2] 新格式数据:
✅ 找到新数据
   碎片数量: 3
   当前章节: 1
   已解锁ID: ["c1-1", "c1-2", "c1-3"]

[3] 打卡数据:
✅ 当前连续天数: 3
```

**含义**：你已经使用过新服务，有完整的数据记录。

---

## 📊 数据说明

### 现有数据有哪些？

#### 1. **旧格式数据** (`qvm_viewed_fragments`)
```json
["c1-1", "c1-2", "c1-3"]
```

**内容**：已解锁碎片的ID列表

**问题**：
- ❌ 不知道何时解锁的
- ❌ 不知道看了几次
- ❌ 无法收藏

---

#### 2. **新格式数据** (`qvm_memory_v2`)
```json
{
  "fragments": {
    "c1-1": {
      "id": "c1-1",
      "chapter": 1,
      "unlockedAt": "2026-03-01T10:30:00.000Z",
      "unlockReason": "random",
      "day": 1,
      "viewCount": 2,
      "isFavorite": false
    }
  },
  "currentChapter": 1,
  "lastUnlockedDay": 3
}
```

**优势**：
- ✅ 知道何时解锁的
- ✅ 统计查看次数
- ✅ 支持收藏功能

---

## 🧪 测试新服务功能

### 测试1：清空数据重新开始

```javascript
// 清空所有记忆碎片数据
localStorage.removeItem('qvm_viewed_fragments');
localStorage.removeItem('qvm_memory_v2');
console.log('✅ 数据已清空，可以重新开始测试');
```

---

### 测试2：模拟数据迁移

```javascript
// 模拟旧数据
localStorage.setItem('qvm_viewed_fragments', JSON.stringify(['c1-1', 'c1-2']));
console.log('✅ 已设置旧数据，下次使用服务时会自动迁移');
```

---

### 测试3：查看所有碎片列表

```javascript
// 查看所有22个碎片
console.log('所有碎片列表：');
const allFragments = [
  'c1-1', 'c1-2', 'c1-3', 'c1-4', 'c1-5', 'c1-6',  // 第1章
  'c2-1', 'c2-2', 'c2-3', 'c2-4', 'c2-5', 'c2-6',  // 第2章
  'milestone-7',                                     // 第7天里程碑
  'c3-1', 'c3-2', 'c3-3', 'c3-4', 'c3-5', 'c3-6',  // 第3章
  'milestone-14',                                    // 第14天里程碑
  'final'                                            // 最终章
];
console.log('总碎片数:', allFragments.length);
console.log('碎片ID:', allFragments);
```

---

## ❓ 请告诉我你的情况

请把上面"第2步"的代码复制到浏览器控制台运行，然后告诉我：

### 问题1：你看到了什么？

- A) 全是"⚪ 没有数据" → 我是全新用户
- B) 有旧数据 ["c1-1", "c1-2"...] → 我已经有碎片了
- C) 有新格式数据 → 我已经用过新服务了

### 问题2：你想怎么处理？

- **选项1**：保留现有数据，继续使用（自动迁移）
- **选项2**：清空所有数据，从零开始测试

### 问题3：确认后我会：

**如果选择保留数据**：
- ✅ 确保旧数据能正常迁移
- ✅ 修改主组件使用新服务
- ✅ 进入阶段2（核心功能）

**如果选择清空数据**：
- ✅ 帮你清空 localStorage
- ✅ 从零开始测试新功能
- ✅ 进入阶段2（核心功能）

---

## 🎯 下一步

**等你回复后，我会**：
1. 根据你的选择处理数据
2. 开始阶段2：修改主组件
3. 实现按天顺序触发
4. 创建记忆博物馆组件

**现在请运行检查脚本，告诉我结果！** 🚀
