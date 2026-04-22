'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';

interface PendingPost {
  id: number;
  type: string;
  title: string;
  description?: string;
  company?: string;
  city?: string;
  salary?: string;
  experience?: string;
  workType?: string;
  technologies?: string[];
  contactPhone?: string;
  contactEmail?: string;
  contactTelegram?: string;
  author?: { firstName: string; lastName?: string; username?: string };
  category?: { name: string };
  createdAt: string;
}

const typeLabels: Record<string, string> = {
  VACANCY: 'Vakansiya',
  RESUME: 'Rezyume',
  COURSE: 'Kurs',
  MENTOR: 'Mentor',
  INTERNSHIP: 'Stajirovka',
};

const typeBadgeColors: Record<string, string> = {
  VACANCY: '#2563eb',
  RESUME: '#16a34a',
  COURSE: '#9333ea',
  MENTOR: '#ea580c',
  INTERNSHIP: '#0891b2',
};

export default function ModerationPage() {
  const [posts, setPosts] = useState<PendingPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    loadPending();
  }, [page]);

  async function loadPending() {
    try {
      setLoading(true);
      const res: any = await adminApi.moderation.getPending(page);
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

  async function handleApprove(id: number) {
    if (actionLoading !== null) return;
    setActionLoading(id);
    try {
      await adminApi.moderation.approve(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      if (expanded === id) setExpanded(null);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Tasdiqlashda xatolik yuz berdi");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(id: number) {
    if (actionLoading !== null) return;
    const reason = prompt('Rad etish sababi (ixtiyoriy):');
    setActionLoading(id);
    try {
      await adminApi.moderation.reject(id, reason || undefined);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      if (expanded === id) setExpanded(null);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Rad etishda xatolik yuz berdi");
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
        <div>
          <div className="admin-card" style={{marginBottom: 16}}>
            <p className="td-muted">
              {posts.length} ta e&apos;lon tekshiruv kutmoqda
            </p>
          </div>

          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {posts.map((post) => {
              const isOpen = expanded === post.id;
              const color = typeBadgeColors[post.type] || '#64748b';
              return (
                <div key={post.id} className="admin-card" style={{padding:0,overflow:'hidden'}}>
                  {/* Header row — always visible */}
                  <div
                    style={{padding:'16px 20px',display:'flex',alignItems:'center',gap:12,cursor:'pointer',borderBottom: isOpen ? '1px solid rgba(30,58,95,0.08)' : 'none'}}
                    onClick={() => setExpanded(isOpen ? null : post.id)}
                  >
                    <span style={{fontSize:12,fontWeight:700,padding:'3px 10px',borderRadius:6,color:'#fff',background:color}}>
                      {typeLabels[post.type] || post.type}
                    </span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:700,fontSize:15,color:'var(--navy)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{post.title}</div>
                      <div style={{fontSize:12,color:'var(--text-muted)',marginTop:2}}>
                        #{post.id} &middot; {post.author?.firstName} {post.author?.lastName || ''} &middot; {new Date(post.createdAt).toLocaleDateString('uz-UZ')}
                      </div>
                    </div>
                    <svg width="18" height="18" fill="none" stroke="var(--text-muted)" strokeWidth="2" viewBox="0 0 24 24"
                      style={{transform:isOpen?'rotate(180deg)':'rotate(0)',transition:'transform 0.2s',flexShrink:0}}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </div>

                  {/* Expanded details */}
                  {isOpen && (
                    <div style={{padding:'16px 20px'}}>
                      {/* Info grid */}
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px 20px',marginBottom:16}}>
                        {post.company && <Detail label="Kompaniya" value={post.company}/>}
                        {post.city && <Detail label="Shahar" value={post.city}/>}
                        {post.salary && <Detail label="Maosh" value={post.salary}/>}
                        {post.experience && <Detail label="Tajriba" value={post.experience}/>}
                        {post.workType && <Detail label="Ish turi" value={post.workType}/>}
                        {post.category?.name && <Detail label="Kategoriya" value={post.category.name}/>}
                      </div>

                      {/* Technologies */}
                      {post.technologies && post.technologies.length > 0 && (
                        <div style={{marginBottom:16}}>
                          <div style={{fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:6}}>Texnologiyalar</div>
                          <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                            {post.technologies.map(t => (
                              <span key={t} style={{fontSize:11,fontWeight:600,padding:'3px 10px',borderRadius:6,background:'rgba(30,58,95,0.06)',color:'var(--navy)'}}>{t}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      {post.description && (
                        <div style={{marginBottom:16}}>
                          <div style={{fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:6}}>Tavsif</div>
                          <div style={{fontSize:14,color:'var(--navy)',lineHeight:1.7,whiteSpace:'pre-wrap',background:'rgba(30,58,95,0.03)',padding:'12px 16px',borderRadius:10,border:'1px solid rgba(30,58,95,0.06)'}}>
                            {post.description}
                          </div>
                        </div>
                      )}

                      {/* Contact info */}
                      {(post.contactPhone || post.contactEmail || post.contactTelegram) && (
                        <div style={{marginBottom:20}}>
                          <div style={{fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:6}}>Aloqa</div>
                          <div style={{display:'flex',flexWrap:'wrap',gap:10}}>
                            {post.contactPhone && <span style={{fontSize:13,color:'var(--navy)'}}>📞 {post.contactPhone}</span>}
                            {post.contactEmail && <span style={{fontSize:13,color:'var(--navy)'}}>✉️ {post.contactEmail}</span>}
                            {post.contactTelegram && <span style={{fontSize:13,color:'var(--navy)'}}>💬 {post.contactTelegram}</span>}
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div style={{display:'flex',gap:10}}>
                        <button className="btn btn-success" style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:6}}
                          onClick={() => handleApprove(post.id)} disabled={actionLoading === post.id}>
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          Tasdiqlash
                        </button>
                        <button className="btn btn-danger" style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:6}}
                          onClick={() => handleReject(post.id)} disabled={actionLoading === post.id}>
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
                          Rad etish
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="pagination" style={{marginTop:16}}>
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

function Detail({label, value}: {label: string; value: string}) {
  return (
    <div>
      <div style={{fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em'}}>{label}</div>
      <div style={{fontSize:14,fontWeight:600,color:'var(--navy)',marginTop:2}}>{value}</div>
    </div>
  );
}
