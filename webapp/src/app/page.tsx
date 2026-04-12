'use client';
import { useEffect, useState } from 'react';
import { useTelegram } from '@/hooks/useTelegram';
import { api } from '@/lib/api';
import type { Post, PublicStats } from '@/types';
import PostCard from '@/components/PostCard';
import BottomNav from '@/components/BottomNav';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  const { user, isLoading: tgLoading } = useTelegram();
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.statistics.getPublic().catch(() => null),
      api.posts.getAll({ limit: '5', sort: 'createdAt', order: 'desc' }).catch(() => null),
    ]).then(([s, p]: any) => {
      if (s) setStats(s.data || s);
      if (p) setPosts((p.data || p)?.data || []);
    }).finally(() => setLoading(false));
  }, []);

  if (tgLoading || loading) return <LoadingSpinner />;
  const st = stats?.byType;

  return (
    <div style={{paddingBottom:100,minHeight:'100dvh'}}>
      {/* Hero */}
      <div className="gradient-hero" style={{padding:'32px 20px 60px',position:'relative'}}>
        <div style={{position:'relative',zIndex:2}}>
          <div className="anim-fade" style={{display:'flex',alignItems:'center',gap:14,marginBottom:24}}>
            <Image src="/logo.png" alt="Yuksalish.dev" width={56} height={56} style={{objectFit:'contain',filter:'drop-shadow(0 2px 8px rgba(0,0,0,0.3))'}} priority/>
            <div>
              <span style={{color:'#fff',fontSize:20,fontWeight:900,letterSpacing:'-0.01em'}}>Yuksalish<span style={{color:'#d4c494'}}>.dev</span></span>
              <div style={{fontSize:10,color:'rgba(255,255,255,0.4)',fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase',marginTop:2}}>IT Platformasi</div>
            </div>
          </div>
          <h1 className="anim-fade d1" style={{fontSize:24,fontWeight:900,color:'#fff',lineHeight:1.2,letterSpacing:'-0.02em'}}>
            {user ? `Salom, ${user.firstName}` : "O'zbekiston IT Platformasi"}
          </h1>
          <p className="anim-fade d2" style={{color:'rgba(255,255,255,0.45)',fontSize:14,marginTop:8,maxWidth:280,lineHeight:1.5}}>
            Vakansiya, rezyume, kurs va mentorlik
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="anim-slide" style={{padding:'0 16px',marginTop:-32,position:'relative',zIndex:10}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
          {[
            { v: st?.vacancies ?? 0, l: 'Vakansiya', svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><defs><linearGradient id="gv" x1="0" y1="0" x2="24" y2="24"><stop stop-color="#1e3a5f"/><stop offset="1" stop-color="#2d5a8e"/></linearGradient></defs><rect x="2" y="7" width="20" height="14" rx="3" fill="url(#gv)" opacity="0.12"/><rect x="3" y="8" width="18" height="12" rx="2.5" stroke="#1e3a5f" stroke-width="1.6" fill="none"/><path d="M8 8V6a2 2 0 012-2h4a2 2 0 012 2v2" stroke="#1e3a5f" stroke-width="1.6" fill="none"/><circle cx="12" cy="14" r="1.5" fill="#1e3a5f"/></svg>' },
            { v: st?.resumes ?? 0, l: 'Rezyume', svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><defs><linearGradient id="gr" x1="0" y1="0" x2="24" y2="24"><stop stop-color="#1e3a5f"/><stop offset="1" stop-color="#2d5a8e"/></linearGradient></defs><rect x="3" y="1" width="14" height="20" rx="3" fill="url(#gr)" opacity="0.12" transform="translate(2,1)"/><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="#1e3a5f" stroke-width="1.6" fill="none"/><path d="M14 2v6h6" stroke="#1e3a5f" stroke-width="1.6" fill="none"/><circle cx="10" cy="13" r="2" fill="#1e3a5f" opacity="0.25"/><path d="M8 17.5a2 2 0 014 0" stroke="#1e3a5f" stroke-width="1.4" fill="none"/><path d="M15 13h2M15 16h2" stroke="#1e3a5f" stroke-width="1.4" stroke-linecap="round"/></svg>' },
            { v: st?.courses ?? 0, l: 'Kurslar', svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><defs><linearGradient id="gc" x1="0" y1="0" x2="24" y2="24"><stop stop-color="#1e3a5f"/><stop offset="1" stop-color="#2d5a8e"/></linearGradient></defs><rect x="1" y="2" width="22" height="20" rx="3" fill="url(#gc)" opacity="0.12"/><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2V3z" stroke="#1e3a5f" stroke-width="1.6" fill="none"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7V3z" stroke="#1e3a5f" stroke-width="1.6" fill="none"/><path d="M7 8h2M7 11h3M15 8h2M15 11h3" stroke="#1e3a5f" stroke-width="1.3" stroke-linecap="round" opacity="0.5"/></svg>' },
          ].map((s, i) => (
            <div key={i} className={`card anim-scale d${i+1}`} style={{textAlign:'center',padding:14,border:'none'}}>
              <div style={{display:'flex',justifyContent:'center',marginBottom:6}} dangerouslySetInnerHTML={{__html:s.svg}}/>
              <div style={{fontSize:22,fontWeight:900,color:'var(--navy)',letterSpacing:'-0.02em'}}>{s.v}</div>
              <div style={{fontSize:9,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.06em',marginTop:2}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{padding:'24px 16px 0'}}>
        <h2 className="anim-fade d3" style={{fontSize:17,fontWeight:800,marginBottom:12,color:'var(--navy)'}}>Tezkor havolalar</h2>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          {[
            { href: '/posts?type=VACANCY', label: 'Vakansiyalar', sub: 'Ish topish', svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="8" width="18" height="12" rx="2.5" fill="#1e3a5f" opacity="0.08"/><rect x="3" y="8" width="18" height="12" rx="2.5" stroke="#1e3a5f" stroke-width="1.5" fill="none"/><path d="M8 8V6a2 2 0 012-2h4a2 2 0 012 2v2" stroke="#1e3a5f" stroke-width="1.5" fill="none"/><circle cx="12" cy="14" r="1.5" fill="#b8a06a"/><path d="M12 15.5V17" stroke="#b8a06a" stroke-width="1.3"/></svg>', bg: 'linear-gradient(135deg, #e8edf4 0%, #f0f4f9 100%)' },
            { href: '/posts?type=RESUME', label: 'Rezyumelar', sub: 'Ishchi topish', svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" fill="#1e3a5f" opacity="0.08"/><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="#1e3a5f" stroke-width="1.5" fill="none"/><path d="M14 2v6h6" stroke="#1e3a5f" stroke-width="1.5" fill="none"/><circle cx="10" cy="13" r="2" stroke="#b8a06a" stroke-width="1.3" fill="#b8a06a" opacity="0.2"/><path d="M7.5 18a2.5 2.5 0 015 0" stroke="#b8a06a" stroke-width="1.3" fill="none"/><path d="M15 13h2.5M15 16h2.5" stroke="#1e3a5f" stroke-width="1.3" stroke-linecap="round" opacity="0.4"/></svg>', bg: 'linear-gradient(135deg, #e8edf4 0%, #f0f4f9 100%)' },
            { href: '/posts?type=COURSE', label: 'Kurslar', sub: "O'rganish", svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5z" fill="#1e3a5f" opacity="0.1"/><path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#1e3a5f" stroke-width="1.5" fill="none"/><path d="M6 9.5v5.5a6 4 0 0012 0V9.5" stroke="#1e3a5f" stroke-width="1.5" fill="none"/><path d="M22 7v7" stroke="#b8a06a" stroke-width="1.5" stroke-linecap="round"/><circle cx="22" cy="15" r="1" fill="#b8a06a"/></svg>', bg: 'linear-gradient(135deg, #f7f3e8 0%, #faf7f0 100%)' },
            { href: '/posts?type=MENTOR', label: 'Mentorlar', sub: "Yo'l ko'rsatish", svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="7" r="3.5" fill="#1e3a5f" opacity="0.1" stroke="#1e3a5f" stroke-width="1.5"/><path d="M2 21a7 7 0 0114 0" stroke="#1e3a5f" stroke-width="1.5" fill="none"/><circle cx="18" cy="9" r="2.5" fill="#b8a06a" opacity="0.15" stroke="#b8a06a" stroke-width="1.3"/><path d="M14.5 21a5 5 0 017 0" stroke="#b8a06a" stroke-width="1.3" fill="none"/><path d="M18 6V4M20 7l1-1M16 7l-1-1" stroke="#b8a06a" stroke-width="1" stroke-linecap="round" opacity="0.5"/></svg>', bg: 'linear-gradient(135deg, #f7f3e8 0%, #faf7f0 100%)' },
          ].map((a, i) => (
            <Link key={a.href} href={a.href} className={`card anim-fade d${i+1}`} style={{padding:14,display:'flex',alignItems:'center',gap:12,textDecoration:'none'}}>
              <div style={{width:44,height:44,borderRadius:14,background:a.bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}} dangerouslySetInnerHTML={{__html:a.svg}}/>
              <div>
                <div style={{fontWeight:700,fontSize:13,color:'var(--navy)'}}>{a.label}</div>
                <div style={{fontSize:11,color:'var(--text-muted)',marginTop:1}}>{a.sub}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent */}
      <div style={{padding:'24px 16px 0'}}>
        <div className="anim-fade d4" style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
          <h2 style={{fontSize:17,fontWeight:800,color:'var(--navy)'}}>So'nggi e'lonlar</h2>
          <Link href="/posts" style={{fontSize:13,fontWeight:700,color:'var(--gold)',display:'flex',alignItems:'center',gap:4}}>
            Barchasi
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
          </Link>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {posts.length > 0 ? posts.map((post, i) => (
            <div key={post.id} className={`anim-fade d${Math.min(i+1,6)}`}><PostCard post={post} /></div>
          )) : (
            <div className="card anim-fade" style={{textAlign:'center',padding:'40px 20px'}}>
              <div className="anim-float" style={{width:64,height:64,borderRadius:20,background:'var(--navy-light)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
                <svg width="24" height="24" fill="none" stroke="var(--navy)" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M2 8l10 5 10-5"/></svg>
              </div>
              <p style={{fontSize:15,fontWeight:700,marginBottom:4,color:'var(--navy)'}}>Hali e'lonlar yo'q</p>
              <p style={{fontSize:13,color:'var(--text-muted)',marginBottom:16}}>Birinchi bo'lib e'lon joylashtiring!</p>
              <Link href="/create" className="btn btn-primary btn-sm" style={{display:'inline-flex'}}>
                E'lon yaratish
              </Link>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
