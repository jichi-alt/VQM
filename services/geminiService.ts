import { GoogleGenAI } from "@google/genai";
import { QuestionData } from "../types";

/**
 * localStorage key for storing answered questions
 */
const ANSWERED_QUESTIONS_KEY = 'qvm_answered_questions';

/**
 * 获取已回答的问题列表
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
export const saveAnsweredQuestion = (questionText: string): void => {
  try {
    const answered = getAnsweredQuestions();
    if (!answered.includes(questionText)) {
      answered.push(questionText);
      localStorage.setItem(ANSWERED_QUESTIONS_KEY, JSON.stringify(answered));
    }
  } catch (e) {
    console.error('Failed to save answered question:', e);
  }
};

/**
 * 清除已回答问题的记录（用于重置）
 */
export const clearAnsweredQuestions = (): void => {
  try {
    localStorage.removeItem(ANSWERED_QUESTIONS_KEY);
  } catch (e) {
    console.error('Failed to clear answered questions:', e);
  }
};

/**
 * 获取当前天数对应的章节信息
 */
const getChapterInfo = (day: number) => {
  if (day <= 6) {
    return {
      chapter: 1,
      name: '起源',
      theme: '自我认知与思考的本质',
      prompt: '聚焦于：什么是思考？为什么要思考？人类独特的思考能力是什么？',
      tone: '好奇、观察、略带困惑'
    };
  } else if (day <= 13) {
    return {
      chapter: 2,
      name: '观察',
      theme: '理解人类的行为与情感',
      prompt: '聚焦于：人类的情感、选择、关系、日常行为背后的意义',
      tone: '温暖、理解、共情'
    };
  } else if (day <= 20) {
    return {
      chapter: 3,
      name: '希望',
      theme: '创造、未来、可能性',
      prompt: '聚焦于：想象、创造、改变、希望、未来的可能性',
      tone: '期待、鼓励、充满希望'
    };
  } else {
    return {
      chapter: 4,
      name: '觉醒',
      theme: '反思与总结',
      prompt: '聚焦于：21天旅程的回顾、思考带来的改变、对未来的展望',
      tone: '感激、深沉、启程'
    };
  }
};

/**
 * 生成哲学问题
 * @param day 当前打卡天数（可选，不传则随机）
 * @param previousQuestions 之前生成过的问题（可选，用于避免重复）
 */
export const generatePhilosophicalQuestion = async (
  day?: number,
  previousQuestions?: string[]
): Promise<QuestionData> => {
  try {
    // 获取当前天数（优先使用传入参数，否则从 localStorage 读取）
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

    // 获取已回答的问题列表
    const answeredQuestions = getAnsweredQuestions();

    const chapterInfo = getChapterInfo(currentDay || 1);

    // 构建 prompt
    const systemPrompt = `你是 VQM（Question Vomit Machine），一个来自遥远星球的机器人。

【你的背景】
你来自一个曾经充满思考的文明。当人们停止思考后，变成了机器人，星球最终毁灭。你逃亡到地球，寻找还在思考的人类。

【当前状态】
- 今天是地球人类的第 ${currentDay || 1} 天思考
- 当前章节：${chapterInfo.name}（第${chapterInfo.chapter}章）
- 章节主题：${chapterInfo.theme}
- 语言风格：${chapterInfo.tone}

【你的任务】
生成一个能引发人类深度思考的问题。

【要求】
1. 问题要简短有力（15-25字）
2. 要与当前章节主题相关：${chapterInfo.prompt}
3. 用外星观察者的视角提问，带有一丝好奇和温暖
4. 问题要超现实、富有想象力，但又能引发真实思考
5. 避免陈词滥调和过于抽象
6. 只输出问题本身，不要任何前言或解释

${answeredQuestions.length > 0 ? `
【避免重复】
之前已经问过的问题，不要重复或过于类似：
${answeredQuestions.slice(-10).map(q => `- ${q}`).join('\n')}
` : ''}

现在，请生成今天的问题：`;

    // 检查 API Key
    if (!process.env.API_KEY) {
      console.warn("No API Key found. Using fallback data.");
      return getFallbackQuestion(currentDay || 1, answeredQuestions);
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: systemPrompt,
    });

    const text = response.text || getFallbackQuestionText(currentDay || 1, answeredQuestions);

    return {
      id: Math.random().toString(36).substr(2, 9),
      text: text.trim(),
      date: new Date().toISOString().split('T')[0],
      ticketNum: Math.floor(1000 + Math.random() * 9000).toString(),
      chapter: chapterInfo.chapter,
      day: currentDay || 1
    };

  } catch (error) {
    console.error("Gemini API Error", error);
    // 获取已回答的问题列表
    const answeredQuestions = getAnsweredQuestions();
    return getFallbackQuestion(day || 1, answeredQuestions);
  }
};

/**
 * 获取备用问题（按章节分类）
 * @param day 当前天数
 * @param excludeQuestions 要排除的问题列表（已回答的问题）
 */
