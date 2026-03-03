/**
 * useAuth - 用户认证 Hook
 */

import { useState, useEffect } from 'react';
import { getAuthService } from '../../../src/services/auth.service';
import type { User } from '../../../src/types';

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const authService = getAuthService();
      const user = await authService.initialize();
      if (user) {
        setCurrentUser(user);
      }
      setLoading(false);
    };

    initAuth();

    // 监听认证状态变化
    const authService = getAuthService();
    const unsubscribe = authService.onAuthStateChange((user) => {
      setCurrentUser(user);
    });

    return () => {
      unsubscribe?.();
    };
  }, []);

  const signIn = async () => {
    setShowAuthModal(true);
  };

  const signOut = async () => {
    const authService = getAuthService();
    await authService.signOut();
    setCurrentUser(null);
  };

  return {
    currentUser,
    loading,
    showAuthModal,
    setShowAuthModal,
    signIn,
    signOut,
  };
};
