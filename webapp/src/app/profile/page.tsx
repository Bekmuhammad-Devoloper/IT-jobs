'use client';
import { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '@/store';
import { api } from '@/lib/api';
import BottomNav from '@/components/BottomNav';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ProfilePage() {
  const { user, telegram, isLoading: storeLoading, isAuthenticated } = useAppStore();
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [f, setF] = useState({firstName:'',lastName:'',profession:'',bio:'',skills:'',city:'',github:'',linkedin:'',portfolio:'',contactPhone:'',resumeUrl:''});
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);

  // Telegram user data via state (not render-time read, to handle SDK load timing)
  const [tgPhotoUrl, setTgPhotoUrl] = useState<string|null>(null);
  const [tgFirstName, setTgFirstName] = useState<string|null>(null);
  const [tgLastName, setTgLastName] = useState<string|null>(null);
  const [tgUsername, setTgUsername] = useState<string|null>(null);

  // Read Telegram user data - retry until SDK loads
  useEffect(() => {
    let cancelled = false;
    const readTg = (attempt = 0) => {
      if (cancelled) return;
      const u = window.Telegram?.WebApp?.initDataUnsafe?.user;
      if (u) {
        setTgFirstName(u.first_name || null);
        setTgLastName(u.last_name || null);
        setTgPhotoUrl(u.photo_url || null);
        setTgUsername(u.username || null);
      } else if (attempt < 30) {
        setTimeout(() => readTg(attempt + 1), 100);
      }
    };
    readTg();
    return () => { cancelled = true; };
  }, []);

  // Fetch profile when user is authenticated from store
  useEffect(() => {
    if (user?.id) {
      api.users.getProfile().then((r: any) => {
        const p = r.data || r; setProfile(p);
        setF({firstName:p.firstName||'',lastName:p.lastName||'',profession:p.profession||'',bio:p.bio||'',skills:p.skills||'',city:p.city||'',github:p.github||'',linkedin:p.linkedin||'',portfolio:p.portfolio||'',contactPhone:p.contactPhone||'',resumeUrl:p.resumeUrl||''});
      }).catch(console.error).finally(() => setLoading(false));
      // Load user's posts
      setPostsLoading(true);
      api.posts.getMy(1).then((r: any) => {
        const data = r.data?.data || r.data || [];
        setMyPosts(Array.isArray(data) ? data : []);
      }).catch(console.error).finally(() => setPostsLoading(false));
    } else if (!storeLoading) {
      setLoading(false);
    }
  }, [user, storeLoading]);

  // When Telegram data arrives and we don't have profile data yet, prefill names
  useEffect(() => {
    if (tgFirstName && !profile) {
      setF(prev => ({
        ...prev,
        firstName: prev.firstName || tgFirstName || '',
        lastName: prev.lastName || tgLastName || '',
      }));
    }
  }, [tgFirstName, tgLastName, profile]);

  const setField = (k:string,v:string) => setF(p=>({...p,[k]:v}));

  async function save() {
    setSaving(true);
    try { await api.users.updateProfile(f); setEditing(false); } catch(e) { alert('Xatolik'); }
    finally { setSaving(false); }
  }

  // Show loading only briefly while store initializes
  if (storeLoading && loading) return <LoadingSpinner />;

  // Priority: store user > Telegram data > form data > fallback
  const displayName = user?.firstName || tgFirstName || f.firstName || 'Foydalanuvchi';
  const displayLastName = user?.lastName || tgLastName || f.lastName || '';
  const photoUrl = tgPhotoUrl || user?.photoUrl || profile?.photoUrl;

  return (
    <div style={{paddingBottom:100,minHeight:'100dvh'}}>
      <div className="gradient-hero" style={{padding:'28px 20px 56px',position:'relative'}}>
        <div style={{position:'relative',zIndex:2,display:'flex',alignItems:'center',gap:16}}>
          {photoUrl ? (
            <img src={photoUrl} alt="avatar" style={{width:60,height:60,borderRadius:20,objectFit:'cover',border:'2px solid rgba(184,160,106,0.3)',flexShrink:0}} />
          ) : (
            <div style={{width:60,height:60,borderRadius:20,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,fontWeight:800,color:'#fff',background:'rgba(184,160,106,0.2)',border:'2px solid rgba(184,160,106,0.3)',backdropFilter:'blur(10px)',flexShrink:0}}>
              {displayName?.[0] || '?'}
            </div>
          )}
          <div style={{flex:1}}>
            <h1 style={{fontSize:18,fontWeight:800,color:'#fff'}}>{displayName} {displayLastName}</h1>
            {f.profession && <p style={{color:'rgba(255,255,255,0.5)',fontSize:13,marginTop:2}}>{f.profession}</p>}
            {profile?.rating > 0 && <span style={{display:'inline-flex',alignItems:'center',gap:4,marginTop:4,fontSize:12,fontWeight:700,color:'var(--gold)'}}>&#9733; {profile.rating}</span>}
          </div>
          {user?.id && (
            <button onClick={() => setEditing(!editing)} style={{width:36,height:36,borderRadius:10,background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
              <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><path d={editing?"M6 18L18 6M6 6l12 12":"M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"}/></svg>
            </button>
          )}
        </div>
      </div>

      <div style={{padding:'0 16px',marginTop:-28,position:'relative',zIndex:10}}>
        {editing ? (
          <div className="card anim-fade" style={{display:'flex',flexDirection:'column',gap:16}}>
            <h2 style={{fontWeight:800,fontSize:15,color:'var(--navy)',display:'flex',alignItems:'center',gap:6}}>
              <svg width="15" height="15" fill="none" stroke="var(--navy)" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              Profilni tahrirlash
            </h2>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <PF label="Ism" value={f.firstName} onChange={v=>setField('firstName',v)} />
              <PF label="Familiya" value={f.lastName} onChange={v=>setField('lastName',v)} />
            </div>
            <PF label="Kasb" value={f.profession} onChange={v=>setField('profession',v)} placeholder="Frontend Developer" />
            <PF label="Bio" value={f.bio} onChange={v=>setField('bio',v)} placeholder="Qisqacha o'zingiz haqida..." textarea />
            <PF label="Ko'nikmalar" value={f.skills} onChange={v=>setField('skills',v)} placeholder="React, TypeScript" />
            <PF label="Shahar" value={f.city} onChange={v=>setField('city',v)} placeholder="Toshkent" />
            <div className="divider" />
            <h3 style={{fontWeight:800,fontSize:14,color:'var(--navy)'}}>Ijtimoiy tarmoqlar</h3>
            <PF label="GitHub" value={f.github} onChange={v=>setField('github',v)} />
            <PF label="LinkedIn" value={f.linkedin} onChange={v=>setField('linkedin',v)} />
            <PF label="Portfolio" value={f.portfolio} onChange={v=>setField('portfolio',v)} />
            <PF label="Telefon" value={f.contactPhone} onChange={v=>setField('contactPhone',v)} placeholder="+998..." />
            
            <div className="divider" />
            <h3 style={{fontWeight:800,fontSize:14,color:'var(--navy)'}}>Rezyume</h3>
            <ResumeUpload resumeUrl={f.resumeUrl} onUploaded={(url: string) => setField('resumeUrl', url)} />

            <button className="btn btn-primary" style={{width:'100%'}} onClick={save} disabled={saving}>{saving?'Saqlanmoqda...':'Saqlash'}</button>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:8}} className="anim-fade">
            {f.bio && (
              <div className="card">
                <h3 style={{fontWeight:800,fontSize:14,marginBottom:8,color:'var(--navy)',display:'flex',alignItems:'center',gap:6}}>
                  <svg width="14" height="14" fill="none" stroke="var(--navy)" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                  Haqida
                </h3>
                <p style={{fontSize:14,color:'var(--text-secondary)',lineHeight:1.6}}>{f.bio}</p>
              </div>
            )}

            {f.skills && (
              <div className="card">
                <h3 style={{fontWeight:800,fontSize:14,marginBottom:10,color:'var(--navy)',display:'flex',alignItems:'center',gap:6}}>
                  <svg width="14" height="14" fill="none" stroke="var(--navy)" strokeWidth="1.8" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  Ko'nikmalar
                </h3>
                <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                  {f.skills.split(',').map(s=>s.trim()).filter(Boolean).map(s => (
                    <span key={s} style={{fontSize:11,fontWeight:700,padding:'5px 12px',borderRadius:8,background:'var(--navy-light)',color:'var(--navy)'}}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="card">
              <h3 style={{fontWeight:800,fontSize:14,marginBottom:12,color:'var(--navy)',display:'flex',alignItems:'center',gap:6}}>
                <svg width="14" height="14" fill="none" stroke="var(--navy)" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
                Statistika
              </h3>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
                {[
                  {v:profile?.postsCount||0, l:"E'lonlar", svg:'<svg width="16" height="16" fill="none" stroke="#1e3a5f" stroke-width="1.7" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/><path d="M14 2v6h6"/></svg>'},
                  {v:profile?.rating||0, l:'Reyting', svg:'<svg width="16" height="16" fill="none" stroke="#b8a06a" stroke-width="1.7" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'},
                  {v:profile?.viewsCount||0, l:"Ko'rishlar", svg:'<svg width="16" height="16" fill="none" stroke="#1e3a5f" stroke-width="1.7" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'},
                ].map((s,i) => (
                  <div key={i} style={{textAlign:'center',padding:12,borderRadius:12,background:'var(--bg)'}}>
                    <div style={{display:'flex',justifyContent:'center',marginBottom:4}} dangerouslySetInnerHTML={{__html:s.svg}}/>
                    <div style={{fontSize:20,fontWeight:900,color:'var(--navy)'}}>{s.v}</div>
                    <div style={{fontSize:9,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em',marginTop:2}}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* My Posts */}
            <div className="card">
              <h3 style={{fontWeight:800,fontSize:14,marginBottom:12,color:'var(--navy)',display:'flex',alignItems:'center',gap:6}}>
                <svg width="14" height="14" fill="none" stroke="var(--navy)" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/><path d="M14 2v6h6"/></svg>
                Mening e&apos;lonlarim
              </h3>
              {postsLoading ? (
                <p style={{fontSize:13,color:'var(--text-muted)',textAlign:'center',padding:16}}>Yuklanmoqda...</p>
              ) : myPosts.length === 0 ? (
                <p style={{fontSize:13,color:'var(--text-muted)',textAlign:'center',padding:16}}>Hali e&apos;lon joylamadingiz</p>
              ) : (
                <div style={{display:'flex',flexDirection:'column',gap:14}}>
                  {myPosts.map((p: any) => {
                    const statusColors: Record<string, {bg:string;color:string;label:string;icon:string}> = {
                      PENDING: {bg:'rgba(234,179,8,0.12)',color:'#b45309',label:'Kutilmoqda',icon:'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'},
                      APPROVED: {bg:'rgba(22,163,74,0.1)',color:'#16a34a',label:'Tasdiqlandi',icon:'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'},
                      REJECTED: {bg:'rgba(220,38,38,0.1)',color:'#dc2626',label:'Rad etilgan',icon:'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'},
                    };
                    const s = statusColors[p.status] || statusColors.PENDING;
                    const typeConfig: Record<string,{label:string;icon:string;bg:string}> = {
                      VACANCY:{label:'Vakansiya',icon:'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0h2a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h2',bg:'rgba(99,102,241,0.1)'},
                      RESUME:{label:'Rezyume',icon:'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',bg:'rgba(14,165,233,0.1)'},
                      COURSE:{label:'Kurs',icon:'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',bg:'rgba(168,85,247,0.1)'},
                      MENTOR:{label:'Mentor',icon:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',bg:'rgba(245,158,11,0.1)'},
                      INTERNSHIP:{label:'Stajirovka',icon:'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',bg:'rgba(16,185,129,0.1)'},
                    };
                    const tc = typeConfig[p.type] || {label:p.type,icon:'M4 6h16M4 12h16M4 18h16',bg:'rgba(30,58,95,0.06)'};
                    const channelLink = p.extra?.channelLink;
                    return (
                      <div key={p.id} style={{borderRadius:16,background:'#fff',border:'1px solid rgba(30,58,95,0.08)',boxShadow:'0 2px 12px rgba(30,58,95,0.06)',overflow:'hidden'}}>
                        {/* Header */}
                        <div style={{padding:'14px 16px',display:'flex',alignItems:'flex-start',gap:12}}>
                          <div style={{width:42,height:42,borderRadius:12,background:tc.bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                            <svg width="20" height="20" fill="none" stroke="var(--navy)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d={tc.icon}/></svg>
                          </div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:15,fontWeight:700,color:'var(--navy)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{p.title}</div>
                            <div style={{display:'flex',alignItems:'center',gap:6,marginTop:5,flexWrap:'wrap'}}>
                              <span style={{fontSize:10,fontWeight:700,padding:'3px 8px',borderRadius:6,background:tc.bg,color:'var(--navy)'}}>{tc.label}</span>
                              <span style={{fontSize:10,fontWeight:700,padding:'3px 8px',borderRadius:6,background:s.bg,color:s.color,display:'flex',alignItems:'center',gap:3}}>
                                <svg width="10" height="10" fill="none" stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d={s.icon}/></svg>
                                {s.label}
                              </span>
                              {p.isClosed && (
                                <span style={{fontSize:10,fontWeight:700,padding:'3px 8px',borderRadius:6,background:'rgba(107,114,128,0.1)',color:'#6b7280',display:'flex',alignItems:'center',gap:3}}>
                                  <svg width="10" height="10" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                                  Yopilgan
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* Footer actions */}
                        <div style={{padding:'0 16px 14px',display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                          <span style={{fontSize:11,color:'var(--text-muted)',display:'flex',alignItems:'center',gap:4}}>
                            <svg width="12" height="12" fill="none" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                            {new Date(p.createdAt).toLocaleDateString('uz-UZ')}
                          </span>
                          <div style={{flex:1}}/>
                          {p.status === 'APPROVED' && channelLink && (
                            <a href={channelLink} target="_blank" rel="noopener noreferrer" style={{fontSize:11,fontWeight:700,padding:'7px 12px',borderRadius:10,background:'var(--navy)',color:'#fff',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:5,transition:'opacity .15s'}}
                              onMouseEnter={e=>(e.currentTarget.style.opacity='0.85')} onMouseLeave={e=>(e.currentTarget.style.opacity='1')}>
                              <svg width="13" height="13" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                              Kanalda
                            </a>
                          )}
                          {p.type === 'VACANCY' && p.status === 'APPROVED' && !p.isClosed && (
                            <a href={`/posts/${p.id}/applications`} style={{fontSize:11,fontWeight:700,padding:'7px 12px',borderRadius:10,background:'var(--navy-light)',color:'var(--navy)',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:5}}>
                              <svg width="13" height="13" fill="none" stroke="var(--navy)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
                              Murojaatlar{p.applicationCount > 0 ? ` (${p.applicationCount})` : ''}
                            </a>
                          )}
                          {p.type === 'VACANCY' && p.status === 'APPROVED' && !p.isClosed && (
                            <button onClick={async () => {
                              if (!confirm('Vakansiyani yopmoqchimisiz? Bu qaytarib bo\'lmaydi.')) return;
                              try {
                                await api.posts.close(p.id);
                                setMyPosts(prev => prev.map(x => x.id === p.id ? {...x, isClosed: true} : x));
                              } catch(e:any) { alert(e.message || 'Xatolik'); }
                            }} style={{fontSize:11,fontWeight:700,padding:'7px 12px',borderRadius:10,background:'rgba(220,38,38,0.06)',color:'#dc2626',border:'1px solid rgba(220,38,38,0.15)',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:5,transition:'background .15s'}}
                              onMouseEnter={e=>(e.currentTarget.style.background='rgba(220,38,38,0.12)')} onMouseLeave={e=>(e.currentTarget.style.background='rgba(220,38,38,0.06)')}>
                              <svg width="13" height="13" fill="none" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                              Yopish
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {(f.city || f.contactPhone || f.github || f.linkedin || f.portfolio) && (
              <div className="card">
                <h3 style={{fontWeight:800,fontSize:14,marginBottom:12,color:'var(--navy)',display:'flex',alignItems:'center',gap:6}}>
                  <svg width="14" height="14" fill="none" stroke="var(--navy)" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                  Ma'lumotlar
                </h3>
                <div style={{display:'flex',flexDirection:'column',gap:10}}>
                  {f.city && <InfoRow svg='<svg width="14" height="14" fill="none" stroke="#1e3a5f" stroke-width="1.7" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>' label="Shahar" value={f.city}/>}
                  {f.contactPhone && <InfoRow svg='<svg width="14" height="14" fill="none" stroke="#1e3a5f" stroke-width="1.7" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="3"/><line x1="12" y1="18" x2="12" y2="18.01"/></svg>' label="Telefon" value={f.contactPhone}/>}
                  {f.github && <InfoRow svg='<svg width="14" height="14" fill="none" stroke="#1e3a5f" stroke-width="1.7" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>' label="GitHub" value={f.github}/>}
                  {f.linkedin && <InfoRow svg='<svg width="14" height="14" fill="none" stroke="#1e3a5f" stroke-width="1.7" viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>' label="LinkedIn" value={f.linkedin}/>}
                  {f.portfolio && <InfoRow svg='<svg width="14" height="14" fill="none" stroke="#1e3a5f" stroke-width="1.7" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>' label="Portfolio" value={f.portfolio}/>}
                  {f.resumeUrl && <InfoRow svg='<svg width="14" height="14" fill="none" stroke="#1e3a5f" stroke-width="1.7" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/><path d="M14 2v6h6"/></svg>' label="Rezyume" value="Yuklangan ✓"/>}
                </div>
              </div>
            )}

            {!f.bio && !f.skills && (
              <div className="card" style={{textAlign:'center',padding:'32px 20px'}}>
                <div className="anim-float" style={{width:56,height:56,borderRadius:18,background:'var(--navy-light)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px'}}>
                  <svg width="22" height="22" fill="none" stroke="var(--navy)" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                </div>
                <p style={{fontSize:14,color:'var(--text-muted)',marginBottom:12}}>Profilingizni to'ldiring</p>
                <button className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>Tahrirlash</button>
              </div>
            )}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

function PF({label,value,onChange,placeholder,textarea}:{label:string;value:string;onChange:(v:string)=>void;placeholder?:string;textarea?:boolean}) {
  return (
    <div>
      <label style={{fontSize:12,fontWeight:700,color:'var(--text-secondary)',display:'block',marginBottom:6}}>{label}</label>
      {textarea ? <textarea className="input" rows={3} placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)} />
        : <input className="input" placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)} />}
    </div>
  );
}

function InfoRow({svg,label,value}:{svg:string;label:string;value:string}) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:12}}>
      <div style={{width:34,height:34,borderRadius:10,background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}} dangerouslySetInnerHTML={{__html:svg}}/>
      <div>
        <div style={{fontSize:10,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em'}}>{label}</div>
        <div style={{fontSize:14,fontWeight:600,color:'var(--navy)'}}>{value}</div>
      </div>
    </div>
  );
}

function ResumeUpload({resumeUrl, onUploaded}:{resumeUrl:string; onUploaded:(url:string)=>void}) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.upload.file(file);
      onUploaded(res.url);
    } catch (err: any) {
      alert(err.message || 'Yuklashda xatolik');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {resumeUrl ? (
        <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderRadius:12,background:'var(--bg)',border:'1.5px solid rgba(30,58,95,0.1)'}}>
          <svg width="20" height="20" fill="none" stroke="var(--navy)" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/><path d="M14 2v6h6"/></svg>
          <a href={resumeUrl} target="_blank" rel="noopener noreferrer" style={{flex:1,fontSize:13,fontWeight:600,color:'var(--navy)',textDecoration:'none'}}>
            Rezyume yuklangan ✓
          </a>
          <label style={{fontSize:12,fontWeight:700,color:'var(--gold)',cursor:'pointer'}}>
            O&apos;zgartirish
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleFile} style={{display:'none'}} />
          </label>
        </div>
      ) : (
        <label style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'16px',borderRadius:12,border:'2px dashed rgba(30,58,95,0.2)',cursor:'pointer',background:'var(--bg)',fontSize:13,fontWeight:600,color:'var(--text-muted)'}}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
          {uploading ? 'Yuklanmoqda...' : 'Rezyume yuklash (PDF, DOC)'}
          <input type="file" accept=".pdf,.doc,.docx" onChange={handleFile} style={{display:'none'}} disabled={uploading} />
        </label>
      )}
    </div>
  );
}
