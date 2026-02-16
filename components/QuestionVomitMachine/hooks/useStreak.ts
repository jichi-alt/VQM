/**
 * useStreak - 打卡数据管理 Hook
 */

import { useState, useEffect, useCallback } from 'react';
import { getStreakData, saveStreakData, type StreakData } from '../../services/dataService';

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
      const data = await getStreakData(userId);
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
    await saveStreakData(newStreakData, userId);
  }, [streakData, userId]);

  // 执行打卡
  const checkIn = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];
    const lastCheckIn = streakData.lastCheckIn;
    let newStreak = streakData.currentStreak;

    // 检查是否连续打卡
    if (lastCheckIn) {
      const lastDate = new Date(lastCheckIn);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      // 如果断档超过1天，重置
      if (diffDays > 1) {
        newStreak = 1;
      } else if (diffDays === 1) {
        // 连续打卡
        newStreak += 1;
      }
      // diffDays === 0 表示今天已经打过卡了
    } else {
      // 首次打卡
      newStreak = 1;
    }

    const isCompleted = newStreak >= 21;
    const newHistory = streakData.checkInHistory.includes(today)
      ? streakData.checkInHistory
      : [...streakData.checkInHistory, today];

    const updates: Partial<StreakData> = {
      isActive: true,
      lastCheckIn: today,
      currentStreak: newStreak,
      isCompleted,
      startDate: streakData.startDate || today,
      checkInHistory: newHistory,
      longestStreak: Math.max(streakData.longestStreak, newStreak),
    };

    await updateStreak(updates);
    return { ...updates };
  }, [streakData, updateStreak]);

  return {
    streakData,
    loading,
    updateStreak,
    checkIn,
  };
};
