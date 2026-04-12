import { create } from 'zustand';
import type { User, TelegramWebApp } from '@/types';
import { api } from '@/lib/api';

interface AppState {
  user: User | null;
  telegram: TelegramWebApp | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  initTelegram: () => void;
  authenticate: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  setError: (error: string | null) => void;
}

let initStarted = false;

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  telegram: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  initTelegram: () => {
    // Prevent double init from React StrictMode
    if (initStarted) return;
    initStarted = true;

    const tryInit = (attempt = 0) => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();
        set({ telegram: tg });
        // Immediately authenticate after getting Telegram context
        get().authenticate();
      } else if (attempt < 30) {
        // Script may still be loading — retry every 150ms, up to ~4.5 seconds
        setTimeout(() => tryInit(attempt + 1), 150);
      } else {
        // Not inside Telegram after retries — stop loading
        console.log('[Yuksalish] Not in Telegram context');
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
        console.log('[Yuksalish] No initData available');
        set({ isLoading: false });
        return;
      }

      console.log('[Yuksalish] Authenticating with initData...');
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
