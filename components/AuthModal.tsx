import React, { useState } from 'react';
import { X, Mail, Lock, User } from 'lucide-react';
import { signIn, signUp } from '../src/services/auth.service';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const result = await signIn({ email, password });
        if (!result.success) {
          setError(result.error || '登录失败');
          setLoading(false);
          return;
        }
      } else {
        const result = await signUp({ email, password, username });
        if (!result.success) {
          setError(result.error || '注册失败');
          setLoading(false);
          return;
        }
      }

      // 成功
      onAuthSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.message || '操作失败');
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setUsername('');
    setError('');
    setIsLogin(true);
    onClose();
  };

  const switchMode = () => {
    setError('');
    setIsLogin(!isLogin);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-[400px] bg-space-850/95 backdrop-blur-md border-2 border-amber-400/50 rounded-lg shadow-2xl relative overflow-hidden hologram">
        {/* 扫描线效果 */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-amber-400/5 to-transparent animate-scanline"></div>

        {/* 顶部装饰条 */}
        <div className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 h-1"></div>

        {/* 关闭按钮 */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-amber-400/20 hover:bg-amber-400/40 border border-2 border-amber-400/50 rounded-full transition-all z-10"
          title="关闭"
        >
          <X size={16} className="text-amber-400" />
        </button>

        <div className="p-8">
          {/* 标题 */}
          <h2 className="text-2xl font-black mb-6 text-center text-amber-100 glow-text">
            {isLogin ? '登录观测站' : '加入观测站'}
          </h2>

          {/* 错误提示 */}
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-400/50 rounded text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 邮箱 */}
            <div>
              <label className="block text-cyan-400/70 text-xs font-mono mb-2">
                EMAIL_ADDRESS
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/50" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-space-800/80 border border-space-700 rounded-lg py-3 pl-10 pr-4 text-amber-100 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/30"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {/* 密码 */}
            <div>
              <label className="block text-cyan-400/70 text-xs font-mono mb-2">
                PASSWORD
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/50" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-space-800/80 border border-space-700 rounded-lg py-3 pl-10 pr-4 text-amber-100 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/30"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* 用户名（仅注册时显示） */}
            {!isLogin && (
              <div>
                <label className="block text-cyan-400/70 text-xs font-mono mb-2">
                  USERNAME
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/50" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-space-800/80 border border-space-700 rounded-lg py-3 pl-10 pr-4 text-amber-100 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/30"
                    placeholder="观测员代号"
                  />
                </div>
              </div>
            )}

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-400 hover:bg-amber-300 text-space-900 border-2 border-amber-500 font-bold py-3 px-4 transition-all flex items-center justify-center gap-2 btn-3d btn-glow shadow-lg shadow-amber-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '处理中...' : isLogin ? '进入观测站' : '注册账号'}
            </button>
          </form>

          {/* 切换登录/注册 */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={switchMode}
              className="text-cyan-400/70 hover:text-cyan-400 text-sm transition-colors"
            >
              {isLogin ? '还没有账号？立即注册' : '已有账号？去登录'}
            </button>
          </div>
        </div>

        {/* 底部装饰条 */}
        <div className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 h-1"></div>
      </div>
    </div>
  );
};
