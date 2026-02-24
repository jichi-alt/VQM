import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '../useAuth';

// 模拟 authService
vi.mock('../../../../src/services/auth.service', () => ({
  getAuthService: vi.fn(),
}));

import { getAuthService } from '../../../../src/services/auth.service';

describe('useAuth Hook', () => {
  const mockAuthService = {
    initialize: vi.fn(),
    onAuthStateChange: vi.fn(),
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    getCurrentUser: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAuthService).mockReturnValue(mockAuthService as any);
  });

  it('应该初始化并获取当前用户状态', async () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    mockAuthService.initialize.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockAuthService.initialize).toHaveBeenCalledTimes(1);
    expect(result.current.currentUser).toEqual(mockUser);
  });

  it('signIn 应该显示认证弹窗', () => {
    mockAuthService.initialize.mockResolvedValue(null);

    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.signIn();
    });

    expect(result.current.showAuthModal).toBe(true);
  });

  it('setShowAuthModal 应该控制弹窗显示', () => {
    mockAuthService.initialize.mockResolvedValue(null);

    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.setShowAuthModal(true);
    });

    expect(result.current.showAuthModal).toBe(true);

    act(() => {
      result.current.setShowAuthModal(false);
    });

    expect(result.current.showAuthModal).toBe(false);
  });

  it('signOut 应该登出用户', async () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    mockAuthService.initialize.mockResolvedValue(mockUser);
    mockAuthService.signOut.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockAuthService.signOut).toHaveBeenCalledTimes(1);
    expect(result.current.currentUser).toBeNull();
  });
});
