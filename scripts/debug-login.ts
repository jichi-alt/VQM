/**
 * 调试登录流程 - 找出"处理中"的原因
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://msfifonrgyxlysngguyu.supabase.co';
const supabaseKey = 'sb_publishable_-4YZCuSJ715fSUH0XskVFw_xJ5SWxKo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugLogin() {
  console.log('🔍 开始调试登录流程...\n');

  const testEmail = 'test4150@gmail.com';
  const testPassword = 'test123456';

  console.log('📧 测试账号:', testEmail);

  // 步骤 1: 测试登录请求
  console.log('\n1️⃣ 测试登录请求...');
  const startTime = Date.now();

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    const elapsed = Date.now() - startTime;
    console.log(`   ⏱️  请求耗时: ${elapsed}ms`);

    if (error) {
      console.log('❌ 登录失败:', error.message);
      return;
    }

    console.log('✅ 登录请求成功！');
    console.log('   用户ID:', data.user?.id);
    console.log('   邮箱确认:', data.user?.email_confirmed_at);
    console.log('   Session:', data.session ? '存在' : '不存在');

    // 步骤 2: 测试 profile 查询（这可能是卡住的地方）
    console.log('\n2️⃣ 测试 profile 查询...');
    const queryStart = Date.now();

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user!.id)
      .single();

    const queryElapsed = Date.now() - queryStart;
    console.log(`   ⏱️  查询耗时: ${queryElapsed}ms`);

    if (profileError) {
      console.log('⚠️  Profile 查询失败:', profileError.message);
      console.log('   错误代码:', profileError.code);
      console.log('   错误详情:', profileError.hint);
    } else if (profile) {
      console.log('✅ Profile 查询成功！');
      console.log('   Profile ID:', profile.id);
      console.log('   Profile 邮箱:', profile.email);
    } else {
      console.log('⚠️  Profile 为空');
    }

    // 步骤 3: 测试认证状态监听
    console.log('\n3️⃣ 测试认证状态监听...');
    let triggered = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`   📢 事件触发: ${event}`);
      if (!triggered) {
        triggered = true;
        console.log('   ✅ 认证监听正常工作');
      }
    });

    // 等待 2 秒看是否有事件触发
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (!triggered) {
      console.log('   ⚠️  认证监听未触发（可能需要手动触发）');
    }

    subscription.unsubscribe();

  } catch (err: any) {
    console.log('❌ 异常:', err.message);
    console.log('   错误堆栈:', err.stack);
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 诊断完成');
  console.log('='.repeat(50));

  console.log('\n💡 如果上面的步骤都成功了，问题可能在于：');
  console.log('   1. 前端代码没有正确热更新');
  console.log('   2. onAuthSuccess 函数没有被正确调用');
  console.log('   3. 状态更新后组件没有重新渲染');
  console.log('\n建议操作：');
  console.log('   1. 重启开发服务器: npm run dev');
  console.log('   2. 清除浏览器缓存：Ctrl+Shift+Delete');
  console.log('   3. 打开浏览器控制台（F12）查看错误');
}

debugLogin().catch(console.error);
