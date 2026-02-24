import React, { useState, useEffect } from 'react';
import { LogIn, LogOut, Mail } from 'lucide-react';
import { setBGMVolume, setBGMEnabled, setSoundVolume, setSoundEnabled, isBGMEnabled, isSoundEnabled, initBGMManager, playSound } from '../src/services/audio.service';
import type { User } from '../src/types';

interface AudioControlProps {
  currentUser: User | null;
  onLogin: () => void;
  onLogout: () => void;
}

/**
 * 音效控制组件 - 固定在右上角
 * Space Diary 风格设计
 */
export const AudioControl: React.FC<AudioControlProps> = ({ currentUser, onLogin, onLogout }) => {
  const [bgmEnabled, setBgmEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [bgmVolume, setBgmVolume] = useState(0.3);
  const [soundVolume, setSoundVolume] = useState(0.5);
  const [expanded, setExpanded] = useState(false);

  // 初始化状态
  useEffect(() => {
    const bgm = isBGMEnabled();
    const sound = isSoundEnabled();
    console.log('[AudioControl] 初始化 - BGM:', bgm, 'Sound:', sound);
    setBgmEnabled(bgm);
    setSoundEnabled(sound);
    // 确保 BGM 管理器已初始化
    initBGMManager();
  }, []);

  // 处理用户首次点击（初始化音频系统）
  const handleFirstInteraction = () => {
    console.log('[AudioControl] 用户交互，初始化音频');
    // 播放一个静默音效来初始化 AudioContext
    playSound('button-click');
  };

  // BGM 开关切换
  const handleBGMToggle = () => {
    handleFirstInteraction(); // 确保音频已初始化
    const newState = !bgmEnabled;
    console.log('[AudioControl] 切换 BGM:', bgmEnabled, '->', newState);
    setBgmEnabled(newState);
    setBGMEnabled(newState);
  };

  // 音效开关切换
  const handleSoundToggle = () => {
    handleFirstInteraction(); // 确保音频已初始化
    const newState = !soundEnabled;
    console.log('[AudioControl] 切换音效:', soundEnabled, '->', newState);
    setSoundEnabled(newState);
    setSoundEnabled(newState);
  };

  // BGM 音量变化
  const handleBGMVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setBgmVolume(newVolume);
    setBGMVolume(newVolume);
  };

  // 音效音量变化
  const handleSoundVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setSoundVolume(newVolume);
    setSoundVolume(newVolume);
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
      {/* 折叠状态 - 音效控制按钮 */}
      {!expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="flex items-center gap-2 px-3 py-2 bg-space-800/90 backdrop-blur-sm border border-amber-400/30 rounded-lg hover:border-amber-400/60 transition-all duration-200 group"
          title="音效设置"
        >
          {/* 声波图标 */}
          <svg
            className="w-5 h-5 text-amber-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {bgmEnabled || soundEnabled ? (
              <>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              </>
            ) : (
              <>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                />
              </>
            )}
          </svg>
        </button>
      )}

      {/* 登录/登出按钮 */}
      {currentUser ? (
        <button
          onClick={onLogout}
          className="p-2 bg-space-800/90 backdrop-blur-sm border border-cyan-400/30 rounded-lg hover:border-cyan-400/60 transition-all"
          title={`已登录: ${currentUser.email}`}
        >
          <Mail size={18} className="text-cyan-400" />
        </button>
      ) : (
        <button
          onClick={onLogin}
          className="p-2 bg-space-800/90 backdrop-blur-sm border border-amber-400/30 rounded-lg hover:border-amber-400/60 transition-all"
          title="登录"
        >
          <LogIn size={18} className="text-amber-400" />
        </button>
      )}

      {/* 展开状态 - 显示完整控制面板 */}
      {expanded && (
        <div className="w-64 bg-space-800/95 backdrop-blur-sm border border-amber-400/40 rounded-lg p-4 shadow-lg shadow-amber-400/10">
          {/* 标题栏 */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-amber-400 font-display font-semibold text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
              音效控制
            </h3>
            <button
              onClick={() => setExpanded(false)}
              className="text-space-700 hover:text-amber-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* BGM 控制 */}
          <div className="mb-4 p-3 bg-space-900/50 rounded-lg border border-amber-400/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-amber-100 text-sm">背景音乐</span>
              <button
                onClick={handleBGMToggle}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                  bgmEnabled ? 'bg-amber-400' : 'bg-space-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                    bgmEnabled ? 'translate-x-5.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            {bgmEnabled && (
              <div className="mt-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={bgmVolume}
                  onChange={handleBGMVolumeChange}
                  className="w-full h-1.5 bg-space-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <div className="flex justify-between text-xs text-space-700 mt-1">
                  <span>静音</span>
                  <span>{Math.round(bgmVolume * 100)}%</span>
                  <span>最大</span>
                </div>
              </div>
            )}
          </div>

          {/* 音效控制 */}
          <div className="p-3 bg-space-900/50 rounded-lg border border-cyan-400/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-cyan-100 text-sm">交互音效</span>
              <button
                onClick={handleSoundToggle}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                  soundEnabled ? 'bg-cyan-400' : 'bg-space-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                    soundEnabled ? 'translate-x-5.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            {soundEnabled && (
              <div className="mt-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={soundVolume}
                  onChange={handleSoundVolumeChange}
                  className="w-full h-1.5 bg-space-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-xs text-space-700 mt-1">
                  <span>静音</span>
                  <span>{Math.round(soundVolume * 100)}%</span>
                  <span>最大</span>
                </div>
              </div>
            )}
          </div>

          {/* 装饰元素 - 全息风格边角 */}
          <div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-amber-400/60" />
          <div className="absolute top-0 right-0 w-2 h-2 border-r-2 border-t-2 border-amber-400/60" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-l-2 border-b-2 border-amber-400/60" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 border-amber-400/60" />
        </div>
      )}
    </div>
  );
};
