import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPromptModal } from '../LoginPromptModal';

describe('LoginPromptModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onLogin: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('当 isOpen 为 false 时不渲染', () => {
    const { container } = render(<LoginPromptModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('应该显示标题和说明文案', () => {
    render(<LoginPromptModal {...defaultProps} />);

    expect(screen.getByText('保存到云端')).toBeInTheDocument();
    expect(screen.getByText(/登录后将自动保存到云端/)).toBeInTheDocument();
    expect(screen.getByText(/未登录数据仅保存在本地浏览器/)).toBeInTheDocument();
  });

  it('点击"立即登录"按钮应该调用 onLogin', async () => {
    const user = userEvent.setup();
    render(<LoginPromptModal {...defaultProps} />);

    const loginButton = screen.getByRole('button', { name: /立即登录/ });
    await user.click(loginButton);

    expect(defaultProps.onLogin).toHaveBeenCalledTimes(1);
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('点击"稍后再说"按钮应该调用 onClose', async () => {
    const user = userEvent.setup();
    render(<LoginPromptModal {...defaultProps} />);

    // 获取所有按钮，选择包含"稍后再说"文本的那个
    const buttons = screen.getAllByRole('button');
    const laterButton = buttons.find(btn => btn.textContent === '稍后再说');

    if (!laterButton) {
      throw new Error('找不到"稍后再说"按钮');
    }

    await user.click(laterButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
    expect(defaultProps.onLogin).not.toHaveBeenCalled();
  });

  it('点击关闭按钮应该调用 onClose', async () => {
    const user = userEvent.setup();
    render(<LoginPromptModal {...defaultProps} />);

    const closeButton = screen.getByTitle('关闭');
    await user.click(closeButton);

    // 验证 onClose 被调用
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
