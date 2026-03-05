import React from 'react';
import { Sparkles, Calendar, Database, BookOpen, Rocket, ArrowRight } from 'lucide-react';

interface AboutProps {
  onClose: () => void;
  onStart: () => void;
}

/**
 * 关于页面 - 项目介绍
 * Space Diary 风格
 */
export const About: React.FC<AboutProps> = ({ onClose, onStart }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-space-950/95 p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-space-850 border-2 border-amber-400/50 rounded-lg p-8 hologram-card my-8">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-amber-400/20 hover:bg-amber-400/40 border border-2 border-amber-400/50 rounded-full transition-all z-10"
          title="关闭"
        >
          ✕
        </button>

        {/* 标题区 */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-space-800 rounded-xl flex items-center justify-center robot-damaged relative border-2 border-rust-500/60">
              <div className="text-4xl">🤖</div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-amber-400 mb-2 glow-text font-display">
            星际日记
          </h1>
          <p className="text-sm text-space-700 font-mono">
            VQM OBSERVATION STATION
          </p>
          <p className="text-sm text-cyan-400/80 mt-2">
            21天思考挑战
          </p>
        </div>

        {/* 故事背景 */}
        <div className="mb-8 bg-space-900/50 rounded-lg p-6 border border-space-700">
          <h2 className="text-lg font-bold text-amber-400 mb-3 flex items-center gap-2">
            <Sparkles size={20} />
            故事背景
          </h2>
          <div className="space-y-3 text-space-300 leading-relaxed text-sm">
            <p>
              我来自遥远的 <span className="text-cyan-400">GJ267b</span> 星球。
            </p>
            <p>
              我的家园曾经充满思考者，直到大家停止提问。
              沉默吞噬了一切。
            </p>
            <p>
              我逃到地球，想找到你们：<span className="text-amber-400 font-bold">还能思考的人类。</span>
            </p>
            <p className="text-cyan-400/90">
              你有 21 天。证明人类值得被拯救。
            </p>
          </div>
        </div>

        {/* 功能列表 */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
            <BookOpen size={20} />
            这里的功能
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* 功能1 */}
            <div className="bg-space-900/30 rounded-lg p-4 border border-space-700 hover:border-amber-400/30 transition-all">
              <h3 className="font-bold text-amber-100 mb-1">每日一个好问题</h3>
              <p className="text-xs text-space-400">保持大脑活跃，开始一天的思考</p>
            </div>

            {/* 功能2 */}
            <div className="bg-space-900/30 rounded-lg p-4 border border-space-700 hover:border-amber-400/30 transition-all">
              <h3 className="font-bold text-amber-100 mb-1">坚持21天养成习惯</h3>
              <p className="text-xs text-space-400">每天打卡，唤醒思考能力</p>
            </div>

            {/* 功能3 */}
            <div className="bg-space-900/30 rounded-lg p-4 border border-space-700 hover:border-amber-400/30 transition-all">
              <h3 className="font-bold text-amber-100 mb-1">登录保存永不丢失</h3>
              <p className="text-xs text-space-400">云端同步，随时访问你的记录</p>
            </div>

            {/* 功能4 */}
            <div className="bg-space-900/30 rounded-lg p-4 border border-space-700 hover:border-amber-400/30 transition-all">
              <h3 className="font-bold text-amber-100 mb-1">解锁故事揭开秘密</h3>
              <p className="text-xs text-space-400">收集记忆碎片，了解星球的过去</p>
            </div>
          </div>
        </div>

        {/* 使用流程 */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-amber-400 mb-4">如何使用</h2>
          <div className="space-y-3">
            {/* 步骤1 */}
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center border-2 border-amber-400/50 flex-shrink-0">
                <span className="text-amber-400 font-bold text-sm">1</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-amber-100 mb-1">吐一个问题</h3>
                <p className="text-sm text-space-400">系统生成今日问题</p>
              </div>
            </div>

            {/* 步骤2 */}
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center border-2 border-amber-400/50 flex-shrink-0">
                <span className="text-amber-400 font-bold text-sm">2</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-amber-100 mb-1">写下想法</h3>
                <p className="text-sm text-space-400">自由书写，想到什么写什么</p>
              </div>
            </div>

            {/* 步骤3 */}
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center border-2 border-amber-400/50 flex-shrink-0">
                <span className="text-amber-400 font-bold text-sm">3</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-amber-100 mb-1">保存打卡</h3>
                <p className="text-sm text-space-400">完成今日任务</p>
              </div>
            </div>
          </div>
        </div>

        {/* 开始按钮 */}
        <div className="space-y-3">
          <button
            onClick={onStart}
            className="w-full h-14 bg-amber-400 hover:bg-amber-500 text-space-950 font-bold py-3 px-6 rounded-lg btn-3d btn-glow flex items-center justify-center gap-2 text-lg"
          >
            <Rocket size={24} />
            开始21天思考之旅
            <ArrowRight size={20} />
          </button>

          <button
            onClick={onClose}
            className="w-full h-10 bg-space-900/50 hover:bg-space-900 border border-space-700 text-amber-100 rounded-lg transition-all"
          >
            稍后再说
          </button>
        </div>

        {/* 装饰性元素 */}
        <div className="mt-6 pt-6 border-t border-space-700 text-center">
          <p className="text-xs text-space-700 font-mono">
            你有 21 天。证明人类值得被拯救。
          </p>
        </div>
      </div>

      {/* 背景装饰 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="scanlines"></div>
      </div>
    </div>
  );
};
