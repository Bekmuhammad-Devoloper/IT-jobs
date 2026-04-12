'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/api';

interface AdminStats {
  users: { total: number; active: number; blocked: number };
  posts: { total: number; pending: number; approved: number; rejected: number };
  totalViews: number;
  postsByType: { type: string; total: number; approved: number; pending: number }[];
  charts?: { dailyPosts: any[]; dailyUsers: any[] };
}

interface TopPost {
  id: number;
  title: string;
  type: string;
  viewCount: number;
  author?: { firstName?: string; lastName?: string };
}

const typeLabels: Record<string, string> = {
  VACANCY: 'Vakansiya',
  RESUME: 'Rezyume',
  COURSE: 'Kurs',
  MENTOR: 'Mentorlik',
  INTERNSHIP: 'Stajirovka',
};
const typeColors: Record<string, string> = {
  VACANCY: '#1e3a5f',
  RESUME: '#b8a06a',
  COURSE: '#16a34a',
  MENTOR: '#2563eb',
  INTERNSHIP: '#ea580c',
};

function formatDate() {
  const d = new Date();
  const months = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'];
  return d.getDate() + ' ' + months[d.getMonth()] + ', ' + d.getFullYear();
}

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [topPosts, setTopPosts] = useState<TopPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, topRes]: any[] = await Promise.all([
          adminApi.stats.getAdmin(),
          adminApi.stats.getTopPosts(5).catch(() => []),
        ]);
        setStats(statsRes.data || statsRes);
        setTopPosts(Array.isArray(topRes) ? topRes : (topRes?.data || []));
      } catch (e: any) {
        setError(e.message || "Statistikani yuklashda xatolik");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return (
    <div className="loading-screen">
      <div className="admin-card" style={{padding:'60px 40px',textAlign:'center'}}>
        <div className="spinner" />
        <p style={{color:'#8896ab',fontWeight:600,fontSize:14}}>Ma&apos;lumotlar yuklanmoqda...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="loading-screen">
      <div className="admin-card error-card">
        <div className="icon-box icon-box-red" style={{margin:'0 auto 16px',width:56,height:56}}>
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M12 9v4m0 4h.01" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#dc2626" strokeWidth="2" fill="rgba(220,38,38,0.08)"/></svg>
        </div>
        <p style={{fontWeight:700,color:'#dc2626',fontSize:16}}>Xatolik yuz berdi</p>
        <p style={{color:'#8896ab',fontSize:13,marginTop:4}}>{error}</p>
      </div>
    </div>
  );

  if (!stats) return null;

  const totalPostsAll = stats.postsByType.reduce((s, t) => s + t.total, 0);
  const approvalRate = stats.posts.total > 0 ? Math.round((stats.posts.approved / stats.posts.total) * 100) : 0;
  const pendingRate = stats.posts.total > 0 ? Math.round((stats.posts.pending / stats.posts.total) * 100) : 0;
  const rejectedRate = stats.posts.total > 0 ? Math.round((stats.posts.rejected / stats.posts.total) * 100) : 0;
  const activeRate = stats.users.total > 0 ? Math.round((stats.users.active / stats.users.total) * 100) : 0;

  const barColorList = ['', 'gold', 'green', 'blue', 'orange'];
  const barMax = Math.max(...stats.postsByType.map(i => i.total), 1);

  const donutTotal = stats.posts.total || 1;
  const seg1 = (stats.posts.approved / donutTotal) * 100;
  const seg2 = (stats.posts.pending / donutTotal) * 100;
  const donutBg = `conic-gradient(#16a34a 0% ${seg1}%, #ea580c ${seg1}% ${seg1 + seg2}%, #dc2626 ${seg1 + seg2}% 100%)`;

  return (
    <div className="fade-in-up">
      {/* Welcome */}
      <div className="welcome-banner">
        <h2>Xush kelibsiz, Admin! 👋</h2>
        <p>Yuksalish.dev admin paneliga xush kelibsiz</p>
        <div className="welcome-date">{formatDate()}</div>
      </div>

      {/* Stat cards */}
      <div className="grid-4">
        <div className="stat-card">
          <div className="stat-inner">
            <div>
              <div className="stat-value">{stats.users.total}</div>
              <div className="stat-label">Foydalanuvchilar</div>
            </div>
            <div className="icon-box icon-box-navy">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <circle cx="9" cy="7" r="4" stroke="#b8a06a" strokeWidth="1.8" fill="rgba(184,160,106,0.15)"/>
                <path d="M2 21v-1a5 5 0 015-5h4a5 5 0 015 5v1" stroke="#b8a06a" strokeWidth="1.8" strokeLinecap="round"/>
                <circle cx="17" cy="7" r="2.5" stroke="#b8a06a" strokeWidth="1.4" strokeDasharray="2 2"/>
                <path d="M19 15c1.2.5 2 1.7 2 3v1" stroke="#b8a06a" strokeWidth="1.4" strokeLinecap="round" opacity="0.6"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="stat-card gold">
          <div className="stat-inner">
            <div>
              <div className="stat-value stat-value-orange">{stats.posts.total}</div>
              <div className="stat-label">Jami e&apos;lonlar</div>
            </div>
            <div className="icon-box icon-box-gold-light">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <rect x="4" y="3" width="16" height="18" rx="2.5" stroke="#b8a06a" strokeWidth="1.8" fill="rgba(184,160,106,0.08)"/>
                <path d="M8 8h8M8 12h5" stroke="#b8a06a" strokeWidth="1.8" strokeLinecap="round"/>
                <circle cx="16" cy="17" r="4" fill="rgba(184,160,106,0.15)" stroke="#b8a06a" strokeWidth="1.4"/>
                <path d="M14.5 17l1 1 2-2" stroke="#b8a06a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-inner">
            <div>
              <div className="stat-value stat-value-blue">{stats.posts.pending}</div>
              <div className="stat-label">Kutilmoqda</div>
            </div>
            <div className="icon-box icon-box-blue">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" stroke="#2563eb" strokeWidth="1.8" fill="rgba(37,99,235,0.06)"/>
                <path d="M12 7v5l3.5 2" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="1.5" fill="#2563eb" opacity="0.4"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-inner">
            <div>
              <div className="stat-value stat-value-green">{stats.totalViews}</div>
              <div className="stat-label">Ko&apos;rishlar</div>
            </div>
            <div className="icon-box icon-box-green">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke="#16a34a" strokeWidth="1.8" fill="rgba(22,163,74,0.06)"/>
                <circle cx="12" cy="12" r="3" stroke="#16a34a" strokeWidth="1.8" fill="rgba(22,163,74,0.15)"/>
                <circle cx="12" cy="12" r="1" fill="#16a34a"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="admin-card mb-6">
        <div className="card-header">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="var(--navy)" strokeWidth="1.8" fill="rgba(30,58,95,0.06)" strokeLinejoin="round"/>
          </svg>
          <h2>Tezkor amallar</h2>
        </div>
        <div className="quick-actions">
          <Link href="/dashboard/moderation" className="quick-action">
            <div className="quick-action-icon icon-box-green">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#16a34a" strokeWidth="1.8" fill="rgba(22,163,74,0.08)"/>
                <path d="M9 12l2 2 4-4" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>Moderatsiya</span>
          </Link>
          <Link href="/dashboard/posts" className="quick-action">
            <div className="quick-action-icon icon-box-blue">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="3" stroke="#2563eb" strokeWidth="1.8" fill="rgba(37,99,235,0.06)"/>
                <path d="M7 8h10M7 12h6M7 16h8" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <span>E&apos;lonlar</span>
          </Link>
          <Link href="/dashboard/users" className="quick-action">
            <div className="quick-action-icon icon-box-orange">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <circle cx="9" cy="7" r="3.5" stroke="#ea580c" strokeWidth="1.8" fill="rgba(234,88,12,0.08)"/>
                <path d="M2 20v-1a5 5 0 015-5h4a5 5 0 015 5v1" stroke="#ea580c" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M17 8l2 2 3-3" stroke="#ea580c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>Foydalanuvchilar</span>
          </Link>
          <Link href="/dashboard/settings" className="quick-action">
            <div className="quick-action-icon icon-box-gold-light">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3" stroke="#b8a06a" strokeWidth="1.8" fill="rgba(184,160,106,0.1)"/>
                <path d="M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" stroke="#b8a06a" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <span>Sozlamalar</span>
          </Link>
        </div>
      </div>

      {/* Bar chart + Donut chart */}
      <div className="grid-2-1 mb-6">
        <div className="admin-card">
          <div className="card-header">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <rect x="3" y="12" width="4" height="9" rx="1" stroke="var(--navy)" strokeWidth="1.6" fill="rgba(30,58,95,0.08)"/>
              <rect x="10" y="6" width="4" height="15" rx="1" stroke="var(--navy)" strokeWidth="1.6" fill="rgba(30,58,95,0.12)"/>
              <rect x="17" y="2" width="4" height="19" rx="1" stroke="var(--navy)" strokeWidth="1.6" fill="rgba(30,58,95,0.06)"/>
            </svg>
            <h2>E&apos;lonlar turi bo&apos;yicha</h2>
          </div>
          <div className="bar-chart">
            {stats.postsByType.map((item, i) => {
              const h = Math.max((item.total / barMax) * 120, 4);
              return (
                <div className="bar-col" key={item.type}>
                  <div className="bar-value">{item.total}</div>
                  <div className={`bar-fill ${barColorList[i] || ''}`} style={{ height: h }} />
                  <div className="bar-label">{typeLabels[item.type] || item.type}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="admin-card">
          <div className="card-header">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" stroke="var(--navy)" strokeWidth="1.6" fill="rgba(30,58,95,0.04)"/>
              <path d="M12 3a9 9 0 019 9" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="3" fill="rgba(30,58,95,0.08)"/>
            </svg>
            <h2>Holat</h2>
          </div>
          <div className="donut-wrap">
            <div className="donut" style={{ background: donutBg }}>
              <div className="donut-center" style={{ width: 74, height: 74, borderRadius: '50%', background: '#fff' }}>
                <div className="donut-num">{stats.posts.total}</div>
                <div className="donut-sub">jami</div>
              </div>
            </div>
            <div className="donut-legend">
              <div className="donut-legend-item">
                <div className="donut-legend-dot" style={{ background: '#16a34a' }} />
                Tasdiqlangan
                <span className="donut-legend-val">{stats.posts.approved}</span>
              </div>
              <div className="donut-legend-item">
                <div className="donut-legend-dot" style={{ background: '#ea580c' }} />
                Kutilmoqda
                <span className="donut-legend-val">{stats.posts.pending}</span>
              </div>
              <div className="donut-legend-item">
                <div className="donut-legend-dot" style={{ background: '#dc2626' }} />
                Rad etilgan
                <span className="donut-legend-val">{stats.posts.rejected}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bars + Top posts */}
      <div className="grid-1-1 mb-6">
        <div className="admin-card">
          <div className="card-header">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M3 3v18h18" stroke="var(--navy)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 16l4-5 4 3 5-7" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="7" cy="16" r="1.5" fill="var(--navy)" opacity="0.3"/>
              <circle cx="11" cy="11" r="1.5" fill="var(--navy)" opacity="0.3"/>
              <circle cx="15" cy="14" r="1.5" fill="var(--navy)" opacity="0.3"/>
              <circle cx="20" cy="7" r="1.5" fill="var(--gold)" opacity="0.5"/>
            </svg>
            <h2>Tasdiqlash darajasi</h2>
          </div>
          <div className="progress-row">
            <div className="progress-header">
              <span className="progress-name">✅ Tasdiqlangan</span>
              <span className="progress-num">{approvalRate}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill green" style={{ width: approvalRate + '%' }} />
            </div>
          </div>
          <div className="progress-row">
            <div className="progress-header">
              <span className="progress-name">⏳ Kutilmoqda</span>
              <span className="progress-num">{pendingRate}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill orange" style={{ width: pendingRate + '%' }} />
            </div>
          </div>
          <div className="progress-row">
            <div className="progress-header">
              <span className="progress-name">❌ Rad etilgan</span>
              <span className="progress-num">{rejectedRate}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill red" style={{ width: rejectedRate + '%' }} />
            </div>
          </div>
          <div className="progress-row">
            <div className="progress-header">
              <span className="progress-name">👥 Foydalanuvchi faolligi</span>
              <span className="progress-num">{activeRate}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill blue" style={{ width: activeRate + '%' }} />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="card-header">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M12 2l2.4 4.8 5.3.8-3.8 3.7.9 5.3L12 14.1l-4.8 2.5.9-5.3-3.8-3.7 5.3-.8L12 2z" stroke="var(--gold)" strokeWidth="1.8" fill="rgba(184,160,106,0.12)" strokeLinejoin="round"/>
            </svg>
            <h2>Top e&apos;lonlar</h2>
          </div>
          {topPosts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon icon-box-navy-light">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <rect x="4" y="3" width="16" height="18" rx="2.5" stroke="var(--navy)" strokeWidth="1.6" fill="rgba(30,58,95,0.05)"/>
                  <path d="M8 8h8M8 12h5M8 16h3" stroke="var(--navy)" strokeWidth="1.6" strokeLinecap="round" opacity="0.5"/>
                </svg>
              </div>
              <p className="empty-title">Hali e&apos;lonlar yo&apos;q</p>
              <p className="empty-text">E&apos;lonlar paydo bo&apos;lganda bu yerda ko&apos;rinadi</p>
            </div>
          ) : (
            <div className="activity-list">
              {topPosts.map((post, i) => (
                <div className="activity-item" key={post.id}>
                  <div className="activity-dot" style={{ background: typeColors[post.type] || '#1e3a5f', color: '#fff', fontSize: 12, fontWeight: 800 }}>
                    {i + 1}
                  </div>
                  <div className="activity-content">
                    <div className="activity-text">{post.title}</div>
                    <div className="activity-time">
                      {typeLabels[post.type] || post.type} • {post.viewCount} ko&apos;rish
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Users + System health */}
      <div className="grid-1-1 mb-6">
        <div className="admin-card">
          <div className="card-header">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <circle cx="9" cy="7" r="3.5" stroke="var(--navy)" strokeWidth="1.8" fill="rgba(30,58,95,0.06)"/>
              <path d="M2 20v-1a5 5 0 015-5h4a5 5 0 015 5v1" stroke="var(--navy)" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M17 10l1.5 1.5L22 8" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h2>Foydalanuvchilar tafsiloti</h2>
          </div>
          <div className="grid-3">
            <div className="stat-card success">
              <div className="stat-inner">
                <div>
                  <div className="stat-value stat-value-green">{stats.users.active}</div>
                  <div className="stat-label">Faol</div>
                </div>
                <div className="icon-box icon-box-green">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9" stroke="#16a34a" strokeWidth="1.8" fill="rgba(22,163,74,0.08)"/>
                    <path d="M8 12l3 3 5-5" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
            <div className="stat-card danger">
              <div className="stat-inner">
                <div>
                  <div className="stat-value stat-value-red">{stats.users.blocked}</div>
                  <div className="stat-label">Bloklangan</div>
                </div>
                <div className="icon-box icon-box-red">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9" stroke="#dc2626" strokeWidth="1.8" fill="rgba(220,38,38,0.08)"/>
                    <path d="M15 9l-6 6M9 9l6 6" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-inner">
                <div>
                  <div className="stat-value">{stats.posts.approved}</div>
                  <div className="stat-label">Tasdiqlangan</div>
                </div>
                <div className="icon-box icon-box-green">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="3" stroke="#16a34a" strokeWidth="1.8" fill="rgba(22,163,74,0.06)"/>
                    <path d="M8 12l3 3 5-5" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="card-header">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <rect x="2" y="3" width="20" height="18" rx="3" stroke="var(--navy)" strokeWidth="1.8" fill="rgba(30,58,95,0.04)"/>
              <circle cx="7" cy="12" r="2" fill="var(--navy)" opacity="0.15"/>
              <path d="M12 10v4M14 12h-4" stroke="var(--navy)" strokeWidth="1.8" strokeLinecap="round"/>
              <circle cx="17" cy="8" r="1" fill="var(--gold)" opacity="0.5"/>
              <circle cx="17" cy="16" r="1" fill="#16a34a" opacity="0.5"/>
            </svg>
            <h2>Tizim holati</h2>
          </div>
          <div className="health-row">
            <div className="health-dot online" />
            <div className="health-name">Backend API</div>
            <div className="health-status online">Ishlayapti</div>
          </div>
          <div className="health-row">
            <div className="health-dot online" />
            <div className="health-name">Ma&apos;lumotlar bazasi</div>
            <div className="health-status online">Ishlayapti</div>
          </div>
          <div className="health-row">
            <div className="health-dot online" />
            <div className="health-name">Redis Cache</div>
            <div className="health-status online">Ishlayapti</div>
          </div>
          <div className="health-row">
            <div className="health-dot online" />
            <div className="health-name">Telegram Bot</div>
            <div className="health-status online">Ishlayapti</div>
          </div>
        </div>
      </div>

      {/* Posts detail table */}
      <div className="admin-card mb-6">
        <div className="card-header">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="3" stroke="var(--navy)" strokeWidth="1.6" fill="rgba(30,58,95,0.04)"/>
            <path d="M3 9h18" stroke="var(--navy)" strokeWidth="1.6"/>
            <path d="M9 9v12" stroke="var(--navy)" strokeWidth="1.6"/>
            <circle cx="6" cy="6" r="1" fill="var(--gold)" opacity="0.5"/>
          </svg>
          <h2>E&apos;lonlar jadvali</h2>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tur</th>
              <th>Jami</th>
              <th>Tasdiqlangan</th>
              <th>Kutilmoqda</th>
              <th>Ulushi</th>
            </tr>
          </thead>
          <tbody>
            {stats.postsByType.map((item) => {
              const pct = totalPostsAll > 0 ? (item.total / totalPostsAll) * 100 : 0;
              return (
                <tr key={item.type}>
                  <td>
                    <div className="flex-gap-2">
                      <div className="icon-box icon-box-sm" style={{ background: (typeColors[item.type] || '#1e3a5f') + '12' }}>
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
                          <rect x="4" y="3" width="16" height="18" rx="2.5" stroke={typeColors[item.type] || '#1e3a5f'} strokeWidth="2" fill={(typeColors[item.type] || '#1e3a5f') + '15'}/>
                          <path d="M8 8h8M8 12h5" stroke={typeColors[item.type] || '#1e3a5f'} strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
                        </svg>
                      </div>
                      <span className="td-bold">{typeLabels[item.type] || item.type}</span>
                    </div>
                  </td>
                  <td className="td-bold">{item.total}</td>
                  <td><span className="badge badge-green">{item.approved}</span></td>
                  <td><span className="badge badge-yellow">{item.pending}</span></td>
                  <td>
                    <div className="progress-track" style={{ width: 80 }}>
                      <div className="progress-fill" style={{ width: pct + '%' }} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
