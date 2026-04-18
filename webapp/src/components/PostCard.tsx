'use client';'use client';'use client';

import type { Post } from '@/types';

import { getPostTypeLabel, getPostTypeColor, timeAgo, truncate } from '@/lib/utils';import type { Post } from '@/types';import type { Post } from '@/types';

import Link from 'next/link';

import { getPostTypeLabel, getPostTypeColor, timeAgo, truncate } from '@/lib/utils';import { getPostTypeLabel, getPostTypeColor, timeAgo, truncate } from '@/lib/utils';

export default function PostCard({ post }: { post: Post }) {

  if (post.type === 'RESUME') return <ResumeCard post={post} />;import Link from 'next/link';import Link from 'next/link';

  return <DefaultCard post={post} />;

}



function ResumeCard({ post }: { post: Post }) {export default function PostCard({ post }: { post: Post }) {export default function PostCard({ post }: { post: Post }) {

  const author = post.author;

  const photoUrl = author?.photoUrl || author?.photo;  if (post.type === 'RESUME') return <ResumeCard post={post} />;  const c = getPostTypeColor(post.type);

  const name = [author?.firstName, author?.lastName].filter(Boolean).join(' ') || 'Nomalum';

  const rating = author?.rating || 0;  return <DefaultCard post={post} />;  return (

  const views = (post as any).views || (post as any).viewCount || 0;

}    <Link href={`/posts/${post.id}`} style={{display:'block',textDecoration:'none'}}>

  return (

    <Link href={`/posts/${post.id}`} style={{ display: 'block', textDecoration: 'none' }}>      <div className="card" style={{padding:16}}>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>

        <div style={{ display: 'flex', gap: 12, padding: '14px 14px 10px' }}>/* ── RESUME — special card ───────────────────────────── */        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>

          <div style={{ flexShrink: 0 }}>

            {photoUrl ? (function ResumeCard({ post }: { post: Post }) {          <span className="badge" style={{background:c+'14',color:c,fontSize:10}}>{getPostTypeLabel(post.type)}</span>

              <img src={photoUrl} alt="" style={{ width: 56, height: 56, borderRadius: 14, objectFit: 'cover', border: '2px solid rgba(184,160,106,0.25)' }} />

            ) : (  const author = post.author;          <span style={{fontSize:11,color:'var(--text-muted)',fontWeight:500}}>{timeAgo(post.createdAt)}</span>

              <div style={{ width: 56, height: 56, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e3a5f, #2d5a8e)', color: '#fff', fontSize: 20, fontWeight: 800 }}>

                {name[0] || '?'}  const photoUrl = author?.photoUrl || author?.photo;        </div>

              </div>

            )}  const name = [author?.firstName, author?.lastName].filter(Boolean).join(' ') || 'Nomaʼlum';        <h3 style={{fontWeight:700,fontSize:15,lineHeight:1.35,marginBottom:8,color:'var(--navy)'}}>{truncate(post.title,55)}</h3>

          </div>

          <div style={{ flex: 1, minWidth: 0 }}>  const rating = author?.rating || 0;        <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:8}}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>

              <div style={{ minWidth: 0 }}>  const views = (post as any).views || (post as any).viewCount || 0;          {post.company && <Tag svg={<svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>} text={post.company}/>}

                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>

                  {post.title || author?.profession || 'Mutaxassis'}          {post.city && <Tag svg={<svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>} text={post.city}/>}

                </div>

                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--navy)', lineHeight: 1.2 }}>  return (        </div>

                  {name}

                </div>    <Link href={`/posts/${post.id}`} style={{ display: 'block', textDecoration: 'none' }}>        {post.salary && (

              </div>

              <div style={{ textAlign: 'right', flexShrink: 0 }}>      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>          <div style={{display:'inline-flex',alignItems:'center',gap:5,background:'var(--gold-light)',color:'var(--gold-dark)',borderRadius:8,padding:'5px 12px',fontSize:12,fontWeight:700,marginBottom:8}}>

                {post.experience && (

                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>        {/* ── Top section ── */}            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>

                    {'📊'} {post.experience}

                  </div>        <div style={{ display: 'flex', gap: 12, padding: '14px 14px 10px' }}>            {post.salary}

                )}

                {post.city && (          {/* Photo */}          </div>

                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap', marginTop: 2 }}>

                    {'📍'} {post.city}          <div style={{ flexShrink: 0 }}>        )}

                  </div>

                )}            {photoUrl ? (        {post.technologies && post.technologies.length > 0 && (

              </div>

            </div>              <img src={photoUrl} alt="" style={{ width: 56, height: 56, borderRadius: 14, objectFit: 'cover', border: '2px solid rgba(184,160,106,0.25)' }} />          <div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:8}}>

            {post.technologies && post.technologies.length > 0 && (

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>            ) : (            {post.technologies.slice(0,4).map((t: any) => (

                {post.technologies.slice(0, 5).map((t: any) => (

                  <span key={typeof t === 'string' ? t : t.id} style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 5, background: 'var(--navy-light)', color: 'var(--navy)' }}>              <div style={{ width: 56, height: 56, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e3a5f, #2d5a8e)', color: '#fff', fontSize: 20, fontWeight: 800 }}>              <span key={typeof t==='string'?t:t.id} style={{fontSize:10,fontWeight:700,padding:'3px 9px',borderRadius:6,background:'var(--navy-light)',color:'var(--navy)'}}>

                    {typeof t === 'string' ? t : t.name}

                  </span>                {name[0] || '?'}                {typeof t==='string'?t:t.name}

                ))}

                {post.technologies.length > 5 && (              </div>              </span>

                  <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 5, background: 'var(--bg)', color: 'var(--text-muted)' }}>

                    +{post.technologies.length - 5}            )}            ))}

                  </span>

                )}          </div>            {post.technologies.length>4 && <span style={{fontSize:10,fontWeight:600,padding:'3px 8px',borderRadius:6,background:'var(--bg)',color:'var(--text-muted)'}}>+{post.technologies.length-4}</span>}

              </div>

            )}          {/* Info */}          </div>

          </div>

        </div>          <div style={{ flex: 1, minWidth: 0 }}>        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:8,borderTop:'1px solid var(--border)',marginTop:2}}>

            {[1, 2, 3, 4, 5].map(i => (

              <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i <= rating ? 'var(--gold)' : 'none'} stroke={i <= rating ? 'var(--gold)' : '#ccc'} strokeWidth="2">              <div style={{ minWidth: 0 }}>          <span style={{display:'flex',alignItems:'center',gap:4,fontSize:11,color:'var(--text-muted)'}}>

                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />

              </svg>                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>

            ))}

          </div>                  {post.title || author?.profession || 'Mutaxassis'}            {(post as any).views||(post as any).viewCount||0}

          {post.salary ? (

            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: 'var(--gold-dark)' }}>                </div>          </span>

              {'💰'} {post.salary}

            </div>                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--navy)', lineHeight: 1.2 }}>          {post.author && (

          ) : <span />}

          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>                  {name}            <div style={{display:'flex',alignItems:'center',gap:6}}>

            {'👁'} {views}

          </span>                </div>              {post.author.photoUrl || post.author.photo ? (

          {author && (

            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>              </div>                <img src={post.author.photoUrl || post.author.photo} alt="" style={{width:22,height:22,borderRadius:7,objectFit:'cover'}}/>

              {photoUrl ? (

                <img src={photoUrl} alt="" style={{ width: 18, height: 18, borderRadius: 6, objectFit: 'cover' }} />              <div style={{ textAlign: 'right', flexShrink: 0 }}>              ) : (

              ) : (

                <div style={{ width: 18, height: 18, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,var(--navy),#2a4f7a)', color: '#fff', fontSize: 9, fontWeight: 800 }}>                {post.experience && (                <div style={{width:22,height:22,borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,var(--navy),#2a4f7a)',color:'#fff',fontSize:10,fontWeight:800}}>{post.author.firstName?.[0]||'?'}</div>

                  {name[0]}

                </div>                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>              )}

              )}

              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)' }}>{author.firstName}</span>                    📊 {post.experience}              <span style={{fontSize:11,fontWeight:600,color:'var(--text-secondary)'}}>{post.author.firstName}</span>

            </div>

          )}                  </div>            </div>

        </div>

      </div>                )}          )}

    </Link>

  );                {post.city && (        </div>

}

                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap', marginTop: 2 }}>      </div>

function DefaultCard({ post }: { post: Post }) {

  const c = getPostTypeColor(post.type);                    📍 {post.city}    </Link>

  return (

    <Link href={`/posts/${post.id}`} style={{ display: 'block', textDecoration: 'none' }}>                  </div>  );

      <div className="card" style={{ padding: 16 }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>                )}}

          <span className="badge" style={{ background: c + '14', color: c, fontSize: 10 }}>{getPostTypeLabel(post.type)}</span>

          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{timeAgo(post.createdAt)}</span>              </div>

        </div>

        <h3 style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.35, marginBottom: 8, color: 'var(--navy)' }}>{truncate(post.title, 55)}</h3>            </div>function Tag({svg,text}:{svg:React.ReactNode;text:string}) {

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>

          {post.company && <Tag svg={<svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></svg>} text={post.company} />}            {/* Technologies */}  return <span style={{display:'inline-flex',alignItems:'center',gap:4,fontSize:11,fontWeight:500,color:'var(--text-secondary)',background:'var(--bg)',padding:'4px 10px',borderRadius:6}}>{svg} {text}</span>;

          {post.city && <Tag svg={<svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" /></svg>} text={post.city} />}

        </div>            {post.technologies && post.technologies.length > 0 && (}

        {post.salary && (

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--gold-light)', color: 'var(--gold-dark)', borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>

            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>                {post.technologies.slice(0, 5).map((t: any) => (

            {post.salary}                  <span key={typeof t === 'string' ? t : t.id} style={{

          </div>                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 5,

        )}                    background: 'var(--navy-light)', color: 'var(--navy)',

        {post.technologies && post.technologies.length > 0 && (                  }}>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>                    {typeof t === 'string' ? t : t.name}

            {post.technologies.slice(0, 4).map((t: any) => (                  </span>

              <span key={typeof t === 'string' ? t : t.id} style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 6, background: 'var(--navy-light)', color: 'var(--navy)' }}>                ))}

                {typeof t === 'string' ? t : t.name}                {post.technologies.length > 5 && (

              </span>                  <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 5, background: 'var(--bg)', color: 'var(--text-muted)' }}>

            ))}                    +{post.technologies.length - 5}

            {post.technologies.length > 4 && <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: 'var(--bg)', color: 'var(--text-muted)' }}>+{post.technologies.length - 4}</span>}                  </span>

          </div>                )}

        )}              </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--border)', marginTop: 2 }}>            )}

          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>          </div>

            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>        </div>

            {(post as any).views || (post as any).viewCount || 0}

          </span>        {/* ── Bottom bar ── */}

          {post.author && (        <div style={{

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>          display: 'flex', alignItems: 'center', justifyContent: 'space-between',

              {post.author.photoUrl || post.author.photo ? (          padding: '8px 14px', borderTop: '1px solid var(--border)', background: 'var(--bg)',

                <img src={post.author.photoUrl || post.author.photo} alt="" style={{ width: 22, height: 22, borderRadius: 7, objectFit: 'cover' }} />        }}>

              ) : (          {/* Rating stars */}

                <div style={{ width: 22, height: 22, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,var(--navy),#2a4f7a)', color: '#fff', fontSize: 10, fontWeight: 800 }}>{post.author.firstName?.[0] || '?'}</div>          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>

              )}            {[1, 2, 3, 4, 5].map(i => (

              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>{post.author.firstName}</span>              <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i <= rating ? 'var(--gold)' : 'none'} stroke={i <= rating ? 'var(--gold)' : '#ccc'} strokeWidth="2">

            </div>                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />

          )}              </svg>

        </div>            ))}

      </div>          </div>

    </Link>

  );          {/* Salary */}

}          {post.salary ? (

            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: 'var(--gold-dark)' }}>

