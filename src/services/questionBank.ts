/**
 * 问题库 - 预制哲学问题
 * 按章节和天数组织，不再依赖 Gemini API
 */

export interface Question {
  id: string;
  text: string;
  chapter: number;
  day: number;
  isFirstDayOnly?: boolean;
}

/**
 * 章节 1：起源 (第1-6天)
 * 主题：自我认知与思考的本质
 */
const chapter1Questions: Question[] = [
  // 第1天专属问题（互动性超强）
  { id: 'c1-d1-1', text: '如果我和你互换身体一天，你会最想让我体验你的哪个时刻？', chapter: 1, day: 1, isFirstDayOnly: true },
  { id: 'c1-d1-2', text: '如果我观察你一整天，我最有可能看到你在做什么？', chapter: 1, day: 1, isFirstDayOnly: true },
  { id: 'c1-d1-3', text: '如果我能读懂你此刻的想法，我会发现什么？', chapter: 1, day: 1, isFirstDayOnly: true },
  { id: 'c1-d1-4', text: '如果我在你旁边坐一天，你会最想和我聊什么？', chapter: 1, day: 1, isFirstDayOnly: true },
  // 第2-6天问题
  { id: 'c1-d2-1', text: '如果我从所有人中找到你，我会最先注意到你的什么特点？', chapter: 1, day: 2 },
  { id: 'c1-d2-2', text: '你现在的心情，如果用人生中的一个场景来形容，会是什么？', chapter: 1, day: 2 },
  { id: 'c1-d3-1', text: '如果人生可以重来一次，但只能改变一个选择，你会改变什么？', chapter: 1, day: 3 },
  { id: 'c1-d3-2', text: '你最想被别人理解的一个想法是什么？', chapter: 1, day: 3 },
  { id: 'c1-d4-1', text: '什么事情会让你突然停下来，开始思考？', chapter: 1, day: 4 },
  { id: 'c1-d4-2', text: '如果我能看到你的一整天，我觉得最有趣的部分会是什么？', chapter: 1, day: 4 },
  { id: 'c1-d5-1', text: '你现在最想搞清楚的一件事是什么？', chapter: 1, day: 5 },
  { id: 'c1-d5-2', text: '如果用一个动作来形容现在的你，会是什么动作？', chapter: 1, day: 5 },
  { id: 'c1-d6-1', text: '你每天有多少时间真正属于自己？', chapter: 1, day: 6 },
  { id: 'c1-d6-2', text: '如果有人问你"你是谁"，你会怎么回答？', chapter: 1, day: 6 },
];

/**
 * 章节 2：观察 (第7-13天)
 * 主题：理解人类的行为与情感
 */
const chapter2Questions: Question[] = [
  // 微观/具体问题
  { id: 'c2-d7-1', text: '你最希望谁能真正理解你一个想法？为什么是TA？', chapter: 2, day: 7 },
  { id: 'c2-d7-2', text: '你最怀念和谁的某个时刻？那个时刻有什么特别？', chapter: 2, day: 7 },
  { id: 'c2-d8-1', text: '你最想从别人那里得到，但很少说出口的是什么？', chapter: 2, day: 8 },
  { id: 'c2-d8-2', text: '如果有一个人能完全读懂你的心思，你会觉得是安慰还是害怕？', chapter: 2, day: 8 },
  { id: 'c2-d9-1', text: '让你感到最被理解的时刻，是什么样的？', chapter: 2, day: 9 },
  { id: 'c2-d9-2', text: '你最想对一个人说但没说的话是什么？', chapter: 2, day: 9 },
  { id: 'c2-d10-1', text: '你有没有一个时刻，突然理解了以前不懂的人？', chapter: 2, day: 10 },
  { id: 'c2-d10-2', text: '你觉得人际关系的本质是什么？', chapter: 2, day: 10 },
  { id: 'c2-d11-1', text: '你认为好的关系需要什么？', chapter: 2, day: 11 },
  { id: 'c2-d11-2', text: '在你看来，孤独和连接哪个更重要？', chapter: 2, day: 11 },
  { id: 'c2-d12-1', text: '你觉得关系中的"理解"到底是什么？', chapter: 2, day: 12 },
  { id: 'c2-d12-2', text: '你认为一个人应该有多少真正的朋友？', chapter: 2, day: 12 },
  { id: 'c2-d13-1', text: '在你看来，关系中的给予和索取应该是什么比例？', chapter: 2, day: 13 },
  { id: 'c2-d13-2', text: '你觉得人际关系在人生中占多大的分量？', chapter: 2, day: 13 },
];

/**
 * 章节 3：希望 (第14-20天)
 * 主题：创造、未来、可能性
 */
