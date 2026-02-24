import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// 检查 Supabase 配置
const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key-here');

if (!isSupabaseConfigured) {
  console.warn('⚠️ Supabase 未配置。应用将以本地模式运行（仅使用 localStorage，不支持云端同步）');
}

// 创建 Supabase 客户端（如果已配置）或 mock 客户端
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient();

/**
 * 创建一个 mock Supabase 客户端，用于本地模式
 */
function createMockClient() {
  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: { user: null }, error: { message: '本地模式不支持登录' } }),
      signUp: () => Promise.resolve({ data: { user: null }, error: { message: '本地模式不支持注册' } }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({ single: () => Promise.resolve({ data: null, error: { message: '本地模式' } }) }),
        maybeSingle: () => Promise.resolve({ data: null, error: null }),
      }),
      insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: { message: '本地模式' } }) }) }),
      upsert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
    }),
  } as any;
}

export const isSupabaseEnabled = isSupabaseConfigured;
