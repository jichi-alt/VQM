import { BaseRepository } from './base.repository';
import type { Streak } from '../types';
import { supabase } from '../lib/supabase';

/**
 * 打卡数据访问层
 */
export class StreakRepository extends BaseRepository<Streak> {
  protected tableName = 'user_streaks';

  /**
   * 根据用户ID查询打卡数据
   */
  async findByUserId(userId: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * 保存或更新打卡数据
   */
  async saveByUserId(userId: string, streak: Omit<Streak, 'user_id'>) {
    const { data, error } = await supabase
      .from(this.tableName)
      .upsert({ user_id: userId, ...streak })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
