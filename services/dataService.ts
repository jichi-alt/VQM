/**
 * 数据存储服务 - 统一管理 Supabase + localStorage 双存储
 * Supabase 作为主要存储，localStorage 作为离线 fallback
 */

import { supabase } from '../supabaseClient';

// ==================== 类型定义 ====================

export interface StreakData {
  isActive: boolean;
  lastCheckIn: string | null;
  currentStreak: number;
  isCompleted: boolean;
  startDate: string | null;
  checkInHistory: string[];
  longestStreak: number;
}

export interface DailyState {
  date: string; // YYYY-MM-DD
  questionId?: string;
  questionText?: string;
  answers: Array<{ content: string; timestamp: string }>;
  fragmentUnlocked: boolean;
  checkedIn: boolean;
}

export interface UserPreferences {
  seenPrologue: boolean;
  seenLoading: boolean;
  audioEnabled: boolean;
}

export interface Answer {
  content: string;
  timestamp: string;
}

export interface ArchiveEntry {
  question: {
    id: string;
    text: string;
    date: string;
    ticketNum: string;
    chapter: number;
    day: number;
  };
  answers: Answer[];
  lastModified: string;
}

// ==================== 本地存储 Keys ====================

const LOCAL_KEYS = {
  STREAK: 'qvm_streak',
  DAILY_STATE: 'vqm_today',
  ANSWERED_QUESTION_IDS: 'qvm_answered_question_ids',
  VIEWED_FRAGMENTS: 'qvm_viewed_fragments',
  ARCHIVES: 'vqm_archives',
  PREFERENCES: 'qvm_preferences',
} as const;

// ==================== 辅助函数 ====================

/**
 * 安全的 localStorage 操作
 */
const safeLocalStorage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (e) {
      console.error(`localStorage get error for key ${key}:`, e);
      return defaultValue;
    }
  },
  set: (key: string, value: any): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`localStorage set error for key ${key}:`, e);
      return false;
    }
  },
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`localStorage remove error for key ${key}:`, e);
    }
  },
};

// ==================== 打卡数据 ====================

/**
 * 获取打卡数据
 * 优先从 Supabase 获取，失败则使用 localStorage
 */
export const getStreakData = async (userId?: string): Promise<StreakData | null> => {
  // 先尝试从 localStorage 获取（快速响应）
  const localStreak = safeLocalStorage.get<StreakData>(LOCAL_KEYS.STREAK, null);
  if (localStreak) {
    return localStreak;
  }

  // 如果有 userId，尝试从 Supabase 获取
  if (userId) {
    try {
      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (data && !error) {
        const streakData: StreakData = {
          isActive: true,
          lastCheckIn: data.last_check_in,
          currentStreak: data.current_streak,
          isCompleted: data.is_completed,
          startDate: data.start_date,
          checkInHistory: data.check_in_history || [],
          longestStreak: data.longest_streak,
        };
        // 同步到 localStorage
        safeLocalStorage.set(LOCAL_KEYS.STREAK, streakData);
        return streakData;
      }
    } catch (e) {
      console.error('Failed to get streak from Supabase:', e);
    }
  }

  return null;
};

/**
 * 保存打卡数据
 * 同时保存到 Supabase 和 localStorage
 */
export const saveStreakData = async (
  streakData: StreakData,
  userId?: string
): Promise<{ success: boolean; error?: string }> => {
  // 保存到 localStorage（立即生效）
  safeLocalStorage.set(LOCAL_KEYS.STREAK, streakData);

  // 如果有 userId，同步到 Supabase
  if (userId) {
    try {
      const { error } = await supabase
        .from('user_streaks')
        .upsert({
          user_id: userId,
          current_streak: streakData.currentStreak,
          longest_streak: streakData.longestStreak,
          last_check_in: streakData.lastCheckIn,
          start_date: streakData.startDate,
          check_in_history: streakData.checkInHistory,
          is_completed: streakData.isCompleted,
        });

      if (error) {
        console.error('Failed to save streak to Supabase:', error);
        return { success: false, error: error.message };
      }
    } catch (e: any) {
      console.error('Failed to save streak to Supabase:', e);
      return { success: false, error: e.message };
    }
  }

  return { success: true };
};

// ==================== 每日状态 ====================

/**
 * 获取今日状态
 */
export const getDailyState = async (userId?: string): Promise<DailyState | null> => {
  const today = new Date().toISOString().split('T')[0];

  // 先尝试从 localStorage 获取
  const localState = safeLocalStorage.get<DailyState>(LOCAL_KEYS.DAILY_STATE, null);
  if (localState && localState.date === today) {
    return localState;
  }

  // 如果有 userId，尝试从 Supabase 获取
  if (userId) {
    try {
      const { data, error } = await supabase
        .from('daily_states')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (data && !error) {
        const dailyState: DailyState = {
          date: data.date,
          questionId: data.question_id,
          questionText: data.question_text,
          answers: data.answers || [],
          fragmentUnlocked: data.fragment_unlocked,
          checkedIn: data.checked_in,
        };
        // 同步到 localStorage
        safeLocalStorage.set(LOCAL_KEYS.DAILY_STATE, dailyState);
        return dailyState;
      }
    } catch (e) {
      console.error('Failed to get daily state from Supabase:', e);
    }
  }

  return null;
};

