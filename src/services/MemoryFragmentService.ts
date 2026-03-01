/**
 * 记忆碎片服务
 * 负责碎片的解锁、存储、查询等核心业务逻辑
 */

import type { MemoryFragment, FragmentRecord, MemoryProgress, MemoryStorage } from '../types/memory.types';
import { MEMORY_FRAGMENTS } from './memoryFragments';

export class MemoryFragmentService {
  private storage: Storage;

  constructor() {
    this.storage = window.localStorage;
  }

  // ==================== 存储 ====================

  /**
   * 获取完整的存储数据
   */
  getStorage(): MemoryStorage {
    const data = this.storage.getItem('qvm_memory_v2');
    if (!data) {
      return this.getLegacyStorage();
    }
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('[MemoryService] 存储数据解析失败，使用默认值');
      return this.getDefaultStorage();
    }
  }

  /**
   * 保存存储数据
   */
  saveStorage(storage: MemoryStorage): void {
    this.storage.setItem('qvm_memory_v2', JSON.stringify(storage));
    console.log('[MemoryService] 存储已更新:', storage);
  }

  /**
   * 获取旧版存储数据（兼容性）
   */
  private getLegacyStorage(): MemoryStorage {
    const viewedIds = this.storage.getItem('qvm_viewed_fragments');
    if (!viewedIds) {
      return this.getDefaultStorage();
    }

    try {
      const ids: string[] = JSON.parse(viewedIds);
      const fragments: Record<string, FragmentRecord> = {};

      ids.forEach(id => {
        const fragment = MEMORY_FRAGMENTS.find(f => f.id === id);
        if (fragment) {
          fragments[id] = {
            id: fragment.id,
            chapter: fragment.chapter,
            unlockedAt: new Date().toISOString(),
            unlockReason: 'random',
            day: 1, // 旧数据无法知道确切天数
            viewCount: 1,
            isFavorite: false
          };
        }
      });

      return {
        fragments,
        currentChapter: this.calculateCurrentChapter(1),
        lastUnlockedDay: 1
      };
    } catch (error) {
      console.error('[MemoryService] 迁移旧数据失败:', error);
      return this.getDefaultStorage();
    }
  }

  /**
   * 获取默认存储
   */
  private getDefaultStorage(): MemoryStorage {
    return {
      fragments: {},
      currentChapter: 1,
      lastUnlockedDay: undefined
    };
  }

  // ==================== 碎片解锁 ====================

  /**
   * 检查碎片是否已解锁
   */
  isUnlocked(fragmentId: string): boolean {
    const storage = this.getStorage();
    return !!storage.fragments[fragmentId];
  }

  /**
   * 解锁碎片
   */
  unlockFragment(
    fragment: MemoryFragment,
    day: number,
    reason: 'random' | 'milestone' | 'final'
  ): void {
    const storage = this.getStorage();

    const record: FragmentRecord = {
      id: fragment.id,
      chapter: fragment.chapter,
      unlockedAt: new Date().toISOString(),
      unlockReason: reason,
      day: day,
      viewCount: 0,
      isFavorite: false
    };

    storage.fragments[fragment.id] = record;
    storage.currentChapter = this.calculateCurrentChapter(day);
    storage.lastUnlockedDay = day;

    this.saveStorage(storage);
    console.log('[MemoryService] 碎片已解锁:', fragment.id, '原因:', reason);
  }

  /**
   * 增加碎片查看次数
   */
  incrementViewCount(fragmentId: string): void {
    const storage = this.getStorage();
    if (storage.fragments[fragmentId]) {
      storage.fragments[fragmentId].viewCount++;
      this.saveStorage(storage);
      console.log('[MemoryService] 查看次数+1:', fragmentId);
    }
  }

  /**
   * 切换收藏状态
   */
  toggleFavorite(fragmentId: string): void {
    const storage = this.getStorage();
    if (storage.fragments[fragmentId]) {
      storage.fragments[fragmentId].isFavorite = !storage.fragments[fragmentId].isFavorite;
      this.saveStorage(storage);
      console.log('[MemoryService] 收藏状态已切换:', fragmentId);
    }
  }

  // ==================== 碎片查询 ====================

  /**
   * 获取所有碎片记录
   */
  getAllRecords(): Record<string, FragmentRecord> {
    const storage = this.getStorage();
    return storage.fragments;
  }

  /**
   * 获取单个碎片记录
   */
  getFragmentRecord(fragmentId: string): FragmentRecord | null {
    const storage = this.getStorage();
    return storage.fragments[fragmentId] || null;
  }

  /**
   * 按天顺序获取应该解锁的碎片（确定性）
   */
  getFragmentForDay(day: number): MemoryFragment | null {
    const storage = this.getStorage();

    // 优先级1: 检查当前天数是否解锁过碎片
    const todayFragment = MEMORY_FRAGMENTS.find(
      f => f.minDay === day && f.maxDay >= day && !storage.fragments[f.id]
    );

    if (todayFragment) {
      return todayFragment;
    }

    // 优先级2: 里程碑碎片（必触发）
    const milestone = MEMORY_FRAGMENTS.find(
      f => f.isMilestone && f.minDay === day && !storage.fragments[f.id]
    );
    if (milestone) {
      return milestone;
    }

    // 优先级3: 当前章节的第一个未解锁碎片
    const currentChapter = this.calculateCurrentChapter(day);
    const chapterFragments = MEMORY_FRAGMENTS.filter(
      f => f.chapter === currentChapter && !f.isMilestone && !storage.fragments[f.id]
    );

    if (chapterFragments.length > 0) {
      // 按天数排序，返回第一个
      return chapterFragments.sort((a, b) => a.minDay - b.minDay)[0];
    }

    // 如果当前章节没有碎片了，尝试下一章节
    if (currentChapter === 1) {
      const nextChapterFragments = MEMORY_FRAGMENTS.filter(
        f => f.chapter === 2 && !storage.fragments[f.id]
      );
      if (nextChapterFragments.length > 0) {
        return nextChapterFragments.sort((a, b) => a.minDay - b.minDay)[0];
      }
    }

    return null;
  }

  /**
   * 获取指定章节的所有碎片
   */
  getChapterFragments(chapter: 1 | 2 | 3 | 'final'): Array<{
    fragment: MemoryFragment;
    unlocked: boolean;
    record: FragmentRecord | null;
  }> {
    const storage = this.getStorage();

    return MEMORY_FRAGMENTS
      .filter(f => f.chapter === chapter)
      .map(fragment => ({
        fragment,
        unlocked: !!storage.fragments[fragment.id],
        record: storage.fragments[fragment.id] || null
      }))
      .sort((a, b) => a.fragment.minDay - b.fragment.minDay);
  }

  // ==================== 进度计算 ====================

  /**
   * 获取解锁进度
   */
  getProgress(): MemoryProgress {
    const storage = this.getStorage();
    const unlockedIds = Object.keys(storage.fragments);

    return {
      total: MEMORY_FRAGMENTS.length,
      unlocked: unlockedIds.length,
      byChapter: {
        '1': {
          total: 6,
          unlocked: unlockedIds.filter(id => id.startsWith('c1')).length,
          fragments: this.getChapterFragments(1)
        },
        '2': {
          total: 7, // 6个普通 + 1个里程碑
          unlocked: unlockedIds.filter(id => id.startsWith('c2') || id === 'milestone-7').length,
          fragments: this.getChapterFragments(2)
        },
        '3': {
          total: 7, // 6个普通 + 1个里程碑
          unlocked: unlockedIds.filter(id => id.startsWith('c3') || id === 'milestone-14').length,
          fragments: this.getChapterFragments(3)
        },
        'final': {
          total: 1,
          unlocked: unlockedIds.filter(id => id === 'final').length,
          fragments: this.getChapterFragments('final')
        }
      },
      currentChapter: storage.currentChapter
    };
  }

  /**
   * 计算当前章节
   */
  private calculateCurrentChapter(day: number): 1 | 2 | 3 | 'final' {
    if (day >= 21) return 'final';
    if (day >= 14) return 3;
    if (day >= 7) return 2;
    return 1;
  }

  // ==================== 数据迁移 ====================

  /**
   * 清空所有数据（重置）
   */
  clearAll(): void {
    this.storage.removeItem('qvm_memory_v2');
    this.storage.removeItem('qvm_viewed_fragments');
    console.log('[MemoryService] 所有数据已清空');
  }

  /**
   * 导出数据（备份）
   */
  exportData(): string {
    const storage = this.getStorage();
    return JSON.stringify(storage, null, 2);
  }

  /**
   * 导入数据（恢复）
   */
  importData(jsonData: string): void {
    try {
      const storage: MemoryStorage = JSON.parse(jsonData);
      this.saveStorage(storage);
      console.log('[MemoryService] 数据导入成功');
    } catch (error) {
      console.error('[MemoryService] 数据导入失败:', error);
      throw new Error('无效的数据格式');
    }
  }
}

// 导出服务实例
export const memoryFragmentService = new MemoryFragmentService();
