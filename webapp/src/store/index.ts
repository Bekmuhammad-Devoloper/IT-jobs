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
    if (get()._initDone) return;
    set({ _initDone: true, isLoading: true });

    const waitForSdk = (): Promise<any> => new Promise((resolve) => {
      let attempt = 0;
      const tick = () => {
        const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
        if (tg) return resolve(tg);
        if (++attempt >= 50) return resolve(null);
        setTimeout(tick, 100);
      };
      tick();
    });

    (async () => {
      try {
        const tg = await waitForSdk();
        if (tg) {
          tg.ready();
          tg.expand();
          set({ telegram: tg });

          if (tg.initData) {
            const result: any = await api.auth.telegram(tg.initData);
            const user = result.data?.user || result.user;
            const token = result.data?.token || result.token;
            if (token) localStorage.setItem('token', token);
            set({ user, isAuthenticated: !!user });
            return;
          }
        }

        const savedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (savedToken) {
          try {
            const result: any = await api.auth.me();
            const user = result.data?.user || result.user || result.data || result;
            set({ user, isAuthenticated: !!user });
          } catch (e: any) {
            localStorage.removeItem('token');
            set({ error: e?.message || null });
          }
        }
      } catch (error: any) {
        set({ error: error?.message || 'Auth failed' });
      } finally {
        set({ isLoading: false });
      }
    })();
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
