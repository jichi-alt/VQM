import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AudioControl } from '../AudioControl';

// 模拟 audioService
vi.mock('../../services/audioService', () => ({
  setBGMVolume: vi.fn(),
  setBGMEnabled: vi.fn(),
  setSoundVolume: vi.fn(),
  setSoundEnabled: vi.fn(),
  isBGMEnabled: vi.fn(() => true),
  isSoundEnabled: vi.fn(() => true),
  initBGMManager: vi.fn(),
  playSound: vi.fn(),
}));

describe('AudioControl 组件', () => {
  const mockOnLogin = vi.fn();
  const mockOnLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该渲染组件', () => {
    const { container } = render(<AudioControl currentUser={null} onLogin={mockOnLogin} onLogout={mockOnLogout} />);
    // 组件应该成功渲染
    expect(container.firstChild).toBeInTheDocument();
  });

  it('应该显示登录按钮当用户未登录时', () => {
    render(<AudioControl currentUser={null} onLogin={mockOnLogin} onLogout={mockOnLogout} />);
    const loginButton = screen.getByRole('button', { name: /登录/i });
    expect(loginButton).toBeInTheDocument();
  });

  it('点击登录按钮应该触发 onLogin', async () => {
    const user = userEvent.setup();
    render(<AudioControl currentUser={null} onLogin={mockOnLogin} onLogout={mockOnLogout} />);

    const loginButton = screen.getByRole('button', { name: /登录/i });
    await user.click(loginButton);

    expect(mockOnLogin).toHaveBeenCalledTimes(1);
  });

  it('应该显示用户图标当用户已登录时', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z'
    };
    render(<AudioControl currentUser={mockUser} onLogin={mockOnLogin} onLogout={mockOnLogout} />);

    // 检查是否有邮件图标的按钮（表示已登录用户）
    const buttons = screen.getAllByRole('button');
    const userButton = buttons.find(btn => btn.getAttribute('title')?.includes('test@example.com'));
    expect(userButton).toBeInTheDocument();
  });
});
