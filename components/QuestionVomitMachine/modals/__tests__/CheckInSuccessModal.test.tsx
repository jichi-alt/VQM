import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CheckInSuccessModal } from '../CheckInSuccessModal';

describe('CheckInSuccessModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onUnlock: vi.fn(),
    day: 5,
    isCompleted: false,
  };

  it('当 isOpen 为 false 时不渲染', () => {
    const { container } = render(<CheckInSuccessModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('应该显示当前打卡天数', () => {
    render(<CheckInSuccessModal {...defaultProps} />);
    expect(screen.getByText(/这是你主动思考的第 5 天/)).toBeInTheDocument();
  });

  it('第 7 天应该显示里程碑徽章', () => {
    render(<CheckInSuccessModal {...defaultProps} day={7} />);
    expect(screen.getByText('🏆 里程碑成就')).toBeInTheDocument();
    expect(screen.getByText('第一个周期完成！')).toBeInTheDocument();
  });

  it('第 14 天应该显示特殊文案', () => {
    render(<CheckInSuccessModal {...defaultProps} day={14} />);
    expect(screen.getByText('一半的路程！')).toBeInTheDocument();
  });

  it('第 21 天应该显示完成状态', () => {
    render(<CheckInSuccessModal {...defaultProps} day={21} isCompleted={true} />);
    expect(screen.getByText('全部完成！')).toBeInTheDocument();
  });

  it('点击继续按钮应该调用 onClose 和 onUnlock', async () => {
    const user = userEvent.setup();
    render(<CheckInSuccessModal {...defaultProps} />);

    // 等待按钮显示（有延迟动画）
    const continueButton = await screen.findByRole('button', { name: /继续/ });
    await user.click(continueButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    expect(defaultProps.onUnlock).toHaveBeenCalledTimes(1);
  });
});
