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

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  telegram: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  initTelegram: () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      set({ telegram: tg });
    } else {
      // Not inside Telegram — skip auth, just stop loading
      set({ isLoading: false });
    }
  },

  authenticate: async () => {
    try {
      set({ isLoading: true, error: null });
      const tg = get().telegram;

      if (tg?.initData) {
        const result: any = await api.auth.telegram(tg.initData);
        const user = result.data?.user || result.user;
        const token = result.data?.token || result.token;
        if (token) {
          // Store token for non-Telegram contexts
          localStorage.setItem('token', token);
        }
        set({ user, isAuthenticated: true });
      }
    } catch (error: any) {
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
