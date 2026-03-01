/**
 * 记忆碎片服务测试
 * 验证核心功能是否正常
 */

import { memoryFragmentService } from '../src/services/MemoryFragmentService';
import type { MemoryFragment } from '../src/types/memory.types';

console.log('════════════════════════════════════════');
console.log('   记忆碎片服务测试');
console.log('════════════════════════════════════════');
console.log('');

// 测试1: 获取进度
console.log('[测试1] 获取解锁进度...');
const progress = memoryFragmentService.getProgress();
console.log('✅ 总碎片:', progress.total);
console.log('✅ 已解锁:', progress.unlocked);
console.log('✅ 当前章节:', progress.currentChapter);
console.log('');

// 测试2: 检查是否有旧数据
console.log('[测试2] 检查旧数据迁移...');
const storage = memoryFragmentService.getStorage();
console.log('✅ 存储的碎片数量:', Object.keys(storage.fragments).length);
console.log('✅ 当前章节:', storage.currentChapter);
console.log('');

// 测试3: 获取第1天的碎片
console.log('[测试3] 获取第1天应该解锁的碎片...');
const day1Fragment = memoryFragmentService.getFragmentForDay(1);
if (day1Fragment) {
  console.log('✅ 找到碎片:', day1Fragment.id);
  console.log('   章节:', day1Fragment.chapter);
  console.log('   内容预览:', day1Fragment.content.substring(0, 30) + '...');
} else {
  console.log('⚠️  第1天没有可用的碎片');
}
console.log('');

// 测试4: 模拟解锁碎片
console.log('[测试4] 模拟解锁碎片...');
if (day1Fragment) {
  memoryFragmentService.unlockFragment(day1Fragment, 1, 'random');
  console.log('✅ 碎片已解锁');

  // 验证解锁
  const isUnlocked = memoryFragmentService.isUnlocked(day1Fragment.id);
  console.log('✅ 验证解锁状态:', isUnlocked);
}
console.log('');

// 测试5: 获取章节碎片
console.log('[测试5] 获取第1章所有碎片...');
const chapter1Fragments = memoryFragmentService.getChapterFragments(1);
console.log('✅ 第1章碎片数量:', chapter1Fragments.length);
chapter1Fragments.forEach(item => {
  console.log(`   ${item.fragment.id}: ${item.unlocked ? '✅已解锁' : '🔒未解锁'}`);
});
console.log('');

// 测试6: 数据导出
console.log('[测试6] 导出数据...');
const exportedData = memoryFragmentService.exportData();
console.log('✅ 导出的数据长度:', exportedData.length);
console.log('   数据预览:', exportedData.substring(0, 100) + '...');
console.log('');

console.log('════════════════════════════════════════');
console.log('   所有测试完成！');
console.log('════════════════════════════════════════');
