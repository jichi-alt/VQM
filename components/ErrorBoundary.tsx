import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * 错误边界组件
 * Space Diary 风格的错误处理 UI
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // 这里可以添加错误上报服务 (如 Sentry)
    // logErrorToService(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    // 刷新页面
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-space-950 p-4">
          <div className="w-full max-w-lg bg-space-850 border-2 border-rust-400/50 rounded-lg p-8 hologram-card">
            {/* 图标 */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-rust-400/20 flex items-center justify-center">
                <AlertTriangle size={40} className="text-rust-400" />
              </div>
            </div>

            {/* 标题 */}
            <h1 className="text-3xl font-bold text-center text-rust-400 mb-4 glow-text font-display">
              系统故障
            </h1>

            {/* 说明文字 */}
            <p className="text-center text-space-700 mb-6 leading-relaxed">
              机器人检测到异常信号。思想样本库暂时无法访问。
            </p>

            {/* 错误详情 (开发环境) */}
            {import.meta.env.DEV && this.state.error && (
              <details className="mb-6 bg-space-900/50 rounded-lg p-4 border border-space-700">
                <summary className="cursor-pointer text-sm text-amber-400 font-bold mb-2">
                  技术详情 (仅开发环境)
                </summary>
                <pre className="text-xs text-space-700 overflow-auto max-h-40 whitespace-pre-wrap">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            {/* 故障排除提示 */}
            <div className="bg-space-900/50 rounded-lg p-4 mb-6 border border-space-700">
              <h3 className="text-sm font-bold text-cyan-400 mb-2">可能的解决方案：</h3>
              <ul className="text-xs text-space-700 space-y-1">
                <li>• 刷新页面重试</li>
                <li>• 清除浏览器缓存</li>
                <li>• 检查网络连接</li>
                <li>• 如果问题持续，请联系技术支持</li>
              </ul>
            </div>

            {/* 重置按钮 */}
            <button
              onClick={this.handleReset}
              className="w-full bg-amber-400 hover:bg-amber-500 text-space-950 font-bold py-3 px-6 rounded-lg btn-3d flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCw size={20} />
              重新启动系统
            </button>

            {/* 装饰性元素 */}
            <div className="mt-6 text-center">
              <p className="text-xs text-space-700">
                错误代码: {this.state.error?.name || 'UNKNOWN'}
              </p>
            </div>
          </div>

          {/* 背景装饰 */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="scanlines"></div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
