/**
 * useStreak - 打卡数据管理 Hook
 */

import { useState, useEffect, useCallback } from 'react';
import { getStreakService } from '../../src/services/streak.service';
import type { StreakData } from '../../src/types';

export const useStreak = (userId?: string) => {
  const [streakData, setStreakData] = useState<StreakData>({
    isActive: false,
    lastCheckIn: null,
    currentStreak: 0,
    isCompleted: false,
    startDate: null,
    checkInHistory: [],
    longestStreak: 0,
  });
  const [loading, setLoading] = useState(true);

  // 加载打卡数据
  useEffect(() => {
    const loadStreak = async () => {
      const streakService = getStreakService();
      const data = await streakService.getStreak(userId);
      if (data) {
        setStreakData(data);
      }
      setLoading(false);
    };
    loadStreak();
  }, [userId]);

  // 更新打卡数据
  const updateStreak = useCallback(async (updates: Partial<StreakData>) => {
    const newStreakData = { ...streakData, ...updates };
    setStreakData(newStreakData);
    const streakService = getStreakService();
    await streakService.saveStreak(newStreakData, userId);
  }, [streakData, userId]);

  // 执行打卡
  const checkIn = useCallback(async () => {
    const streakService = getStreakService();
    if (!userId) return null;

    const result = await streakService.checkIn(userId);
    if (result) {
      // 重新加载数据
      const data = await streakService.getStreak(userId);
      if (data) {
        setStreakData(data);
      }
      return result;
    }
    return null;
  }, [userId]);

  return {
    streakData,
    loading,
    updateStreak,
    checkIn,
  };
};
