import React, { useState, useEffect } from 'react';

interface UnlockMemoryModalProps {
  isOpen: boolean;
  onConfirm: () => void;
}

/**
 * UnlockMemoryModal - 解锁记忆碎片弹窗组件
 */
export const UnlockMemoryModal = ({ isOpen, onConfirm }: UnlockMemoryModalProps) => {
  const [isUnlocking, setIsUnlocking] = useState(false);

  // 调试日志
  console.log('[UnlockMemoryModal] 渲染，isOpen:', isOpen);

  const handleUnlock = () => {
    console.log('[UnlockMemoryModal] 点击解锁按钮');
    setIsUnlocking(true);
    setTimeout(() => {
      console.log('[UnlockMemoryModal] 调用 onConfirm');
      onConfirm();
    }, 800);
  };

  // 当弹窗打开时，检查是否有可用的碎片
  // 如果 onConfirm 无效（说明主组件检测到没有可用碎片），则立即关闭
  useEffect(() => {
    if (isOpen) {
      setIsUnlocking(false);
      console.log('[UnlockMemoryModal] 弹窗已打开，等待用户点击解锁');
    }
  }, [isOpen]);

  if (!isOpen) {
    console.log('[UnlockMemoryModal] isOpen 为 false，不渲染');
    return null;
  }

  console.log('[UnlockMemoryModal] isOpen 为 true，渲染解锁弹窗');

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
      {/* 全屏闪光效果 */}
      {isUnlocking && (
        <div className="absolute inset-0 bg-amber-400 animate-[flash_0.8s_ease-out_forwards] z-0"></div>
      )}

      <div className="w-[340px] bg-space-850/90 backdrop-blur-md border-2 border-amber-400 shadow-[6px_6px_0px_0px_rgba(251,191,36,0.4)] animate-in zoom-in-95 duration-500 flex flex-col overflow-hidden hologram relative z-10">

        {/* 顶部装饰条 */}
        <div className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 h-2 animate-pulse"></div>

        {/* 主要内容 */}
        <div className="px-6 py-8 text-center">
          {/* 锁图标动画 */}
          <div className="flex justify-center mb-6">
            <div className={`w-20 h-20 bg-space-800 rounded-full flex items-center justify-center border-2 border-amber-400/50 relative ${isUnlocking ? 'animate-[unlockPulse_0.8s_ease-out_forwards]' : 'animate-bounce'}`} style={{ animationDuration: isUnlocking ? '0.8s' : '2s' }}>
              <span className={`material-symbols-outlined text-4xl ${isUnlocking ? 'text-amber-300 scale-150 transition-transform duration-300' : 'text-amber-400'}`}>
                {isUnlocking ? 'lock_open' : 'lock'}
              </span>
              {/* 光环效果 */}
              <div className={`absolute inset-0 rounded-full border border-amber-400/30 ${isUnlocking ? 'animate-[unlockRing_0.8s_ease-out_forwards]' : 'animate-ping'}`}></div>
            </div>
          </div>

          {/* 核心文案 */}
          <p className={`text-lg font-black mb-3 leading-relaxed ${isUnlocking ? 'text-amber-300 scale-110 transition-all duration-300' : 'text-amber-100 glow-text'}`}>
            {isUnlocking ? '记忆已解锁！' : '记忆碎片正在恢复...'}
          </p>
          <p className="text-sm text-cyan-400/80 mb-8 leading-relaxed">
            {isUnlocking ? '正在读取数据...' : '你在思考时产生的能量\n正在解锁机器人的一段记忆'}
          </p>

          {/* 解锁按钮 */}
          {!isUnlocking && (
            <button
              onClick={handleUnlock}
              className="w-full bg-amber-400 hover:bg-amber-300 text-space-900 border-2 border-amber-500 font-bold py-3 px-4 transition-all flex items-center justify-center gap-2 btn-3d btn-glow shadow-lg shadow-amber-400/30 relative"
            >
              <span className="material-symbols-outlined">lock_open</span>
              <span className="text-sm uppercase tracking-wider">解锁记忆碎片</span>
            </button>
          )}
        </div>

        {/* 底部装饰 */}
        <div className="bg-black/30 px-4 py-2 border-t border-white/10">
          <p className="text-[10px] text-amber-400/60 font-mono text-center">
            ● MEMORY FRAGMENT RECOVERY ●
          </p>
        </div>
      </div>
    </div>
  );
};
