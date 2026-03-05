import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface MemoryFragmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  chapter: number | 'final';
  currentDay: number;
}

/**
 * MemoryFragmentModal - 记忆碎片展示弹窗组件
 */
export const MemoryFragmentModal = ({ isOpen, onClose, content, chapter, currentDay }: MemoryFragmentModalProps) => {
  // 调试日志
  console.log('[MemoryFragmentModal] 渲染，isOpen:', isOpen, 'content:', content?.substring(0, 50));

  // 锁定 body 滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen) {
    console.log('[MemoryFragmentModal] isOpen 为 false，不渲染');
    return null;
  }

  console.log('[MemoryFragmentModal] isOpen 为 true，开始渲染...');

  // 章节颜色
  const chapterColors: Record<number | 'final', { bg: string; border: string; text: string; glow: string; title: string }> = {
    1: { bg: 'bg-space-800/90', border: 'border-space-600', text: 'text-zinc-300', glow: 'shadow-zinc-500/20', title: '记忆碎片' },
    2: { bg: 'bg-blue-900/80', border: 'border-cyan-500/50', text: 'text-cyan-100', glow: 'shadow-cyan-500/30', title: '记忆碎片' },
    3: { bg: 'bg-purple-900/80', border: 'border-purple-500/50', text: 'text-purple-100', glow: 'shadow-purple-500/30', title: '记忆碎片' },
    final: { bg: 'bg-amber-900/80', border: 'border-amber-400', text: 'text-amber-100', glow: 'shadow-amber-500/50', title: '记忆解锁' }
  };

  const colors = chapterColors[chapter] || chapterColors[1];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-500 scanlines perspective-1000" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
      <div className={`w-[360px] ${colors.bg} border-2 ${colors.border} ${colors.glow} shadow-2xl flex flex-col overflow-hidden hologram relative flip-in`} style={{ transformStyle: 'preserve-3d', zIndex: 10000, position: 'relative' }}>

        {/* 动态光效边框 */}
        <div className="absolute inset-0 border-2 border-amber-400/20 rounded-lg animate-[borderPulse_2s_ease-in-out_infinite] pointer-events-none"></div>
        <div className="absolute inset-0 border border-cyan-400/20 rounded-lg animate-[borderPulse_2s_ease-in-out_infinite_0.5s] pointer-events-none"></div>

        {/* 扫描线动画 */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-amber-400/5 to-transparent animate-scanline"></div>

        {/* 顶部：章节标签 + 关闭 */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400 text-sm">lock_open</span>
            <span className={`text-xs font-mono ${colors.text} opacity-70`}>● {colors.title}</span>
            <span className={`text-xs font-bold ${colors.text} ${chapter === 'final' ? 'glow-text' : ''}`}>
              第{chapter === 'final' ? '终' : chapter}章
            </span>
          </div>
          <button onClick={onClose} className={`${colors.text} hover:text-amber-400 transition-colors`}>
            <X size={16} />
          </button>
        </div>

        {/* 中部：机器人头像 + 内容 */}
        <div className="px-6 py-6 flex flex-col items-center relative z-20">
          {/* 机器人小头像 - 破旧风格 + 3D浮动 */}
          <div className="w-16 h-16 bg-space-800 rounded-xl flex items-center justify-center mb-4 border border-rust-500/60 robot-damaged relative float-3d depth-shadow">
            {/* 扫描线 */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent animate-scanline rounded-xl"></div>
            <div className="w-12 h-10 bg-space-850 rounded-lg flex flex-col items-center justify-center border border-space-700">
              <div className="flex gap-2 mb-1">
                <div className="w-3 h-3 bg-amber-400/90 rounded-full shadow-lg shadow-amber-400/30"></div>
                <div className="w-3 h-3 bg-amber-400/60 rounded-full shadow-lg"></div>
              </div>
              <div className="w-3 h-1 bg-space-600 rounded-full"></div>
            </div>
          </div>

          {/* 文字内容 */}
          <p className={`text-sm leading-relaxed text-center ${colors.text} whitespace-pre-line relative z-20`} style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
            {content.replace('{streak}', String(currentDay))}
          </p>
        </div>

        {/* 底部：进度指示 */}
        <div className="px-6 py-3 bg-black/30 border-t border-white/10 relative z-10">
          <div className="flex items-center justify-between text-xs">
            <span className={`${colors.text} opacity-60 font-mono`}>
              DAY {currentDay} / 21
            </span>
            <span className={`${colors.text} opacity-80 font-mono`}>
              {chapter === 'final' ? '▓▓▓▓▓▓▓ 100%'
               : chapter === 3 ? '▓▓▓▓▓▓░ 85%'
               : chapter === 2 ? '▓▓▓░░░░ 40%'
               : '▓░░░░░░ 15%'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
