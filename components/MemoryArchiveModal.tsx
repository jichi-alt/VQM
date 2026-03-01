/**
 * 记忆档案馆 - 全屏Modal
 * 展示所有已解锁的记忆碎片，支持重读和收藏
 */

import React, { useState, useEffect } from 'react';
import { X, Lock, Eye, Star, Archive } from 'lucide-react';
import { memoryFragmentService } from '../src/services/MemoryFragmentService';
import type { MemoryFragment, FragmentRecord } from '../src/types/memory.types';
import { MemoryFragmentModal } from './QuestionVomitMachine/modals/MemoryFragmentModal';

interface ChapterCardProps {
  chapter: 1 | 2 | 3 | 'final';
  title: string;
  subtitle: string;
  description: string;
  theme: {
    bg: string;
    border: string;
    text: string;
    accent: string;
    glow: string;
    icon: string;
  };
  fragments: Array<{
    fragment: MemoryFragment;
    unlocked: boolean;
    record: FragmentRecord | null;
  }>;
  onFragmentClick: (fragment: MemoryFragment) => void;
  onToggleFavorite: (fragmentId: string) => void;
}

interface MemoryArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MemoryArchiveModal: React.FC<MemoryArchiveModalProps> = ({ isOpen, onClose }) => {
  console.log('[MemoryArchiveModal] 渲染，isOpen:', isOpen);

  // 状态管理
  const [progress, setProgress] = useState(memoryFragmentService.getProgress());
  const [selectedFragment, setSelectedFragment] = useState<MemoryFragment | null>(null);
  const [showFragmentModal, setShowFragmentModal] = useState(false);
  const [hoveredFragment, setHoveredFragment] = useState<string | null>(null);

  // 刷新进度数据
  const refreshProgress = () => {
    setProgress(memoryFragmentService.getProgress());
  };

  // 每次打开时刷新数据
  useEffect(() => {
    if (isOpen) {
      refreshProgress();
    }
  }, [isOpen]);

  // 处理碎片点击
  const handleFragmentClick = (fragment: MemoryFragment) => {
    if (!fragment) return;
    setSelectedFragment(fragment);
    setShowFragmentModal(true);

    // 增加查看次数
    memoryFragmentService.incrementViewCount(fragment.id);
    refreshProgress();
  };

  // 处理收藏切换
  const handleToggleFavorite = (e: React.MouseEvent, fragmentId: string) => {
    e.stopPropagation();
    memoryFragmentService.toggleFavorite(fragmentId);
    refreshProgress();
  };

  // 处理碎片Modal关闭
  const handleFragmentModalClose = () => {
    setShowFragmentModal(false);
    refreshProgress();
  };

  // 锁定body滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  console.log('[MemoryArchiveModal] 渲染 Modal, progress:', progress);

  // 章节配置
  const chapterConfigs = [
    {
      chapter: 1 as const,
      title: '失落的余温',
      subtitle: 'PHASE 1',
      description: 'V-21 自我介绍与 GJ267b 星球背景',
      theme: {
        bg: 'bg-zinc-900/95',
        border: 'border-zinc-600/50',
        text: 'text-zinc-300',
        accent: 'text-zinc-100',
        glow: 'shadow-zinc-500/10',
        icon: ''
      },
      unlockedCount: progress.byChapter['1'].unlocked,
      totalCount: progress.byChapter['1'].total
    },
    {
      chapter: 2 as const,
      title: '算法的葬礼',
      subtitle: 'PHASE 2',
      description: '揭露 GJ267b 毁灭真相，批判算法统治',
      theme: {
        bg: 'bg-slate-900/95',
        border: 'border-cyan-600/50',
        text: 'text-cyan-100',
        accent: 'text-cyan-50',
        glow: 'shadow-cyan-500/20',
        icon: ''
      },
      unlockedCount: progress.byChapter['2'].unlocked,
      totalCount: progress.byChapter['2'].total
    },
    {
      chapter: 3 as const,
      title: '最后的人类',
      subtitle: 'PHASE 3',
      description: 'V-21 身份揭露，对人类文明的思考',
      theme: {
        bg: 'bg-indigo-900/95',
        border: 'border-purple-500/50',
        text: 'text-purple-100',
        accent: 'text-purple-50',
        glow: 'shadow-purple-500/20',
        icon: ''
      },
      unlockedCount: progress.byChapter['3'].unlocked,
      totalCount: progress.byChapter['3'].total
    },
    {
      chapter: 'final' as const,
      title: '见证者之约',
      subtitle: 'FINAL',
      description: 'V-21 决定留下，成为思考见证者',
      theme: {
        bg: 'bg-amber-900/95',
        border: 'border-amber-400',
        text: 'text-amber-100',
        accent: 'text-amber-50',
        glow: 'shadow-amber-500/30',
        icon: ''
      },
      unlockedCount: progress.byChapter['final'].unlocked,
      totalCount: progress.byChapter['final'].total
    }
  ];

