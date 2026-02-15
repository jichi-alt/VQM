import { describe, it, expect } from 'vitest';
import { MEMORY_FRAGMENTS, getAvailableFragments, getRandomFragment } from '../memoryFragments';

describe('Memory Fragments Service', () => {
  describe('MEMORY_FRAGMENTS 常量', () => {
    it('应该包含所有记忆碎片', () => {
      expect(MEMORY_FRAGMENTS).toBeDefined();
      expect(Array.isArray(MEMORY_FRAGMENTS)).toBe(true);
      expect(MEMORY_FRAGMENTS.length).toBeGreaterThan(0);
    });

    it('每个碎片应该包含必需的字段', () => {
      MEMORY_FRAGMENTS.forEach((fragment) => {
        expect(fragment).toHaveProperty('id');
        expect(fragment).toHaveProperty('chapter');
        expect(fragment).toHaveProperty('content');
        expect(fragment).toHaveProperty('minDay');
        expect(fragment).toHaveProperty('maxDay');
      });
    });

    it('应该有 3 个章节的碎片', () => {
      const chapter1Count = MEMORY_FRAGMENTS.filter(f => f.chapter === 1).length;
      const chapter2Count = MEMORY_FRAGMENTS.filter(f => f.chapter === 2).length;
      const chapter3Count = MEMORY_FRAGMENTS.filter(f => f.chapter === 3).length;

      expect(chapter1Count).toBeGreaterThanOrEqual(6);
      expect(chapter2Count).toBeGreaterThanOrEqual(6);
      expect(chapter3Count).toBeGreaterThanOrEqual(6);
    });

    it('应该有里程碑碎片', () => {
      const milestones = MEMORY_FRAGMENTS.filter(f => f.isMilestone);
      expect(milestones.length).toBeGreaterThan(0);
      expect(milestones.some(m => m.id === 'final')).toBe(true);
    });
  });

  describe('getAvailableFragments', () => {
    it('第 1 天应该返回第 1 章的碎片', () => {
      const available = getAvailableFragments(1, []);
      expect(available.length).toBeGreaterThan(0);
      available.forEach(frag => {
        expect(frag.minDay).toBeLessThanOrEqual(1);
        expect(frag.maxDay).toBeGreaterThanOrEqual(1);
      });
    });

    it('应该排除已查看的碎片', () => {
      const available1 = getAvailableFragments(1, []);
      const available2 = getAvailableFragments(1, [available1[0].id]);

      expect(available2.length).toBe(available1.length - 1);
    });

    it('第 7 天应该包含里程碑', () => {
      const available = getAvailableFragments(7, []);
      const hasMilestone = available.some(f => f.isMilestone);
      expect(hasMilestone).toBe(true);
    });

    it('第 21 天应该返回最终碎片', () => {
      const available = getAvailableFragments(21, []);
      const final = available.find(f => f.id === 'final');
      expect(final).toBeDefined();
    });
  });

  describe('getRandomFragment', () => {
    it('应该返回一个随机碎片', () => {
      const fragment = getRandomFragment(1, []);
      expect(fragment).toBeDefined();
      expect(fragment).toHaveProperty('id');
      expect(fragment).toHaveProperty('content');
    });

    it('当所有碎片都被查看后应该返回 null', () => {
      // 获取所有可用碎片的 ID
      const allIds = MEMORY_FRAGMENTS.filter(f => f.minDay === 1 && f.maxDay === 1).map(f => f.id);
      const fragment = getRandomFragment(1, allIds);

      // 如果第 1 天有碎片，并且都已查看，应该返回 null
      if (MEMORY_FRAGMENTS.some(f => f.minDay === 1 && f.maxDay === 1)) {
        expect(fragment).toBeNull();
      }
    });

    it('多次调用应该可能返回不同的碎片', () => {
      const results = new Set();
      for (let i = 0; i < 20; i++) {
        const fragment = getRandomFragment(7, []);
        if (fragment) results.add(fragment.id);
      }
      // 第 7 天应该有多个碎片可用
      expect(results.size).toBeGreaterThan(1);
    });
  });
});
