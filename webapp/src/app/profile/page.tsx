'use client';
import { useEffect, useState } from 'react';
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
  const [f, setF] = useState({firstName:'',lastName:'',profession:'',bio:'',skills:'',city:'',github:'',linkedin:'',portfolio:'',contactPhone:''});

  // Get Telegram user data directly from window (always available in Telegram WebApp)
  const tgUser = typeof window !== 'undefined' ? window.Telegram?.WebApp?.initDataUnsafe?.user : null;
  const photoUrl = tgUser?.photo_url || null;
  const tgFirstName = tgUser?.first_name || null;
  const tgLastName = tgUser?.last_name || null;

  useEffect(() => {
    // If authenticated and have user, fetch profile
    if (user?.id) {
      api.users.getProfile().then((r: any) => {
        const p = r.data || r; setProfile(p);
        setF({firstName:p.firstName||'',lastName:p.lastName||'',profession:p.profession||'',bio:p.bio||'',skills:p.skills||'',city:p.city||'',github:p.github||'',linkedin:p.linkedin||'',portfolio:p.portfolio||'',contactPhone:p.contactPhone||''});
      }).catch(console.error).finally(() => setLoading(false));
    } else if (!storeLoading) {
      // Store finished loading but no user — use Telegram data directly
      setLoading(false);
      if (tgFirstName) {
        setF(prev => ({ ...prev, firstName: tgFirstName || '', lastName: tgLastName || '' }));
      }
    }
  }, [user, storeLoading, tgFirstName, tgLastName]);

  const setField = (k:string,v:string) => setF(p=>({...p,[k]:v}));

  async function save() {
    setSaving(true);
    try { await api.users.updateProfile(f); setEditing(false); } catch(e) { alert('Xatolik'); }
    finally { setSaving(false); }
  }

  // Show loading only briefly while store initializes
  if (storeLoading && loading) return <LoadingSpinner />;

  // Use Telegram name as primary, fallback to profile data
  const displayName = tgFirstName || f.firstName || user?.firstName || 'Foydalanuvchi';
  const displayLastName = tgLastName || f.lastName || '';

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
              <PF label="Ism" value={f.firstName} onChange={v=>set('firstName',v)} />
              <PF label="Familiya" value={f.lastName} onChange={v=>set('lastName',v)} />
            </div>
            <PF label="Kasb" value={f.profession} onChange={v=>set('profession',v)} placeholder="Frontend Developer" />
            <PF label="Bio" value={f.bio} onChange={v=>set('bio',v)} placeholder="Qisqacha o'zingiz haqida..." textarea />
            <PF label="Ko'nikmalar" value={f.skills} onChange={v=>set('skills',v)} placeholder="React, TypeScript" />
            <PF label="Shahar" value={f.city} onChange={v=>set('city',v)} placeholder="Toshkent" />
            <div className="divider" />
            <h3 style={{fontWeight:800,fontSize:14,color:'var(--navy)'}}>Ijtimoiy tarmoqlar</h3>
            <PF label="GitHub" value={f.github} onChange={v=>set('github',v)} />
            <PF label="LinkedIn" value={f.linkedin} onChange={v=>set('linkedin',v)} />
            <PF label="Portfolio" value={f.portfolio} onChange={v=>set('portfolio',v)} />
            <PF label="Telefon" value={f.contactPhone} onChange={v=>set('contactPhone',v)} placeholder="+998..." />
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
