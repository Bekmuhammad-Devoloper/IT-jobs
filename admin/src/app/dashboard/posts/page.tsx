'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';

interface PostItem {
  id: number;
  type: string;
  title: string;
  status: string;
  viewCount: number;
  rating?: number;
  pinnedOrder?: number | null;
  author?: { firstName: string; lastName?: string };
  createdAt: string;
}

const typeLabels: Record<string, string> = {
  VACANCY: 'Vakansiya',
  RESUME: 'Rezyume',
  COURSE: 'Kurs',
  MENTOR: 'Mentor',
  INTERNSHIP: 'Stajirovka',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Kutilmoqda',
  APPROVED: 'Tasdiqlangan',
  REJECTED: 'Rad etilgan',
  EXPIRED: 'Muddati tugagan',
};

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingRating, setEditingRating] = useState<{ id: number; val: string } | null>(null);
  const [editingOrder, setEditingOrder] = useState<{ id: number; val: string } | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    loadPosts();
  }, [page, statusFilter, typeFilter]);

  async function loadPosts() {
    try {
      setLoading(true);
      const params: Record<string, string> = { page: String(page), limit: '20' };
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;

      const res: any = await adminApi.posts.getAll(params);
      if (Array.isArray(res.data)) {
        setPosts(res.data);
        setTotalPages(res.meta?.totalPages || 1);
      } else if (res.data?.data) {
        setPosts(res.data.data);
        setTotalPages(res.data.meta?.totalPages || 1);
      } else {
        setPosts([]);
        setTotalPages(1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (deletingId) return;
    if (!confirm("Rostdan o'chirmoqchimisiz?")) return;
    setDeletingId(id);
    try {
      await adminApi.posts.delete(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (e: any) {
      alert(e?.message || "O'chirishda xatolik");
    } finally {
      setDeletingId(null);
    }
  }

  async function saveRating(id: number, val: string) {
    const rating = parseFloat(val);
    if (isNaN(rating) || rating < 0 || rating > 5) {
      alert("Reyting 0 dan 5 gacha bo'lishi kerak");
      return;
    }
    setSavingId(id);
    try {
      const res: any = await adminApi.posts.updateRating(id, rating);
      setPosts((prev) => prev.map((p) => p.id === id ? { ...p, rating: Number(res.rating ?? rating) } : p));
      setEditingRating(null);
    } catch (e: any) {
      alert(e?.message || 'Xatolik');
    } finally {
      setSavingId(null);
    }
  }

  async function saveOrder(id: number, val: string) {
    const order = val === '' ? null : parseInt(val, 10);
    if (val !== '' && (isNaN(order as number) || (order as number) < 1)) {
      alert("O'rni 1 dan boshlanishi kerak yoki bo'sh qoldiring (olib tashlash uchun)");
      return;
    }
    setSavingId(id);
    try {
      const res: any = await adminApi.posts.updateOrder(id, order);
      setPosts((prev) => prev.map((p) => p.id === id ? { ...p, pinnedOrder: res.pinnedOrder ?? order } : p));
      setEditingOrder(null);
    } catch (e: any) {
      alert(e?.message || 'Xatolik');
    } finally {
      setSavingId(null);
    }
  }

  const statusBadge = (s: string) => {
    const map: Record<string, string> = { PENDING: 'badge-yellow', APPROVED: 'badge-green', REJECTED: 'badge-red', EXPIRED: 'badge-gray' };
    return map[s] || 'badge-gray';
  };

  function StarRating({ postId, rating }: { postId: number; rating: number }) {
    if (editingRating?.id === postId) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <input type="number" min="0" max="5" step="0.5" value={editingRating.val}
            onChange={(e) => setEditingRating({ id: postId, val: e.target.value })}
            style={{ width: 52, padding: '2px 6px', border: '1.5px solid #b8a06a', borderRadius: 6, fontSize: 13, textAlign: 'center' }}
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') saveRating(postId, editingRating.val); if (e.key === 'Escape') setEditingRating(null); }}
          />
          <button onClick={() => saveRating(postId, editingRating.val)} disabled={savingId === postId}
            style={{ background: '#b8a06a', color: '#fff', border: 'none', borderRadius: 5, padding: '2px 8px', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>вњ“</button>
          <button onClick={() => setEditingRating(null)}
            style={{ background: 'transparent', color: '#8896ab', border: '1px solid #e2e8f0', borderRadius: 5, padding: '2px 8px', cursor: 'pointer', fontSize: 13 }}>вњ•</button>
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer' }}
        onClick={() => setEditingRating({ id: postId, val: String(rating ?? 0) })} title="Bosib o'zgartiring">
        {[1,2,3,4,5].map((i) => (
          <svg key={i} width="13" height="13" viewBox="0 0 24 24"
            fill={i <= Math.round(rating || 0) ? '#f5b731' : 'none'}
            stroke={i <= Math.round(rating || 0) ? '#f5b731' : '#d1d5db'}
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        ))}
        <span style={{ fontSize: 11, color: '#8896ab', marginLeft: 1 }}>{(rating || 0).toFixed(1)}</span>
        <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="#b8a06a" strokeWidth="2.2" style={{ opacity: 0.7 }}>
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    );
  }

  function OrderCell({ postId, order }: { postId: number; order: number | null | undefined }) {
    if (editingOrder?.id === postId) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <input type="number" min="1" placeholder="вЂ”" value={editingOrder.val}
            onChange={(e) => setEditingOrder({ id: postId, val: e.target.value })}
            style={{ width: 52, padding: '2px 6px', border: '1.5px solid #1e3a5f', borderRadius: 6, fontSize: 13, textAlign: 'center' }}
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') saveOrder(postId, editingOrder.val); if (e.key === 'Escape') setEditingOrder(null); }}
          />
          <button onClick={() => saveOrder(postId, editingOrder.val)} disabled={savingId === postId}
            style={{ background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: 5, padding: '2px 8px', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>вњ“</button>
          <button onClick={() => setEditingOrder(null)}
            style={{ background: 'transparent', color: '#8896ab', border: '1px solid #e2e8f0', borderRadius: 5, padding: '2px 8px', cursor: 'pointer', fontSize: 13 }}>вњ•</button>
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}
        onClick={() => setEditingOrder({ id: postId, val: order != null ? String(order) : '' })} title="Bosib o'zgartiring">
        {order != null
          ? <span style={{ fontWeight: 700, fontSize: 13, color: '#1e3a5f', background: 'rgba(30,58,95,0.09)', borderRadius: 5, padding: '2px 9px' }}>#{order}</span>
          : <span style={{ fontSize: 12, color: '#8896ab' }}>вЂ”</span>
        }
        <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="#8896ab" strokeWidth="2.2" style={{ opacity: 0.7 }}>
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="icon-box icon-box-navy">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <rect x="4" y="3" width="16" height="18" rx="2.5" stroke="#b8a06a" strokeWidth="1.8" fill="rgba(184,160,106,0.08)"/>
            <path d="M8 8h8M8 12h5M8 16h3" stroke="#b8a06a" strokeWidth="1.8" strokeLinecap="round" opacity="0.7"/>
          </svg>
        </div>
        <h1>E&apos;lonlar</h1>
      </div>

      <div className="filter-row">
        <div className="filter-select">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path d="M3 4h18v2l-7 7v7l-4 2v-9L3 6V4z" stroke="#8896ab" strokeWidth="1.8" fill="rgba(136,150,171,0.06)" strokeLinejoin="round"/>
          </svg>
          <select className="admin-input filter-input" title="Status filter"
            value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">Barcha holatlar</option>
            <option value="PENDING">Kutilmoqda</option>
            <option value="APPROVED">Tasdiqlangan</option>
            <option value="REJECTED">Rad etilgan</option>
            <option value="EXPIRED">Muddati tugagan</option>
          </select>
        </div>
        <div className="filter-select">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path d="M7 7h.01M7 3h5c.5 0 1 .2 1.4.6l7 7a2 2 0 010 2.8l-7 7a2 2 0 01-2.8 0l-7-7C3.2 13 3 12.5 3 12V7a4 4 0 014-4z" stroke="#8896ab" strokeWidth="1.8" fill="rgba(136,150,171,0.06)"/>
            <circle cx="7" cy="7" r="1" fill="#8896ab" opacity="0.4"/>
          </svg>
          <select className="admin-input filter-input" title="Type filter"
            value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}>
            <option value="">Barcha turlar</option>
            <option value="VACANCY">Vakansiya</option>
            <option value="RESUME">Rezyume</option>
            <option value="COURSE">Kurs</option>
            <option value="MENTOR">Mentor</option>
            <option value="INTERNSHIP">Stajirovka</option>
          </select>
        </div>
      </div>

      <div style={{ fontSize: 12, color: '#8896ab', marginBottom: 10, paddingLeft: 2 }}>
        &#128161; <b>Reyting</b> va <b>O&apos;rin</b> ustunidagi qiymatga bosib o&apos;zgartiring. O&apos;rin belgilangan e&apos;lonlar birinchi ko&apos;rinadi.
      </div>

      <div className="admin-card">
        {loading ? (
          <div className="empty-state"><div className="spinner" /><p className="empty-text">Yuklanmoqda...</p></div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <p className="empty-title">E&apos;lonlar topilmadi</p>
            <p className="empty-text">Filtrlarni o&apos;zgartirib ko&apos;ring</p>
          </div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tur</th>
                  <th>Sarlavha</th>
                  <th>Holat</th>
                  <th>Reyting</th>
                  <th>O&apos;rin</th>
                  <th>Ko&apos;rishlar</th>
                  <th>Muallif</th>
                  <th>Sana</th>
                  <th>Amal</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} style={post.pinnedOrder != null ? { background: 'rgba(30,58,95,0.035)' } : undefined}>
                    <td className="td-id">#{post.id}</td>
                    <td><span className="badge badge-blue">{typeLabels[post.type] || post.type}</span></td>
                    <td className="td-bold">{post.title}</td>
                    <td><span className={`badge ${statusBadge(post.status)}`}>{statusLabels[post.status] || post.status}</span></td>
                    <td><StarRating postId={post.id} rating={Number(post.rating ?? 0)} /></td>
                    <td><OrderCell postId={post.id} order={post.pinnedOrder} /></td>
                    <td>
                      <div className="flex-gap-2 td-muted">
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.05"/>
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
                        </svg>
                        {post.viewCount}
                      </div>
                    </td>
                    <td className="td-muted">{post.author?.firstName} {post.author?.lastName || ''}</td>
                    <td className="td-date">{new Date(post.createdAt).toLocaleDateString('uz-UZ')}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" disabled={deletingId === post.id} onClick={() => handleDelete(post.id)}>
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
                          <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                          <path d="M19 6l-.9 12.1A2 2 0 0116.1 20H7.9a2 2 0 01-2-1.9L5 6" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.06"/>
                          <path d="M10 11v5M14 11v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="pagination">
                <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
                  Oldingi
                </button>
                <span className="page-num">{page} / {totalPages}</span>
                <button className="btn btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  Keyingi
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
