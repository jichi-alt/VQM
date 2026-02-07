import { supabase } from '../supabaseClient';
import type { UserProfile, UserAnswer, UserStreak } from '../supabaseClient';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends LoginCredentials {
  username?: string;
}

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}

class AuthService {
  private currentUser: UserProfile | null = null;
  private listeners: ((user: UserProfile | null) => void)[] = [];

  // 初始化：检查用户登录状态
  async initialize(): Promise<UserProfile | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // 获取用户完整信息
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        this.currentUser = profile;
        this.notifyListeners();
        return this.currentUser;
      }

      return null;
    } catch (error) {
      console.error('[Auth] 初始化失败:', error);
      return null;
    }
  }

  // 监听认证状态变化
  onAuthStateChange(callback: (user: UserProfile | null) => void) {
    this.listeners.push(callback);

    // 监听 Supabase 认证事件
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] 认证状态变化:', event);

      if (event === 'SIGNED_IN' && session?.user) {
        // 获取用户完整信息
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        this.currentUser = profile;
      } else if (event === 'SIGNED_OUT') {
        this.currentUser = null;
      }

      this.notifyListeners();
    });

    // 返回清理函数
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentUser));
  }

  // 获取当前用户
  getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  // 注册
  async signUp(credentials: SignUpCredentials): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            username: credentials.username,
          },
        },
      });

      if (error) {
        console.error('[Auth] 注册失败:', error);
        return { success: false, error: error.message };
      }

      console.log('[Auth] 注册成功:', data);
      return { success: true };
    } catch (error: any) {
      console.error('[Auth] 注册异常:', error);
      return { success: false, error: error.message };
    }
  }

  // 登录
  async signIn(credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        console.error('[Auth] 登录失败:', error);
        return { success: false, error: error.message };
      }

      console.log('[Auth] 登录成功:', data);

      // 获取用户完整信息
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        this.currentUser = profile;
        this.notifyListeners();
      }

      return { success: true };
    } catch (error: any) {
      console.error('[Auth] 登录异常:', error);
      return { success: false, error: error.message };
    }
  }

  // 登出
  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
      this.currentUser = null;
      this.notifyListeners();
      console.log('[Auth] 登出成功');
    } catch (error) {
      console.error('[Auth] 登出失败:', error);
    }
  }

  // 更新用户信息
  async updateProfile(updates: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> {
    if (!this.currentUser) {
      return { success: false, error: '未登录' };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', this.currentUser.id);

      if (error) {
        return { success: false, error: error.message };
      }

      // 刷新当前用户信息
      await this.initialize();

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // 保存回答
  async saveAnswer(questionId: string, questionText: string, answer: string): Promise<{ success: boolean; error?: string }> {
    if (!this.currentUser) {
      return { success: false, error: '未登录' };
    }

    try {
      const { error } = await supabase.from('user_answers').insert({
        user_id: this.currentUser.id,
        question_id: questionId,
        question_text: questionText,
        answer: answer,
      });

      if (error) {
        console.error('[Auth] 保存回答失败:', error);
        return { success: false, error: error.message };
      }

      console.log('[Auth] 保存回答成功');
      return { success: true };
    } catch (error: any) {
      console.error('[Auth] 保存回答异常:', error);
      return { success: false, error: error.message };
    }
  }

  // 获取用户的所有回答
  async getUserAnswers(): Promise<UserAnswer[]> {
    if (!this.currentUser) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('user_answers')
        .select('*')
        .eq('user_id', this.currentUser.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Auth] 获取回答失败:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('[Auth] 获取回答异常:', error);
      return [];
    }
  }

  // 更新打卡数据
  async updateStreak(streakData: Omit<UserStreak, 'id' | 'user_id'>): Promise<{ success: boolean; error?: string }> {
    if (!this.currentUser) {
      return { success: false, error: '未登录' };
    }

    try {
      const { error } = await supabase
        .from('user_streaks')
        .upsert({
          user_id: this.currentUser.id,
          ...streakData,
        });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // 获取打卡数据
  async getStreak(): Promise<UserStreak | null> {
    if (!this.currentUser) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', this.currentUser.id)
        .single();

      if (error) {
        // 如果没有记录，返回默认值
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('[Auth] 获取打卡数据失败:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('[Auth] 获取打卡数据异常:', error);
      return null;
    }
  }
}

// 单例实例
let authServiceInstance: AuthService | null = null;

export function getAuthService(): AuthService {
  if (!authServiceInstance) {
    authServiceInstance = new AuthService();
  }
  return authServiceInstance;
}

// 便捷函数
export async function signUp(credentials: SignUpCredentials) {
  return getAuthService().signUp(credentials);
}

export async function signIn(credentials: LoginCredentials) {
  return getAuthService().signIn(credentials);
}

export async function signOut() {
  return getAuthService().signOut();
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  return getAuthService().getCurrentUser();
}
