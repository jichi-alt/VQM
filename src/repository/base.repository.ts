import { supabase } from '../lib/supabase';

/**
 * Repository 基类
 * 提供通用的 CRUD 操作
 */
export abstract class BaseRepository<T> {
  protected abstract tableName: string;

  /**
   * 根据 ID 查询单条记录
   */
  async findById(id: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * 查询所有记录（支持过滤）
   */
  async findAll(filters: Record<string, any> = {}) {
    let query = supabase.from(this.tableName).select('*');

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  /**
   * 创建新记录
   */
  async create(item: T) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * 更新记录
   */
  async update(id: string, updates: Partial<T>) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * 删除记录
   */
  async delete(id: string) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Upsert（插入或更新）
   */
  async upsert(item: T) {
    const { data, error } = await supabase
      .from(this.tableName)
      .upsert(item)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
