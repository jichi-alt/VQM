/**
 * 记忆档案馆 - 时间轴版本
 * 产品设计理念：时光机式回顾，清晰展示21天解锁进度
 *
 * 功能：查看已解锁的记忆碎片（与历史样本独立）
 */

import React, { useState, useEffect, useMemo } from 'react';
import { X, Lock, Archive, Trophy, RotateCcw, ArrowLeft } from 'lucide-react';
import { memoryFragmentService } from '../src/services/MemoryFragmentService';
import type { MemoryFragment } from '../src/types/memory.types';
import { MemoryFragmentModal } from './QuestionVomitMachine/modals/MemoryFragmentModal';
import { MEMORY_FRAGMENTS } from '../src/services/memoryFragments';

interface MemoryArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 天数到碎片的映射（确定性）
const DAY_FRAGMENT_MAP: Record<number, string> = {
  1: 'c1-1', 2: 'c1-2', 3: 'c1-3', 4: 'c1-4', 5: 'c1-5', 6: 'c1-6',
  7: 'milestone-7',
  8: 'c2-1', 9: 'c2-2', 10: 'c2-3', 11: 'c2-4', 12: 'c2-5', 13: 'c2-6',
  14: 'milestone-14',
  15: 'c3-1', 16: 'c3-2', 17: 'c3-3', 18: 'c3-4', 19: 'c3-5', 20: 'c3-6',
  21: 'final'
};

// 章节配置
const CHAPTERS = [
  { dayStart: 1, dayEnd: 6, title: '失落的余温', color: 'text-zinc-400' },
  { dayStart: 7, dayEnd: 13, title: '算法的葬礼', color: 'text-cyan-400' },
  { dayStart: 14, dayEnd: 20, title: '最后的人类', color: 'text-purple-400' },
  { dayStart: 21, dayEnd: 21, title: '见证者之约', color: 'text-amber-400' }
];

