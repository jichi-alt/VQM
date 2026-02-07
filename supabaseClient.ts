import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://msfifonrgyxlysngguyu.supabase.co';
const supabaseAnonKey = 'sb_publishable_-4YZCuSJ715fSUH0XskVFw_xJ5SWxKo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 数据库类型定义
export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  created_at: string;
  updated_at: string;
}

export interface UserAnswer {
  id: string;
  user_id: string;
  question_id: string;
  question_text: string;
  answer: string;
  created_at: string;
}

export interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_check_in: string;
  start_date: string;
  check_in_history: string[];
}
