import { StreakRepository } from '../repository';
import { localStorage, LocalStorageKeys } from '../lib/localStorage';
import type { Streak, StreakData } from '../types';

export class StreakService {
  private streakRepo: StreakRepository;

  constructor() {
    this.streakRepo = new StreakRepository();
  }

  /**
   * 获取打卡数据（优先本地，失败则云端）
   */
  async getStreak(userId?: string): Promise<StreakData | null> {
    // 先从本地获取
    const localStreak = localStorage.get<StreakData>(LocalStorageKeys.STREAK, null);
    if (localStreak) {
      return localStreak;
    }

    // 从云端获取
    if (userId) {
      try {
        const cloudStreak = await this.streakRepo.findByUserId(userId);
        if (cloudStreak) {
          // 转换为 StreakData 格式
          const streakData: StreakData = {
            isActive: true,
            lastCheckIn: cloudStreak.last_check_in,
            currentStreak: cloudStreak.current_streak,
            isCompleted: cloudStreak.is_completed,
            startDate: cloudStreak.start_date,
            checkInHistory: cloudStreak.check_in_history || [],
            longestStreak: cloudStreak.longest_streak,
          };
          // 同步到本地
          localStorage.set(LocalStorageKeys.STREAK, streakData);
          return streakData;
        }
      } catch (error) {
        console.error('Failed to get streak from Supabase:', error);
      }
    }

    return null;
  }

  /**
   * 保存打卡数据（本地 + 云端）
   */
  async saveStreak(streakData: StreakData, userId?: string): Promise<{ success: boolean; error?: string }> {
    // 保存到本地
    localStorage.set(LocalStorageKeys.STREAK, streakData);

    // 同步到云端
    if (userId) {
      try {
        // 转换为数据库格式
        const streak: Streak = {
          user_id: userId,
          current_streak: streakData.currentStreak,
          longest_streak: streakData.longestStreak,
          last_check_in: streakData.lastCheckIn || '',
          start_date: streakData.startDate || '',
          check_in_history: streakData.checkInHistory,
          is_completed: streakData.isCompleted,
        };
        await this.streakRepo.saveByUserId(userId, streak);
      } catch (error: any) {
        console.error('Failed to save streak to Supabase:', error);
        return { success: false, error: error.message };
      }
    }

    return { success: true };
  }

  /**
   * 计算新的连续天数
   */
  calculateNewStreak(currentStreak: StreakData): number {
    const today = new Date().toISOString().split('T')[0];
    const lastCheckIn = currentStreak.lastCheckIn;

    if (!lastCheckIn) {
      return 1;
    }

    const lastDate = new Date(lastCheckIn);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // 今天已经打卡
      return currentStreak.currentStreak;
    } else if (diffDays === 1) {
      // 连续打卡
      return currentStreak.currentStreak + 1;
    } else {
      // 断档，重新开始
      return 1;
    }
  }

  /**
   * 执行打卡操作
   */
  async checkIn(userId: string): Promise<{ newStreak: number; isCompleted: boolean } | null> {
    const streakData = await this.getStreak(userId);
    if (!streakData) {
      return null;
    }

    const today = new Date().toISOString().split('T')[0];

    // 如果今天已经打卡，不重复打卡
    if (streakData.lastCheckIn === today) {
      return null;
    }

    // 计算新的连续天数
    const newStreak = this.calculateNewStreak(streakData);
    const isCompleted = newStreak >= 21;

    // 更新数据
    streakData.lastCheckIn = today;
    streakData.currentStreak = newStreak;
    streakData.isCompleted = isCompleted;
    streakData.startDate = streakData.startDate || today;
    streakData.checkInHistory = [...streakData.checkInHistory, today];
    streakData.longestStreak = Math.max(streakData.longestStreak, newStreak);

    // 保存
    await this.saveStreak(streakData, userId);

    return { newStreak, isCompleted };
  }
}

// 单例
let streakServiceInstance: StreakService | null = null;

export function getStreakService(): StreakService {
  if (!streakServiceInstance) {
    streakServiceInstance = new StreakService();
  }
  return streakServiceInstance;
}
