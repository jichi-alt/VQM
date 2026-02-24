/**
 * 问题服务 - 使用预制问题，不再依赖 Gemini API
 */

import { Question } from './questionBank';
import { getRandomQuestion, getChapterInfo } from './questionBank';

export interface QuestionData {
  id: string;
  text: string;
  date: string;
  ticketNum: string;
  chapter: number;
  day: number;
}

// 本地存储 keys
const ANSWERED_QUESTIONS_KEY = 'qvm_answered_questions';
const ANSWERED_QUESTION_IDS_KEY = 'qvm_answered_question_ids';

/**
 * 获取已回答问题的ID列表
 */
export const getAnsweredQuestionIds = (): string[] => {
  try {
    const stored = localStorage.getItem(ANSWERED_QUESTION_IDS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Failed to get answered question IDs:', e);
    return [];
  }
};

/**
 * 获取已回答的问题文本列表（向后兼容）
 */
export const getAnsweredQuestions = (): string[] => {
  try {
    const stored = localStorage.getItem(ANSWERED_QUESTIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

/**
 * 记录已回答的问题
 */
export const saveAnsweredQuestion = (questionId: string, questionText: string): void => {
  try {
    // 保存问题ID
    const answeredIds = getAnsweredQuestionIds();
    if (!answeredIds.includes(questionId)) {
      answeredIds.push(questionId);
      localStorage.setItem(ANSWERED_QUESTION_IDS_KEY, JSON.stringify(answeredIds));
    }

    // 保存问题文本（向后兼容）
    const answeredTexts = getAnsweredQuestions();
    if (!answeredTexts.includes(questionText)) {
      answeredTexts.push(questionText);
      localStorage.setItem(ANSWERED_QUESTIONS_KEY, JSON.stringify(answeredTexts));
    }
  } catch (e) {
    console.error('Failed to save answered question:', e);
  }
};

/**
 * 清除已回答问题的记录
 */
export const clearAnsweredQuestions = (): void => {
  try {
    localStorage.removeItem(ANSWERED_QUESTION_IDS_KEY);
    localStorage.removeItem(ANSWERED_QUESTIONS_KEY);
  } catch (e) {
    console.error('Failed to clear answered questions:', e);
  }
};

/**
 * 生成哲学问题
 * @param day 当前打卡天数（可选，不传则从localStorage读取）
 * @returns Promise<QuestionData>
 */
export const generatePhilosophicalQuestion = async (
  day?: number
): Promise<QuestionData> => {
  try {
    // 获取当前天数
    let currentDay = day;
    if (currentDay === undefined) {
      try {
        const streakData = localStorage.getItem('qvm_streak');
        if (streakData) {
          const parsed = JSON.parse(streakData);
          currentDay = parsed.currentStreak || 1;
        }
      } catch (e) {
        currentDay = 1;
      }
    }

    // 获取已回答问题的ID列表
    const answeredIds = getAnsweredQuestionIds();

    // 从问题库随机获取一个问题
    const question = getRandomQuestion(currentDay || 1, answeredIds);

    const chapterInfo = getChapterInfo(currentDay || 1);

    return {
      id: question.id,
      text: question.text,
      date: new Date().toISOString().split('T')[0],
      ticketNum: Math.floor(1000 + Math.random() * 9000).toString(),
      chapter: chapterInfo.chapter,
      day: currentDay || 1
    };

  } catch (error) {
    console.error("Question Service Error:", error);
    // 返回默认问题
    return {
      id: 'fallback-' + Date.now(),
      text: '你今天在想什么？',
      date: new Date().toISOString().split('T')[0],
      ticketNum: Math.floor(1000 + Math.random() * 9000).toString(),
      chapter: 1,
      day: 1
    };
  }
};

/**
 * 根据问题ID获取问题详情
 */
export const getQuestionById = (id: string): Question | null => {
  const { ALL_QUESTIONS } = require('./questionBank');
  return ALL_QUESTIONS.find((q: Question) => q.id === id) || null;
};
