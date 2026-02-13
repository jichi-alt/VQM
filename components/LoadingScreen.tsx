import React, { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
}

/**
 * 星际风格Loading屏幕
 * 首次访问显示，模拟系统启动
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('正在初始化系统...');

  useEffect(() => {
    // 模拟加载进度
    const milestones = [
      { progress: 20, text: '正在连接星际网络...', delay: 500 },
      { progress: 45, text: '正在加载记忆碎片...', delay: 1200 },
      { progress: 70, text: '正在校准思考引擎...', delay: 2000 },
      { progress: 90, text: '正在启动观测站...', delay: 2800 },
      { progress: 100, text: '系统就绪', delay: 3500 },
    ];

    milestones.forEach(({ progress, text, delay }) => {
      setTimeout(() => {
        setProgress(progress);
        setStatusText(text);
      }, delay);
    });

    // 完成后回调
    setTimeout(() => {
      onComplete();
    }, 4000);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-space-950">
      {/* 星空背景 */}
      <div className="absolute inset-0 space-bg"></div>

      {/* 纸理纹理 */}
      <div className="absolute inset-0 paper-texture pointer-events-none"></div>

      {/* 主内容 */}
      <div className="relative z-10 w-full max-w-md mx-4 text-center">
        {/* 机器人头像 */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            {/* 机器人头像 - CSS绘制破旧风格 */}
            <div className="w-32 h-32 bg-space-800 rounded-2xl flex items-center justify-center robot-damaged relative border-2 border-rust-500/30 depth-shadow float-3d">
              {/* 锈迹装饰 */}
              <div className="absolute top-2 right-3 w-4 h-0.5 bg-rust-400/40 rotate-45"></div>
              <div className="absolute bottom-4 left-4 w-3 h-0.5 bg-rust-400/30 -rotate-12"></div>

              {/* 机器人脸 */}
              <div className="w-28 h-24 bg-space-850 rounded-xl flex flex-col items-center justify-center border border-space-700 relative overflow-hidden layered">
                {/* 扫描线效果 */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent animate-scanline"></div>

                <div className="flex gap-4 mb-2 relative z-10">
                  {/* 左眼 - 完整 */}
                  <div className="w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center shadow-lg shadow-amber-400/50">
                    <div className="w-1.5 h-1.5 bg-space-900 animate-pulse"></div>
                  </div>
                  {/* 右眼 - 损坏（闪烁） */}
                  <div className="w-6 h-6 bg-amber-400/70 rounded-full flex items-center justify-center shadow-lg shadow-amber-400/30 relative">
                    <div className="w-1.5 h-1.5 bg-space-900/70 animate-pulse" style={{ animationDuration: '0.5s' }}></div>
                    {/* 损坏痕迹 */}
                    <div className="absolute top-0 right-0 w-2 h-0.5 bg-rust-400 rotate-45"></div>
                  </div>
                </div>
                <div className="bg-space-700 h-1 w-12 rounded-full"></div>
              </div>
            </div>

            {/* 旋转光环 */}
            <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-amber-400/30 animate-spin" style={{ animationDuration: '8s' }}></div>
            <div className="absolute -inset-3 rounded-2xl border border-cyan-400/20 animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }}></div>
          </div>
        </div>

        {/* 标题 */}
        <h1 className="text-3xl font-bold text-amber-400 mb-2 glow-text font-display">
          星际日记
        </h1>
        <p className="text-sm text-space-700 mb-8 font-mono">
          VQM OBSERVATION STATION
        </p>

        {/* 进度条容器 */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-space-700 mb-2 font-mono">
            <span>SYSTEM LOADING</span>
            <span>{progress}%</span>
          </div>

          {/* 进度条背景 */}
          <div className="h-2 bg-space-800 rounded-full overflow-hidden border border-space-700">
            {/* 进度条填充 */}
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-cyan-400 transition-all duration-500 ease-out progress-segment-active"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* 状态文字 */}
        <div className="flex items-center justify-center gap-2 text-sm text-cyan-400/80">
          <Loader size={16} className="animate-spin" />
          <span className="font-mono">{statusText}</span>
        </div>

        {/* 装饰性元素 */}
        <div className="mt-12 grid grid-cols-3 gap-4 text-xs font-mono text-space-700">
          <div>
            <div className="text-amber-400/60">SECTOR</div>
            <div>GJ267b</div>
          </div>
          <div>
            <div className="text-amber-400/60">STATUS</div>
            <div>ONLINE</div>
          </div>
          <div>
            <div className="text-amber-400/60">MODE</div>
            <div>OBSERVING</div>
          </div>
        </div>
      </div>

      {/* 扫描线效果 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="scanlines"></div>
      </div>
    </div>
  );
};
