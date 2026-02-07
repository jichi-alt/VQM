import React, { useState, useEffect } from 'react';
import { ArrowLeft, X, Trash2, Activity, Trophy, LogIn, LogOut } from 'lucide-react';
import { generatePhilosophicalQuestion, saveAnsweredQuestion, clearAnsweredQuestions, getAnsweredQuestions } from '../services/geminiService';
import { QuestionData } from '../types';
import { MemoryFragment, getRandomFragment, MEMORY_FRAGMENTS } from '../services/memoryFragments';
import { PrologueScene } from './PrologueScene';
import { playSound, switchBGM, type BGMType } from '../services/audioService';
import { AudioControl } from './AudioControl';
import { getAuthService, type UserProfile } from '../services/authService';
import { AuthModal } from './AuthModal';

interface SilentObserverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

interface Answer {
  content: string;
  timestamp: string;
}

interface ArchiveEntry {
  question: QuestionData;
  answers: Answer[];
  lastModified: string;
}

interface StreakData {
  isActive: boolean;           // 是否参与挑战
  lastCheckIn: string | null;  // 上次打卡日期 "YYYY-MM-DD"
  currentStreak: number;       // 当前连续天数
  isCompleted: boolean;        // 是否达成21天
  startDate: string | null;    // 开始日期
  checkInHistory: string[];    // 打卡历史记录 ["2026-01-25", ...]
  longestStreak: number;       // 最长连续天数记录
}

const SilentObserverModal = ({ isOpen, onClose, onConfirm, message }: SilentObserverModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-[300px] bg-space-850/90 backdrop-blur-md border border-cyan-400/30 shadow-[4px_4px_0px_0px_rgba(34,211,238,0.2)] animate-in zoom-in-95 duration-200 flex flex-col hologram">
        <div className="flex justify-end px-2 py-2">
          <button onClick={onClose} className="text-cyan-400/60 hover:text-amber-400 transition-colors">
            <X size={14} />
          </button>
        </div>
        <div className="px-6 pb-2 pt-0">
          <p className="text-sm text-amber-100 font-bold leading-relaxed text-center whitespace-pre-line">
            {message}
          </p>
        </div>
        <div className="flex items-center justify-center gap-4 p-6">
          <button onClick={onClose} className="text-xs text-cyan-400/70 hover:text-cyan-400 transition-colors px-4 py-2">
            取消
          </button>
          <button onClick={() => { onConfirm(); onClose(); }} className="text-xs font-bold text-space-900 bg-amber-400 hover:bg-amber-300 px-6 py-2 transition-colors border border-transparent rounded btn-3d">
            确定
          </button>
        </div>
      </div>
    </div>
  );
};

interface CheckInSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlock: () => void;  // 新增：解锁记忆碎片的回调
  day: number;
  isCompleted: boolean;
}

