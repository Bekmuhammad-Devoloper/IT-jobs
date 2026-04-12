'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { Post } from '@/types';
import { getPostTypeLabel, getPostTypeColor, formatDate, generateFingerprint } from '@/lib/utils';
import BottomNav from '@/components/BottomNav';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = Number(params.id);
    api.posts.getOne(id).then((res: any) => {
      setPost(res.data || res);
      api.posts.addView(id, generateFingerprint()).catch(() => {});
    }).catch(console.error).finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <LoadingSpinner />;
  if (!post) return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'100dvh',gap:16}}>
      <div style={{width:64,height:64,borderRadius:20,background:'var(--navy-light)',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <svg width="24" height="24" fill="none" stroke="var(--navy)" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
      </div>
      <p style={{fontWeight:800,fontSize:18,color:'var(--navy)'}}>E'lon topilmadi</p>
      <button className="btn btn-primary btn-sm" onClick={() => router.push('/posts')}>Orqaga</button>
    </div>
  );

  const c = getPostTypeColor(post.type);

  return (
    <div style={{paddingBottom:100,minHeight:'100dvh'}}>
      <div className="glass" style={{position:'sticky',top:0,zIndex:30,padding:'12px 16px',display:'flex',alignItems:'center',gap:12,borderBottom:'1px solid var(--border)'}}>
        <button onClick={() => router.back()} style={{width:36,height:36,borderRadius:10,background:'#fff',border:'1px solid var(--border-strong)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
          <svg width="18" height="18" fill="none" stroke="var(--navy)" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
        </button>
        <span className="badge" style={{background:c+'14',color:c,fontSize:10}}>{getPostTypeLabel(post.type)}</span>
      </div>

      <div className="anim-fade" style={{padding:'20px 16px',display:'flex',flexDirection:'column',gap:16}}>
        <h1 style={{fontSize:22,fontWeight:900,lineHeight:1.25,letterSpacing:'-0.02em',color:'var(--navy)'}}>{post.title}</h1>

        <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
          {post.company && <Chip svg={<svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>} text={post.company} />}
          {post.city && <Chip svg={<svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>} text={post.city} />}
          {post.salary && <Chip svg={<svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>} text={post.salary} highlight />}
          {post.workType && <Chip svg={<svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>} text={post.workType} />}
          {post.experience && <Chip svg={<svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>} text={post.experience} />}
        </div>

        <div style={{display:'flex',alignItems:'center',gap:16,fontSize:12,color:'var(--text-muted)'}}>
          <span style={{display:'flex',alignItems:'center',gap:4}}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            {(post as any).viewCount || 0} ko'rishlar
          </span>
          <span>{formatDate(post.createdAt)}</span>
        </div>

        {post.technologies && post.technologies.length > 0 && (
          <div>
            <h3 style={{fontWeight:800,fontSize:14,marginBottom:10,color:'var(--navy)',display:'flex',alignItems:'center',gap:6}}>
              <svg width="15" height="15" fill="none" stroke="var(--navy)" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>
              Texnologiyalar
            </h3>
            <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
              {post.technologies.map((t: any) => (
                <span key={typeof t==='string'?t:t.id} style={{fontSize:11,fontWeight:700,padding:'5px 12px',borderRadius:8,background:'var(--navy-light)',color:'var(--navy)'}}>
                  {typeof t==='string'?t:t.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {post.description && (
          <div>
            <h3 style={{fontWeight:800,fontSize:14,marginBottom:8,color:'var(--navy)',display:'flex',alignItems:'center',gap:6}}>
              <svg width="15" height="15" fill="none" stroke="var(--navy)" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/><path d="M14 2v6h6M16 13H8M16 17H8"/></svg>
              Tavsif
            </h3>
            <p style={{fontSize:14,whiteSpace:'pre-wrap',lineHeight:1.7,color:'var(--text-secondary)'}}>{post.description}</p>
          </div>
        )}

        <div className="card" style={{background:'var(--navy-50)',borderColor:'rgba(30,58,95,0.08)'}}>
          <h3 style={{fontWeight:800,fontSize:14,marginBottom:12,color:'var(--navy)',display:'flex',alignItems:'center',gap:6}}>
            <svg width="15" height="15" fill="none" stroke="var(--navy)" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.11 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
            Aloqa
          </h3>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {post.contactTelegram && <CRow icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><path d="M21 5L2 12.5l7 1M21 5l-4 15-7-8.5M21 5l-12 8.5"/></svg>} label="Telegram" value={post.contactTelegram} href={`https://t.me/${post.contactTelegram.replace('@','')}`} />}
            {post.contactPhone && <CRow icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="3"/><line x1="12" y1="18" x2="12" y2="18.01"/></svg>} label="Telefon" value={post.contactPhone} href={`tel:${post.contactPhone}`} />}
            {post.contactEmail && <CRow icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M2 7l10 6 10-6"/></svg>} label="Email" value={post.contactEmail} href={`mailto:${post.contactEmail}`} />}
            {post.link && <CRow icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>} label="Havola" value="Ochish" href={post.link} />}
          </div>
        </div>

        {post.author && (
          <div className="card">
            <h3 style={{fontWeight:800,fontSize:14,marginBottom:12,color:'var(--navy)',display:'flex',alignItems:'center',gap:6}}>
              <svg width="15" height="15" fill="none" stroke="var(--navy)" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M5 21a7 7 0 0114 0"/></svg>
              Muallif
            </h3>
            <div style={{display:'flex',alignItems:'center',gap:14}}>
              <div style={{width:48,height:48,borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,var(--navy),#2a4f7a)',color:'#fff',fontSize:20,fontWeight:800,flexShrink:0}}>
                {post.author.firstName?.[0] || '?'}
              </div>
              <div style={{flex:1}}>
                <p style={{fontWeight:700,fontSize:14}}>{post.author.firstName} {post.author.lastName || ''}</p>
                {post.author.profession && <p style={{fontSize:12,color:'var(--text-muted)',marginTop:2}}>{post.author.profession}</p>}
              </div>
              {post.author.rating > 0 && <span style={{fontSize:12,fontWeight:800,padding:'6px 14px',borderRadius:10,background:'var(--gold-light)',color:'var(--gold-dark)'}}>&#9733; {post.author.rating}</span>}
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

function Chip({svg,text,highlight}:{svg:React.ReactNode;text:string;highlight?:boolean}) {
  return <span style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:12,fontWeight:600,padding:'6px 12px',borderRadius:8,background:highlight?'var(--gold-light)':'var(--bg)',color:highlight?'var(--gold-dark)':'var(--text-secondary)'}}>{svg} {text}</span>;
}

function CRow({icon,label,value,href}:{icon:React.ReactNode;label:string;value:string;href:string}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',gap:12,padding:12,borderRadius:12,background:'#fff',textDecoration:'none',transition:'background 0.15s'}}>
      <div style={{width:36,height:36,borderRadius:10,background:'var(--navy-light)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--navy)',flexShrink:0}}>{icon}</div>
      <div>
        <div style={{fontSize:10,color:'var(--text-muted)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em'}}>{label}</div>
        <div style={{fontSize:14,fontWeight:600,color:'var(--navy)'}}>{value}</div>
      </div>
    </a>
  );
}
