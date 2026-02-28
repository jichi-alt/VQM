/**
 * Supabase 连接验证脚本
 * 检查数据库配置是否正确
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://msfifonrgyxlysngguyu.supabase.co';
const supabaseKey = 'sb_publishable_-4YZCuSJ715fSUH0XskVFw_xJ5SWxKo';

const supabase = createClient(supabaseUrl, supabaseKey);

const tables = [
  'profiles',
  'user_streaks',
  'user_answers',
  'question_bank',
  'answered_questions',
  'viewed_fragments',
  'user_preferences',
  'daily_states'
];

async function verifySupabase() {
  console.log('🔍 开始验证 Supabase 配置...\n');

  // 测试连接
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      console.log('❌ Supabase 连接失败:', error.message);
      console.log('\n💡 请在 Supabase 控制台的 SQL Editor 中执行 supabase-setup-fixed.sql');
      return false;
    }
    console.log('✅ Supabase 连接成功\n');
  } catch (err: any) {
    console.log('❌ 连接错误:', err.message);
    return false;
  }

  // 检查所有表
  console.log('📊 检查数据库表...\n');
  let allTablesExist = true;

  for (const table of tables) {
    try {
      const { data, error, status } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error && status !== 406) {
        console.log(`❌ 表 '${table}' 不存在或无法访问`);
        console.log(`   错误: ${error.message}\n`);
        allTablesExist = false;
      } else {
        // 尝试获取行数
        const { count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        console.log(`✅ 表 '${table}' 存在 (${count ?? 0} 行)`);
      }
    } catch (err: any) {
      console.log(`❌ 表 '${table}' 检查失败:`, err.message);
      allTablesExist = false;
    }
  }

  console.log('\n' + '='.repeat(50));

  if (allTablesExist) {
    console.log('✅ 所有表都存在！数据库配置正确。');
    console.log('\n🎉 Supabase 配置验证通过！');
    return true;
  } else {
    console.log('❌ 部分表缺失，请执行数据库设置脚本。');
    console.log('\n💡 解决方案：');
    console.log('   1. 访问 Supabase 控制台');
    console.log('   2. 进入 SQL Editor');
    console.log('   3. 复制并执行 supabase-setup-fixed.sql 的内容');
    return false;
  }
}

verifySupabase()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('验证脚本执行失败:', err);
    process.exit(1);
  });
