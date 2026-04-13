import { create } from 'zustand';
import type { User, TelegramWebApp } from '@/types';
import { api } from '@/lib/api';

interface AppState {
  user: User | null;
  telegram: TelegramWebApp | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  _initDone: boolean;

  initTelegram: () => void;
  authenticate: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  telegram: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  _initDone: false,

  initTelegram: () => {
    // Prevent double init
    if (get()._initDone) return;
    set({ _initDone: true });

    console.log('[Yuksalish] initTelegram called');

    const tryInit = (attempt = 0) => {
      const tgAvailable = typeof window !== 'undefined' && window.Telegram?.WebApp;
      console.log(`[Yuksalish] tryInit attempt=${attempt}, tgAvailable=${!!tgAvailable}`);

      if (tgAvailable) {
        const tg = window.Telegram!.WebApp;
        console.log('[Yuksalish] Telegram WebApp found, initData length:', tg.initData?.length);
        console.log('[Yuksalish] initDataUnsafe user:', JSON.stringify(tg.initDataUnsafe?.user));
        tg.ready();
        tg.expand();
        set({ telegram: tg });
        // Immediately authenticate after getting Telegram context
        get().authenticate();
      } else if (attempt < 50) {
        // Script may still be loading — retry every 100ms, up to ~5 seconds
        setTimeout(() => tryInit(attempt + 1), 100);
      } else {
        // Not inside Telegram after retries — stop loading
        console.log('[Yuksalish] Not in Telegram context after 50 attempts');
        set({ isLoading: false });
      }
    };
    tryInit();
  },

  authenticate: async () => {
    try {
      set({ isLoading: true, error: null });
      const tg = get().telegram;

      if (!tg?.initData) {
        console.log('[Yuksalish] No initData available, skipping auth');
        set({ isLoading: false });
        return;
      }

      console.log('[Yuksalish] Authenticating with initData (length:', tg.initData.length, ')...');
      const result: any = await api.auth.telegram(tg.initData);
      const user = result.data?.user || result.user;
      const token = result.data?.token || result.token;
      if (token) {
        localStorage.setItem('token', token);
      }
      console.log('[Yuksalish] Auth success, user:', user?.firstName);
      set({ user, isAuthenticated: true });
    } catch (error: any) {
      console.error('[Yuksalish] Auth error:', error.message);
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (data) => {
    try {
      const result: any = await api.users.updateProfile(data);
      const user = result.data || result;
      set({ user });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  setError: (error) => set({ error }),
}));
