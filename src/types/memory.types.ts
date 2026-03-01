/**
 * 记忆碎片类型定义
 */

// 从 memoryFragments.ts 导入 MemoryFragment（避免重复定义）
import type { MemoryFragment } from '../services/memoryFragments';

export type { MemoryFragment };

export interface FragmentRecord {
  id: string;
  chapter: 1 | 2 | 3 | 'final';
  unlockedAt: string;        // ISO timestamp
  unlockReason: 'random' | 'milestone' | 'final';
  day: number;               // 解锁时的连续天数
  viewCount: number;         // 查看次数
  isFavorite: boolean;       // 是否收藏
}

export interface MemoryProgress {
  total: number;             // 总碎片数
  unlocked: number;          // 已解锁数
  byChapter: {
    [key: string]: {
      total: number;
      unlocked: number;
      fragments: Array<{
        id: string;
        unlocked: boolean;
      }>;
    };
  };
  currentChapter: 1 | 2 | 3 | 'final';
}

export interface MemoryStorage {
  fragments: Record<string, FragmentRecord>;
  currentChapter: 1 | 2 | 3 | 'final';
  lastUnlockedDay?: number;    // 上次解锁碎片的打卡天数
}