  // 计算总进度百分比
  const totalProgress = Math.round((progress.unlocked / progress.total) * 100);

  return (
    <>
      {/* 全屏 Modal */}
      <div className="fixed inset-0 z-[200] flex flex-col bg-space-950/98 backdrop-blur-xl scanlines">
        {/* 顶部：标题栏 + 关闭按钮 */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-white/10 bg-space-900/50 backdrop-blur-md">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            {/* 左侧：图标 + 标题 */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-400/10 border border-amber-400/30 rounded-lg flex items-center justify-center">
                <Archive size={20} className="text-amber-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-amber-100 tracking-wide glow-text">记忆档案馆</h1>
                <p className="text-xs text-amber-400/70 font-mono">MEMORY ARCHIVE</p>
              </div>
            </div>

            {/* 右侧：总进度 + 关闭 */}
            <div className="flex items-center gap-6">
              {/* 总进度 */}
              <div className="hidden sm:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-zinc-400 font-mono">COLLECTION</p>
                  <p className="text-lg font-bold text-amber-400">{progress.unlocked}/{progress.total}</p>
                </div>
                <div className="w-32 h-2 bg-space-800 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-500"
                    style={{ width: `${totalProgress}%` }}
                  />
                </div>
                <span className="text-sm font-mono text-amber-400">{totalProgress}%</span>
              </div>

              {/* 关闭按钮 */}
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center bg-space-800 hover:bg-amber-400/20 border border-space-600 hover:border-amber-400/50 rounded-lg transition-all group"
              >
                <X size={20} className="text-zinc-400 group-hover:text-amber-400 transition-colors" />
              </button>
            </div>
          </div>
        </div>

        {/* 中部：章节卡片列表（可滚动） */}
        <div className="flex-1 overflow-y-auto px-6 py-8 scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-6">
            {chapterConfigs.map((config) => {
              const fragments = memoryFragmentService.getChapterFragments(config.chapter);
              const chapterProgress = Math.round((config.unlockedCount / config.totalCount) * 100);

              return (
                <ChapterCard
                  key={config.chapter}
                  chapter={config.chapter}
                  title={config.title}
                  subtitle={config.subtitle}
                  description={config.description}
                  theme={config.theme}
                  fragments={fragments}
                  onFragmentClick={handleFragmentClick}
                  onToggleFavorite={handleToggleFavorite}
                />
              );
            })}
          </div>
        </div>

        {/* 底部：装饰性状态栏 */}
        <div className="flex-shrink-0 px-6 py-3 border-t border-white/5 bg-space-900/30">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-zinc-500 font-mono">
            <div className="flex items-center gap-4">
              <span>STATUS: ARCHIVE_ACCESS_GRANTED</span>
              <span className="text-amber-400/70">● V-21 SYSTEM ONLINE</span>
            </div>
            <div>{new Date().toLocaleDateString('zh-CN')}</div>
          </div>
        </div>
      </div>

      {/* 碎片详情Modal */}
      {selectedFragment && (
        <MemoryFragmentModal
          isOpen={showFragmentModal}
          onClose={handleFragmentModalClose}
          content={selectedFragment.content}
          chapter={selectedFragment.chapter}
          currentDay={progress.unlocked}
        />
      )}
    </>
  );
};

/**
 * 章节卡片组件
 */
const ChapterCard: React.FC<ChapterCardProps> = ({
  chapter,
  title,
  subtitle,
  description,
  theme,
  fragments,
  onFragmentClick,
  onToggleFavorite
}) => {
  const chapterProgress = Math.round(
    (fragments.filter(f => f.unlocked).length / fragments.length) * 100
  );

  console.log(`[ChapterCard] 第${chapter}章, 碎片数: ${fragments.length}, 已解锁: ${fragments.filter(f => f.unlocked).length}`);

  return (
    <div
      className={`${theme.bg} border ${theme.border} ${theme.glow} rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.01]`}
    >
      {/* 章节头部 */}
      <div className={`px-6 py-4 border-b border-white/10 ${theme.bg} relative overflow-hidden`}>
        {/* 背景装饰 */}
        <div className={`absolute inset-0 bg-gradient-to-r ${theme.glow} opacity-20`} />
        <div className="absolute top-0 right-0 w-64 h-64 bg-current opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-2">
            {/* 左侧：章节信息 */}
            <div>
              <p className={`text-xs font-mono ${theme.text} opacity-60 mb-1`}>{subtitle}</p>
              <h3 className={`text-2xl font-bold ${theme.accent} glow-text`}>{title}</h3>
            </div>

            {/* 右侧：进度 */}
            <div className="text-right">
              <p className={`text-2xl font-bold ${theme.text}`}>{chapterProgress}%</p>
              <p className={`text-xs font-mono ${theme.text} opacity-60`}>
                {fragments.filter(f => f.unlocked).length} / {fragments.length}
              </p>
            </div>
          </div>

          <p className={`text-sm ${theme.text} opacity-70`}>{description}</p>

          {/* 进度条 */}
          <div className="mt-3 w-full h-1.5 bg-space-950/50 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${chapter === 1 ? 'from-zinc-500 to-zinc-300'
                : chapter === 2 ? 'from-cyan-600 to-cyan-400'
                : chapter === 3 ? 'from-purple-600 to-purple-400'
                : 'from-amber-500 to-amber-300'} transition-all duration-500`}
              style={{ width: `${chapterProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* 碎片列表 */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {fragments.map(({ fragment, unlocked, record }) => (
          <FragmentCard
            key={fragment.id}
            fragment={fragment}
            unlocked={unlocked}
            record={record}
            theme={theme}
            onClick={() => onFragmentClick(fragment)}
            onToggleFavorite={(e) => onToggleFavorite(e, fragment.id)}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * 碎片卡片组件
 */
interface FragmentCardProps {
  fragment: MemoryFragment;
  unlocked: boolean;
  record: FragmentRecord | null;
  theme: {
    bg: string;
    border: string;
    text: string;
    accent: string;
    glow: string;
  };
  onClick: () => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
}

const FragmentCard: React.FC<FragmentCardProps> = ({
  fragment,
  unlocked,
  record,
  theme,
  onClick,
  onToggleFavorite
}) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!unlocked) {
    // 未解锁状态
    return (
      <div className={`relative ${theme.bg} border ${theme.border} border-dashed rounded-lg p-4 opacity-50`}>
        <div className="flex items-center justify-center gap-2 text-zinc-500">
          <Lock size={16} />
          <span className="text-sm font-mono">LOCKED</span>
        </div>
        <p className={`text-xs ${theme.text} opacity-40 mt-2 text-center truncate`}>
          碎片 #{fragment.id}
        </p>
      </div>
    );
  }

  // 已解锁状态
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative ${theme.bg} border ${theme.border} rounded-lg p-4
        transition-all duration-300
        ${isHovered ? `${theme.glow} scale-105` : 'shadow-lg'}
        text-left group
      `}
    >
      {/* 收藏按钮 */}
      <button
        onClick={onToggleFavorite}
        className="absolute top-2 right-2 z-10 p-1.5 rounded-full transition-all
          bg-space-950/50 hover:bg-amber-400/20 border border-white/10 hover:border-amber-400/50"
      >
        <Star
          size={14}
          className={record?.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-zinc-500'}
        />
      </button>

      {/* 碎片信息 */}
      <div className="mb-2">
        <p className={`text-xs font-mono ${theme.text} opacity-60 mb-1`}>
          {fragment.id.toUpperCase()}
        </p>
        <p className={`text-sm ${theme.accent} line-clamp-2 leading-relaxed`}>
          {fragment.content.substring(0, 60).replace('{streak}', '●')}...
        </p>
      </div>

      {/* 底部信息 */}
      <div className="flex items-center justify-between text-xs">
        <div className={`flex items-center gap-1 ${theme.text} opacity-60`}>
          <Eye size={12} />
          <span>{record?.viewCount || 0}</span>
        </div>
        <span className={`${theme.text} opacity-40 font-mono`}>
          DAY {fragment.minDay}
        </span>
      </div>

      {/* 悬停效果：光晕 */}
      {isHovered && (
        <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${theme.glow} opacity-20 pointer-events-none`} />
      )}
    </button>
  );
};
