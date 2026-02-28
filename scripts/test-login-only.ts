/**
 * 测试登录功能（使用已存在的测试账号）
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://msfifonrgyxlysngguyu.supabase.co';
const supabaseKey = 'sb_publishable_-4YZCuSJ715fSUH0XskVFw_xJ5SWxKo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  console.log('🔐 测试登录功能...\n');

  // 使用之前创建的测试账号
  const testEmail = 'test4150@gmail.com';
  const testPassword = 'test123456';

  console.log('📧 测试账号:', testEmail);
  console.log('🔑 密码:', testPassword);
  console.log('');

  const { data, error } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (error) {
    console.log('❌ 登录失败:', error.message);
    console.log('');
    console.log('💡 可能的原因：');
    console.log('   1. 邮件确认功能尚未关闭（需要等待几分钟生效）');
    console.log('   2. 测试账号密码错误');
    console.log('   3. Supabase 配置问题');
    return;
  }

  console.log('✅ 登录成功！\n');
  console.log('👤 用户信息：');
  console.log('   用户ID:', data.user?.id);
  console.log('   邮箱:', data.user?.email);
  console.log('   已确认:', data.user?.email_confirmed_at ? '是' : '否');
  console.log('   会话令牌:', data.session?.access_token ? '已获取' : '未获取');
  console.log('');

  // 测试获取 profile
  if (data.user?.id) {
    console.log('📋 测试获取用户 Profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.log('❌ Profile 获取失败:', profileError.message);
    } else {
      console.log('✅ Profile 获取成功！');
      console.log('   用户名:', profile.username || '未设置');
      console.log('   创建时间:', profile.created_at);
    }
  }

  console.log('');
  console.log('='.repeat(50));
  console.log('🎉 登录功能测试完成！');
  console.log('='.repeat(50));
}

testLogin().catch(console.error);
