const API_URL = typeof window !== 'undefined'
  ? '/api'  // browser: use Next.js rewrite proxy
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'); // server-side

function getToken(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('admin_token') || '';
  }
  return '';
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
}

export const adminApi = {
  auth: {
    login: (telegramId: string, secretKey: string) =>
      request('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ telegramId, secretKey }),
      }),
    me: () => request('/auth/me'),
  },

  stats: {
    getAdmin: () => request('/statistics/admin'),
    getPublic: () => request('/statistics'),
    getTopPosts: (limit = 5) => request(`/statistics/top-posts?limit=${limit}`),
  },

  users: {
    getAll: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request(`/admin/users${qs}`);
    },
    getOne: (id: number) => request(`/admin/users/${id}`),
    block: (id: number) => request(`/admin/users/${id}/block`, { method: 'PUT' }),
    unblock: (id: number) => request(`/admin/users/${id}/unblock`, { method: 'PUT' }),
    setRole: (id: number, role: string) =>
      request(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  },

  posts: {
    getAll: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request(`/admin/posts${qs}`);
    },
    delete: (id: number) => request(`/admin/posts/${id}`, { method: 'DELETE' }),
  },

  moderation: {
    getPending: (page = 1) => request(`/admin/moderation/pending?page=${page}`),
    approve: (id: number) => request(`/admin/moderation/${id}/approve`, { method: 'PUT' }),
    reject: (id: number, reason?: string) =>
      request(`/admin/moderation/${id}/reject`, {
        method: 'PUT',
        body: JSON.stringify({ reason }),
      }),
  },

  settings: {
    getAll: () => request('/admin/settings'),
    update: (key: string, value: string) =>
      request(`/admin/settings/${key}`, { method: 'PUT', body: JSON.stringify({ value }) }),
    getCategories: () => request('/admin/settings/categories'),
    createCategory: (data: any) =>
      request('/admin/settings/categories', { method: 'POST', body: JSON.stringify(data) }),
    updateCategory: (id: number, data: any) =>
      request(`/admin/settings/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteCategory: (id: number) =>
      request(`/admin/settings/categories/${id}`, { method: 'DELETE' }),
    getTechnologies: () => request('/admin/settings/technologies'),
    createTechnology: (data: any) =>
      request('/admin/settings/technologies', { method: 'POST', body: JSON.stringify(data) }),
    deleteTechnology: (id: number) =>
      request(`/admin/settings/technologies/${id}`, { method: 'DELETE' }),
  },
};
