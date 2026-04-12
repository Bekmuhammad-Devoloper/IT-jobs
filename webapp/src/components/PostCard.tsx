'use client';
import type { Post } from '@/types';
import { getPostTypeLabel, getPostTypeColor, timeAgo, truncate } from '@/lib/utils';
import Link from 'next/link';

export default function PostCard({ post }: { post: Post }) {
  const c = getPostTypeColor(post.type);
  return (
    <Link href={`/posts/${post.id}`} style={{display:'block',textDecoration:'none'}}>
      <div className="card" style={{padding:16}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
          <span className="badge" style={{background:c+'14',color:c,fontSize:10}}>{getPostTypeLabel(post.type)}</span>
          <span style={{fontSize:11,color:'var(--text-muted)',fontWeight:500}}>{timeAgo(post.createdAt)}</span>
        </div>
        <h3 style={{fontWeight:700,fontSize:15,lineHeight:1.35,marginBottom:8,color:'var(--navy)'}}>{truncate(post.title,55)}</h3>
        <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:8}}>
          {post.company && <Tag svg={<svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>} text={post.company}/>}
          {post.city && <Tag svg={<svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>} text={post.city}/>}
        </div>
        {post.salary && (
          <div style={{display:'inline-flex',alignItems:'center',gap:5,background:'var(--gold-light)',color:'var(--gold-dark)',borderRadius:8,padding:'5px 12px',fontSize:12,fontWeight:700,marginBottom:8}}>
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
            {post.salary}
          </div>
        )}
        {post.technologies && post.technologies.length > 0 && (
          <div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:8}}>
            {post.technologies.slice(0,4).map((t: any) => (
              <span key={typeof t==='string'?t:t.id} style={{fontSize:10,fontWeight:700,padding:'3px 9px',borderRadius:6,background:'var(--navy-light)',color:'var(--navy)'}}>
                {typeof t==='string'?t:t.name}
              </span>
            ))}
            {post.technologies.length>4 && <span style={{fontSize:10,fontWeight:600,padding:'3px 8px',borderRadius:6,background:'var(--bg)',color:'var(--text-muted)'}}>+{post.technologies.length-4}</span>}
          </div>
        )}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:8,borderTop:'1px solid var(--border)',marginTop:2}}>
          <span style={{display:'flex',alignItems:'center',gap:4,fontSize:11,color:'var(--text-muted)'}}>
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            {(post as any).views||(post as any).viewCount||0}
          </span>
          {post.author && (
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <div style={{width:22,height:22,borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,var(--navy),#2a4f7a)',color:'#fff',fontSize:10,fontWeight:800}}>{post.author.firstName?.[0]||'?'}</div>
              <span style={{fontSize:11,fontWeight:600,color:'var(--text-secondary)'}}>{post.author.firstName}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function Tag({svg,text}:{svg:React.ReactNode;text:string}) {
  return <span style={{display:'inline-flex',alignItems:'center',gap:4,fontSize:11,fontWeight:500,color:'var(--text-secondary)',background:'var(--bg)',padding:'4px 10px',borderRadius:6}}>{svg} {text}</span>;
}