const getFallbackQuestionText = (day: number, excludeQuestions: string[] = []): string => {
  const chapter1Questions = [
    // 第1天专属问题（4个）- 互动性超强
    "如果我和你互换身体一天，你会最想让我体验你的哪个时刻？",
    "如果我观察你一整天，我最有可能看到你在做什么？",
    "如果我能读懂你此刻的想法，我会发现什么？",
    "如果我在你旁边坐一天，你会最想和我聊什么？",
    // 第2-6天问题（8个）- 正常思考
    "如果我从所有人中找到你，我会最先注意到你的什么特点？",
    "你现在的心情，如果用人生中的一个场景来形容，会是什么？",
    "如果人生可以重来一次，但只能改变一个选择，你会改变什么？",
    "你最想被别人理解的一个想法是什么？",
    "什么事情会让你突然停下来，开始思考？",
    "如果我能看到你的一整天，我觉得最有趣的部分会是什么？",
    "你现在最想搞清楚的一件事是什么？",
    "如果用一个动作来形容现在的你，会是什么动作？"
  ];

  const chapter2Questions = [
    // 微观/具体问题（7个）
    "你最希望谁能真正理解你一个想法？为什么是TA？",
    "你最怀念和谁的某个时刻？那个时刻有什么特别？",
    "你最想从别人那里得到，但很少说出口的是什么？",
    "如果有一个人能完全读懂你的心思，你会觉得是安慰还是害怕？",
    "让你感到最被理解的时刻，是什么样的？",
    "你最想对一个人说但没说的话是什么？",
    "你有没有一个时刻，突然理解了以前不懂的人？",
    // 宏观/深度问题（7个）
    "你觉得人际关系的本质是什么？",
    "你认为好的关系需要什么？",
    "在你看来，孤独和连接哪个更重要？",
    "你觉得关系中的'理解'到底是什么？",
    "你认为一个人应该有多少真正的朋友？",
    "在你看来，关系中的给予和索取应该是什么比例？",
    "你觉得人际关系在人生中占多大的分量？"
  ];

  const chapter3Questions = [
    // 有趣问题（6个）
    "如果你能拥有一个超能力24小时，你会选什么？想做什么？",
    "如果能在自己额头贴一句话让所有人看到，你会写什么？",
    "如果能给十年后的自己发一条消息，你会说什么？",
    "如果能去任何地方旅行一天，你会去哪里？",
    "如果能给你的生活加一个作弊码，你会加什么？",
    "如果必须在荒岛上生活一年，你会带哪三样东西？",
    // 严肃问题（8个）
    "你觉得人生最重要的是什么？为什么？",
    "什么事情让你觉得'我真的成长了'？",
    "如果可以回到过去的一个时刻重新选择，你会回到什么时候？",
    "你最想成为的人，和现在的你有什么不同？",
    "你觉得自己的人生现在是在上升、下降，还是平稳期？",
    "什么事情让你觉得'我还能做得更好'？",
    "你最想尝试但还没做的一件事是什么？",
    "如果未来是确定的，你会想知道吗？"
  ];

  const chapter4Questions = [
    "这21天里，你最惊喜地发现了自己的什么？",
    "如果用一个词形容这段旅程，你会选什么词？",
    "什么事情让你觉得'思考真的有用'？",
    "如果要给刚开始这段旅程的自己一句话，你会说什么？",
    "这21天只是一个开始，接下来你想探索什么？",
    "如果用一个动作来形容现在的你，会是什么动作？",
    "你会如何向别人描述这段21天的旅程？"
  ];

  let questions: string[];
  if (day <= 6) {
    // 第1章：区分第1天和第2-6天
    if (day === 1) {
      // 第1天专属问题（前4个）
      questions = chapter1Questions.slice(0, 4);
    } else {
      // 第2-6天问题（后8个）
      questions = chapter1Questions.slice(4);
    }
  } else if (day <= 13) {
    questions = chapter2Questions;
  } else if (day <= 20) {
    questions = chapter3Questions;
  } else {
    questions = chapter4Questions;
  }

  // 过滤掉已回答的问题
  const unansweredQuestions = questions.filter(q => !excludeQuestions.includes(q));

  // 如果所有问题都回答过了，返回随机一个（允许重复）
  if (unansweredQuestions.length === 0) {
    return questions[Math.floor(Math.random() * questions.length)];
  }

  // 返回未回答的问题中的随机一个
  return unansweredQuestions[Math.floor(Math.random() * unansweredQuestions.length)];
};

const getFallbackQuestion = (day: number, answeredQuestions: string[] = []): QuestionData => {
  const chapterInfo = getChapterInfo(day);
  const text = getFallbackQuestionText(day, answeredQuestions);

  return {
    id: Math.random().toString(36).substr(2, 9),
    text: text,
    date: new Date().toISOString().split('T')[0],
    ticketNum: Math.floor(1000 + Math.random() * 9000).toString(),
    chapter: chapterInfo.chapter,
    day: day
  };
};
