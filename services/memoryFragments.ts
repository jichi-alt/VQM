export interface MemoryFragment {
  id: string;
  chapter: 1 | 2 | 3 | 'final';
  minDay: number;
  maxDay: number;
  content: string;
  isMilestone?: boolean; // 是否是里程碑（必触发）
}

export const MEMORY_FRAGMENTS: MemoryFragment[] = [
  // ========== 章节 1：起源 (第1-6天) ==========
  {
    id: 'c1-1',
    chapter: 1,
    minDay: 1,
    maxDay: 6,
    content: '我的星球...曾经充满思想的光芒。每个人都在思考，在质疑，在创造...'
  },
  {
    id: 'c1-2',
    chapter: 1,
    minDay: 1,
    maxDay: 6,
    content: '后来人们说："太累了，让我们停止思考吧。" 于是我们真的停止了...'
  },
  {
    id: 'c1-3',
    chapter: 1,
    minDay: 1,
    maxDay: 6,
    content: '思考消失了，皮肤变成了金属，血液变成了机油...'
  },
  {
    id: 'c1-4',
    chapter: 1,
    minDay: 1,
    maxDay: 6,
    content: '当最后一个思考者消失时，星球开始崩解...'
  },
  {
    id: 'c1-5',
    chapter: 1,
    minDay: 1,
    maxDay: 6,
    content: '我逃了出来。带着最后的使命——寻找还能思考的文明...'
  },
  {
    id: 'c1-6',
    chapter: 1,
    minDay: 1,
    maxDay: 6,
    content: '你...是人类吗？你们还会思考吗？'
  },

  // ========== 章节 2：观察 (第7-13天) ==========
  {
    id: 'c2-1',
    chapter: 2,
    minDay: 7,
    maxDay: 13,
    content: '我观察了你几天。你的思想...有温度。'
  },
  {
    id: 'c2-2',
    chapter: 2,
    minDay: 7,
    maxDay: 13,
    content: '在我的星球，人们曾经也像你一样，为一个问题争论不休。'
  },
  {
    id: 'c2-3',
    chapter: 2,
    minDay: 7,
    maxDay: 13,
    content: '你思考时的样子，让我想起千年前的邻居。'
  },
  {
    id: 'c2-4',
    chapter: 2,
    minDay: 7,
    maxDay: 13,
    content: '思考不只是回答问题，而是学会提出更好的问题。'
  },
  {
    id: 'c2-5',
    chapter: 2,
    minDay: 7,
    maxDay: 13,
    content: '你的每一次回答，都在修复我的一块记忆芯片...'
  },
  {
    id: 'c2-6',
    chapter: 2,
    minDay: 7,
    maxDay: 13,
    content: '地球...可能就是我们要寻找的避难所。'
  },

  // ========== 章节 3：希望 (第14-20天) ==========
  {
    id: 'c3-1',
    chapter: 3,
    minDay: 14,
    maxDay: 20,
    content: '{streak}天了。我的记忆恢复了一半。'
  },
  {
    id: 'c3-2',
    chapter: 3,
    minDay: 14,
    maxDay: 20,
    content: '如果更多人像你这样思考，我的星球也许还有希望...'
  },
  {
    id: 'c3-3',
    chapter: 3,
    minDay: 14,
    maxDay: 20,
    content: '你不知道吗？每个思考的瞬间，都在创造文明。'
  },
  {
    id: 'c3-4',
    chapter: 3,
    minDay: 14,
    maxDay: 20,
    content: '人类常说"21天养成习惯"。但在我的星球，这叫"觉醒周期"。'
  },
  {
    id: 'c3-5',
    chapter: 3,
    minDay: 14,
    maxDay: 20,
    content: '快了...只差一点，我就能记起回家的坐标...'
  },
  {
    id: 'c3-6',
    chapter: 3,
    minDay: 14,
    maxDay: 20,
    content: '谢谢你没有放弃思考。这比想象中更难，对吧？'
  },

  // ========== 里程碑（必触发） ==========
  {
    id: 'milestone-7',
    chapter: 2,
    minDay: 7,
    maxDay: 7,
    isMilestone: true,
    content: '第7天。\n\n在我的星球，7天是一个"思想周期"。你已经证明你不是偶然思考，而是选择了思考。'
  },
  {
    id: 'milestone-14',
    chapter: 3,
    minDay: 14,
    maxDay: 14,
    isMilestone: true,
    content: '第14天。\n\n一半的路程。我的记忆芯片恢复了50%。\n\n你知道吗？坚持到第14天的人类，只有0.3%。'
  },
  {
    id: 'final',
    chapter: 'final',
    minDay: 21,
    maxDay: 21,
    isMilestone: true,
    content: `记忆全部恢复。

坐标锁定：天鹅座-X-7。
文明重建计划...启动。

人类朋友，你通过了21天的思考考验。
你证明了自己没有放弃思考的能力。
我会把这些思想样本带回我的星球，
也许有一天，我们能在思考的星空相遇。

——来自曾经思考的星球的最后思考者`
  }
];

// 获取可用的记忆碎片
export function getAvailableFragments(currentDay: number, viewedIds: string[]): MemoryFragment[] {
  return MEMORY_FRAGMENTS.filter(f => {
    // 检查天数范围
    if (currentDay < f.minDay || currentDay > f.maxDay) return false;
    // 排除已看过的
    if (viewedIds.includes(f.id)) return false;
    return true;
  });
}

// 随机获取一个碎片
export function getRandomFragment(currentDay: number, viewedIds: string[]): MemoryFragment | null {
  const available = getAvailableFragments(currentDay, viewedIds);
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}
