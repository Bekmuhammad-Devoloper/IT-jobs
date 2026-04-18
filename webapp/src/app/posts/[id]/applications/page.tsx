'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import BottomNav from '@/components/BottomNav';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const id = Number(params.id);
    api.posts.getApplications(id)
      .then((res: any) => {
        const data = Array.isArray(res) ? res : res.data || [];
        setApplications(data);
      })
      .catch((e: any) => setError(e.message || 'Xatolik'))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{paddingBottom:100,minHeight:'100dvh'}}>
      <div className="glass" style={{position:'sticky',top:0,zIndex:30,padding:'12px 16px',display:'flex',alignItems:'center',gap:12,borderBottom:'1px solid var(--border)'}}>
        <button onClick={() => router.back()} style={{width:36,height:36,borderRadius:10,background:'#fff',border:'1px solid var(--border-strong)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
          <svg width="18" height="18" fill="none" stroke="var(--navy)" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h1 style={{fontSize:18,fontWeight:900,color:'var(--navy)'}}>Murojaatlar ({applications.length})</h1>
      </div>

      <div className="anim-fade" style={{padding:'16px',display:'flex',flexDirection:'column',gap:10}}>
        {error && <p style={{color:'#dc2626',fontSize:14,textAlign:'center',padding:20}}>{error}</p>}

        {!error && applications.length === 0 && (
          <div style={{textAlign:'center',padding:'40px 20px'}}>
            <div style={{fontSize:48,marginBottom:12}}>📭</div>
            <p style={{fontWeight:700,fontSize:16,color:'var(--navy)'}}>Hali murojaatlar yo&apos;q</p>
            <p style={{fontSize:13,color:'var(--text-muted)',marginTop:4}}>Nomzodlar murojaat qilganda bu yerda ko&apos;rinadi</p>
          </div>
        )}

        {applications.map((app: any) => {
          const u = app.user;
          const name = [u?.firstName, u?.lastName].filter(Boolean).join(' ') || 'Foydalanuvchi';
          return (
            <div key={app.id} className="card" style={{padding:16}}>
              <a href={u?.username ? `https://t.me/${u.username}` : '#'} target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',gap:12,textDecoration:'none',color:'inherit',marginBottom:12}}>
                {u?.photoUrl ? (
                  <img src={u.photoUrl} alt={name} style={{width:48,height:48,borderRadius:16,objectFit:'cover',flexShrink:0}} />
                ) : (
                  <div style={{width:48,height:48,borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,var(--navy),#2a4f7a)',color:'#fff',fontSize:20,fontWeight:800,flexShrink:0}}>
                    {name[0] || '?'}
                  </div>
                )}
                <div style={{flex:1}}>
                  <p style={{fontWeight:700,fontSize:14,color:'var(--navy)'}}>{name}</p>
                  {u?.username && <p style={{fontSize:12,color:'var(--text-muted)',marginTop:2}}>@{u.username}</p>}
                  {u?.profession && <p style={{fontSize:12,color:'var(--text-muted)',marginTop:2}}>{u.profession}</p>}
                </div>
                {u?.rating > 0 && <span style={{fontSize:11,fontWeight:800,padding:'4px 10px',borderRadius:8,background:'var(--gold-light)',color:'var(--gold-dark)'}}>★ {u.rating}</span>}
              </a>

              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {app.message && (
                  <div style={{padding:'10px 14px',borderRadius:10,background:'var(--bg)',fontSize:13,color:'var(--text-secondary)',lineHeight:1.6}}>
                    💬 {app.message}
                  </div>
                )}
                {app.resumeUrl && (
                  <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',gap:8,padding:'10px 14px',borderRadius:10,background:'var(--navy-light)',textDecoration:'none',fontSize:13,fontWeight:600,color:'var(--navy)'}}>
                    📄 Rezyumeni ko&apos;rish
                  </a>
                )}
                {app.portfolio && (
                  <a href={app.portfolio} target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',gap:8,padding:'10px 14px',borderRadius:10,background:'var(--navy-light)',textDecoration:'none',fontSize:13,fontWeight:600,color:'var(--navy)'}}>
                    🔗 Portfolio
                  </a>
                )}
              </div>

              <div style={{fontSize:11,color:'var(--text-muted)',marginTop:8}}>
                {new Date(app.createdAt).toLocaleString('uz-UZ')}
              </div>
            </div>
          );
        })}
      </div>
      <BottomNav />
    </div>
  );
}
