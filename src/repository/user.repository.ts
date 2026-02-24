import { BaseRepository } from './base.repository';
import type { User } from '../types';
import { supabase } from '../lib/supabase';

/**
 * 用户数据访问层
 */
export class UserRepository extends BaseRepository<User> {
  protected tableName = 'profiles';

  /**
   * 根据邮箱查询用户
   */
  async findByEmail(email: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * 根据ID查询用户
   */
  async findById(userId: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * 创建用户资料
   */
  async createProfile(user: User) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(user)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
