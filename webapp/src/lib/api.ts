const API_URL = typeof window !== 'undefined'
  ? '/api'  // browser: use Next.js rewrite proxy
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'); // server-side

function getInitData(): string {
  if (typeof window !== 'undefined') {
    if (window.Telegram?.WebApp?.initData) {
      return window.Telegram.WebApp.initData;
    }
    const token = localStorage.getItem('token');
    if (token) return `token:${token}`;
  }
  return '';
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const initData = getInitData();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (initData.startsWith('token:')) {
    headers['Authorization'] = `Bearer ${initData.slice(6)}`;
  } else if (initData) {
    headers['Authorization'] = `tma ${initData}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Network error' }));
    const msg = Array.isArray(error.message) ? error.message.join(', ') : (error.message || `HTTP ${res.status}`);
    throw new Error(msg);
  }

  return res.json();
}

// ── Auth ──────────────────────────────────────────────
export const api = {
  auth: {
    telegram: (initData: string) =>
      request('/auth/telegram', {
        method: 'POST',
        body: JSON.stringify({ initData }),
      }),
    me: () => request('/auth/me'),
  },

  // ── Users ──────────────────────────────────────────
  users: {
    getProfile: () => request('/users/me'),
    updateProfile: (data: any) =>
      request('/users/me', { method: 'PUT', body: JSON.stringify(data) }),
    getResumes: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request(`/users/resumes${qs}`);
    },
    getResume: (id: number) => request(`/users/resumes/${id}`),
  },

  // ── Upload ──────────────────────────────────────────
  upload: {
    file: async (file: File): Promise<{ url: string; filename: string; originalName: string; size: number }> => {
      const formData = new FormData();
      formData.append('file', file);
      const initData = getInitData();
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: initData ? { Authorization: `tma ${initData}` } : {},
        body: formData,
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Upload error' }));
        throw new Error(error.message || `HTTP ${res.status}`);
      }
      return res.json();
    },
  },

  // ── Posts ──────────────────────────────────────────
  posts: {
    getAll: (params?: Record<string, string>, signal?: AbortSignal) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request(`/posts${qs}`, signal ? { signal } : {});
    },
    getOne: (id: number) => request(`/posts/${id}`),
    create: (data: any) =>
      request('/posts', { method: 'POST', body: JSON.stringify(data) }),
    getMy: (page = 1) => request(`/posts/my?page=${page}`),
    addView: (id: number, fingerprint?: string) =>
      request(`/posts/${id}/view`, {
        method: 'POST',
        body: JSON.stringify({ fingerprint }),
      }),
    delete: (id: number) => request(`/posts/${id}`, { method: 'DELETE' }),
    apply: (id: number, data: any) =>
      request(`/posts/${id}/apply`, { method: 'POST', body: JSON.stringify(data) }),
    getApplications: (id: number) => request(`/posts/${id}/applications`),
    close: (id: number) =>
      request(`/posts/${id}/close`, { method: 'PUT' }),
  },

  // ── Services ──────────────────────────────────────
  services: {
    getAll: () => request('/services'),
    getOne: (id: number) => request(`/services/${id}`),
  },

  // ── Statistics ──────────────────────────────────────
  statistics: {
    getPublic: () => request('/statistics'),
  },

  // ── Telegram ──────────────────────────────────────
  telegram: {
    checkSubscription: (telegramId: string) =>
      request(`/telegram/check-subscription/${telegramId}`),
  },
};
