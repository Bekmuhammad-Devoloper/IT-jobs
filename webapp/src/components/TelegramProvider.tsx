'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store';

export default function TelegramProvider({ children }: { children: React.ReactNode }) {
  const initTelegram = useAppStore((s) => s.initTelegram);

  useEffect(() => {
    initTelegram();
  }, [initTelegram]);

  return <>{children}</>;
}
