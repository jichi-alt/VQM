// ==================== 用户相关 ====================

export interface User {
  id: string;
  email: string;
  username?: string;
  created_at: string;
  updated_at: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  username?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// ==================== 打卡相关 ====================

export interface Streak {
  id?: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_check_in: string;        // YYYY-MM-DD
  start_date: string;           // YYYY-MM-DD
  check_in_history: string[];   // ["2026-01-25", ...]
  is_completed: boolean;
}

export interface StreakData {
  isActive: boolean;
  lastCheckIn: string | null;
  currentStreak: number;
  isCompleted: boolean;
  startDate: string | null;
  checkInHistory: string[];
  longestStreak: number;
}

// ==================== 答案相关 ====================

export interface Answer {
  id?: string;
  user_id: string;
  question_id: string;
  question_text: string;
  answer: string;
  day?: number;
  chapter?: number;
  created_at: string;
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
  answers: Array<{ content: string; timestamp: string }>;
  lastModified: string;
}

// ==================== 问题相关 ====================

export interface Question {
  id: string;
  text: string;
  chapter: number;
  day: number;
  is_first_day_only?: boolean;
}

export interface QuestionData {
  id: string;
  text: string;
  date: string;
  ticketNum: string;
  chapter: number;
  day: number;
}

// ==================== 记忆碎片 ====================

export interface MemoryFragment {
  id: string;
  chapter: number;
  minDay?: number;
  maxDay?: number;
  isMilestone?: boolean;
  content: string;
}

// ==================== 每日状态 ====================

export interface DailyState {
  date: string;
  questionId?: string;
  questionText?: string;
  answers: Array<{ content: string; timestamp: string }>;
  fragmentUnlocked: boolean;
  checkedIn: boolean;
}

// ==================== 用户偏好 ====================

export interface UserPreferences {
  seenPrologue: boolean;
  seenLoading: boolean;
  audioEnabled: boolean;
}
