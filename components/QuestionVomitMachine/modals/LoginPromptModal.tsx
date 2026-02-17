import React from 'react';
import { X, LogIn } from 'lucide-react';

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

/**
 * LoginPromptModal - 登录提醒弹窗组件
 */
export const LoginPromptModal = ({ isOpen, onClose, onLogin }: LoginPromptModalProps) => {
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
              className="w-full bg-space-800 hover:bg-space-700 text-amber-100 border border-amber-400/30 font-bold py-3 px-4 hover:border-amber-400/50 transition-all"
            >
              稍后再说
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
