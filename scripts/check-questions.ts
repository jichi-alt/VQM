/**
 * 检查问题库状态
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://msfifonrgyxlysngguyu.supabase.co';
const supabaseKey = 'sb_publishable_-4YZCuSJ715fSUH0XskVFw_xJ5SWxKo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkQuestions() {
  console.log('📚 检查问题库状态...\n');

  const { data, error, count } = await supabase
    .from('question_bank')
    .select('*', { count: 'exact', head: false })
    .limit(5);

  if (error) {
    console.log('❌ 错误:', error.message);
    return;
  }

  console.log(`📊 问题库总数: ${count ?? 0} 个\n`);

  if (count && count > 0) {
    console.log('✅ 问题库已初始化！前5个问题：\n');
    data.forEach((q, i) => {
      console.log(`${i + 1}. [第${q.chapter}章-第${q.day}天] ${q.text}`);
    });
  } else {
    console.log('⚠️ 问题库为空！\n');
    console.log('💡 解决方案：');
    console.log('   1. 访问 Supabase SQL Editor:');
    console.log('      https://supabase.com/dashboard/project/msfifonrgyxlysngguyu/sql');
    console.log('   2. 执行 supabase-setup-fixed.sql 中的 INSERT 语句');
    console.log('   3. 或者直接复制下面的 SQL 执行：\n');
    console.log('-- 复制从这里开始 --');
  }
}

checkQuestions();
