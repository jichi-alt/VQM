import { supabase } from '../lib/supabase';
import { UserRepository } from '../repository';
import type { User, SignUpCredentials, LoginCredentials } from '../types';

export class AuthService {
  private userRepo: UserRepository;
  private currentUser: User | null = null;
  private listeners: ((user: User | null) => void)[] = [];

  constructor() {
    this.userRepo = new UserRepository();
  }

  // ========== 认证相关 ==========

  /**
   * 初始化：检查用户登录状态
   */
  async initialize(): Promise<User | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // 获取用户完整信息
        this.currentUser = await this.userRepo.findById(session.user.id);
        this.notifyListeners();
        return this.currentUser;
      }

      return null;
    } catch (error) {
      console.error('[Auth] 初始化失败:', error);
      return null;
    }
  }

  /**
   * 监听认证状态变化
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    this.listeners.push(callback);

    // 监听 Supabase 认证事件
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] 认证状态变化:', event);

      if (event === 'SIGNED_IN' && session?.user) {
        // 获取用户完整信息
        this.currentUser = await this.userRepo.findById(session.user.id);
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

  /**
   * 获取当前用户
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * 注册
   */
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

      // 创建用户资料
      if (data.user) {
        await this.userRepo.createProfile({
          id: data.user.id,
          email: data.user.email!,
          username: credentials.username,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      return { success: true };
    } catch (error: any) {
      console.error('[Auth] 注册异常:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 登录
   */
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
        this.currentUser = await this.userRepo.findById(data.user.id);
        this.notifyListeners();
      }

      return { success: true };
    } catch (error: any) {
      console.error('[Auth] 登录异常:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 登出
   */
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

export async function getCurrentUser(): Promise<User | null> {
  return getAuthService().getCurrentUser();
}
