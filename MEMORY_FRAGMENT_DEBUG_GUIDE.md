# 🧩 记忆碎片弹窗调试指南

## ✅ 诊断结果

所有核心组件都已正确配置：
- ✅ 22个记忆碎片数据
- ✅ 核心函数存在
- ✅ Modal 组件完整
- ✅ 状态变量已定义
- ✅ 函数调用链正确

---

## 🔍 如何调试

### 第1步：打开浏览器控制台

1. 打开浏览器访问 http://localhost:3000/
2. 按 **F12** 打开开发者工具
3. 点击 **Console** 标签
4. 确保能看到日志输出

---

### 第2步：触发记忆碎片流程

**操作步骤**：
1. 点击"吐一个问题"
2. 写一个答案（随便写点内容）
3. 点击"存入人类思想样本库"
4. 等待打卡成功弹窗出现
5. 点击"继续"按钮

---

### 第3步：观察控制台输出

#### ✅ 正常情况应该看到：

```javascript
// 1. 保存答案后
开始保存...
本地保存成功！

// 2. 打卡成功
🎉 打卡成功！连续思考第 1 天
🎬 显示打卡成功弹窗，天数: 1

// 3. 点击继续按钮
[CheckInSuccessModal] 点击继续按钮
[CheckInSuccessModal] onClose 已调用，准备触发 onUnlock
[CheckInSuccessModal] 调用 onUnlock

// 4. 触发记忆碎片
🧩 尝试触发记忆碎片 {currentDay: 1, viewedFragmentIds: [], totalFragments: 22}
✨ 触发随机碎片 c1-1 内容: 我的星球...曾经充满思想的光芒。
[tryTriggerMemoryFragment] 设置 showUnlockModal = true (random)

// 5. 解锁弹窗出现
[UnlockMemoryModal] 渲染，isOpen: true
[UnlockMemoryModal] 弹窗已打开，等待用户点击解锁

// 6. 点击解锁按钮
[UnlockMemoryModal] 点击解锁按钮
[UnlockMemoryModal] 调用 onConfirm
[handleUnlockMemory] 被调用
[handleUnlockMemory] currentMemoryFragment: {id: 'c1-1', ...}
[handleUnlockMemory] 等待 100ms 后显示记忆碎片弹窗

// 7. 记忆碎片弹窗出现
[MemoryFragmentModal] 渲染，isOpen: true
[MemoryFragmentModal] isOpen 为 true，开始渲染...
```

---

#### ❌ 异常情况可能看到：

**情况A：没有可用碎片**
```javascript
🧩 尝试触发记忆碎片 {currentDay: 1, viewedFragmentIds: ['c1-1', 'c1-2', ...], ...}
⚠️ 没有可用的碎片
可用碎片检查: {currentDay: 1, viewedFragmentIds: [...], ...}
```

**原因**：所有当前章节的碎片都已观看

**修复**：清除碎片记录
```javascript
// 在浏览器控制台运行
localStorage.removeItem('qvm_viewed_fragments');
location.reload();
```

---

**情况B：解锁弹窗未出现**
```javascript
✨ 触发随机碎片 c1-1
[tryTriggerMemoryFragment] 设置 showUnlockModal = true (random)
// 然后就没有日志了...
```

**原因**：`setShowUnlockModal(true)` 未生效

**修复**：检查状态更新是否被批处理，或组件是否卸载

---

**情况C：点击解锁后没反应**
```javascript
[UnlockMemoryModal] 点击解锁按钮
[UnlockMemoryModal] 调用 onConfirm
// 然后就没有日志了...
```

**原因**：`handleUnlockMemory` 未被调用

**修复**：检查 `onConfirm` 属性是否正确传入

---

## 🛠️ 快速修复工具

### 工具1：运行诊断脚本

```bash
./scripts/diagnose-memory-fragment.sh
```

### 工具2：清除所有数据

```javascript
// 在浏览器控制台运行
localStorage.clear();
location.reload();
```

### 工具3：强制触发第1个碎片

暂时修改 `tryTriggerMemoryFragment` 函数：

```typescript
const tryTriggerMemoryFragment = (): boolean => {
  const currentDay = streakData.currentStreak;

  // 🆕 测试代码：强制触发第一个碎片
  if (viewedFragmentIds.length === 0) {
    const firstFragment = MEMORY_FRAGMENTS[0]; // c1-1
    if (firstFragment) {
      console.log('🧪 测试模式：强制触发第一个碎片');
      setCurrentMemoryFragment(firstFragment);
      setShowUnlockModal(true);
      return true;
    }
  }

  // 原有逻辑...
};
```

---

## 📊 完整检查清单

在浏览器中测试时，确认以下每一步：

### 步骤1：保存答案
- [ ] 能吐出问题
- [ ] 能写答案
- [ ] 能保存答案
- [ ] 控制台显示"本地保存成功"

### 步骤2：打卡成功
- [ ] 出现打卡成功弹窗
- [ ] 显示连续天数（如"第1天"）
- [ ] 控制台显示"打卡成功"

### 步骤3：点击继续
- [ ] 点击"继续"按钮
- [ ] 控制台显示"点击继续按钮"
- [ ] 控制台显示"尝试触发记忆碎片"
- [ ] 控制台显示"触发XX碎片" 或 "没有可用的碎片"

### 步骤4：解锁弹窗
- [ ] 如果有碎片，出现解锁弹窗
- [ ] 控制台显示"设置 showUnlockModal = true"
- [ ] 控制台显示"[UnlockMemoryModal] 渲染，isOpen: true"

### 步骤5：点击解锁
- [ ] 点击"解锁记忆碎片"按钮
- [ ] 控制台显示"[handleUnlockMemory] 被调用"
- [ ] 控制台显示"等待 100ms 后显示记忆碎片弹窗"

### 步骤6：记忆碎片弹窗
- [ ] 出现记忆碎片弹窗
- [ ] 显示机器人记忆内容
- [ ] 控制台显示"[MemoryFragmentModal] 渲染，isOpen: true"

---

## 🆘 现在请执行

### 方式1：告诉我控制台输出

1. 打开浏览器控制台 (F12)
2. 执行完整的记忆碎片触发流程
3. 复制所有相关日志
4. 粘贴给我

### 方式2：运行自动诊断

```bash
./scripts/diagnose-memory-fragment.sh
```

### 方式3：使用维护技能

直接告诉我：
- "记忆碎片弹窗不显示"
- "解锁按钮点击没反应"
- 或者描述你看到的现象

---

## 💡 预期结果

如果一切正常，你应该看到：

1. **打卡成功弹窗** 🎉
   ```
   这是你主动思考的第 1 天
   ```

2. **解锁弹窗** 🔓
   ```
   记忆碎片正在恢复...
   [解锁记忆碎片] 按钮
   ```

3. **记忆碎片弹窗** 💭
   ```
   我的星球...曾经充满思想的光芒。
   每个人都在思考，在质疑，在创造...
   ```

---

## 📞 需要帮助？

请提供以下信息：

1. **浏览器控制台输出**（最重要的！）
2. **在哪一步卡住了**
3. **看到了什么，没看到什么**
4. **是否有报错信息**

有了这些信息，我可以精准地帮你解决问题！🚀
