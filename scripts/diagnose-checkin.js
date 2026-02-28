/**
 * 诊断打卡和记忆碎片状态
 */

// 在浏览器控制台运行此脚本

console.log('='.repeat(50));
console.log('🔍 诊断打卡和记忆碎片状态');
console.log('='.repeat(50));

// 1. 检查打卡数据
const streakData = JSON.parse(localStorage.getItem('qvm_streak') || 'null');
console.log('📅 打卡数据:', streakData);
console.log('  - 当前连续天数:', streakData?.currentStreak);
console.log('  - 上次打卡日期:', streakData?.lastCheckIn);
console.log('  - 今天是否已打卡:', streakData?.lastCheckIn === new Date().toLocaleDateString('en-CA'));

// 2. 检查记忆碎片
const viewedFragments = JSON.parse(localStorage.getItem('qvm_viewed_fragments') || '[]');
console.log('🧩 已查看的记忆碎片:', viewedFragments);

// 3. 检查是否有 CheckInSuccessModal
const modals = document.querySelectorAll('[class*="fixed"][class*="z-"]');
console.log('🎬 当前显示的模态框数量:', modals.length);
modals.forEach((modal, i) => {
  console.log(`  模态框 ${i + 1}:`, modal.className.substring(0, 100));
});

// 4. 检查 React 状态（需要访问内部状态，这里只能猜测）
console.log('');
console.log('💡 如果打卡成功但没有弹窗，可能原因：');
console.log('  1. CheckInSuccessModal 组件未渲染');
console.log('  2. showCheckInModal 状态未更新');
console.log('  3. z-index 被其他元素覆盖');
console.log('');
console.log('💡 如果打卡成功弹窗显示了但没有记忆碎片：');
console.log('  1. 没有点击"继续"按钮');
console.log('  2. tryTriggerMemoryFragment 未触发');
console.log('  3. 记忆碎片数据未加载');

console.log('='.repeat(50));
