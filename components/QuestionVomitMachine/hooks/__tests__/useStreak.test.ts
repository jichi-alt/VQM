import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useStreak } from '../useStreak';

// 模拟 streak.service
vi.mock('../../../../src/services/streak.service', () => ({
  getStreakService: vi.fn(),
}));

import { getStreakService } from '../../../../src/services/streak.service';

describe('useStreak Hook', () => {
  const mockStreakService = {
    getStreak: vi.fn(),
    saveStreak: vi.fn(),
    checkIn: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getStreakService).mockReturnValue(mockStreakService as any);
    // 清除 localStorage
    localStorage.clear();
  });

  it('应该初始化默认的 streak 数据', async () => {
    mockStreakService.getStreak.mockResolvedValue({
      isActive: false,
      lastCheckIn: null,
      currentStreak: 0,
      isCompleted: false,
      startDate: null,
      checkInHistory: [],
      longestStreak: 0,
    });

    const { result } = renderHook(() => useStreak());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.streakData.currentStreak).toBe(0);
    expect(result.current.streakData.isCompleted).toBe(false);
  });

  it('应该加载已有的 streak 数据', async () => {
    const mockData = {
      isActive: true,
      lastCheckIn: '2026-02-16',
      currentStreak: 5,
      isCompleted: false,
      startDate: '2026-02-12',
      checkInHistory: ['2026-02-12', '2026-02-13', '2026-02-14', '2026-02-15', '2026-02-16'],
      longestStreak: 5,
    };

    mockStreakService.getStreak.mockResolvedValue(mockData);

    const { result } = renderHook(() => useStreak());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.streakData.currentStreak).toBe(5);
  });

  it('checkIn 应该增加连续天数', async () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const mockData = {
      isActive: true,
      lastCheckIn: yesterday,
      currentStreak: 1,
      isCompleted: false,
      startDate: yesterday,
      checkInHistory: [yesterday],
      longestStreak: 1,
    };

    const updatedData = { ...mockData, currentStreak: 2, lastCheckIn: today };

    mockStreakService.getStreak.mockResolvedValueOnce(mockData).mockResolvedValueOnce(updatedData);
    mockStreakService.checkIn.mockResolvedValue({ newStreak: 2, isCompleted: false });
    mockStreakService.saveStreak.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useStreak());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.checkIn();
    });

    expect(result.current.streakData.currentStreak).toBe(2);
  });

  it('checkIn 达到 21 天应该标记为完成', async () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const mockData = {
      isActive: true,
      lastCheckIn: yesterday,
      currentStreak: 20,
      isCompleted: false,
      startDate: yesterday,
      checkInHistory: Array.from({ length: 20 }, (_, i) => {
        const d = new Date(Date.now() - (20 - i) * 86400000);
        return d.toISOString().split('T')[0];
      }),
      longestStreak: 20,
    };

    const updatedData = { ...mockData, currentStreak: 21, isCompleted: true };

    mockStreakService.getStreak.mockResolvedValueOnce(mockData).mockResolvedValueOnce(updatedData);
    mockStreakService.checkIn.mockResolvedValue({ newStreak: 21, isCompleted: true });
    mockStreakService.saveStreak.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useStreak());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.checkIn();
    });

    expect(result.current.streakData.currentStreak).toBe(21);
    expect(result.current.streakData.isCompleted).toBe(true);
  });
});
