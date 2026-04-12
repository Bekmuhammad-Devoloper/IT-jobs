'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';

interface PendingPost {
  id: number;
  type: string;
  title: string;
  company?: string;
  city?: string;
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

export default function ModerationPage() {
  const [posts, setPosts] = useState<PendingPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    loadPending();
  }, [page]);

  async function loadPending() {
    try {
      setLoading(true);
      const res: any = await adminApi.moderation.getPending(page);
      const data = res.data || res;
      setPosts(data.data || []);
      setTotalPages(data.meta?.totalPages || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id: number) {
    setActionLoading(id);
    try {
      await adminApi.moderation.approve(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(id: number) {
    const reason = prompt('Rad etish sababi (ixtiyoriy):');
    setActionLoading(id);
    try {
      await adminApi.moderation.reject(id, reason || undefined);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="icon-box icon-box-navy">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#b8a06a" strokeWidth="1.8" fill="rgba(184,160,106,0.1)"/>
            <path d="M9 12l2 2 4-4" stroke="#b8a06a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1>Moderatsiya</h1>
      </div>

      {loading ? (
        <div className="admin-card empty-state">
          <div className="spinner" />
          <p className="empty-text">Yuklanmoqda...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="admin-card empty-state">
          <div className="empty-icon icon-box-green">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#16a34a" strokeWidth="1.8" fill="rgba(22,163,74,0.08)"/>
              <path d="M9 12l2 2 4-4" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="empty-title">Hammasi tekshirilgan!</p>
          <p className="empty-text">Kutilayotgan e&apos;lonlar yo&apos;q</p>
        </div>
      ) : (
        <div className="admin-card">
          <div className="flex-between mb-4">
            <p className="td-muted">
              {posts.length} ta e&apos;lon tekshiruv kutmoqda
            </p>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tur</th>
                <th>Sarlavha</th>
                <th>Muallif</th>
                <th>Sana</th>
                <th>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td className="td-id">#{post.id}</td>
                  <td><span className="badge badge-blue">{typeLabels[post.type] || post.type}</span></td>
                  <td className="td-bold">{post.title}</td>
                  <td className="td-muted">{post.author?.firstName} {post.author?.lastName || ''}</td>
                  <td className="td-date">
                    {new Date(post.createdAt).toLocaleDateString('uz-UZ')}
                  </td>
                  <td>
                    <div className="flex-gap-2">
                      <button className="btn btn-success btn-sm" onClick={() => handleApprove(post.id)} title="Tasdiqlash"
                        disabled={actionLoading === post.id}>
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.1"/>
                          <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleReject(post.id)} title="Rad etish"
                        disabled={actionLoading === post.id}>
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.1"/>
                          <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                        </svg>
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
        </div>
      )}
    </div>
  );
}
