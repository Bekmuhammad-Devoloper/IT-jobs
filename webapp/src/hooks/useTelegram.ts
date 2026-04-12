'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store';

export function useTelegram() {
  const { telegram, initTelegram, user, isLoading, isAuthenticated } = useAppStore();

  useEffect(() => {
    initTelegram();
  }, [initTelegram]);

  const tgUser = telegram?.initDataUnsafe?.user;

  return {
    tg: telegram,
    user,
    isLoading,
    isAuthenticated,
    colorScheme: telegram?.colorScheme || 'light',
    haptic: telegram?.HapticFeedback,
    photoUrl: tgUser?.photo_url || null,
    tgFirstName: tgUser?.first_name || null,
    tgLastName: tgUser?.last_name || null,
  };
}
