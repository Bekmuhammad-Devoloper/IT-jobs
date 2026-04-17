'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api';

interface UserDetail {
  id: number;
  telegramId: string;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  phone?: string;
  city?: string;
  profession?: string;
  experience?: string;
  level?: string;
  bio?: string;
  github?: string;
  linkedin?: string;
  portfolio?: string;
  resumeUrl?: string;
  technologies?: string[];
  role: string;
  isBlocked: boolean;
  rating: number;
  profileCompleted: boolean;
  createdAt: string;
  posts?: any[];
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      adminApi.users.getOne(Number(params.id))
        .then((res: any) => setUser(res.data || res))
        .catch(() => router.push('/dashboard/users'))
        .finally(() => setLoading(false));
    }
  }, [params.id]);

  if (loading) return (
    <div className="loading-screen">
      <div className="admin-card" style={{padding:'60px 40px',textAlign:'center'}}>
        <div className="spinner" />
        <p style={{color:'#8896ab',fontWeight:600,fontSize:14}}>Yuklanmoqda...</p>
      </div>
    </div>
  );

  if (!user) return null;

  return (
    <div className="fade-in-up">
      <button className="btn btn-ghost btn-sm" onClick={() => router.push('/dashboard/users')} style={{marginBottom:16}}>
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        Orqaga
      </button>

      {/* User profile header */}
      <div className="welcome-banner" style={{display:'flex',alignItems:'center',gap:20,padding:'28px 32px'}}>
        {user.photoUrl ? (
          <img src={user.photoUrl} alt={user.firstName} style={{width:72,height:72,borderRadius:18,objectFit:'cover',border:'3px solid rgba(184,160,106,0.3)',flexShrink:0}} />
        ) : (
          <div style={{width:72,height:72,borderRadius:18,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,fontWeight:800,color:'#fff',background:'rgba(184,160,106,0.2)',border:'3px solid rgba(184,160,106,0.3)',flexShrink:0}}>
            {user.firstName?.charAt(0)?.toUpperCase() || '?'}
          </div>
        )}
        <div style={{flex:1}}>
          <h2 style={{fontSize:22,fontWeight:800,color:'#fff',marginBottom:4}}>
            {user.firstName} {user.lastName || ''}
          </h2>
          {user.profession && <p style={{color:'rgba(255,255,255,0.6)',fontSize:14}}>{user.profession}</p>}
          <div style={{display:'flex',gap:8,marginTop:8,flexWrap:'wrap'}}>
            <span className={`badge ${user.isBlocked ? 'badge-red' : 'badge-green'}`}>
              {user.isBlocked ? 'Bloklangan' : 'Faol'}
            </span>
            <span className="badge badge-blue">{user.role}</span>
            {user.profileCompleted && <span className="badge badge-green">Profil to&apos;liq</span>}
          </div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{display:'flex',alignItems:'center',gap:4,justifyContent:'flex-end'}}>
            <svg width="18" height="18" fill="#b8a06a" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            <span style={{color:'#b8a06a',fontWeight:800,fontSize:20}}>{user.rating}</span>
          </div>
          <div style={{color:'rgba(255,255,255,0.4)',fontSize:11,marginTop:4}}>
            ID: #{user.id} • TG: {user.telegramId}
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid-2-1" style={{marginTop:20}}>
        <div className="admin-card">
          <div className="card-header">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4" stroke="var(--navy)" strokeWidth="1.8"/><path d="M5 21v-2a7 7 0 0114 0v2" stroke="var(--navy)" strokeWidth="1.8"/></svg>
            <h2>Shaxsiy ma&apos;lumotlar</h2>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:12,padding:'8px 0'}}>
            <InfoRow label="Username" value={user.username ? `@${user.username}` : '-'} />
            <InfoRow label="Telefon" value={user.phone || '-'} />
            <InfoRow label="Shahar" value={user.city || '-'} />
            <InfoRow label="Tajriba" value={user.experience || '-'} />
            <InfoRow label="Daraja" value={user.level || '-'} />
            <InfoRow label="Ro'yxatdan o'tgan" value={new Date(user.createdAt).toLocaleDateString('uz-UZ')} />
          </div>
        </div>

        <div className="admin-card">
          <div className="card-header">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="var(--navy)" strokeWidth="1.8"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="var(--navy)" strokeWidth="1.8"/></svg>
            <h2>Havolalar</h2>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:12,padding:'8px 0'}}>
            <InfoRow label="GitHub" value={user.github || '-'} isLink={!!user.github} />
            <InfoRow label="LinkedIn" value={user.linkedin || '-'} isLink={!!user.linkedin} />
            <InfoRow label="Portfolio" value={user.portfolio || '-'} isLink={!!user.portfolio} />
            <InfoRow label="Rezyume" value={user.resumeUrl ? 'Yuklangan ✓' : '-'} isLink={!!user.resumeUrl} />
          </div>
        </div>
      </div>

      {/* Bio & Technologies */}
      {(user.bio || (user.technologies && user.technologies.length > 0)) && (
        <div className="admin-card" style={{marginTop:16}}>
          {user.bio && (
            <>
              <div className="card-header">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="var(--navy)" strokeWidth="1.8"/></svg>
                <h2>Bio</h2>
              </div>
              <p style={{fontSize:14,color:'#5a6a7e',lineHeight:1.7,padding:'8px 0'}}>{user.bio}</p>
            </>
          )}
          {user.technologies && user.technologies.length > 0 && (
            <div style={{marginTop:user.bio ? 16 : 0}}>
              <div className="card-header">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6" stroke="var(--navy)" strokeWidth="1.8"/><polyline points="8 6 2 12 8 18" stroke="var(--navy)" strokeWidth="1.8"/></svg>
                <h2>Texnologiyalar</h2>
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:6,padding:'8px 0'}}>
                {user.technologies.map((t) => (
                  <span key={t} style={{fontSize:11,fontWeight:700,padding:'5px 12px',borderRadius:8,background:'var(--navy-light)',color:'var(--navy)'}}>{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* User posts */}
      {user.posts && user.posts.length > 0 && (
        <div className="admin-card" style={{marginTop:16}}>
          <div className="card-header">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2.5" stroke="var(--navy)" strokeWidth="1.8"/><path d="M8 8h8M8 12h5" stroke="var(--navy)" strokeWidth="1.8" strokeLinecap="round"/></svg>
            <h2>E&apos;lonlari ({user.posts.length})</h2>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Sarlavha</th>
                <th>Turi</th>
                <th>Holati</th>
                <th>Sana</th>
              </tr>
            </thead>
            <tbody>
              {user.posts.map((post: any) => (
                <tr key={post.id}>
                  <td className="td-id">#{post.id}</td>
                  <td className="td-bold">{post.title}</td>
                  <td><span className="badge badge-blue">{post.type}</span></td>
                  <td>
                    <span className={`badge ${post.status === 'APPROVED' ? 'badge-green' : post.status === 'PENDING' ? 'badge-yellow' : 'badge-red'}`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="td-date">{new Date(post.createdAt).toLocaleDateString('uz-UZ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, isLink }: { label: string; value: string; isLink?: boolean }) {
  return (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <span style={{fontSize:13,color:'#8896ab',fontWeight:600}}>{label}</span>
      {isLink && value !== '-' ? (
        <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" style={{fontSize:13,fontWeight:700,color:'var(--navy)',textDecoration:'underline'}}>
          {value}
        </a>
      ) : (
        <span style={{fontSize:13,fontWeight:700,color:'var(--navy)'}}>{value}</span>
      )}
    </div>
  );
}
