import React, { useState, useEffect } from 'react';
import { ArrowLeft, X, Trash2, Activity, Trophy } from 'lucide-react';
import { generatePhilosophicalQuestion } from '../services/geminiService';
import { QuestionData } from '../types';
import { MemoryFragment, getRandomFragment, MEMORY_FRAGMENTS } from '../services/memoryFragments';

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
  day: number;
  isCompleted: boolean;
}

const CheckInSuccessModal = ({ isOpen, onClose, day, isCompleted }: CheckInSuccessModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-[320px] bg-space-850/90 backdrop-blur-md border-2 border-amber-400 shadow-[6px_6px_0px_0px_rgba(251,191,36,0.3)] animate-in zoom-in-95 duration-300 flex flex-col overflow-hidden hologram relative">
        {/* 顶部装饰条 */}
        <div className="bg-amber-400/90 h-2"></div>

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
              <div className="w-16 h-16 bg-amber-400 rounded-full flex items-center justify-center shadow-lg shadow-amber-400/50">
                <Trophy size={32} className="text-space-900" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-space-800 rounded-full flex items-center justify-center border-2 border-amber-400/50">
                <Activity size={32} className="text-amber-400" />
              </div>
            )}
          </div>

          {/* 核心文案 */}
          <p className="text-lg font-black text-amber-100 mb-2 leading-relaxed">
            太好了，人类！
          </p>
          <p className="text-xl font-black text-amber-400 mb-6 tracking-tight glow-text">
            这是你主动思考的第 {day} 天
          </p>

          {/* 进度可视化 */}
          <div className="flex gap-[1px] mb-6 h-2 justify-center progress-pipe">
            {[...Array(21)].map((_, i) => {
              const isActive = i < day;
              return (
                <div
                  key={i}
                  className={`w-1.5 rounded-[1px] progress-segment ${
                    isActive
                      ? isCompleted
                        ? 'bg-amber-400 progress-segment-active'
                        : i === day - 1
                        ? 'bg-amber-400 progress-segment-active animate-pulse'
                        : 'bg-amber-400/60'
                      : 'bg-space-700'
                  }`}
                ></div>
              );
            })}
          </div>

          {/* 继续按钮 */}
          <button
            onClick={() => {
              onClose();
            }}
            className="w-full bg-space-800 hover:bg-space-700 text-amber-100 border border-amber-400/30 font-bold py-3 px-4 hover:border-amber-400/50 transition-all flex items-center justify-center gap-2 btn-3d"
          >
            <span>现在开始真正的思考吧！</span>
            <span className="text-amber-400">→</span>
          </button>
        </div>
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

  // 星际日记风格 - 章节颜色
  const chapterColors: Record<number | 'final', { bg: string; border: string; text: string; glow: string }> = {
    1: { bg: 'bg-space-800/90', border: 'border-space-600', text: 'text-zinc-300', glow: 'shadow-zinc-500/20' },
    2: { bg: 'bg-blue-900/80', border: 'border-cyan-500/50', text: 'text-cyan-100', glow: 'shadow-cyan-500/30' },
    3: { bg: 'bg-purple-900/80', border: 'border-purple-500/50', text: 'text-purple-100', glow: 'shadow-purple-500/30' },
    final: { bg: 'bg-amber-900/80', border: 'border-amber-400', text: 'text-amber-100', glow: 'shadow-amber-500/50' }
  };

  const colors = chapterColors[chapter] || chapterColors[1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300 scanlines perspective-1000">
      <div className={`w-[360px] ${colors.bg} border-2 ${colors.border} ${colors.glow} shadow-2xl flex flex-col overflow-hidden hologram relative flip-in`} style={{ transformStyle: 'preserve-3d' }}>

        {/* 扫描线动画 */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-amber-400/5 to-transparent animate-scanline"></div>

        {/* 顶部：章节标签 + 关闭 */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono ${colors.text} opacity-70`}>● 记忆碎片</span>
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
  const [view, setView] = useState<'intro' | 'daily' | 'history'>('intro');
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
  const [isVomiting, setIsVomiting] = useState(false);
  const [hasVomitedToday, setHasVomitedToday] = useState(false);
  const [remainingRerolls, setRemainingRerolls] = useState(1);
  const [isDbEmpty, setIsDbEmpty] = useState(true);
  const [userInput, setUserInput] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [isEditingHistory, setIsEditingHistory] = useState(false);

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

  // ==================== 工具函数 ====================

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
    if (isCompleted && !streakData.isCompleted) {
      console.log('🏆 恭喜！完成21天思考挑战！');
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

  // 触发记忆碎片的函数
  const tryTriggerMemoryFragment = (probability: number) => {
    const currentDay = streakData.currentStreak;

    // 21天必触发最终结局
    if (currentDay >= 21) {
      const finalFragment = MEMORY_FRAGMENTS.find(f => f.id === 'final');
      if (finalFragment && !viewedFragmentIds.includes('final')) {
        setCurrentMemoryFragment(finalFragment);
        setShowMemoryModal(true);
        saveViewedFragment('final');
        return;
      }
    }

    // 里程碑天数必触发
    const milestoneFragment = MEMORY_FRAGMENTS.find(
      f => f.isMilestone && f.minDay === currentDay && !viewedFragmentIds.includes(f.id)
    );
    if (milestoneFragment) {
      setCurrentMemoryFragment(milestoneFragment);
      setShowMemoryModal(true);
      saveViewedFragment(milestoneFragment.id);
      return;
    }

    // 随机触发
    if (Math.random() < probability) {
      const fragment = getRandomFragment(currentDay, viewedFragmentIds);
      if (fragment) {
        setCurrentMemoryFragment(fragment);
        setShowMemoryModal(true);
        saveViewedFragment(fragment.id);
      }
    }
  };

  const handleSpitQuestion = async () => {
    setIsVomiting(true);

    const [questionData] = await Promise.all([
      generatePhilosophicalQuestion(),
      new Promise<void>((resolve) => setTimeout(resolve, 1500))
    ]);

    setIsVomiting(false);
    setCurrentQuestion(questionData);
    setHasVomitedToday(true);
    setRemainingRerolls(1);
    setUserInput(''); // 新题清空输入
    setLastSavedTime(null);
    setIsEditingHistory(false);
    saveTodayState(questionData, 1);
    setView('daily');

    // 延迟触发记忆碎片（30%）
    setTimeout(() => tryTriggerMemoryFragment(0.3), 500);
  };

  // 保存答案（覆盖模式）
  const handleArchive = () => {
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

      console.log('保存成功！');

      // ==================== Phase 2: 集成打卡逻辑 ====================
      // 只有在非编辑历史记录模式且是新记录或首次保存时才打卡
      if (!isEditingHistory) {
        checkIn(); // 执行打卡
      }

      // 保存成功后跳转到历史页
      setView('history');

      // 延迟触发记忆碎片（50%）
      setTimeout(() => tryTriggerMemoryFragment(0.5), 300);
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    }
  };

  const handleReroll = async () => {
    if (remainingRerolls <= 0) return;

    setIsVomiting(true);
    const [questionData] = await Promise.all([
      generatePhilosophicalQuestion(),
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

  // ==================== INTRO VIEW ====================
  if (view === 'intro') {
    return (
      <>
      <div className="min-h-screen space-bg flex flex-col font-display relative">
        {/* 纸理纹理叠加 */}
        <div className="absolute inset-0 paper-texture pointer-events-none"></div>

        {/* --- 顶部：Protocol-21 进度条 --- */}
        <div className="w-full bg-space-900/80 backdrop-blur-sm border-b border-space-700 py-3 px-6 shadow-lg relative z-10">
          <div className="max-w-md mx-auto">

            {/* 头部信息 */}
            <div className="flex justify-between items-end mb-3 border-b border-space-700 pb-2">
              <div className="flex flex-col">
                <span className="text-[10px] text-cyan-400/70 font-mono tracking-widest uppercase mb-0.5">
                  PROTOCOL-21
                </span>
                <div className="flex items-center gap-1.5 text-amber-400">
                  {/* 图标：未完成显示 Activity，完成显示 Trophy */}
                  {streakData.isCompleted
                    ? <Trophy size={14} className="text-amber-400 glow-text" />
                    : <Activity size={14} className="text-amber-400/80" />
                  }
                  <span className="text-sm font-bold font-mono tracking-tight text-amber-100">
                    {streakData.isCompleted ? "文明重建" : streakData.currentStreak === 0 ? "准备开始" : "觉醒中..."}
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

                // 样式逻辑 - 星际日记风格
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
              <span className="text-amber-400/80">文明重建进度</span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-0">
          <div className="w-full max-w-md">
          {/* Robot Face - 破旧机器人 + 3D浮动 */}
          <div className="flex flex-col items-center mb-8 perspective-1000">
            <h3 className="text-amber-400 font-black text-2xl mb-6 tracking-widest uppercase glow-text">星际日记</h3>
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
          </div>

          {/* 状态显示 - 全息卡片风格 */}
          <div className="w-full border border-dashed border-cyan-400/30 bg-space-850/50 backdrop-blur-sm p-3 mb-8 text-center hologram">
            <p className="font-mono text-xs text-cyan-400/90 font-bold">
              STATUS: <span className={isVomiting ? "text-amber-400 animate-pulse glow-text" : "text-amber-400/80"}>
                {isVomiting ? "正在生成..." : hasVomitedToday ? "今日已抽题" : "等待输入..."}
              </span>
            </p>
          </div>

          {/* 核心逻辑：根据 hasVomitedToday 显示不同按钮 */}
          {!hasVomitedToday ? (
            // ========== 未抽题：显示大按钮 - 3D按压效果 ==========
            <button
              onClick={handleSpitQuestion}
              disabled={isVomiting}
              className="w-full h-16 bg-amber-400/90 hover:bg-amber-400 border-2 border-amber-500 btn-3d flex items-center justify-center gap-3 disabled:grayscale disabled:opacity-50 hologram"
            >
              <span className="text-space-900 text-xl font-black tracking-widest uppercase">
                {isVomiting ? "CALCULATING..." : "吐一个问题"}
              </span>
              <span className="bg-space-900 text-amber-400 p-1 rounded">
                →
              </span>
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
                className="w-full h-14 bg-space-850/80 hover:bg-space-850 border border-cyan-400/30 text-amber-100 btn-3d flex items-center justify-center gap-2 hologram"
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
                      generatePhilosophicalQuestion(),
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
                  className="w-full h-10 bg-space-700/50 hover:bg-space-700/70 border border-space-600 text-cyan-400/80 hover:text-cyan-400 btn-3d flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed hologram"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span>
                  <span>不满意？强制重置 (剩余: {remainingRerolls})</span>
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
                  <p className="font-mono text-cyan-400/80">设置打卡天数：</p>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        const newData = { ...streakData, currentStreak: 1, lastCheckIn: getTodayDate() };
                        saveStreakData(newData);
                        setStreakData(newData);
                      }}
                      className="px-2 py-1 bg-space-700/50 hover:bg-space-700 border border-space-600 text-cyan-400 rounded"
                    >第1天</button>
                    <button
                      onClick={() => {
                        const newData = { ...streakData, currentStreak: 7, lastCheckIn: getTodayDate() };
                        saveStreakData(newData);
                        setStreakData(newData);
                      }}
                      className="px-2 py-1 bg-space-700/50 hover:bg-space-700 border border-space-600 text-cyan-400 rounded"
                    >第7天(里程碑)</button>
                    <button
                      onClick={() => {
                        const newData = { ...streakData, currentStreak: 14, lastCheckIn: getTodayDate() };
                        saveStreakData(newData);
                        setStreakData(newData);
                      }}
                      className="px-2 py-1 bg-space-700/50 hover:bg-space-700 border border-space-600 text-cyan-400 rounded"
                    >第14天(里程碑)</button>
                    <button
                      onClick={() => {
                        const newData = { ...streakData, currentStreak: 21, lastCheckIn: getTodayDate(), isCompleted: true };
                        saveStreakData(newData);
                        setStreakData(newData);
                      }}
                      className="px-2 py-1 bg-amber-400/90 border border-amber-500 hover:bg-amber-400 text-space-900 rounded font-bold"
                    >第21天(通关)</button>
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
                        setViewedFragmentIds([]);
                        localStorage.removeItem('qvm_viewed_fragments');
                        alert('已清除碎片记录，可以重新观看');
                      }}
                      className="px-2 py-1 bg-space-700/50 hover:bg-space-700 border border-space-600 text-cyan-400/80 rounded"
                    >清除碎片记录</button>
                    <button
                      onClick={() => {
                        if (confirm('确定要重置所有数据吗？包括打卡进度和碎片记录')) {
                          localStorage.removeItem('qvm_streak');
                          localStorage.removeItem('qvm_viewed_fragments');
                          localStorage.removeItem('vqm_archives');
                          localStorage.removeItem('vqm_today');
                          window.location.reload();
                        }
                      }}
                      className="px-2 py-1 bg-red-900/30 hover:bg-red-900/50 border border-red-700/50 text-red-400 rounded"
                    >重置所有数据</button>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-amber-400/20">
                  <p className="font-mono text-amber-400/70">
                    当前状态: Day {streakData.currentStreak} | 已看碎片: {viewedFragmentIds.length}
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
        onClose={() => setShowCheckInModal(false)}
        day={checkInDay}
        isCompleted={checkInDay >= 21}
      />
      <MemoryFragmentModal
        isOpen={showMemoryModal}
        onClose={() => setShowMemoryModal(false)}
        content={currentMemoryFragment?.content || ''}
        chapter={currentMemoryFragment?.chapter || 1}
        currentDay={streakData.currentStreak}
      />
      </>
    );
  }

  // ==================== DAILY VIEW (记录页) ====================
  if (view === 'daily' && currentQuestion) {
    return (
      <>
      <div className="min-h-screen space-bg text-amber-100 p-6 relative">
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
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="w-full min-h-[180px] bg-space-800/80 border border-space-700 rounded-lg p-4 text-amber-100 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/30 resize-none backdrop-blur-sm"
            placeholder="在这里捕捉你的意识火花..."
          />
          <div className="flex justify-between items-center mt-2 text-cyan-400/60 text-xs font-mono">
            <span>LN: {userInput.split('\n').length}</span>
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
              className="w-full bg-amber-400/90 hover:bg-amber-400 border-2 border-amber-500 text-space-900 btn-3d py-4 px-6 flex items-center justify-center gap-3 hologram"
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
        onClose={() => setShowCheckInModal(false)}
        day={checkInDay}
        isCompleted={checkInDay >= 21}
      />
      <MemoryFragmentModal
        isOpen={showMemoryModal}
        onClose={() => setShowMemoryModal(false)}
        content={currentMemoryFragment?.content || ''}
        chapter={currentMemoryFragment?.chapter || 1}
        currentDay={streakData.currentStreak}
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
      <div className="min-h-screen space-bg p-6 relative">
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
        onClose={() => setShowCheckInModal(false)}
        day={checkInDay}
        isCompleted={checkInDay >= 21}
      />
      <MemoryFragmentModal
        isOpen={showMemoryModal}
        onClose={() => setShowMemoryModal(false)}
        content={currentMemoryFragment?.content || ''}
        chapter={currentMemoryFragment?.chapter || 1}
        currentDay={streakData.currentStreak}
      />
      </>
    );
  }

  return null;
};
