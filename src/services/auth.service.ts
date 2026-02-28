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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] 认证状态变化:', event);

      if (event === 'SIGNED_IN' && session?.user) {
        // 先用 session 数据创建临时用户对象，立即通知 UI
        const tempUser: User = {
          id: session.user.id,
          email: session.user.email || '',
          username: session.user.user_metadata?.username || null,
          created_at: new Date(session.user.created_at).toISOString(),
          updated_at: new Date().toISOString(),
        };

        this.currentUser = tempUser;
        this.notifyListeners(); // 立即通知 UI 更新

        // 然后异步获取完整的 profile（不阻塞 UI）
        try {
          const profile = await this.userRepo.findById(session.user.id);
          if (profile) {
            this.currentUser = profile;
            this.notifyListeners(); // 再次通知 UI 更新完整数据
          }
        } catch (err) {
          console.error('[Auth] 获取 profile 失败，使用 session 数据:', err);
        }
      } else if (event === 'SIGNED_OUT') {
        this.currentUser = null;
        this.notifyListeners();
      }
    });

    // 返回清理函数
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
      subscription?.unsubscribe();
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

      // 注意：profile 由数据库 trigger 自动创建，不需要手动创建
      // trigger: handle_new_user() 在 auth.users 上触发

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

      // 获取用户完整信息（如果失败则使用 session 数据）
      if (data.user) {
        try {
          const profile = await this.userRepo.findById(data.user.id);
          if (profile) {
            this.currentUser = profile;
          } else {
            // Profile 不存在，使用 session 数据创建临时用户对象
            this.currentUser = {
              id: data.user.id,
              email: data.user.email || '',
              username: data.user.user_metadata?.username || null,
              created_at: new Date(data.user.created_at).toISOString(),
              updated_at: new Date().toISOString(),
            };
          }
        } catch (err) {
          console.error('[Auth] 获取 profile 失败，使用 session 数据:', err);
          // 即使 profile 查询失败，也使用 session 数据
          this.currentUser = {
            id: data.user.id,
            email: data.user.email || '',
            username: data.user.user_metadata?.username || null,
            created_at: new Date(data.user.created_at).toISOString(),
            updated_at: new Date().toISOString(),
          };
        }
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
