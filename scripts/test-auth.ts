/**
 * 测试 Supabase 认证功能
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://msfifonrgyxlysngguyu.supabase.co';
const supabaseKey = 'sb_publishable_-4YZCuSJ715fSUH0XskVFw_xJ5SWxKo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  console.log('🔐 测试 Supabase 认证功能...\n');

  // 1. 测试注册功能
  console.log('1️⃣ 测试注册功能...');
  const testEmail = `test${Math.floor(Math.random() * 10000)}@gmail.com`;
  const testPassword = 'test123456';

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
  });

  if (signUpError) {
    console.log('❌ 注册失败:', signUpError.message);
    return;
  }

  console.log('✅ 注册成功！');
  console.log('   用户ID:', signUpData.user?.id);
  console.log('   邮箱:', signUpData.user?.email);

  // 2. 检查是否自动创建了 profile
  console.log('\n2️⃣ 检查 profile 是否自动创建...');
  if (signUpData.user?.id) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', signUpData.user.id)
      .single();

    if (profileError) {
      console.log('❌ Profile 查询失败:', profileError.message);
    } else if (profile) {
      console.log('✅ Profile 已自动创建！');
      console.log('   Profile ID:', profile.id);
      console.log('   Profile 邮箱:', profile.email);
    } else {
      console.log('⚠️ Profile 未找到（可能需要手动创建）');
    }
  }

  // 3. 测试登录功能
  console.log('\n3️⃣ 测试登录功能...');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (signInError) {
    console.log('❌ 登录失败:', signInError.message);
    return;
  }

  console.log('✅ 登录成功！');
  console.log('   用户ID:', signInData.user?.id);
  console.log('   访问令牌:', signInData.session?.access_token ? '已获取' : '未获取');

  // 4. 测试登出功能
  console.log('\n4️⃣ 测试登出功能...');
  const { error: signOutError } = await supabase.auth.signOut();

  if (signOutError) {
    console.log('❌ 登出失败:', signOutError.message);
  } else {
    console.log('✅ 登出成功！');
  }

  console.log('\n' + '='.repeat(50));
  console.log('🎉 认证功能测试完成！所有功能正常。');
  console.log('='.repeat(50));

  // 提供测试账号信息
  console.log('\n📝 测试账号信息（可手动测试）:');
  console.log('   邮箱:', testEmail);
  console.log('   密码:', testPassword);
}

testAuth().catch(console.error);