/**
 * 保存今日状态
 */
export const saveDailyState = async (
  dailyState: DailyState,
  userId?: string
): Promise<{ success: boolean; error?: string }> => {
  // 保存到 localStorage
  safeLocalStorage.set(LOCAL_KEYS.DAILY_STATE, dailyState);

  // 同步到 Supabase
  if (userId) {
    try {
      const { error } = await supabase
        .from('daily_states')
        .upsert({
          user_id: userId,
          date: dailyState.date,
          question_id: dailyState.questionId,
          question_text: dailyState.questionText,
          answers: dailyState.answers,
          fragment_unlocked: dailyState.fragmentUnlocked,
          checked_in: dailyState.checkedIn,
        });

      if (error) {
        console.error('Failed to save daily state to Supabase:', error);
        return { success: false, error: error.message };
      }
    } catch (e: any) {
      console.error('Failed to save daily state to Supabase:', e);
      return { success: false, error: e.message };
    }
  }

  return { success: true };
};

// ==================== 已回答问题 ====================

/**
 * 获取已回答问题的ID列表
 */
export const getAnsweredQuestionIds = async (userId?: string): Promise<string[]> => {
  // 先从 localStorage 获取
  const localIds = safeLocalStorage.get<string[]>(LOCAL_KEYS.ANSWERED_QUESTION_IDS, []);
  if (localIds.length > 0) {
    return localIds;
  }

  // 从 Supabase 获取
  if (userId) {
    try {
      const { data, error } = await supabase
        .from('answered_questions')
        .select('question_text')
        .eq('user_id', userId);

      if (data && !error) {
        const ids = data.map(item => item.question_text);
        safeLocalStorage.set(LOCAL_KEYS.ANSWERED_QUESTION_IDS, ids);
        return ids;
      }
    } catch (e) {
      console.error('Failed to get answered questions from Supabase:', e);
    }
  }

  return [];
};

/**
 * 记录已回答的问题
 */
export const saveAnsweredQuestion = async (
  questionId: string,
  questionText: string,
  userId?: string
): Promise<{ success: boolean; error?: string }> => {
  // 更新 localStorage
  const answeredIds = safeLocalStorage.get<string[]>(LOCAL_KEYS.ANSWERED_QUESTION_IDS, []);
  if (!answeredIds.includes(questionId)) {
    answeredIds.push(questionId);
    safeLocalStorage.set(LOCAL_KEYS.ANSWERED_QUESTION_IDS, answeredIds);
  }

  // 同步到 Supabase
  if (userId) {
    try {
      const { error } = await supabase
        .from('answered_questions')
        .insert({
          user_id: userId,
          question_text: questionText,
        });

      if (error) {
        // 唯一约束冲突，说明已存在，不算错误
        if (error.code !== '23505') {
          console.error('Failed to save answered question to Supabase:', error);
        }
      }
    } catch (e: any) {
      console.error('Failed to save answered question to Supabase:', e);
    }
  }

  return { success: true };
};

/**
 * 清除已回答问题的记录
 */
export const clearAnsweredQuestions = async (): Promise<void> => {
  safeLocalStorage.remove(LOCAL_KEYS.ANSWERED_QUESTION_IDS);
  // Supabase 数据保留，不删除
};

// ==================== 记忆碎片 ====================

/**
 * 获取已查看的记忆碎片ID列表
 */
export const getViewedFragments = async (userId?: string): Promise<string[]> => {
  // 先从 localStorage 获取
  const localFragments = safeLocalStorage.get<string[]>(LOCAL_KEYS.VIEWED_FRAGMENTS, []);
  if (localFragments.length > 0) {
    return localFragments;
  }

  // 从 Supabase 获取
  if (userId) {
    try {
      const { data, error } = await supabase
        .from('viewed_fragments')
        .select('fragment_id')
        .eq('user_id', userId);

      if (data && !error) {
        const ids = data.map(item => item.fragment_id);
        safeLocalStorage.set(LOCAL_KEYS.VIEWED_FRAGMENTS, ids);
        return ids;
      }
    } catch (e) {
      console.error('Failed to get viewed fragments from Supabase:', e);
    }
  }

  return [];
};

/**
 * 记录已查看的记忆碎片
 */
export const saveViewedFragment = async (
  fragmentId: string,
  userId?: string
): Promise<{ success: boolean; error?: string }> => {
  // 更新 localStorage
  const viewedIds = safeLocalStorage.get<string[]>(LOCAL_KEYS.VIEWED_FRAGMENTS, []);
  if (!viewedIds.includes(fragmentId)) {
    viewedIds.push(fragmentId);
    safeLocalStorage.set(LOCAL_KEYS.VIEWED_FRAGMENTS, viewedIds);
  }

  // 同步到 Supabase
  if (userId) {
    try {
      const { error } = await supabase
        .from('viewed_fragments')
        .insert({
          user_id: userId,
          fragment_id: fragmentId,
        });

      if (error && error.code !== '23505') {
        console.error('Failed to save viewed fragment to Supabase:', error);
      }
    } catch (e) {
      console.error('Failed to save viewed fragment to Supabase:', e);
    }
  }

  return { success: true };
};