const CheckInSuccessModal = ({ isOpen, onClose, onUnlock, day, isCompleted }: CheckInSuccessModalProps) => {
  const [showButton, setShowButton] = useState(false);
  const [isMilestone, setIsMilestone] = useState(false);
  const [exploding, setExploding] = useState(false);

  // 判断是否是里程碑
  useEffect(() => {
    if (isOpen) {
      const milestone = day === 7 || day === 14 || day === 21;
      setIsMilestone(milestone);

      // 里程碑触发爆炸效果
      if (milestone) {
        setTimeout(() => setExploding(true), 200);
      }

      // 延迟显示按钮
      setTimeout(() => {
        setShowButton(true);
      }, 1500);
    } else {
      setShowButton(false);
      setExploding(false);
    }
  }, [isOpen, day]);

  if (!isOpen) return null;

  // 里程碑天数特殊文案
  const getMilestoneText = () => {
    if (day === 7) return "第一个周期完成！";
    if (day === 14) return "一半的路程！";
    if (day === 21) return "全部完成！";
    return "太好了，人类！";
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-300 ${
      exploding ? 'bg-amber-400/30' : 'bg-black/70'
    } transition-colors duration-300`}>
      {/* 超级夸张的粒子爆炸效果 */}
      {isMilestone && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* 放射光芒 */}
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={`ray-${i}`}
              className="absolute left-1/2 top-1/2 w-1 h-40 bg-gradient-to-t from-amber-400 to-transparent opacity-60"
              style={{
                transform: `translateX(-50%) translateY(-50%) rotate(${i * 30}deg)`,
                animation: `rayExpand 1s ease-out ${i * 0.05}s forwards`,
                transformOrigin: 'center top',
              }}
            />
          ))}

          {/* 大量彩色粒子 */}
          {Array.from({ length: 60 }).map((_, i) => {
            const size = Math.random() * 8 + 4; // 4-12px
            const angle = (i / 60) * 360;
            const distance = Math.random() * 200 + 100;
            const colors = ['#fbbf24', '#fde047', '#fb923c', '#22d3ee', '#a78bfa', '#f472b6'];
            const color = colors[Math.floor(Math.random() * colors.length)];

            return (
              <div
                key={i}
                className="absolute rounded-full shadow-lg"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: '50%',
                  top: '50%',
                  marginLeft: `-${size/2}px`,
                  marginTop: `-${size/2}px`,
                  backgroundColor: color,
                  animation: `particleExplode 1.5s ease-out ${Math.random() * 0.5}s forwards`,
                  '--tx': `${Math.cos(angle * Math.PI / 180) * distance}px`,
                  '--ty': `${Math.sin(angle * Math.PI / 180) * distance}px`,
                  zIndex: 100,
                } as React.CSSProperties}
              />
            );
          })}

          {/* 星星闪烁 */}
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={`star-${i}`}
              className="absolute text-6xl"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
                animation: `starTwinkle 0.8s ease-in-out ${i * 0.1}s`,
                opacity: 0,
              }}
            >
              ⭐
            </div>
          ))}
        </div>
      )}

      <div className={`w-[320px] bg-space-850/90 backdrop-blur-md border-2 shadow-[6px_6px_0px_0px_rgba(251,191,36,0.3)] animate-in zoom-in-95 duration-300 flex flex-col overflow-hidden hologram relative ${
        isMilestone ? 'border-amber-300 scale-110' : 'border-amber-400'
      }`}>
        {/* 顶部装饰条 */}
        <div className={`h-2 ${isMilestone ? 'bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300' : 'bg-amber-400/90'}`}></div>

        {/* 关闭按钮 */}
        <div className="flex justify-end px-3 py-2">
          <button onClick={onClose} className="text-cyan-400/60 hover:text-amber-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* 主要内容 */}
        <div className="px-6 pb-6 pt-2 text-center">
          {/* 奖杯图标（完成态）或活动图标（进行中） */}
          <div className="flex justify-center mb-4">
            {isCompleted ? (
              <div className="w-16 h-16 bg-amber-400 rounded-full flex items-center justify-center shadow-lg shadow-amber-400/50 animate-[badgeBounce_1s_ease-out]">
                <Trophy size={32} className="text-space-900" />
              </div>
            ) : (
              <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${
                isMilestone
                  ? 'bg-gradient-to-br from-amber-300 to-amber-500 border-2 border-amber-300 shadow-amber-400/70'
                  : 'bg-space-800 border-2 border-amber-400/50'
              }`}>
                <Activity size={32} className={isMilestone ? 'text-space-900' : 'text-amber-400'} />
              </div>
            )}
          </div>

          {/* 里程碑徽章 */}
          {isMilestone && (
            <div className="mb-3 animate-[badgeSlideIn_0.5s_ease-out]">
              <span className="inline-block bg-amber-400 text-space-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                🏆 里程碑成就
              </span>
            </div>
          )}

          {/* 核心文案 */}
          <p className={`text-lg font-black mb-2 leading-relaxed ${isMilestone ? 'text-amber-300 scale-110' : 'text-amber-100'}`}>
            {getMilestoneText()}
          </p>
          <p className={`mb-6 tracking-tight ${isMilestone ? 'text-2xl text-amber-300 glow-text scale-110' : 'text-xl text-amber-400'}`}>
            这是你主动思考的第 {day} 天
          </p>

          {/* 进度可视化 */}
          <div className="flex gap-[1px] mb-6 h-2 justify-center progress-pipe">
            {[...Array(21)].map((_, i) => {
              const isActive = i < day;
              const isToday = i === day - 1;
              return (
                <div
                  key={i}
                  className={`w-1.5 rounded-[1px] progress-segment transition-all duration-500 ${
                    isActive
                      ? isCompleted || isToday
                        ? 'bg-amber-400 progress-segment-active animate-pulse'
                        : 'bg-amber-400/60'
                      : 'bg-space-700'
                  }`}
                ></div>
              );
            })}
          </div>

          {/* 继续按钮 - 延迟显示 */}
          <button
            onClick={() => {
              onClose();
              onUnlock();  // 触发解锁记忆碎片
            }}
            className={`w-full bg-space-800 hover:bg-space-700 text-amber-100 border border-amber-400/30 font-bold py-3 px-4 hover:border-amber-400/50 transition-all flex items-center justify-center gap-2 btn-3d btn-glow relative ${
              showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transition: 'all 0.5s ease-out' }}
          >
            <span>继续</span>
            <span className="text-amber-400">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== 解锁记忆碎片弹窗 ====================
interface UnlockMemoryModalProps {
  isOpen: boolean;
  onConfirm: () => void;
}

const UnlockMemoryModal = ({ isOpen, onConfirm }: UnlockMemoryModalProps) => {
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleUnlock = () => {
    setIsUnlocking(true);
    setTimeout(() => {
      onConfirm();
    }, 800); // 闪光动画持续时间
  };

  if (!isOpen) return null;

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

// ==================== 登录提醒弹窗 ====================
interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

const LoginPromptModal = ({ isOpen, onClose, onLogin }: LoginPromptModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-[380px] bg-space-850/95 backdrop-blur-md border-2 border-amber-400/50 shadow-2xl hologram relative overflow-hidden">
        {/* 顶部装饰条 */}
        <div className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 h-1"></div>

        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-amber-400/20 hover:bg-amber-400/40 border border-2 border-amber-400/50 rounded-full transition-all z-10"
          title="关闭"
        >
          <X size={16} className="text-amber-400" />
        </button>

        <div className="p-8">
          {/* 图标 */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-amber-400/20 rounded-full flex items-center justify-center border-2 border-amber-400/50">
              <LogIn size={32} className="text-amber-400" />
            </div>
          </div>

          {/* 标题 */}
          <h2 className="text-xl font-black mb-3 text-center text-amber-100 glow-text">
            保存到云端
          </h2>

          {/* 说明文案 */}
          <div className="text-center mb-6 space-y-2">
            <p className="text-sm text-cyan-400/90">
              登录后将自动保存到云端，跨设备同步
            </p>
            <p className="text-xs text-space-700">
              （未登录数据仅保存在本地浏览器）
            </p>
          </div>

          {/* 按钮组 */}
          <div className="space-y-3">
            <button
              onClick={onLogin}
              className="w-full bg-amber-400 hover:bg-amber-300 text-space-900 border-2 border-amber-500 font-bold py-3 px-4 transition-all flex items-center justify-center gap-2 btn-3d btn-glow shadow-lg shadow-amber-400/30"
            >
              <LogIn size={18} />
              <span>立即登录</span>
            </button>

            <button
              onClick={onClose}
              className="w-full bg-space-800 hover:bg-space-700 text-cyan-400/80 border border-cyan-400/30 font-semibold py-3 px-4 transition-all flex items-center justify-center gap-2"
            >
              <span>稍后再说</span>
            </button>
          </div>

          {/* 底部提示 */}
          <div className="mt-6 text-center">
            <p className="text-[10px] text-space-700 font-mono">
              已有账号？点击右上角登录按钮
            </p>
          </div>
        </div>

        {/* 底部装饰条 */}
        <div className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 h-1"></div>
      </div>
    </div>
  );
};

// ==================== 记忆碎片弹窗 ====================
interface MemoryFragmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  chapter: number | 'final';
  currentDay: number;
}

const MemoryFragmentModal = ({ isOpen, onClose, content, chapter, currentDay }: MemoryFragmentModalProps) => {
  if (!isOpen) return null;

  // 章节颜色
  const chapterColors: Record<number | 'final', { bg: string; border: string; text: string; glow: string; title: string }> = {
    1: { bg: 'bg-space-800/90', border: 'border-space-600', text: 'text-zinc-300', glow: 'shadow-zinc-500/20', title: '记忆碎片' },
    2: { bg: 'bg-blue-900/80', border: 'border-cyan-500/50', text: 'text-cyan-100', glow: 'shadow-cyan-500/30', title: '记忆碎片' },
    3: { bg: 'bg-purple-900/80', border: 'border-purple-500/50', text: 'text-purple-100', glow: 'shadow-purple-500/30', title: '记忆碎片' },
    final: { bg: 'bg-amber-900/80', border: 'border-amber-400', text: 'text-amber-100', glow: 'shadow-amber-500/50', title: '记忆解锁' }
  };

  const colors = chapterColors[chapter] || chapterColors[1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-500 scanlines perspective-1000">
      <div className={`w-[360px] ${colors.bg} border-2 ${colors.border} ${colors.glow} shadow-2xl flex flex-col overflow-hidden hologram relative flip-in`} style={{ transformStyle: 'preserve-3d' }}>

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
          <div className="w-16 h-16 bg-space-800 rounded-xl flex items-center justify-center mb-4 border border-rust-500/30 robot-damaged relative float-3d depth-shadow">
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

          {/* 文字内容 - 移除typing-cursor，确保显示 */}
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

export const QuestionVomitMachine: React.FC = () => {
  // 初始化时检查是否看过前言
  const hasSeenPrologue = localStorage.getItem('qvm_seen_prologue') === 'true';
  const [view, setView] = useState<'intro' | 'daily' | 'history' | 'prologue'>(hasSeenPrologue ? 'intro' : 'prologue');
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
  const [audioInitialized, setAudioInitialized] = useState(false);

  // 认证相关状态
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [pendingLoginPrompt, setPendingLoginPrompt] = useState(false); // 待显示的登录提醒

  // 调试：打印初始状态
  console.log('QuestionVomitMachine 渲染，当前 view:', view);
  console.log('是否看过前言:', hasSeenPrologue);

  // 监听全局用户交互来初始化音频
  useEffect(() => {
    if (audioInitialized) return;

    const handleUserInteraction = () => {
      if (!audioInitialized) {
        console.log('[App] 用户首次交互，初始化音频系统');
        // 播放一个静默的音效来初始化 AudioContext
        playSound('button-click');
        setAudioInitialized(true);
      }
    };

    // 监听多种用户交互事件
    const events = ['click', 'keydown', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [audioInitialized]);

  // 初始化认证服务
  useEffect(() => {
    const initAuth = async () => {
      const authService = getAuthService();
      const user = await authService.initialize();
      if (user) {
        setCurrentUser(user);
        console.log('[App] 用户已登录:', user.email);
      }
    };
    initAuth();

    // 监听认证状态变化
    const authService = getAuthService();
    const unsubscribe = authService.onAuthStateChange((user) => {
      setCurrentUser(user);
      console.log('[App] 认证状态变化:', user?.email || '未登录');
    });

    return () => {
      unsubscribe?.();
    };
  }, []);

  const [isVomiting, setIsVomiting] = useState(false);
  const [hasVomitedToday, setHasVomitedToday] = useState(false);
  const [remainingRerolls, setRemainingRerolls] = useState(1);
  const [isDbEmpty, setIsDbEmpty] = useState(true);
  const [userInput, setUserInput] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [isEditingHistory, setIsEditingHistory] = useState(false);

  // 过渡动画状态
  const [showQuestionPreview, setShowQuestionPreview] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState<QuestionData | null>(null);

  // 删除相关状态
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [archiveToDelete, setArchiveToDelete] = useState<ArchiveEntry | null>(null);

  // 打卡成功弹窗状态
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInDay, setCheckInDay] = useState(0);

  // Streak 打卡相关状态
  const [streakData, setStreakData] = useState<StreakData>({
    isActive: true,
    lastCheckIn: null,
    currentStreak: 0,
    isCompleted: false,
    startDate: null,
    checkInHistory: [],
    longestStreak: 0
  });

  // 记忆碎片相关状态
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [currentMemoryFragment, setCurrentMemoryFragment] = useState<MemoryFragment | null>(null);
  const [viewedFragmentIds, setViewedFragmentIds] = useState<string[]>([]);

  // 解锁记忆碎片弹窗状态
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  // 机器人是否已离开（21天完成 + 所有问题抽完）
  const [robotHasLeft, setRobotHasLeft] = useState(false);

  // ==================== 工具函数 ====================

  // 预设问题总数（来自 geminiService.ts）
  const TOTAL_FALLBACK_QUESTIONS = 47; // 12 + 14 + 14 + 7

  // 检查是否所有预设问题都被抽取过了
  const checkAllQuestionsAnswered = (): boolean => {
    const answeredQuestions = getAnsweredQuestions();
    // 如果已回答问题数 >= 总预设问题数，认为已经抽完
    // 注意：这里只统计预设问题，AI生成的不计入
    return answeredQuestions.length >= TOTAL_FALLBACK_QUESTIONS;
  };

  // 更新机器人离开状态
  const updateRobotLeftStatus = () => {
    const isCompleted = streakData.isCompleted;
    const allAnswered = checkAllQuestionsAnswered();
    setRobotHasLeft(isCompleted && allAnswered);
  };

  // 获取今日日期 (YYYY-MM-DD 格式)
  const getTodayDate = (): string => {
    return new Date().toLocaleDateString('en-CA'); // en-CA 格式为 "YYYY-MM-DD"
  };

  // 格式化时间显示
  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  // 格式化日期显示 (YYYY-MM-DD → MM月DD日)
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
  };

  // 判断两个日期是否连续（相差1天）
  const isConsecutiveDay = (date1: string, date2: string): boolean => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
  };

  // 加载 Streak 数据
  const loadStreakData = (): StreakData => {
    try {
      const saved = localStorage.getItem('qvm_streak');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load streak data:', error);
    }

    // 返回默认值
    return {
      isActive: true,
      lastCheckIn: null,
      currentStreak: 0,
      isCompleted: false,
      startDate: null,
      checkInHistory: [],
      longestStreak: 0
    };
  };

  // 保存 Streak 数据
  const saveStreakData = (data: StreakData): void => {
    try {
      localStorage.setItem('qvm_streak', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save streak data:', error);
    }
  };

  // 初始化 Streak 数据（首次使用）
  const initializeStreakData = (): void => {
    const existing = localStorage.getItem('qvm_streak');
    if (!existing) {
      const initialData: StreakData = {
        isActive: true,
        lastCheckIn: null,
        currentStreak: 0,
        isCompleted: false,
        startDate: null,
        checkInHistory: [],
        longestStreak: 0
      };
      saveStreakData(initialData);
      setStreakData(initialData);
    } else {
      const loaded = loadStreakData();
      setStreakData(loaded);
    }
  };

  // 检查是否需要重置连续天数（断档超过1天）
  const checkStreakValidity = (): boolean => {
    if (!streakData.lastCheckIn) return true;

    const today = getTodayDate();
    const lastCheckInDate = new Date(streakData.lastCheckIn);
    const todayDate = new Date(today);

    // 计算相差天数
    const diffTime = todayDate.getTime() - lastCheckInDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // 如果相差超过1天，说明断档了
    return diffDays <= 1;
  };

  // 旧版本：格式化时间显示
  // const formatTime = (timestamp: string): string => {
  //   const date = new Date(timestamp);
  //   return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  // };

  // ==================== Phase 2: 打卡业务逻辑 ====================

  // 计算新的连续天数
  const calculateNewStreak = (currentData: StreakData): number => {
    const today = getTodayDate();
    const lastCheckIn = currentData.lastCheckIn;

    // 首次打卡
    if (!lastCheckIn) {
      return 1;
    }

    // 今天已经打卡过了
    if (lastCheckIn === today) {
      return currentData.currentStreak;
    }

    // 昨天打卡了，连续
    if (isConsecutiveDay(lastCheckIn, today)) {
      return currentData.currentStreak + 1;
    }

    // 断档了，重新开始
    return 1;
  };

  // 检查今天是否已经打卡
  const hasCheckedInToday = (): boolean => {
    const today = getTodayDate();
    return streakData.lastCheckIn === today;
  };

  // 执行打卡
  const checkIn = (): { newStreak: number; isCompleted: boolean } | null => {
    const today = getTodayDate();

    // 如果今天已经打卡，不再重复打卡
    if (hasCheckedInToday()) {
      console.log('今天已经打卡过了');
      return null;
    }

    // 计算新的连续天数
    const newStreak = calculateNewStreak(streakData);

    // 更新最长记录
    const newLongestStreak = Math.max(streakData.longestStreak, newStreak);

    // 检查是否完成21天
    const isCompleted = newStreak >= 21;

    // 构建新的打卡数据
    const newStreakData: StreakData = {
      ...streakData,
      lastCheckIn: today,
      currentStreak: newStreak,
      isCompleted: isCompleted,
      startDate: streakData.startDate || today,
      checkInHistory: [...streakData.checkInHistory, today],
      longestStreak: newLongestStreak
    };

    // 保存并更新状态
    saveStreakData(newStreakData);
    setStreakData(newStreakData);

    console.log(`🎉 打卡成功！连续思考第 ${newStreak} 天`);

    // 完成21天提示
    // 完成提示音效
    if (isCompleted && !streakData.isCompleted) {
      console.log('🏆 恭喜！完成21天思考挑战！');
      playSound('milestone'); // 播放里程碑音效
    } else if (newStreak === 7 || newStreak === 14) {
      playSound('milestone'); // 播放里程碑音效
    } else {
      playSound('success'); // 播放普通成功音效
    }

    // 显示打卡成功弹窗
    setCheckInDay(newStreak);
    setShowCheckInModal(true);

    return { newStreak, isCompleted };
  };

  // 失效今天的打卡（删除今日记录时调用）
  const invalidateTodayCheckIn = (): void => {
    const today = getTodayDate();

    // 只有当最后打卡日期是今天时才失效
    if (streakData.lastCheckIn !== today) {
      return;
    }

    // 从历史记录中移除今天
    const newHistory = streakData.checkInHistory.filter(date => date !== today);

    // 回退连续天数
    const newStreak = Math.max(0, streakData.currentStreak - 1);

    const newStreakData: StreakData = {
      ...streakData,
      lastCheckIn: newHistory.length > 0 ? newHistory[newHistory.length - 1] : null,
      currentStreak: newStreak,
      checkInHistory: newHistory
    };

    saveStreakData(newStreakData);
    setStreakData(newStreakData);

    console.log('❌ 今日打卡已失效');
  };

  // ==================== Phase 2 End ====================

  // 加载指定问题的答案
  const loadAnswerForQuestion = (question: QuestionData | null) => {
    if (!question) return;

    try {
      const archives: ArchiveEntry[] = JSON.parse(localStorage.getItem('vqm_archives') || '[]');
      const entry = archives.find((a: ArchiveEntry) => a.question.id === question.id);

      if (entry && entry.answers && entry.answers.length > 0) {
        setUserInput(entry.answers[0].content);
        setLastSavedTime(formatTime(entry.answers[0].timestamp));
      } else {
        setUserInput('');
        setLastSavedTime(null);
      }
    } catch (error) {
      console.error('Failed to load answer:', error);
      setUserInput('');
      setLastSavedTime(null);
    }
  };

  // 从 localStorage 加载今日状态
  useEffect(() => {
    const today = new Date().toDateString();
    const savedData = localStorage.getItem('vqm_today');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (data.date === today) {
          setHasVomitedToday(true);
          setRemainingRerolls(data.remainingRerolls || 1);
          setCurrentQuestion(data.question || null);

          // 加载今日已保存的答案（如果存在）
          if (data.question) {
            loadAnswerForQuestion(data.question);
          }
        }
      } catch (error) {
        console.error('Failed to parse today data:', error);
      }
    }

    // 检查数据库是否为空，并迁移旧格式数据
    try {
      const archives: any[] = JSON.parse(localStorage.getItem('vqm_archives') || '[]');

      // 迁移旧格式数据：{ question, answer, timestamp } -> { question, answers: [{content, timestamp}], lastModified }
      const needsMigration = archives.some((a: any) => !a.answers && a.answer !== undefined);

      if (needsMigration) {
        const migratedArchives: ArchiveEntry[] = archives.map((item: any) => {
          if (item.answers) {
            return item as ArchiveEntry;
          }
          // 旧格式转换为新格式
          return {
            question: item.question,
            answers: item.answer ? [{ content: item.answer, timestamp: item.timestamp || new Date().toISOString() }] : [],
            lastModified: item.timestamp || new Date().toISOString()
          };
        });
        localStorage.setItem('vqm_archives', JSON.stringify(migratedArchives));
        setIsDbEmpty(migratedArchives.length === 0);
      } else {
        setIsDbEmpty(archives.length === 0);
      }
    } catch (error) {
      console.error('Failed to parse archives:', error);
      setIsDbEmpty(true);
    }

    // ==================== Phase 1: 初始化 Streak 数据 ====================
    initializeStreakData();

    // 临时：在控制台显示 streak 数据（方便验证）
    console.log('🔥 Streak Data 初始化完成:', loadStreakData());

    // 加载已看过的记忆碎片
    try {
      const saved = localStorage.getItem('qvm_viewed_fragments');
      if (saved) {
        setViewedFragmentIds(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load viewed fragments:', error);
    }

    // 检查机器人是否已离开
    updateRobotLeftStatus();
  }, []);

  // 保存今日状态到 localStorage
  const saveTodayState = (question: QuestionData, rerolls: number) => {
    const today = new Date().toDateString();
    localStorage.setItem('vqm_today', JSON.stringify({
      date: today,
      question,
      remainingRerolls: rerolls
    }));
  };

  // ==================== 记忆碎片系统 ====================

  // 保存已看过的碎片
  const saveViewedFragment = (fragmentId: string) => {
    const newViewed = [...viewedFragmentIds, fragmentId];
    setViewedFragmentIds(newViewed);
    localStorage.setItem('qvm_viewed_fragments', JSON.stringify(newViewed));
  };

  // 触发记忆碎片的函数 - 仅在保存答案后调用
  const tryTriggerMemoryFragment = () => {
    const currentDay = streakData.currentStreak;
    console.log('🧩 尝试触发记忆碎片', { currentDay, viewedIds: viewedFragmentIds });

    // 21天必触发最终结局
    if (currentDay >= 21) {
      const finalFragment = MEMORY_FRAGMENTS.find(f => f.id === 'final');
      if (finalFragment && !viewedFragmentIds.includes('final')) {
        console.log('✨ 触发最终结局');
        setCurrentMemoryFragment(finalFragment);
        setShowUnlockModal(true);  // 显示解锁弹窗
        return;
      }
    }

    // 里程碑天数必触发
    const milestoneFragment = MEMORY_FRAGMENTS.find(
      f => f.isMilestone && f.minDay === currentDay && !viewedFragmentIds.includes(f.id)
    );
    if (milestoneFragment) {
      console.log('✨ 触发里程碑碎片', milestoneFragment.id);
      setCurrentMemoryFragment(milestoneFragment);
      setShowUnlockModal(true);  // 显示解锁弹窗
      return;
    }

    // 随机触发一个当前章节的碎片
    const fragment = getRandomFragment(currentDay, viewedFragmentIds);
    if (fragment) {
      console.log('✨ 触发随机碎片', fragment.id);
      setCurrentMemoryFragment(fragment);
      setShowUnlockModal(true);  // 显示解锁弹窗
    } else {
      console.log('⚠️ 没有可用的碎片');
    }
  };

  // 确认解锁记忆碎片
  const handleUnlockMemory = () => {
    playSound('unlock'); // 播放解锁音效
    setShowUnlockModal(false);
    if (currentMemoryFragment) {
      saveViewedFragment(currentMemoryFragment.id);
      setShowMemoryModal(true);
    }
  };

  // ==================== 前言逻辑 ====================

  // 标记已看过前言
  const markPrologueSeen = () => {
    localStorage.setItem('qvm_seen_prologue', 'true');
  };

  // 初始化：检查是否看过前言（已移到 useState 初始化）
  // 注意：不再需要单独的 useEffect，已在主 useEffect 中处理

  // ==================== BGM 切换逻辑 ====================
  // 根据 view 切换背景音乐
  useEffect(() => {
    const updateBGM = async () => {
      let bgmType: BGMType = 'none';

      switch (view) {
        case 'prologue':
          bgmType = 'none'; // 前言完全静音
          break;
        case 'intro':
          bgmType = 'voice'; // 进入游戏界面使用 Background voice.m4a
          break;
        case 'daily':
        case 'history':
          bgmType = 'space'; // 写答案界面使用 space.mp3
          break;
      }

      await switchBGM(bgmType, 1.5, 1); // 1.5秒淡入，1秒淡出
    };

    updateBGM();
  }, [view]); // 监听 view 变化

  // 认证相关处理函数
  const handleLogin = () => {
    setShowAuthModal(true);
  };

  const handleLogout = async () => {
    const authService = getAuthService();
    await authService.signOut();
    setCurrentUser(null);
    playSound('button-click');
  };

  const handleAuthSuccess = () => {
    // 认证成功后刷新页面状态
    window.location.reload();
  };

  // 处理记忆碎片弹窗关闭
  const handleMemoryModalClose = () => {
    setShowMemoryModal(false);
    // 如果有待显示的登录提醒，现在显示
    if (pendingLoginPrompt) {
      console.log('记忆碎片关闭，显示登录提醒');
      setShowLoginPrompt(true);
      setPendingLoginPrompt(false);
    }
  };

  const handleSpitQuestion = async () => {
    playSound('vomit'); // 播放呕吐音效（与机器人张嘴同步）
    setIsVomiting(true);

    const [questionData] = await Promise.all([
      generatePhilosophicalQuestion(streakData.currentStreak || 1),
      new Promise<void>((resolve) => setTimeout(resolve, 1500))
    ]);

    setIsVomiting(false);

    // 显示问题预览过渡
    setPreviewQuestion(questionData);
    setShowQuestionPreview(true);

    // 2秒后自动跳转到Daily页
    setTimeout(() => {
      setShowQuestionPreview(false);
      setCurrentQuestion(questionData);
      setHasVomitedToday(true);
      setRemainingRerolls(1);
      setUserInput('');
      setLastSavedTime(null);
      setIsEditingHistory(false);
      saveTodayState(questionData, 1);
      setView('daily');
    }, 2000);
  };

  // 保存答案（覆盖模式）
  const handleArchive = async () => {
    if (!currentQuestion) {
      console.error('No current question');
      return;
    }

    console.log('开始保存...');

    const newAnswer: Answer = {
      content: userInput,
      timestamp: new Date().toISOString()
    };

    try {
      // 1. 如果已登录，先保存到云端
      if (currentUser) {
        console.log('用户已登录，保存到云端...');
        const authService = getAuthService();
        const result = await authService.saveAnswer(
          currentQuestion.id,
          currentQuestion.text,
          userInput
        );

        if (!result.success) {
          console.error('云端保存失败:', result.error);
          // 云端保存失败不影响本地保存
        } else {
          console.log('云端保存成功！');
        }
      } else {
        // 2. 如果未登录，标记需要在记忆碎片关闭后显示登录提醒
        console.log('用户未登录，标记待显示登录提醒');
        setPendingLoginPrompt(true);
      }

      // 3. 保存到本地（无论是否登录）
      const archives: ArchiveEntry[] = JSON.parse(localStorage.getItem('vqm_archives') || '[]');
      const existingIndex = archives.findIndex(a => a.question.id === currentQuestion.id);

      if (existingIndex >= 0) {
        // 覆盖已有记录
        console.log('覆盖已有记录');
        archives[existingIndex].answers = [newAnswer];
        archives[existingIndex].lastModified = newAnswer.timestamp;
      } else {
        // 创建新记录
        console.log('创建新记录');
        const newEntry: ArchiveEntry = {
          question: currentQuestion,
          answers: [newAnswer],
          lastModified: newAnswer.timestamp
        };
        archives.unshift(newEntry);
      }

      localStorage.setItem('vqm_archives', JSON.stringify(archives));
      setIsDbEmpty(false);
      setLastSavedTime(formatTime(newAnswer.timestamp));

      // 记录已回答的问题
      if (currentQuestion?.text) {
        saveAnsweredQuestion(currentQuestion.text);
      }

      console.log('本地保存成功！');

      // 更新机器人离开状态
      updateRobotLeftStatus();

      // ==================== Phase 2: 集成打卡逻辑 ====================
      // 只有在非编辑历史记录模式且是新记录或首次保存时才打卡
      if (!isEditingHistory) {
        const checkInResult = checkIn(); // 执行打卡，并返回结果
        // 如果打卡成功，显示打卡成功弹窗（包含庆祝动画）
        if (checkInResult) {
          console.log('打卡成功，准备显示庆祝弹窗');
          // 不跳转，让弹窗自然显示
          return;
        }
      }

      // 保存成功后跳转到历史页
      setView('history');
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    }
  };

  const handleReroll = async () => {
    if (remainingRerolls <= 0) return;

    setIsVomiting(true);
    const [questionData] = await Promise.all([
      generatePhilosophicalQuestion(streakData.currentStreak || 1),
      new Promise<void>((resolve) => setTimeout(resolve, 1500))
    ]);
    setIsVomiting(false);

    setCurrentQuestion(questionData);
    setRemainingRerolls(prev => prev - 1);
    setUserInput(''); // 重抽后清空输入
    setLastSavedTime(null);
    setIsEditingHistory(false);
    saveTodayState(questionData, remainingRerolls - 1);
  };

  // 打开历史记录进行编辑
  const openHistoryEntry = (entry: ArchiveEntry) => {
    setCurrentQuestion(entry.question);
    setIsEditingHistory(true);

    if (entry.answers.length > 0) {
      setUserInput(entry.answers[0].content);
      setLastSavedTime(formatTime(entry.answers[0].timestamp));
    } else {
      setUserInput('');
      setLastSavedTime(null);
    }

    setView('daily');
  };

  // 打开删除确认弹窗
  const confirmDelete = (entry: ArchiveEntry, e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止冒泡，避免触发卡片点击
    setArchiveToDelete(entry);
    setShowDeleteModal(true);
  };

  // 执行删除
  const handleDeleteArchive = () => {
    if (!archiveToDelete) return;

    try {
      const archives: ArchiveEntry[] = JSON.parse(localStorage.getItem('vqm_archives') || '[]');
      const filtered = archives.filter(a => a.question.id !== archiveToDelete.question.id);
      localStorage.setItem('vqm_archives', JSON.stringify(filtered));

      // ==================== Phase 2: 删除记录时失效打卡 ====================
      // 检查删除的记录是否是今天创建/修改的
      const today = getTodayDate();
      const deletedDate = new Date(archiveToDelete.lastModified).toLocaleDateString('en-CA');

      if (deletedDate === today) {
        // 删除的是今天的记录，失效打卡
        invalidateTodayCheckIn();
      }

      // 如果删除的是今日问题，重置今日状态
      if (currentQuestion?.id === archiveToDelete.question.id) {
        setHasVomitedToday(false);
        setCurrentQuestion(null);
        setUserInput('');
        setLastSavedTime(null);
        localStorage.removeItem('vqm_today');
      }

      // 更新数据库状态
      setIsDbEmpty(filtered.length === 0);

      // 关闭弹窗
      setShowDeleteModal(false);
      setArchiveToDelete(null);
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请重试');
    }
  };

  const handleResetToday = () => {
    setHasVomitedToday(false);
    setCurrentQuestion(null);
    setRemainingRerolls(1);
    setUserInput('');
    setLastSavedTime(null);
    setIsEditingHistory(false);
    localStorage.removeItem('vqm_today');
  };

  // ==================== PROLOGUE VIEW (前言动画) ====================
  if (view === 'prologue') {
    return (
      <>
      <AudioControl currentUser={currentUser} onLogin={handleLogin} onLogout={handleLogout} />
      <PrologueScene
        onComplete={() => {
          markPrologueSeen();
          setView('intro');
        }}
        onSkip={() => {
          markPrologueSeen();
          setView('intro');
        }}
      />
      </>
    );
  }

  // ==================== 问题预览过渡弹窗 ====================
  if (showQuestionPreview && previewQuestion) {
    return (
      <>
      <AudioControl currentUser={currentUser} onLogin={handleLogin} onLogout={handleLogout} />
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm">
        <div className="max-w-lg w-full mx-4 question-preview-enter">
          {/* 星际风格卡片 */}
          <div className="bg-space-850 border-2 border-amber-400/50 rounded-lg p-8 shadow-2xl relative overflow-hidden">
            {/* 全息扫描效果 */}
            <div className="absolute inset-0 bg-gradient-to-b from-amber-400/10 to-transparent pointer-events-none"></div>

            {/* 标签 */}
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              <span className="text-amber-400 text-sm font-mono tracking-wider">
                问题已提取
              </span>
            </div>

            {/* 问题文本 */}
            <div className="text-amber-100 text-xl leading-relaxed mb-6 relative z-10">
              {previewQuestion.text}
            </div>

            {/* 装饰元素 */}
            <div className="flex justify-between items-center text-space-600 text-xs font-mono relative z-10">
              <span>NO.{previewQuestion.ticketNum}</span>
              <span>即将进入记录页面...</span>
            </div>

            {/* 进度条 */}
            <div className="mt-4 h-1 bg-space-700 rounded-full overflow-hidden relative z-10">
              <div className="h-full bg-amber-400 animate-[progress_2s_ease-out_forwards]"></div>
            </div>
          </div>
        </div>
      </div>
      </>
    );
  }

  // ==================== INTRO VIEW ====================
  if (view === 'intro') {
    return (
      <>
      <AudioControl currentUser={currentUser} onLogin={handleLogin} onLogout={handleLogout} />
      <div className="min-h-screen space-bg flex flex-col font-display relative intro-enter">
        {/* 纸理纹理叠加 */}
        <div className="absolute inset-0 paper-texture pointer-events-none"></div>

        {/* --- 顶部：21天进度条 --- */}
        <div className="w-full bg-space-900/80 backdrop-blur-sm border-b border-space-700 py-3 px-6 shadow-lg relative z-10">
          <div className="max-w-md mx-auto">

            {/* 头部信息 */}
            <div className="flex justify-between items-end mb-3 border-b border-space-700 pb-2">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-amber-400">
                  {/* 图标：未完成显示 Activity，完成显示 Trophy */}
                  {streakData.isCompleted
                    ? <Trophy size={14} className="text-amber-400 glow-text" />
                    : <Activity size={14} className="text-amber-400/80" />
                  }
                  <span className="text-sm font-bold font-mono tracking-tight text-amber-100">
                    {streakData.isCompleted ? "思想觉醒" : streakData.currentStreak === 0 ? "准备开始" : "请保持思想呕吐"}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-3xl font-black font-mono leading-none tracking-tighter text-amber-400 glow-text">
                  {String(streakData.currentStreak).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-cyan-400/60 font-mono uppercase tracking-wider block mt-0.5">
                  / 21 天
                </span>
              </div>
            </div>

            {/* 分段式进度条 (3D管道效果) */}
            <div className="flex gap-[2px] mb-2 h-3 progress-pipe">
              {[...Array(21)].map((_, i) => {
                const isActive = i < streakData.currentStreak;

                // 样式逻辑
                let bgClass = "bg-space-700/50"; // 默认/未来 (暗色)

                if (isActive) {
                  if (streakData.isCompleted) {
                    bgClass = "bg-amber-400 progress-segment-active"; // 完成态全金 + 发光
                  } else if (i === streakData.currentStreak - 1) {
                    bgClass = "bg-amber-400 progress-segment-active animate-pulse"; // 今日高亮 + 发光 + 脉冲
                  } else {
                    bgClass = "bg-amber-400/60"; // 过去已打卡 (半透明琥珀色)
                  }
                }

                return (
                  <div key={i} className={`flex-1 rounded-[1px] transition-all duration-300 progress-segment ${bgClass}`}></div>
                );
              })}
            </div>

            {/* 底部微文案 */}
            <div className="flex justify-between items-center text-[10px] text-cyan-400/60 font-mono">
              <span>记忆恢复: {streakData.isCompleted ? "100%" : `${Math.round((streakData.currentStreak/21)*100)}%`}</span>
              <span className="text-amber-400/80">思考进度</span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-0">
          <div className="w-full max-w-md">
          {/* Robot Face - 破旧机器人 + 3D浮动 */}
          <div className="flex flex-col items-center mb-8 perspective-1000">
            <h3 className="text-amber-400 font-black text-2xl mb-6 tracking-widest uppercase glow-text">问题呕吐机</h3>

            {robotHasLeft ? (
              // ========== 机器人已离开 ==========
              <div className="mb-8 relative">
                {/* 空的位置 - 只留下轮廓 */}
                <div className="w-48 h-48 bg-space-900/30 rounded-2xl flex items-center justify-center relative border-2 border-dashed border-space-600 shadow-2xl">
                  {/* 留下的文字 */}
                  <div className="text-center p-6">
                    <span className="material-symbols-outlined text-4xl text-amber-400/50 block mb-3">rocket_launch</span>
                    <p className="text-sm text-cyan-400/60 font-mono leading-relaxed">
                      机器人已经回到了他的星球<br />
                      <span className="text-xs text-amber-400/80 mt-2 block">
                        他留下的所有问题<br />
                        都已被你抽取完毕
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // ========== 机器人还在 ==========
              <div className={`mb-8 relative ${isVomiting ? 'animate-shake' : 'float-3d'}`}>
                {/* 机器人外壳 - 添加破损效果 */}
                <div className="w-48 h-48 bg-space-800 rounded-2xl flex items-center justify-center robot-damaged relative border-2 border-rust-500/30 shadow-2xl depth-shadow">
                  {/* 锈迹装饰 */}
                  <div className="absolute top-4 right-4 w-8 h-1 bg-rust-400/40 rotate-45"></div>
                  <div className="absolute bottom-6 left-6 w-6 h-1 bg-rust-400/30 -rotate-12"></div>

                  {/* 机器人脸 */}
                  <div className="w-40 h-32 bg-space-850 rounded-xl flex flex-col items-center justify-center border border-space-700 relative overflow-hidden layered">
                    {/* 扫描线效果 */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent animate-scanline"></div>

                    <div className="flex gap-6 mb-2 relative z-10">
                      {/* 左眼 - 完整 */}
                      <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-lg shadow-amber-400/50">
                        <div className="w-2 h-2 bg-space-900 animate-pulse"></div>
                      </div>
                      {/* 右眼 - 损坏（闪烁） */}
                      <div className="w-8 h-8 bg-amber-400/70 rounded-full flex items-center justify-center shadow-lg shadow-amber-400/30 relative">
                        <div className="w-2 h-2 bg-space-900/70 animate-pulse" style={{ animationDuration: '0.5s' }}></div>
                        {/* 损坏痕迹 */}
                        <div className="absolute top-0 right-0 w-3 h-0.5 bg-rust-400 rotate-45"></div>
                      </div>
                    </div>
                    <div className={`bg-space-700 mt-2 transition-all ${isVomiting ? 'h-12 w-20' : 'h-1 w-16'} rounded-full`}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 状态显示 - 全息卡片风格 */}
          <div className="w-full border border-dashed border-cyan-400/30 bg-space-850/50 backdrop-blur-sm p-3 mb-8 text-center hologram">
            <p className="font-mono text-xs text-cyan-400/90 font-bold">
              状态: <span className={isVomiting ? "text-amber-400 animate-pulse glow-text" : "text-amber-400/80"}>
                {robotHasLeft ? "机器人已离开" : isVomiting ? "正在生成..." : hasVomitedToday ? "今日已呕吐" : "今日未呕吐"}
              </span>
            </p>
          </div>

          {/* 核心逻辑：根据 hasVomitedToday 显示不同按钮 */}
          {robotHasLeft ? (
            // ========== 机器人已离开 ==========
            <div className="w-full h-16 bg-space-800/50 border-2 border-space-600 rounded-lg flex items-center justify-center gap-3 opacity-60">
              <span className="material-symbols-outlined text-cyan-400/50 text-2xl">lock</span>
              <span className="text-space-400 text-lg font-bold tracking-wider uppercase">
                机器人已离开
              </span>
            </div>
          ) : !hasVomitedToday ? (
            // ========== 未抽题：显示大按钮 - 3D按压效果 ==========
            <button
              onClick={handleSpitQuestion}
              disabled={isVomiting}
              className={`w-full h-16 bg-amber-400/90 hover:bg-amber-400 border-2 border-amber-500 btn-3d btn-glow flex items-center justify-center gap-3 disabled:grayscale disabled:opacity-50 hologram relative ${isVomiting ? 'btn-loading' : ''}`}
            >
              <span className="text-space-900 text-xl font-black tracking-widest uppercase">
                {isVomiting ? "CALCULATING..." : "吐一个问题"}
              </span>
              {!isVomiting && (
                <span className="bg-space-900 text-amber-400 p-1 rounded">
                  →
                </span>
              )}
            </button>
          ) : (
            // ========== 已抽题：显示查看今日样本按钮 ==========
            <div className="space-y-3">
              <button
                onClick={() => {
                  // 只切换视图，不清空输入（让 useEffect 自动加载答案）
                  setIsEditingHistory(false);
                  setView('daily');
                }}
                className="w-full h-14 bg-space-850/80 hover:bg-space-850 border border-cyan-400/30 text-amber-100 btn-3d btn-glow flex items-center justify-center gap-2 hologram relative"
              >
                <span className="material-symbols-outlined text-cyan-400">today</span>
                <span className="font-bold tracking-wide">查看今日样本</span>
              </button>

              {/* 强制重置按钮 */}
              {remainingRerolls > 0 && !isDbEmpty && (
                <button
                  onClick={async () => {
                    if (remainingRerolls <= 0) return;

                    setIsVomiting(true);
                    const [questionData] = await Promise.all([
                      generatePhilosophicalQuestion(streakData.currentStreak || 1),
                      new Promise<void>((resolve) => setTimeout(resolve, 1500))
                    ]);
                    setIsVomiting(false);

                    // 重置所有状态
                    setCurrentQuestion(questionData);
                    setRemainingRerolls(prev => prev - 1);
                    setUserInput(''); // 清空输入框
                    setLastSavedTime(null);
                    setIsEditingHistory(false);
                    saveTodayState(questionData, remainingRerolls - 1);

                    // 呕吐完成后直接进入第二个界面
                    setView('daily');
                  }}
                  disabled={isVomiting || remainingRerolls <= 0}
                  className={`w-full h-10 bg-space-700/50 hover:bg-space-700/70 border border-space-600 text-cyan-400/80 hover:text-cyan-400 btn-3d btn-glow flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed hologram relative ${isVomiting ? 'btn-loading' : ''}`}
                >
                  {!isVomiting && <span className="material-symbols-outlined text-sm">refresh</span>}
                  <span>{isVomiting ? "重置中..." : `不满意？强制重置 (剩余: ${remainingRerolls})`}</span>
                </button>
              )}
            </div>
          )}

          {/* 底部链接 */}
          <div className="mt-8 text-center space-y-3">
            <button
              onClick={() => setView('history')}
              className="text-sm font-mono text-cyan-400/60 hover:text-cyan-400 transition-colors underline decoration-dotted"
            >
              查看历史样本 {">"}
            </button>

            {/* ==================== 测试面板 ==================== */}
            <details className="text-left">
              <summary className="text-xs font-mono text-amber-400/60 hover:text-amber-400 cursor-pointer underline decoration-dashed select-none">
                [测试面板] 点击展开调试选项
              </summary>
              <div className="mt-3 p-3 bg-space-850/80 backdrop-blur-sm border border-amber-400/20 rounded text-xs space-y-2 hologram">
                <p className="font-bold text-amber-400 mb-2">🎮 记忆碎片测试工具</p>

                {/* 设置打卡天数 */}
                <div className="space-y-1 mb-3">
                  <p className="font-mono text-cyan-400/80">设置打卡天数（即将打卡状态）：</p>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        const yesterday = new Date();
                        yesterday.setDate(yesterday.getDate() - 1);
                        const newData = { ...streakData, currentStreak: 0, lastCheckIn: yesterday.toISOString().split('T')[0], checkInHistory: [yesterday.toISOString().split('T')[0]] };
                        saveStreakData(newData);
                        setStreakData(newData);
                      }}
                      className="px-2 py-1 bg-space-700/50 hover:bg-space-700 border border-space-600 text-cyan-400 rounded"
                    >第0天→1天</button>
                    <button
                      onClick={() => {
                        const yesterday = new Date();
                        yesterday.setDate(yesterday.getDate() - 1);
                        const newData = { ...streakData, currentStreak: 6, lastCheckIn: yesterday.toISOString().split('T')[0], checkInHistory: Array(6).fill('').map((_, i) => {
                          const d = new Date();
                          d.setDate(d.getDate() - (6 - i));
                          return d.toISOString().split('T')[0];
                        }) };
                        saveStreakData(newData);
                        setStreakData(newData);
                      }}
                      className="px-2 py-1 bg-space-700/50 hover:bg-space-700 border border-space-600 text-cyan-400 rounded"
                    >第6天→7天(里程碑)</button>
                    <button
                      onClick={() => {
                        const yesterday = new Date();
                        yesterday.setDate(yesterday.getDate() - 1);
                        const newData = { ...streakData, currentStreak: 13, lastCheckIn: yesterday.toISOString().split('T')[0], checkInHistory: Array(13).fill('').map((_, i) => {
                          const d = new Date();
                          d.setDate(d.getDate() - (13 - i));
                          return d.toISOString().split('T')[0];
                        }) };
                        saveStreakData(newData);
                        setStreakData(newData);
                      }}
                      className="px-2 py-1 bg-space-700/50 hover:bg-space-700 border border-space-600 text-cyan-400 rounded"
                    >第13天→14天(里程碑)</button>
                    <button
                      onClick={() => {
                        const yesterday = new Date();
                        yesterday.setDate(yesterday.getDate() - 1);
                        const newData = { ...streakData, currentStreak: 20, lastCheckIn: yesterday.toISOString().split('T')[0], checkInHistory: Array(20).fill('').map((_, i) => {
                          const d = new Date();
                          d.setDate(d.getDate() - (20 - i));
                          return d.toISOString().split('T')[0];
                        }) };
                        saveStreakData(newData);
                        setStreakData(newData);
                      }}
                      className="px-2 py-1 bg-amber-400/90 border border-amber-500 hover:bg-amber-400 text-space-900 rounded font-bold"
                    >第20天→21天(通关)</button>
                    <button
                      onClick={() => {
                        // 模拟所有问题都被抽取了
                        const dummyQuestions = Array(47).fill('dummy');
                        localStorage.setItem('qvm_answered_questions', JSON.stringify(dummyQuestions));
                        const newData = { ...streakData, currentStreak: 21, lastCheckIn: getTodayDate(), isCompleted: true };
                        saveStreakData(newData);
                        setStreakData(newData);
                        updateRobotLeftStatus();
                        alert('已设置：机器人已离开状态\n（21天完成 + 所有问题抽完）');
                      }}
                      className="px-2 py-1 bg-red-900/50 hover:bg-red-900/70 border border-red-700/50 text-red-300 rounded font-bold"
                    >🚀 机器人已离开</button>
                  </div>
                </div>

                {/* 测试各章节碎片 */}
                <div className="space-y-1 mb-3">
                  <p className="font-mono text-cyan-400/80">测试各章节随机碎片：</p>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        const fragment = getRandomFragment(3, viewedFragmentIds);
                        if (fragment) {
                          setCurrentMemoryFragment(fragment);
                          setShowMemoryModal(true);
                          saveViewedFragment(fragment.id);
                        } else {
                          alert('第1章碎片已全部看完，请清除记录');
                        }
                      }}
                      className="px-2 py-1 bg-space-800/50 hover:bg-space-800 border border-space-600 text-amber-400/80 rounded"
                    >第1章</button>
                    <button
                      onClick={() => {
                        const fragment = getRandomFragment(8, viewedFragmentIds);
                        if (fragment) {
                          setCurrentMemoryFragment(fragment);
                          setShowMemoryModal(true);
                          saveViewedFragment(fragment.id);
                        } else {
                          alert('第2章碎片已全部看完，请清除记录');
                        }
                      }}
                      className="px-2 py-1 bg-blue-900/50 hover:bg-blue-900/70 border border-blue-700/50 text-blue-200 rounded"
                    >第2章</button>
                    <button
                      onClick={() => {
                        const fragment = getRandomFragment(16, viewedFragmentIds);
                        if (fragment) {
                          setCurrentMemoryFragment(fragment);
                          setShowMemoryModal(true);
                          saveViewedFragment(fragment.id);
                        } else {
                          alert('第3章碎片已全部看完，请清除记录');
                        }
                      }}
                      className="px-2 py-1 bg-purple-900/50 hover:bg-purple-900/70 border border-purple-700/50 text-purple-200 rounded"
                    >第3章</button>
                    <button
                      onClick={() => {
                        const finalFragment = MEMORY_FRAGMENTS.find(f => f.id === 'final');
                        if (finalFragment) {
                          setCurrentMemoryFragment(finalFragment);
                          setShowMemoryModal(true);
                        }
                      }}
                      className="px-2 py-1 bg-amber-400/90 hover:bg-amber-400 border border-amber-500 text-space-900 rounded font-bold glow-text"
                    >最终结局</button>
                  </div>
                </div>

                {/* 数据管理 */}
                <div className="space-y-1">
                  <p className="font-mono text-cyan-400/80">数据管理：</p>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        localStorage.removeItem('qvm_seen_prologue');
                        setView('prologue');
                      }}
                      className="px-2 py-1 bg-purple-900/50 hover:bg-purple-900/70 border border-purple-700/50 text-purple-200 rounded font-bold"
                    >🎬 重播前言</button>
                    <button
                      onClick={() => {
                        setViewedFragmentIds([]);
                        localStorage.removeItem('qvm_viewed_fragments');
                        alert('已清除碎片记录，可以重新观看');
                      }}
                      className="px-2 py-1 bg-space-700/50 hover:bg-space-700 border border-space-600 text-cyan-400/80 rounded"
                    >清除碎片记录</button>
                    <button
                      onClick={() => {
                        clearAnsweredQuestions();
                        alert('已清除问题记录，可以重新回答');
                        window.location.reload();
                      }}
                      className="px-2 py-1 bg-space-700/50 hover:bg-space-700 border border-space-600 text-cyan-400/80 rounded"
                    >清除问题记录</button>
                    <button
                      onClick={() => {
                        if (confirm('确定要重置所有数据吗？包括打卡进度和碎片记录')) {
                          localStorage.removeItem('qvm_streak');
                          localStorage.removeItem('qvm_viewed_fragments');
                          localStorage.removeItem('vqm_archives');
                          localStorage.removeItem('vqm_today');
                          clearAnsweredQuestions();
                          window.location.reload();
                        }
                      }}
                      className="px-2 py-1 bg-red-900/30 hover:bg-red-900/50 border border-red-700/50 text-red-400 rounded"
                    >重置所有数据</button>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-amber-400/20">
                  <p className="font-mono text-amber-400/70">
                    当前状态: Day {streakData.currentStreak} | 已看碎片: {viewedFragmentIds.length} | 已答问题: {(() => { try { const a = JSON.parse(localStorage.getItem('qvm_answered_questions') || '[]'); return a.length; } catch { return 0; } })()}
                  </p>
                </div>
              </div>
            </details>
          </div>
          </div>
        </div>

        <SilentObserverModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={() => {
            setUserInput('');
            setView('intro');
          }}
          message="确定要清空当前输入吗？"
        />
      </div>
      <CheckInSuccessModal
        isOpen={showCheckInModal}
        onClose={() => {
          setShowCheckInModal(false);
          // 打卡成功弹窗关闭后，自动跳转到历史页面
          setTimeout(() => setView('history'), 300);
        }}
        onUnlock={tryTriggerMemoryFragment}
        day={checkInDay}
        isCompleted={checkInDay >= 21}
      />
      <UnlockMemoryModal
        isOpen={showUnlockModal}
        onConfirm={handleUnlockMemory}
      />
      <MemoryFragmentModal
        isOpen={showMemoryModal}
        onClose={handleMemoryModalClose}
        content={currentMemoryFragment?.content || ''}
        chapter={currentMemoryFragment?.chapter || 1}
        currentDay={streakData.currentStreak}
      />
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
      </>
    );
  }

  // ==================== DAILY VIEW (记录页) ====================
  if (view === 'daily' && currentQuestion) {
    return (
      <>
      <AudioControl currentUser={currentUser} onLogin={handleLogin} onLogout={handleLogout} />
      <div className="min-h-screen space-bg text-amber-100 p-6 relative daily-enter">
        {/* 纸理纹理叠加 */}
        <div className="absolute inset-0 paper-texture pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl mx-auto">
        {/* 统一样式的返回按钮 - 星际风格 */}
        <button onClick={() => {
          setView('intro');
          setIsEditingHistory(false);
        }} className="self-start text-cyan-400/70 hover:text-cyan-400 mb-6 flex items-center gap-1 text-sm transition-colors">
          <ArrowLeft size={14} /> 返回观测站
        </button>

        {/* 问题票据 - 全息卡片风格 */}
        <div className="bg-space-850/80 backdrop-blur-sm border border-cyan-400/30 p-6 rounded-lg mb-6 shadow-xl hologram depth-shadow">
          <div className="flex justify-between items-center border-b border-dashed border-cyan-400/30 pb-2 mb-4">
            <p className="text-cyan-400/70 text-xs font-mono">TICKET #{currentQuestion.ticketNum}</p>
            <p className="text-cyan-400/70 text-xs font-mono">{currentQuestion.date}</p>
          </div>
          <h2 className="text-xl font-bold mb-2 text-amber-100">{currentQuestion.text}</h2>
          <div className="flex justify-between items-end opacity-30 mt-4">
            <div className="h-8 w-32 bg-cyan-400/20"></div>
            <span className="text-[10px] font-mono text-cyan-400/60">VQM-REF-{currentQuestion.id}</span>
          </div>
        </div>

        {/* 输入区域 - 星际终端风格 */}
        <div className="mb-6">
          <label className="block text-cyan-400/70 text-xs font-mono mb-2">
            INPUT BUFFER // WRITE ACCESS
          </label>

          {/* 呕吐写作引导卡片 */}
          <div className="mb-3 bg-amber-400/10 border border-amber-400/30 rounded-lg p-3 hologram">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-amber-400 text-sm mt-0.5">tips_and_updates</span>
              <div className="text-xs text-amber-100 leading-relaxed">
                <p className="font-bold text-amber-400 mb-1">呕吐写作法</p>
                <p className="opacity-90">想到什么写什么，不要过度编辑，让思想自由流动。</p>
              </div>
            </div>
          </div>

          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="w-full min-h-[180px] bg-space-800/80 border border-space-700 rounded-lg p-4 text-amber-100 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/30 resize-none backdrop-blur-sm"
            placeholder="在这里捕捉你的意识火花..."
          />
          <div className="flex justify-between items-center mt-2 text-cyan-400/60 text-xs font-mono">
            <div className="flex items-center gap-3">
              <span>LN: {userInput.split('\n').length}</span>
              <span className="text-amber-400/80">{userInput.length} 字</span>
            </div>
            <span>COL: {userInput.length}</span>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-3">
          {/* 保存按钮 - 3D按压效果 */}
          <div>
            <button
              onClick={() => {
                if (!userInput.trim()) {
                  setShowConfirmModal(true);
                } else {
                  handleArchive();
                }
              }}
              className="w-full bg-amber-400/90 hover:bg-amber-400 border-2 border-amber-500 text-space-900 btn-3d btn-glow py-4 px-6 flex items-center justify-center gap-3 hologram relative"
            >
              <span className="material-symbols-outlined">archive</span>
              <span className="font-bold tracking-wider text-sm uppercase">存入人类思想样本库</span>
            </button>

            {/* 保存时间反馈 */}
            {lastSavedTime && (
              <div className="text-center mt-2">
                <span className="text-xs text-cyan-400/70 font-mono">
                  上次保存: {lastSavedTime}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setUserInput('')}
              className="flex-1 text-cyan-400/60 hover:text-cyan-400 text-xs font-mono py-3 flex items-center justify-center gap-2 transition-colors bg-space-800/50 hover:bg-space-800/70 border border-space-700 rounded"
            >
              <span className="material-symbols-outlined text-sm">restart_alt</span>
              <span>清空重置</span>
            </button>

            {remainingRerolls > 0 && !isEditingHistory && (
              <button
                onClick={handleReroll}
                className="flex-1 text-cyan-400/60 hover:text-amber-400 text-xs font-mono py-3 flex items-center justify-center gap-2 transition-colors bg-space-800/50 hover:bg-space-800/70 border border-space-700 rounded"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                <span>重新抽取 (剩余: {remainingRerolls})</span>
              </button>
            )}
          </div>
        </div>
        </div>

        <SilentObserverModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleArchive}
          message="什么都没写，确定要存入吗？"
        />
      </div>
      <CheckInSuccessModal
        isOpen={showCheckInModal}
        onClose={() => {
          setShowCheckInModal(false);
          // 打卡成功弹窗关闭后，自动跳转到历史页面
          setTimeout(() => setView('history'), 300);
        }}
        onUnlock={tryTriggerMemoryFragment}
        day={checkInDay}
        isCompleted={checkInDay >= 21}
      />
      <UnlockMemoryModal
        isOpen={showUnlockModal}
        onConfirm={handleUnlockMemory}
      />
      <MemoryFragmentModal
        isOpen={showMemoryModal}
        onClose={handleMemoryModalClose}
        content={currentMemoryFragment?.content || ''}
        chapter={currentMemoryFragment?.chapter || 1}
        currentDay={streakData.currentStreak}
      />
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
      </>
    );
  }

  // ==================== HISTORY VIEW (历史页) ====================
  if (view === 'history') {
    let archives: ArchiveEntry[] = [];
    try {
      archives = JSON.parse(localStorage.getItem('vqm_archives') || '[]');
    } catch (error) {
      console.error('Failed to parse archives:', error);
      archives = [];
    }

    const isEmpty = archives.length === 0;

    return (
      <>
      <AudioControl currentUser={currentUser} onLogin={handleLogin} onLogout={handleLogout} />
      <div className="min-h-screen space-bg p-6 relative history-enter">
        {/* 纸理纹理叠加 */}
        <div className="absolute inset-0 paper-texture pointer-events-none"></div>

        {/* 返回按钮和标题 */}
        <div className="relative z-10 max-w-2xl mx-auto mb-6">
          <button onClick={() => setView('intro')} className="self-start text-cyan-400/70 hover:text-cyan-400 mb-6 flex items-center gap-1 text-sm transition-colors">
            <ArrowLeft size={14} /> 返回观测站
          </button>
          <h1 className="text-2xl font-black mb-6 tracking-tight text-amber-100 glow-text">人类思想样本库</h1>
        </div>

        {/* 档案列表 */}
        <div className="relative z-10 max-w-2xl mx-auto">
          {isEmpty ? (
            <div className="text-center py-12">
              <p className="text-cyan-400/60 font-mono text-sm hologram inline-block px-6 py-3 bg-space-850/50 rounded-lg">
                数据库为空，暂无样本
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {archives.map((archive, index) => (
                <div
                  key={index}
                  onClick={() => openHistoryEntry(archive)}
                  className="group relative bg-space-850/80 backdrop-blur-sm border border-space-700 hover:border-amber-400/50 rounded-lg p-4 shadow-lg hover:shadow-xl hover:shadow-amber-400/10 transition-all cursor-pointer hologram depth-shadow"
                >
                  {/* 删除按钮 - 悬停时显示 */}
                  <button
                    onClick={(e) => confirmDelete(archive, e)}
                    className="absolute top-3 right-3 text-cyan-400/50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-red-900/20 rounded"
                    title="删除此记录"
                  >
                    <Trash2 size={16} />
                  </button>

                  <div className="flex justify-between items-start mb-2 pr-8">
                    <p className="text-cyan-400/70 text-xs font-mono">
                      {new Date(archive.lastModified).toLocaleDateString()}
                    </p>
                    <p className="text-cyan-400/50 text-xs font-mono">
                      #{archive.question?.ticketNum || 'N/A'}
                    </p>
                  </div>
                  <h3 className="font-bold text-amber-100 mb-1 pr-8">{archive.question?.text || '未知问题'}</h3>

                  {/* 仅显示是否有答案，不显示内容 */}
                  {archive.answers && archive.answers.length > 0 && (
                    <p className="text-xs text-cyan-400/60 font-mono flex items-center gap-1">
                      <span className="text-amber-400">✓</span> 已保存 {new Date(archive.answers[0].timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                  {(!archive.answers || archive.answers.length === 0) && (
                    <p className="text-xs text-cyan-400/40 italic">(无回答)</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 悬浮按钮 */}
        {!hasVomitedToday && (
          <button
            onClick={() => setView('intro')}
            className="fixed bottom-6 right-6 w-14 h-14 bg-amber-400/90 hover:bg-amber-400 border-2 border-amber-500 rounded-full shadow-lg shadow-amber-400/30 flex items-center justify-center hover:brightness-110 transition-all btn-3d z-20"
          >
            <span className="text-space-900 text-2xl font-black">+</span>
          </button>
        )}
      </div>

      {/* 弹窗 */}
      <SilentObserverModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setArchiveToDelete(null);
        }}
        onConfirm={handleDeleteArchive}
        message={`确定要删除这条记录吗？\n\n"${archiveToDelete?.question?.text || '未知问题'}"\n\n删除后无法恢复。`}
      />
      <CheckInSuccessModal
        isOpen={showCheckInModal}
        onClose={() => {
          setShowCheckInModal(false);
          // 打卡成功弹窗关闭后，自动跳转到历史页面
          setTimeout(() => setView('history'), 300);
        }}
        onUnlock={tryTriggerMemoryFragment}
        day={checkInDay}
        isCompleted={checkInDay >= 21}
      />
      <UnlockMemoryModal
        isOpen={showUnlockModal}
        onConfirm={handleUnlockMemory}
      />
      <MemoryFragmentModal
        isOpen={showMemoryModal}
        onClose={handleMemoryModalClose}
        content={currentMemoryFragment?.content || ''}
        chapter={currentMemoryFragment?.chapter || 1}
        currentDay={streakData.currentStreak}
      />
      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        onLogin={handleLogin}
      />
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
      </>
    );
  }

  return null;
};
