'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/api';

interface UserItem {
  id: number;
  telegramId: string;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  role: string;
  isBlocked: boolean;
  rating: number;
  profileCompleted: boolean;
  createdAt: string;
}

const roleColors: Record<string, string> = {
  USER: 'badge-gray',
  ADMIN: 'badge-blue',
  SUPERADMIN: 'badge-orange',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadUsers();
  }, [page]);

  async function loadUsers() {
    try {
      setLoading(true);
      const params: Record<string, string> = { page: String(page), limit: '20' };
      if (search) params.q = search;

      const res: any = await adminApi.users.getAll(params);
      if (Array.isArray(res.data)) {
        setUsers(res.data);
        setTotalPages(res.meta?.totalPages || 1);
      } else if (res.data?.data) {
        setUsers(res.data.data);
        setTotalPages(res.data.meta?.totalPages || 1);
      } else {
        setUsers([]);
        setTotalPages(1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    setPage(1);
    loadUsers();
  }

  const [actionUserId, setActionUserId] = useState<number | null>(null);

  async function toggleBlock(user: UserItem) {
    if (actionUserId) return;
    const action = user.isBlocked ? 'blokdan chiqarmoqchimisiz' : 'bloklamoqchimisiz';
    if (!confirm(`${user.firstName} ${user.lastName || ''}ni ${action}?`)) return;
    setActionUserId(user.id);
    const original = user.isBlocked;
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, isBlocked: !u.isBlocked } : u)),
    );
    try {
      if (original) {
        await adminApi.users.unblock(user.id);
      } else {
        await adminApi.users.block(user.id);
      }
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Amalni bajarib bo'lmadi");
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isBlocked: original } : u)),
      );
    } finally {
      setActionUserId(null);
    }
  }

  async function changeRole(userId: number, role: string, currentRole: string) {
    if (role === currentRole) return;
    if (!confirm(`Rolni ${currentRole} → ${role}ga o'zgartirmoqchimisiz?`)) return;
    try {
      await adminApi.users.setRole(userId, role);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role } : u)),
      );
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Rolni o'zgartirib bo'lmadi (ruxsat yo'q bo'lishi mumkin)");
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="icon-box icon-box-navy">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <circle cx="9" cy="7" r="3.5" stroke="#b8a06a" strokeWidth="1.8" fill="rgba(184,160,106,0.1)"/>
            <path d="M2 20v-1a5 5 0 015-5h4a5 5 0 015 5v1" stroke="#b8a06a" strokeWidth="1.8" strokeLinecap="round"/>
            <circle cx="17" cy="7" r="2.5" stroke="#b8a06a" strokeWidth="1.4" strokeDasharray="2 2" opacity="0.5"/>
            <path d="M19 15c1.2.5 2 1.7 2 3v1" stroke="#b8a06a" strokeWidth="1.4" strokeLinecap="round" opacity="0.4"/>
          </svg>
        </div>
        <h1>Foydalanuvchilar</h1>
      </div>

      {/* Search */}
      <div className="search-bar">
        <div className="search-input-wrap">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="7" stroke="#8896ab" strokeWidth="1.8" fill="rgba(136,150,171,0.04)"/>
            <path d="M21 21l-4.35-4.35" stroke="#8896ab" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input className="admin-input" placeholder="Qidirish (ism, username)..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
        </div>
        <button className="btn btn-primary" onClick={handleSearch}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.06"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Qidirish
        </button>
      </div>

      <div className="admin-card">
        {loading ? (
          <div className="empty-state">
            <div className="spinner" />
            <p className="empty-text">Yuklanmoqda...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon icon-box-navy-light">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                <circle cx="9" cy="7" r="3.5" stroke="#8896ab" strokeWidth="1.5" fill="rgba(136,150,171,0.06)"/>
                <path d="M2 20v-1a5 5 0 015-5h4a5 5 0 015 5v1" stroke="#8896ab" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="17" cy="7" r="2.5" stroke="#8896ab" strokeWidth="1.2" strokeDasharray="2 2" opacity="0.4"/>
              </svg>
            </div>
            <p className="empty-title">Foydalanuvchilar topilmadi</p>
            <p className="empty-text">Qidiruv so&apos;zini o&apos;zgartirib ko&apos;ring</p>
          </div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Foydalanuvchi</th>
                  <th>Username</th>
                  <th>Rol</th>
                  <th>Reyting</th>
                  <th>Holat</th>
                  <th>Sana</th>
                  <th>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="td-id">#{user.id}</td>
                    <td>
                      <div className="flex-gap-3">
                        {user.photoUrl ? (
                          <img src={user.photoUrl} alt={user.firstName} style={{width:36,height:36,borderRadius:10,objectFit:'cover',border:'2px solid rgba(184,160,106,0.2)'}} />
                        ) : (
                          <div className="user-avatar">
                            {user.firstName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <Link href={`/dashboard/users/${user.id}`} className="td-bold" style={{textDecoration:'none',color:'inherit'}}>
                          {user.firstName} {user.lastName || ''}
                        </Link>
                      </div>
                    </td>
                    <td className="td-muted">{user.username ? `@${user.username}` : '-'}</td>
                    <td>
                      <select className="admin-input role-select" title="Rol"
                        value={user.role}
                        onChange={(e) => changeRole(user.id, e.target.value, user.role)}>
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                        <option value="SUPERADMIN">Superadmin</option>
                      </select>
                    </td>
                    <td>
                      <div className="rating-star">
                        <svg width="14" height="14" fill="#b8a06a" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                        {user.rating}
                      </div>
                    </td>
                    <td>
                      {user.isBlocked ? (
                        <span className="badge badge-red">Bloklangan</span>
                      ) : (
                        <span className="badge badge-green">Faol</span>
                      )}
                    </td>
                    <td className="td-date">
                      {new Date(user.createdAt).toLocaleDateString('uz-UZ')}
                    </td>
                    <td>
                      <div style={{display:'flex',gap:6}}>
                        <Link
                          href={`/dashboard/users/${user.id}`}
                          className="btn btn-sm btn-ghost"
                          title="Foydalanuvchi profilini ko'rish"
                        >
                          <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.06"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
                          </svg>
                        </Link>
                        <button
                          className={`btn btn-sm ${user.isBlocked ? 'btn-success' : 'btn-danger'}`}
                          disabled={actionUserId === user.id}
                          onClick={() => toggleBlock(user)}
                          title={user.isBlocked ? 'Blokdan chiqarish' : 'Bloklash'}
                        >
                        {user.isBlocked ? (
                          <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
                            <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.06"/>
                            <path d="M8 11V7a4 4 0 018 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                            <circle cx="12" cy="16" r="1.5" fill="currentColor" opacity="0.5"/>
                          </svg>
                        ) : (
                          <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
                            <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.06"/>
                            <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                            <circle cx="12" cy="16" r="1.5" fill="currentColor" opacity="0.5"/>
                          </svg>
                        )}
                      </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="pagination">
                <button className="btn btn-ghost btn-sm" disabled={page <= 1}
                  onClick={() => setPage(page - 1)}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                  Oldingi
                </button>
                <span className="page-num">{page} / {totalPages}</span>
                <button className="btn btn-ghost btn-sm" disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}>
                  Keyingi
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