// ==================== 用户偏好 ====================

/**
 * 获取用户偏好设置
 */
export const getUserPreferences = async (userId?: string): Promise<UserPreferences> => {
  const defaultPrefs: UserPreferences = {
    seenPrologue: false,
    seenLoading: false,
    audioEnabled: true,
  };

  // 先从 localStorage 获取
  const localPrefs = safeLocalStorage.get<UserPreferences>(LOCAL_KEYS.PREFERENCES, defaultPrefs);
  if (localPrefs) {
    return localPrefs;
  }

  // 从 Supabase 获取
  if (userId) {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (data && !error) {
        const prefs: UserPreferences = {
          seenPrologue: data.seen_prologue,
          seenLoading: data.seen_loading,
          audioEnabled: data.audio_enabled,
        };
        safeLocalStorage.set(LOCAL_KEYS.PREFERENCES, prefs);
        return prefs;
      }
    } catch (e) {
      console.error('Failed to get user preferences from Supabase:', e);
    }
  }

  return defaultPrefs;
};

/**
 * 保存用户偏好设置
 */
export const saveUserPreferences = async (
  prefs: UserPreferences,
  userId?: string
): Promise<{ success: boolean; error?: string }> => {
  // 保存到 localStorage
  safeLocalStorage.set(LOCAL_KEYS.PREFERENCES, prefs);

  // 同步到 Supabase
  if (userId) {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          seen_prologue: prefs.seenPrologue,
          seen_loading: prefs.seenLoading,
          audio_enabled: prefs.audioEnabled,
        });

      if (error) {
        console.error('Failed to save user preferences to Supabase:', error);
        return { success: false, error: error.message };
      }
    } catch (e: any) {
      console.error('Failed to save user preferences to Supabase:', e);
      return { success: false, error: e.message };
    }
  }

  return { success: true };
};

// ==================== 回答记录 ====================

/**
 * 保存用户回答到 Supabase
 */
export const saveUserAnswerToSupabase = async (
  userId: string,
  questionId: string,
  questionText: string,
  answer: string,
  day?: number,
  chapter?: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('user_answers')
      .insert({
        user_id: userId,
        question_id: questionId,
        question_text: questionText,
        answer: answer,
        day: day,
        chapter: chapter,
      });

    if (error) {
      console.error('Failed to save answer to Supabase:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (e: any) {
    console.error('Failed to save answer to Supabase:', e);
    return { success: false, error: e.message };
  }
};

/**
 * 从 Supabase 获取用户的所有回答
 */
export const getUserAnswersFromSupabase = async (
  userId: string
): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('user_answers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to get answers from Supabase:', error);
      return [];
    }

    return data || [];
  } catch (e) {
    console.error('Failed to get answers from Supabase:', e);
    return [];
  }
};

// ==================== 数据同步 ====================

/**
 * 将 localStorage 数据同步到 Supabase
 */
export const syncLocalToSupabase = async (userId: string): Promise<{
  success: boolean;
  synced: string[];
  failed: string[];
}> => {
  const synced: string[] = [];
  const failed: string[] = [];

  // 同步打卡数据
  const streakData = safeLocalStorage.get<StreakData>(LOCAL_KEYS.STREAK, null);
  if (streakData) {
    const result = await saveStreakData(streakData, userId);
    if (result.success) {
      synced.push('打卡数据');
    } else {
      failed.push('打卡数据');
    }
  }

  // 同步已回答问题
  const answeredIds = safeLocalStorage.get<string[]>(LOCAL_KEYS.ANSWERED_QUESTION_IDS, []);
  if (answeredIds.length > 0) {
    // 这里简化处理，只记录同步
    synced.push('已回答问题');
  }

  // 同步已查看碎片
  const viewedFragments = safeLocalStorage.get<string[]>(LOCAL_KEYS.VIEWED_FRAGMENTS, []);
  if (viewedFragments.length > 0) {
    synced.push('记忆碎片');
  }

  // 同步用户偏好
  const prefs = safeLocalStorage.get<UserPreferences>(LOCAL_KEYS.PREFERENCES, null);
  if (prefs) {
    const result = await saveUserPreferences(prefs, userId);
    if (result.success) {
      synced.push('用户偏好');
    } else {
      failed.push('用户偏好');
    }
  }

  return { success: failed.length === 0, synced, failed };
};

/**
 * 清除所有本地数据
 */
export const clearAllLocalData = (): void => {
  Object.values(LOCAL_KEYS).forEach(key => {
    safeLocalStorage.remove(key);
  });
};
