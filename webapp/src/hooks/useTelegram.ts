'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store';

export function useTelegram() {
  const { telegram, initTelegram, authenticate, user, isLoading, isAuthenticated } = useAppStore();

  useEffect(() => {
    initTelegram();
  }, [initTelegram]);

  useEffect(() => {
    if (telegram && !isAuthenticated && !user) {
      authenticate();
    }
  }, [telegram, isAuthenticated, user, authenticate]);

  return {
    tg: telegram,
    user,
    isLoading,
    isAuthenticated,
    colorScheme: telegram?.colorScheme || 'light',
    haptic: telegram?.HapticFeedback,
  };
}
