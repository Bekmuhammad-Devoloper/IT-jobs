'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/api';
import {
  Users, FileText, Clock, Eye,
  ShieldCheck, LayoutGrid, Settings, Zap,
  BarChart3, PieChart, TrendingUp, Trophy,
  UserCheck, UserX, CheckSquare, Activity,
  AlertTriangle, Table2, ChevronRight,
} from 'lucide-react';

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
          <AlertTriangle size={24} color="#dc2626" strokeWidth={2} />
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
              <Users size={22} color="#b8a06a" strokeWidth={1.8} />
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
              <FileText size={22} color="#b8a06a" strokeWidth={1.8} />
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
              <Clock size={22} color="#2563eb" strokeWidth={1.8} />
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
              <Eye size={22} color="#16a34a" strokeWidth={1.8} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="admin-card mb-6">
        <div className="card-header">
          <Zap size={18} color="var(--navy)" strokeWidth={1.8} />
          <h2>Tezkor amallar</h2>
        </div>
        <div className="quick-actions">
          <Link href="/dashboard/moderation" className="quick-action">
            <div className="quick-action-icon icon-box-green">
              <ShieldCheck size={20} color="#16a34a" strokeWidth={1.8} />
            </div>
            <span>Moderatsiya</span>
            <ChevronRight size={14} color="#8896ab" strokeWidth={2} />
          </Link>
          <Link href="/dashboard/posts" className="quick-action">
            <div className="quick-action-icon icon-box-blue">
              <LayoutGrid size={20} color="#2563eb" strokeWidth={1.8} />
            </div>
            <span>E&apos;lonlar</span>
            <ChevronRight size={14} color="#8896ab" strokeWidth={2} />
          </Link>
          <Link href="/dashboard/users" className="quick-action">
            <div className="quick-action-icon icon-box-orange">
              <UserCheck size={20} color="#ea580c" strokeWidth={1.8} />
            </div>
            <span>Foydalanuvchilar</span>
            <ChevronRight size={14} color="#8896ab" strokeWidth={2} />
          </Link>
          <Link href="/dashboard/settings" className="quick-action">
            <div className="quick-action-icon icon-box-gold-light">
              <Settings size={20} color="#b8a06a" strokeWidth={1.8} />
            </div>
            <span>Sozlamalar</span>
            <ChevronRight size={14} color="#8896ab" strokeWidth={2} />
          </Link>
        </div>
      </div>

      {/* Bar chart + Donut chart */}
      <div className="grid-2-1 mb-6">
        <div className="admin-card">
          <div className="card-header">
            <BarChart3 size={18} color="var(--navy)" strokeWidth={1.8} />
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
            <PieChart size={18} color="var(--navy)" strokeWidth={1.8} />
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
            <TrendingUp size={18} color="var(--navy)" strokeWidth={1.8} />
            <h2>Tasdiqlash darajasi</h2>
          </div>
          <div className="progress-row">
            <div className="progress-header">
              <span className="progress-name">Tasdiqlangan</span>
              <span className="progress-num">{approvalRate}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill green" style={{ width: approvalRate + '%' }} />
            </div>
          </div>
          <div className="progress-row">
            <div className="progress-header">
              <span className="progress-name">Kutilmoqda</span>
              <span className="progress-num">{pendingRate}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill orange" style={{ width: pendingRate + '%' }} />
            </div>
          </div>
          <div className="progress-row">
            <div className="progress-header">
              <span className="progress-name">Rad etilgan</span>
              <span className="progress-num">{rejectedRate}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill red" style={{ width: rejectedRate + '%' }} />
            </div>
          </div>
          <div className="progress-row">
            <div className="progress-header">
              <span className="progress-name">Foydalanuvchi faolligi</span>
              <span className="progress-num">{activeRate}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill blue" style={{ width: activeRate + '%' }} />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="card-header">
            <Trophy size={18} color="var(--gold)" strokeWidth={1.8} />
            <h2>Top e&apos;lonlar</h2>
          </div>
          {topPosts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon icon-box-navy-light">
                <FileText size={24} color="var(--navy)" strokeWidth={1.6} />
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
            <UserCheck size={18} color="var(--navy)" strokeWidth={1.8} />
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
                  <CheckSquare size={18} color="#16a34a" strokeWidth={1.8} />
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
                  <UserX size={18} color="#dc2626" strokeWidth={1.8} />
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
                  <CheckSquare size={18} color="#16a34a" strokeWidth={1.8} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="card-header">
            <Activity size={18} color="var(--navy)" strokeWidth={1.8} />
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
          <Table2 size={18} color="var(--navy)" strokeWidth={1.8} />
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
                        <FileText size={13} color={typeColors[item.type] || '#1e3a5f'} strokeWidth={2} />
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
