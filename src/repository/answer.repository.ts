import { BaseRepository } from './base.repository';
import type { Answer } from '../types';
import { supabase } from '../lib/supabase';

/**
 * 答案数据访问层
 */
export class AnswerRepository extends BaseRepository<Answer> {
  protected tableName = 'user_answers';

  /**
   * 根据用户ID查询所有答案
   */
  async findByUserId(userId: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * 查询用户对某个问题的回答
   */
  async findByQuestion(userId: string, questionId: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('question_id', questionId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /**
   * 保存用户答案
   */
  async saveAnswer(answer: Omit<Answer, 'id'>) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(answer)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
