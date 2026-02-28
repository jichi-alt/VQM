/**
 * 初始化问题库数据
 * 执行此脚本前请确保已在 Supabase 控制台执行了 supabase-setup-fixed.sql
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://msfifonrgyxlysngguyu.supabase.co';
const supabaseKey = 'sb_publishable_-4YZCuSJ715fSUH0XskVFw_xJ5SWxKo';

const supabase = createClient(supabaseUrl, supabaseKey);

const questions = [
  // 章节 1：起源 (第1-6天)
  { id: 'c1-d1-1', text: '如果我和你互换身体一天，你会最想让我体验你的哪个时刻？', chapter: 1, day: 1, is_first_day_only: true },
  { id: 'c1-d1-2', text: '如果我观察你一整天，我最有可能看到你在做什么？', chapter: 1, day: 1, is_first_day_only: true },
  { id: 'c1-d1-3', text: '如果我能读懂你此刻的想法，我会发现什么？', chapter: 1, day: 1, is_first_day_only: true },
  { id: 'c1-d1-4', text: '如果我在你旁边坐一天，你会最想和我聊什么？', chapter: 1, day: 1, is_first_day_only: true },
  { id: 'c1-d2-1', text: '如果我从所有人中找到你，我会最先注意到你的什么特点？', chapter: 1, day: 2, is_first_day_only: false },
  { id: 'c1-d2-2', text: '你现在的心情，如果用人生中的一个场景来形容，会是什么？', chapter: 1, day: 2, is_first_day_only: false },
  { id: 'c1-d3-1', text: '如果人生可以重来一次，但只能改变一个选择，你会改变什么？', chapter: 1, day: 3, is_first_day_only: false },
  { id: 'c1-d3-2', text: '你最想被别人理解的一个想法是什么？', chapter: 1, day: 3, is_first_day_only: false },
  { id: 'c1-d4-1', text: '什么事情会让你突然停下来，开始思考？', chapter: 1, day: 4, is_first_day_only: false },
  { id: 'c1-d4-2', text: '如果我能看到你的一整天，我觉得最有趣的部分会是什么？', chapter: 1, day: 4, is_first_day_only: false },
  { id: 'c1-d5-1', text: '你现在最想搞清楚的一件事是什么？', chapter: 1, day: 5, is_first_day_only: false },
  { id: 'c1-d5-2', text: '如果用一个动作来形容现在的你，会是什么动作？', chapter: 1, day: 5, is_first_day_only: false },
  { id: 'c1-d6-1', text: '你每天有多少时间真正属于自己？', chapter: 1, day: 6, is_first_day_only: false },
  { id: 'c1-d6-2', text: '如果有人问你"你是谁"，你会怎么回答？', chapter: 1, day: 6, is_first_day_only: false },

  // 章节 2：观察 (第7-13天)
  { id: 'c2-d7-1', text: '你最希望谁能真正理解你一个想法？为什么是TA？', chapter: 2, day: 7, is_first_day_only: false },
  { id: 'c2-d7-2', text: '你最怀念和谁的某个时刻？那个时刻有什么特别？', chapter: 2, day: 7, is_first_day_only: false },
  { id: 'c2-d8-1', text: '你最想从别人那里得到，但很少说出口的是什么？', chapter: 2, day: 8, is_first_day_only: false },
  { id: 'c2-d8-2', text: '如果有一个人能完全读懂你的心思，你会觉得是安慰还是害怕？', chapter: 2, day: 8, is_first_day_only: false },
  { id: 'c2-d9-1', text: '让你感到最被理解的时刻，是什么样的？', chapter: 2, day: 9, is_first_day_only: false },
  { id: 'c2-d9-2', text: '你最想对一个人说但没说的话是什么？', chapter: 2, day: 9, is_first_day_only: false },
  { id: 'c2-d10-1', text: '你有没有一个时刻，突然理解了以前不懂的人？', chapter: 2, day: 10, is_first_day_only: false },
  { id: 'c2-d10-2', text: '你觉得人际关系的本质是什么？', chapter: 2, day: 10, is_first_day_only: false },
  { id: 'c2-d11-1', text: '你认为好的关系需要什么？', chapter: 2, day: 11, is_first_day_only: false },
  { id: 'c2-d11-2', text: '在你看来，孤独和连接哪个更重要？', chapter: 2, day: 11, is_first_day_only: false },
  { id: 'c2-d12-1', text: '你觉得关系中的"理解"到底是什么？', chapter: 2, day: 12, is_first_day_only: false },
  { id: 'c2-d12-2', text: '你认为一个人应该有多少真正的朋友？', chapter: 2, day: 12, is_first_day_only: false },
  { id: 'c2-d13-1', text: '在你看来，关系中的给予和索取应该是什么比例？', chapter: 2, day: 13, is_first_day_only: false },
  { id: 'c2-d13-2', text: '你觉得人际关系在人生中占多大的分量？', chapter: 2, day: 13, is_first_day_only: false },

  // 章节 3：希望 (第14-20天)
  { id: 'c3-d14-1', text: '如果你能拥有一个超能力24小时，你会选什么？想做什么？', chapter: 3, day: 14, is_first_day_only: false },
  { id: 'c3-d14-2', text: '如果能在自己额头贴一句话让所有人看到，你会写什么？', chapter: 3, day: 14, is_first_day_only: false },
  { id: 'c3-d15-1', text: '如果能给十年后的自己发一条消息，你会说什么？', chapter: 3, day: 15, is_first_day_only: false },
  { id: 'c3-d15-2', text: '如果能去任何地方旅行一天，你会去哪里？', chapter: 3, day: 15, is_first_day_only: false },
  { id: 'c3-d16-1', text: '如果能给你的生活加一个作弊码，你会加什么？', chapter: 3, day: 16, is_first_day_only: false },
  { id: 'c3-d16-2', text: '如果必须在荒岛上生活一年，你会带哪三样东西？', chapter: 3, day: 16, is_first_day_only: false },
  { id: 'c3-d17-1', text: '你觉得人生最重要的是什么？为什么？', chapter: 3, day: 17, is_first_day_only: false },
  { id: 'c3-d17-2', text: '什么事情让你觉得"我真的成长了"？', chapter: 3, day: 17, is_first_day_only: false },
  { id: 'c3-d18-1', text: '如果可以回到过去的一个时刻重新选择，你会回到什么时候？', chapter: 3, day: 18, is_first_day_only: false },
  { id: 'c3-d18-2', text: '你最想成为的人，和现在的你有什么不同？', chapter: 3, day: 18, is_first_day_only: false },
  { id: 'c3-d19-1', text: '你觉得自己的人生现在是在上升、下降，还是平稳期？', chapter: 3, day: 19, is_first_day_only: false },
  { id: 'c3-d19-2', text: '什么事情让你觉得"我还能做得更好"？', chapter: 3, day: 19, is_first_day_only: false },
  { id: 'c3-d20-1', text: '你最想尝试但还没做的一件事是什么？', chapter: 3, day: 20, is_first_day_only: false },
  { id: 'c3-d20-2', text: '如果未来是确定的，你会想知道吗？', chapter: 3, day: 20, is_first_day_only: false },

  // 章节 4：觉醒 (第21天)
  { id: 'c4-d21-1', text: '这21天里，你最惊喜地发现了自己的什么？', chapter: 4, day: 21, is_first_day_only: false },
  { id: 'c4-d21-2', text: '如果用一个词形容这段旅程，你会选什么词？', chapter: 4, day: 21, is_first_day_only: false },
  { id: 'c4-d21-3', text: '什么事情让你觉得"思考真的有用"？', chapter: 4, day: 21, is_first_day_only: false },
  { id: 'c4-d21-4', text: '如果要给刚开始这段旅程的自己一句话，你会说什么？', chapter: 4, day: 21, is_first_day_only: false },
  { id: 'c4-d21-5', text: '这21天只是一个开始，接下来你想探索什么？', chapter: 4, day: 21, is_first_day_only: false },
  { id: 'c4-d21-6', text: '如果用一个动作来形容现在的你，会是什么动作？', chapter: 4, day: 21, is_first_day_only: false },
  { id: 'c4-d21-7', text: '你会如何向别人描述这段21天的旅程？', chapter: 4, day: 21, is_first_day_only: false },
];

async function initQuestions() {
  console.log('📚 开始初始化问题库...\n');

  try {
    const { data, error } = await supabase
      .from('question_bank')
      .insert(questions)
      .select();

    if (error) {
      console.log('❌ 初始化失败:', error.message);
      return false;
    }

    console.log(`✅ 成功插入 ${data?.length ?? 0} 个问题！\n`);
    console.log('📊 问题库统计：');

    const chapterCounts = questions.reduce((acc, q) => {
      acc[q.chapter] = (acc[q.chapter] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    Object.entries(chapterCounts).forEach(([chapter, count]) => {
      console.log(`   章节 ${chapter}: ${count} 个问题`);
    });

    console.log('\n🎉 问题库初始化完成！');
    return true;
  } catch (err: any) {
    console.log('❌ 执行失败:', err.message);
    return false;
  }
}

initQuestions()
  .then(success => process.exit(success ? 0 : 1))
  .catch(err => {
    console.error('脚本执行失败:', err);
    process.exit(1);
  });