export const MemoryArchiveModal: React.FC<MemoryArchiveModalProps> = ({ isOpen, onClose }) => {
  const [progress, setProgress] = useState(memoryFragmentService.getProgress());
  const [selectedFragment, setSelectedFragment] = useState<MemoryFragment | null>(null);
  const [showFragmentModal, setShowFragmentModal] = useState(false);

  const refreshProgress = () => {
    setProgress(memoryFragmentService.getProgress());
  };

  useEffect(() => {
    if (isOpen) refreshProgress();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  const handleFragmentClick = (fragment: MemoryFragment) => {
    if (!fragment) return;
    setSelectedFragment(fragment);
    setShowFragmentModal(true);
    memoryFragmentService.incrementViewCount(fragment.id);
    refreshProgress();
  };

  const handleReset = () => {
    if (confirm('确定要清空所有记忆碎片数据吗？')) {
      memoryFragmentService.clearAll();
      refreshProgress();
    }
  };

  // 生成时间轴数据
  const timelineData = useMemo(() => {
    const storage = memoryFragmentService.getStorage();
    const unlockedIds = new Set(Object.keys(storage.fragments));

    return Array.from({ length: 21 }, (_, i) => {
      const day = i + 1;
      const fragmentId = DAY_FRAGMENT_MAP[day];
      const unlocked = fragmentId ? unlockedIds.has(fragmentId) : false;

      return { day, fragmentId, unlocked };
    });
  }, [progress]);

  const totalProgress = Math.round((progress.unlocked / progress.total) * 100);

  if (!isOpen) return null;

  return (
    <>
      {/* 全屏 Modal */}
      <div className="fixed inset-0 z-[200] flex flex-col bg-space-950/95 backdrop-blur-sm">
        {/* 顶部栏 */}
        <div className="flex-shrink-0 px-4 py-3 border-b border-white/10 bg-space-900/50">
          <div className="flex items-center justify-between max-w-2xl mx-auto w-full">
            {/* 左侧：返回 + 标题 */}
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5 text-cyan-400/70 hover:text-cyan-400"
              >
                <ArrowLeft size={16} />
                <span className="text-sm">返回观测站</span>
              </button>
              <div className="flex items-center gap-2">
                <Archive size={18} className="text-amber-400" />
                <h1 className="text-lg font-bold text-amber-100">记忆档案馆</h1>
              </div>
            </div>

            {/* 右侧：进度 + 关闭 */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-amber-400">{progress.unlocked}/{progress.total}</span>
              <div className="w-20 h-1.5 bg-space-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-300"
                  style={{ width: `${totalProgress}%` }}
                />
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={18} className="text-zinc-400" />
              </button>
            </div>
          </div>
        </div>

        {/* 时间轴内容区 */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="max-w-2xl mx-auto space-y-2">
            {CHAPTERS.map((chapter) => {
              const daysInChapter = timelineData.filter(
                t => t.day >= chapter.dayStart && t.day <= chapter.dayEnd
              );

              return (
                <div key={chapter.title}>
                  {/* 章节标题 */}
                  <div className="flex items-center gap-3 my-3">
                    <div className={`text-xs font-bold ${chapter.color}`}>{chapter.title}</div>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  {/* 章节时间轴 */}
                  <div className="space-y-1">
                    {daysInChapter.map((item) => {
                      const isMilestone = [7, 14, 21].includes(item.day);
                      const fragment = item.fragmentId
                        ? MEMORY_FRAGMENTS.find(f => f.id === item.fragmentId) || null
                        : null;

                      return (
                        <TimelineCard
                          key={item.day}
                          day={item.day}
                          unlocked={item.unlocked}
                          isMilestone={isMilestone}
                          fragment={fragment}
                          onClick={() => fragment && handleFragmentClick(fragment)}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="flex-shrink-0 px-4 py-3 border-t border-white/10 bg-space-900/50">
          <div className="max-w-2xl mx-auto flex justify-center">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-500 hover:text-amber-400 transition-colors"
            >
              <RotateCcw size={14} />
              重置数据
            </button>
          </div>
        </div>
      </div>

      {/* 碎片详情 Modal */}
      {selectedFragment && (
        <MemoryFragmentModal
          isOpen={showFragmentModal}
          onClose={() => {
            setShowFragmentModal(false);
            refreshProgress();
          }}
          content={selectedFragment.content}
          chapter={selectedFragment.chapter}
          currentDay={progress.unlocked}
        />
      )}
    </>
  );
};

/**
 * 时间轴卡片
 */
interface TimelineCardProps {
  day: number;
  unlocked: boolean;
  isMilestone: boolean;
  fragment: MemoryFragment | null;
  onClick: () => void;
}

const TimelineCard: React.FC<TimelineCardProps> = ({ day, unlocked, isMilestone, fragment, onClick }) => {
  if (!fragment) return null;

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded text-left transition-all w-full ${
        unlocked
          ? 'bg-white/5 border border-white/5 hover:border-amber-400/30 hover:bg-white/10'
          : 'bg-black/30 text-zinc-600 hover:bg-black/40'
      }`}
    >
      <div className={`w-16 text-xs font-mono ${unlocked ? 'text-zinc-400' : 'text-zinc-600'}`}>DAY {day}</div>
      {isMilestone && (
        <Trophy size={14} className={unlocked ? 'text-amber-400 shrink-0' : 'text-amber-600/50 shrink-0'} />
      )}
      {!unlocked && !isMilestone && (
        <Lock size={14} />
      )}
      <div className={`flex-1 min-w-0 ${unlocked ? '' : 'text-xs'}`}>
        {unlocked ? (
          <>
            <div className="text-xs text-zinc-500 font-mono mb-0.5">{fragment.id.toUpperCase()}</div>
            <div className="text-xs text-zinc-300 truncate">
              {fragment.content.substring(0, 60)}
            </div>
          </>
        ) : (
          <div className="text-xs">未解锁</div>
        )}
      </div>
    </button>
  );
};
