import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SilentObserverModal } from '../SilentObserverModal';

describe('SilentObserverModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    message: '确定要删除吗？',
  };

  it('当 isOpen 为 false 时不渲染', () => {
    const { container } = render(<SilentObserverModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('当 isOpen 为 true 时应该渲染', () => {
    const { container } = render(<SilentObserverModal {...defaultProps} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('应该显示传入的消息', () => {
    render(<SilentObserverModal {...defaultProps} />);
    expect(screen.getByText('确定要删除吗？')).toBeInTheDocument();
  });

  it('点击取消按钮应该调用 onClose', async () => {
    const user = userEvent.setup();
    render(<SilentObserverModal {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: '取消' });
    await user.click(cancelButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
  });

  it('点击确定按钮应该调用 onConfirm 和 onClose', async () => {
    const user = userEvent.setup();
    render(<SilentObserverModal {...defaultProps} />);

    const confirmButton = screen.getByRole('button', { name: '确定' });
    await user.click(confirmButton);

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    // onClose 在 onClick 中通过 onConfirm() 调用
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