function Tag({ svg, text }: { svg: React.ReactNode; text: string }) {              💰 {post.salary}

  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', background: 'var(--bg)', padding: '4px 10px', borderRadius: 6 }}>{svg} {text}</span>;            </div>

}          ) : <span />}


          {/* Views */}
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
            👁 {views}
          </span>

          {/* Author mini */}
          {author && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              {photoUrl ? (
                <img src={photoUrl} alt="" style={{ width: 18, height: 18, borderRadius: 6, objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 18, height: 18, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,var(--navy),#2a4f7a)', color: '#fff', fontSize: 9, fontWeight: 800 }}>
                  {name[0]}
                </div>
              )}
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)' }}>{author.firstName}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ── Default card (VACANCY, COURSE, etc.) ──────────── */
function DefaultCard({ post }: { post: Post }) {
  const c = getPostTypeColor(post.type);
  return (
    <Link href={`/posts/${post.id}`} style={{ display: 'block', textDecoration: 'none' }}>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span className="badge" style={{ background: c + '14', color: c, fontSize: 10 }}>{getPostTypeLabel(post.type)}</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{timeAgo(post.createdAt)}</span>
        </div>
        <h3 style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.35, marginBottom: 8, color: 'var(--navy)' }}>{truncate(post.title, 55)}</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {post.company && <Tag svg={<svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></svg>} text={post.company} />}
          {post.city && <Tag svg={<svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" /></svg>} text={post.city} />}
        </div>
        {post.salary && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--gold-light)', color: 'var(--gold-dark)', borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
            {post.salary}
          </div>
        )}
        {post.technologies && post.technologies.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
            {post.technologies.slice(0, 4).map((t: any) => (
              <span key={typeof t === 'string' ? t : t.id} style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 6, background: 'var(--navy-light)', color: 'var(--navy)' }}>
                {typeof t === 'string' ? t : t.name}
              </span>
            ))}
            {post.technologies.length > 4 && <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: 'var(--bg)', color: 'var(--text-muted)' }}>+{post.technologies.length - 4}</span>}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--border)', marginTop: 2 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
            {(post as any).views || (post as any).viewCount || 0}
          </span>
          {post.author && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {post.author.photoUrl || post.author.photo ? (
                <img src={post.author.photoUrl || post.author.photo} alt="" style={{ width: 22, height: 22, borderRadius: 7, objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 22, height: 22, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,var(--navy),#2a4f7a)', color: '#fff', fontSize: 10, fontWeight: 800 }}>{post.author.firstName?.[0] || '?'}</div>
              )}
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>{post.author.firstName}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function Tag({ svg, text }: { svg: React.ReactNode; text: string }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', background: 'var(--bg)', padding: '4px 10px', borderRadius: 6 }}>{svg} {text}</span>;
}
