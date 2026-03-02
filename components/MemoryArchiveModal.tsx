/**
 * 记忆档案馆 - 简化版
 * 展示已解锁的记忆碎片，支持重读
 *
 * 简化内容：
 * - 去掉收藏功能
 * - 去掉查看次数统计
 * - 去掉底部装饰栏
 * - 简化卡片样式和动画
 * - 保留核心：进度展示 + 碎片列表 + 点击查看
 */

import React, { useState, useEffect } from 'react';
import { X, Lock, Archive } from 'lucide-react';
import { memoryFragmentService } from '../src/services/MemoryFragmentService';
import type { MemoryFragment } from '../src/types/memory.types';
import { MemoryFragmentModal } from './QuestionVomitMachine/modals/MemoryFragmentModal';

interface MemoryArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

  const totalProgress = Math.round((progress.unlocked / progress.total) * 100);

  if (!isOpen) return null;

  // 章节配置（简化）
  const chapters = [
    { id: 1, title: '失落的余温', color: 'zinc', count: progress.byChapter['1'] },
    { id: 2, title: '算法的葬礼', color: 'cyan', count: progress.byChapter['2'] },
    { id: 3, title: '最后的人类', color: 'purple', count: progress.byChapter['3'] },
    { id: 'final', title: '见证者之约', color: 'amber', count: progress.byChapter['final'] },
  ];

  return (
    <>
      {/* 全屏 Modal */}
      <div className="fixed inset-0 z-[200] flex flex-col bg-space-950/95 backdrop-blur-sm">
        {/* 顶部栏：标题 + 进度 + 关闭 */}
        <div className="flex-shrink-0 px-4 py-3 border-b border-white/10 bg-space-900/50">
          <div className="flex items-center justify-between max-w-4xl mx-auto gap-4">
            {/* 左侧：标题 */}
            <div className="flex items-center gap-2">
              <Archive size={18} className="text-amber-400" />
              <h1 className="text-lg font-bold text-amber-100">记忆档案馆</h1>
            </div>

            {/* 中间：进度 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-amber-400">{progress.unlocked}/{progress.total}</span>
              <div className="w-24 h-1.5 bg-space-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-300"
                  style={{ width: `${totalProgress}%` }}
                />
              </div>
            </div>

            {/* 右侧：关闭 */}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={18} className="text-zinc-400" />
            </button>
          </div>
        </div>

        {/* 内容区：章节列表 */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {chapters.map((chapter) => {
              const fragments = memoryFragmentService.getChapterFragments(chapter.id as any);
              const chapterProgress = Math.round((chapter.count.unlocked / chapter.count.total) * 100);

              return (
                <div key={chapter.id} className="bg-space-900/50 border border-white/10 rounded-lg overflow-hidden">
                  {/* 章节头部 */}
                  <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                    <div>
                      <h3 className={`text-sm font-bold ${
                        chapter.id === 1 ? 'text-zinc-200' :
                        chapter.id === 2 ? 'text-cyan-200' :
                        chapter.id === 3 ? 'text-purple-200' :
                        'text-amber-200'
                      }`}>
                        {chapter.title}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {chapter.count.unlocked} / {chapter.count.total}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-zinc-300">{chapterProgress}%</p>
                    </div>
                  </div>

                  {/* 碎片网格 */}
                  <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {fragments.map(({ fragment, unlocked }) => (
                      <FragmentCard
                        key={fragment.id}
                        fragment={fragment}
                        unlocked={unlocked}
                        onClick={() => handleFragmentClick(fragment)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
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
 * 碎片卡片（简化版）
 */
interface FragmentCardProps {
  fragment: MemoryFragment;
  unlocked: boolean;
  onClick: () => void;
}

const FragmentCard: React.FC<FragmentCardProps> = ({ fragment, unlocked, onClick }) => {
  if (!unlocked) {
    return (
      <div className="aspect-square bg-space-950 border border-dashed border-white/10 rounded flex flex-col items-center justify-center gap-1 text-zinc-600">
        <Lock size={16} />
        <span className="text-xs font-mono">DAY {fragment.minDay}</span>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className="aspect-square bg-space-800 border border-white/10 hover:border-amber-400/50 rounded p-2 text-left transition-all hover:bg-space-800/80 group"
    >
      <p className="text-xs text-zinc-500 font-mono mb-1">{fragment.id.toUpperCase()}</p>
      <p className="text-xs text-zinc-300 line-clamp-3 leading-relaxed">
        {fragment.content.substring(0, 50).replace('{streak}', '●')}...
      </p>
    </button>
  );
};