const chapter3Questions: Question[] = [
  // 有趣问题
  { id: 'c3-d14-1', text: '如果你能拥有一个超能力24小时，你会选什么？想做什么？', chapter: 3, day: 14 },
  { id: 'c3-d14-2', text: '如果能在自己额头贴一句话让所有人看到，你会写什么？', chapter: 3, day: 14 },
  { id: 'c3-d15-1', text: '如果能给十年后的自己发一条消息，你会说什么？', chapter: 3, day: 15 },
  { id: 'c3-d15-2', text: '如果能去任何地方旅行一天，你会去哪里？', chapter: 3, day: 15 },
  { id: 'c3-d16-1', text: '如果能给你的生活加一个作弊码，你会加什么？', chapter: 3, day: 16 },
  { id: 'c3-d16-2', text: '如果必须在荒岛上生活一年，你会带哪三样东西？', chapter: 3, day: 16 },
  // 严肃问题
  { id: 'c3-d17-1', text: '你觉得人生最重要的是什么？为什么？', chapter: 3, day: 17 },
  { id: 'c3-d17-2', text: '什么事情让你觉得"我真的成长了"？', chapter: 3, day: 17 },
  { id: 'c3-d18-1', text: '如果可以回到过去的一个时刻重新选择，你会回到什么时候？', chapter: 3, day: 18 },
  { id: 'c3-d18-2', text: '你最想成为的人，和现在的你有什么不同？', chapter: 3, day: 18 },
  { id: 'c3-d19-1', text: '你觉得自己的人生现在是在上升、下降，还是平稳期？', chapter: 3, day: 19 },
  { id: 'c3-d19-2', text: '什么事情让你觉得"我还能做得更好"？', chapter: 3, day: 19 },
  { id: 'c3-d20-1', text: '你最想尝试但还没做的一件事是什么？', chapter: 3, day: 20 },
  { id: 'c3-d20-2', text: '如果未来是确定的，你会想知道吗？', chapter: 3, day: 20 },
];

/**
 * 章节 4：觉醒 (第21天)
 * 主题：反思与总结
 */
const chapter4Questions: Question[] = [
  { id: 'c4-d21-1', text: '这21天里，你最惊喜地发现了自己的什么？', chapter: 4, day: 21 },
  { id: 'c4-d21-2', text: '如果用一个词形容这段旅程，你会选什么词？', chapter: 4, day: 21 },
  { id: 'c4-d21-3', text: '什么事情让你觉得"思考真的有用"？', chapter: 4, day: 21 },
  { id: 'c4-d21-4', text: '如果要给刚开始这段旅程的自己一句话，你会说什么？', chapter: 4, day: 21 },
  { id: 'c4-d21-5', text: '这21天只是一个开始，接下来你想探索什么？', chapter: 4, day: 21 },
  { id: 'c4-d21-6', text: '如果用一个动作来形容现在的你，会是什么动作？', chapter: 4, day: 21 },
  { id: 'c4-d21-7', text: '你会如何向别人描述这段21天的旅程？', chapter: 4, day: 21 },
];

/**
 * 所有问题库
 */
export const ALL_QUESTIONS: Question[] = [
  ...chapter1Questions,
  ...chapter2Questions,
  ...chapter3Questions,
  ...chapter4Questions,
];

/**
 * 章节信息
 */
export interface ChapterInfo {
  chapter: number;
  name: string;
  theme: string;
  prompt: string;
  tone: string;
}

export const CHAPTER_INFO: Record<number, ChapterInfo> = {
  1: {
    chapter: 1,
    name: '起源',
    theme: '自我认知与思考的本质',
    prompt: '聚焦于：什么是思考？为什么要思考？人类独特的思考能力是什么？',
    tone: '好奇、观察、略带困惑'
  },
  2: {
    chapter: 2,
    name: '观察',
    theme: '理解人类的行为与情感',
    prompt: '聚焦于：人类的情感、选择、关系、日常行为背后的意义',
    tone: '温暖、理解、共情'
  },
  3: {
    chapter: 3,
    name: '希望',
    theme: '创造、未来、可能性',
    prompt: '聚焦于：想象、创造、改变、希望、未来的可能性',
    tone: '期待、鼓励、充满希望'
  },
  4: {
    chapter: 4,
    name: '觉醒',
    theme: '反思与总结',
    prompt: '聚焦于：21天旅程的回顾、思考带来的改变、对未来的展望',
    tone: '感激、深沉、启程'
  }
};

/**
 * 根据天数获取章节信息
 */
export const getChapterInfo = (day: number): ChapterInfo => {
  if (day <= 6) return CHAPTER_INFO[1];
  if (day <= 13) return CHAPTER_INFO[2];
  if (day <= 20) return CHAPTER_INFO[3];
  return CHAPTER_INFO[4];
};

/**
 * 获取指定天数可用的问题列表
 */
export const getQuestionsForDay = (day: number): Question[] => {
  return ALL_QUESTIONS.filter(q => q.day === day);
};

/**
 * 获取指定章节的问题列表
 */
export const getQuestionsForChapter = (chapter: number): Question[] => {
  return ALL_QUESTIONS.filter(q => q.chapter === chapter);
};

/**
 * 随机获取一个问题
 * @param day 当前天数
 * @param excludeIds 要排除的问题ID列表（已回答过的问题）
 */
export const getRandomQuestion = (day: number, excludeIds: string[] = []): Question => {
  const availableQuestions = ALL_QUESTIONS.filter(q => {
    // 筛选符合天数的问题
    if (q.day !== day) return false;
    // 排除已回答的问题
    if (excludeIds.includes(q.id)) return false;
    return true;
  });

  // 如果没有可用问题，返回该天数的任意一个问题（允许重复）
  if (availableQuestions.length === 0) {
    const dayQuestions = getQuestionsForDay(day);
    return dayQuestions[Math.floor(Math.random() * dayQuestions.length)];
  }

  // 随机返回一个问题
  return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
};
