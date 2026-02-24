/**
 * 统一的 localStorage 操作工具
 *
 * 解决问题：
 * - localStorage 操作散落在 questionService、dataService 等多处
 * - key 名称不统一
 * - 错误处理不一致
 */

const PREFIX = 'qvm_';

/**
 * 统一的 localStorage key 常量
 */
export const LocalStorageKeys = {
  STREAK: `${PREFIX}streak`,
  DAILY_STATE: `${PREFIX}daily_state`,
  ANSWERED_IDS: `${PREFIX}answered_question_ids`,
  ANSWERED_QUESTIONS: `${PREFIX}answered_questions`, // 向后兼容
  VIEWED_FRAGMENTS: `${PREFIX}viewed_fragments`,
  ARCHIVES: `${PREFIX}archives`,
  PREFERENCES: `${PREFIX}preferences`,
  SEEN_PROLOGUE: `${PREFIX}seen_prologue`,
} as const;

/**
 * 统一的 localStorage 操作接口
 */
export const localStorage = {
  /**
   * 获取数据
   * @param key - localStorage key
   * @param defaultValue - 默认值（获取失败时返回）
   */
  get<T>(key: string, defaultValue: T): T {
    try {
      const stored = window.localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (e) {
      console.error(`localStorage get error for key ${key}:`, e);
      return defaultValue;
    }
  },

  /**
   * 保存数据
   * @param key - localStorage key
   * @param value - 要保存的值
   * @returns 是否保存成功
   */
  set(key: string, value: any): boolean {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`localStorage set error for key ${key}:`, e);
      return false;
    }
  },

  /**
   * 删除数据
   * @param key - localStorage key
   */
  remove(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      console.error(`localStorage remove error for key ${key}:`, e);
    }
  },

  /**
   * 清空所有数据
   */
  clear(): void {
    try {
      window.localStorage.clear();
    } catch (e) {
      console.error('localStorage clear error:', e);
    }
  },
};
