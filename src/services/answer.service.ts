import { AnswerRepository } from '../repository';
import { localStorage, LocalStorageKeys } from '../lib/localStorage';
import type { Answer } from '../types';

export class AnswerService {
  private answerRepo: AnswerRepository;

  constructor() {
    this.answerRepo = new AnswerRepository();
  }

  /**
   * 保存用户答案到云端
   */
  async saveAnswer(
    userId: string,
    questionId: string,
    questionText: string,
    answer: string,
    day?: number,
    chapter?: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.answerRepo.saveAnswer({
        user_id: userId,
        question_id: questionId,
        question_text: questionText,
        answer,
        day,
        chapter,
        created_at: new Date().toISOString(),
      });

      console.log('[AnswerService] 保存成功');
      return { success: true };
    } catch (error: any) {
      console.error('[AnswerService] 保存失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 从云端获取用户的所有答案
   */
  async getUserAnswers(userId: string): Promise<Answer[]> {
    try {
      return await this.answerRepo.findByUserId(userId);
    } catch (error) {
      console.error('[AnswerService] 获取答案失败:', error);
      return [];
    }
  }

  /**
   * 记录已回答的问题ID（到本地）
   */
  saveAnsweredQuestion(questionId: string, questionText: string): void {
    // 保存问题ID
    const answeredIds = this.getAnsweredQuestionIds();
    if (!answeredIds.includes(questionId)) {
      answeredIds.push(questionId);
      localStorage.set(LocalStorageKeys.ANSWERED_IDS, answeredIds);
    }

    // 保存问题文本（向后兼容）
    const answeredTexts = this.getAnsweredQuestions();
    if (!answeredTexts.includes(questionText)) {
      answeredTexts.push(questionText);
      localStorage.set(LocalStorageKeys.ANSWERED_QUESTIONS, answeredTexts);
    }
  }

  /**
   * 获取已回答问题的ID列表
   */
  getAnsweredQuestionIds(): string[] {
    return localStorage.get<string[]>(LocalStorageKeys.ANSWERED_IDS, []);
  }

  /**
   * 获取已回答的问题文本列表（向后兼容）
   */
  getAnsweredQuestions(): string[] {
    return localStorage.get<string[]>(LocalStorageKeys.ANSWERED_QUESTIONS, []);
  }

  /**
   * 清除已回答问题的记录
   */
  clearAnsweredQuestions(): void {
    localStorage.remove(LocalStorageKeys.ANSWERED_IDS);
    localStorage.remove(LocalStorageKeys.ANSWERED_QUESTIONS);
  }
}

// 单例
let answerServiceInstance: AnswerService | null = null;

export function getAnswerService(): AnswerService {
  if (!answerServiceInstance) {
    answerServiceInstance = new AnswerService();
  }
  return answerServiceInstance;
}
