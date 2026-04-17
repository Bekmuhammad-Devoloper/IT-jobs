'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTelegram } from '@/hooks/useTelegram';
import { api } from '@/lib/api';
import BottomNav from '@/components/BottomNav';

const TYPES = [
  { v: 'VACANCY', l: 'Vakansiya', d: 'Ishchi qidirish', svg: '<svg width="22" height="22" fill="none" stroke="#1e3a5f" stroke-width="1.7" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>', bg: '#e8edf4' },
  { v: 'RESUME', l: 'Rezyume', d: 'Ish topish', svg: '<svg width="22" height="22" fill="none" stroke="#1e3a5f" stroke-width="1.7" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>', bg: '#e8edf4' },
  { v: 'COURSE', l: 'Kurs', d: "O'rgatish", svg: '<svg width="22" height="22" fill="none" stroke="#1e3a5f" stroke-width="1.7" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>', bg: '#e8edf4' },
  { v: 'MENTOR', l: 'Mentorlik', d: 'Mentor sifatida', svg: '<svg width="22" height="22" fill="none" stroke="#1e3a5f" stroke-width="1.7" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M5 21a7 7 0 0114 0"/></svg>', bg: '#e8edf4' },
  { v: 'INTERNSHIP', l: 'Stajirovka', d: 'Amaliyot', svg: '<svg width="22" height="22" fill="none" stroke="#1e3a5f" stroke-width="1.7" viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5"/></svg>', bg: '#e8edf4' },
];
const WORKS = ['Ofis', 'Masofaviy', 'Gibrid', 'Frilanser'];

export default function CreatePage() {
  const router = useRouter();
  const { user } = useTelegram();
  const [step, setStep] = useState(1);
  const [type, setType] = useState('');
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    title:'', description:'', company:'', city:'', salary:'',
    experience:'', workType:'', technologies:'', link:'',
    contactTelegram:'', contactPhone:'', contactEmail:'',
  });

  const set = (k: string, v: string) => setF(p => ({...p,[k]:v}));

  async function submit() {
    if (!f.title.trim()) return;
    setBusy(true);
    try {
      await api.posts.create({...f, type, technologies: f.technologies.split(',').map(t=>t.trim()).filter(Boolean)});
      router.push('/posts');
    } catch(e: any) { console.error(e); alert(e.message || "Xatolik yuz berdi"); }
    finally { setBusy(false); }
  }

  return (
    <div style={{paddingBottom:100,minHeight:'100dvh'}}>
      <div className="glass" style={{position:'sticky',top:0,zIndex:30,padding:'14px 16px',display:'flex',alignItems:'center',gap:12}}>
        <button onClick={() => step>1?setStep(1):router.back()} style={{width:36,height:36,borderRadius:10,background:'#fff',border:'1px solid var(--border-strong)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
          <svg width="18" height="18" fill="none" stroke="var(--navy)" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h1 style={{fontSize:18,fontWeight:900,color:'var(--navy)'}}>{step===1 ? "E'lon turi" : "Yangi e'lon"}</h1>
        {step===2 && (
          <div style={{marginLeft:'auto',display:'flex',gap:3}}>
            <div style={{width:24,height:3,borderRadius:2,background:'var(--navy)'}} />
            <div style={{width:24,height:3,borderRadius:2,background:'var(--border-strong)'}} />
          </div>
        )}
      </div>

      {step === 1 && (
        <div className="anim-fade" style={{padding:'16px',display:'flex',flexDirection:'column',gap:8}}>
          <p style={{fontSize:14,color:'var(--text-muted)',marginBottom:4}}>Qanday e'lon joylashtirasiz?</p>
          {TYPES.map(t => (
            <button key={t.v} className="card" style={{display:'flex',alignItems:'center',gap:14,textAlign:'left',width:'100%',cursor:'pointer',padding:16}} onClick={() => {setType(t.v);setStep(2);}}>
              <div style={{width:46,height:46,borderRadius:14,background:t.bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}} dangerouslySetInnerHTML={{__html:t.svg}}/>
              <div style={{flex:1}}>
                <p style={{fontWeight:700,fontSize:14,color:'var(--navy)'}}>{t.l}</p>
                <p style={{fontSize:12,color:'var(--text-muted)',marginTop:2}}>{t.d}</p>
              </div>
              <svg width="16" height="16" fill="none" stroke="var(--text-muted)" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="anim-fade" style={{padding:'16px',display:'flex',flexDirection:'column',gap:18}}>

          {/* ── RESUME ── */}
          {type === 'RESUME' && (<>
            <FG label="Kasbi / Yo'nalish" req>
              <input className="input" placeholder="Full Stack Developer" value={f.title} onChange={e=>set('title',e.target.value)} />
            </FG>
            <FG label="Maqsad / O'zingiz haqida">
              <textarea className="input" rows={4} placeholder="Qanday ish qidiryapsiz, nimalar qila olasiz..." value={f.description} onChange={e=>set('description',e.target.value)} />
            </FG>
            <FG label="Texnologiyalar" hint="vergul bilan">
              <input className="input" placeholder="React, Node.js, TypeScript, PostgreSQL" value={f.technologies} onChange={e=>set('technologies',e.target.value)} />
            </FG>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <FG label="Hudud"><input className="input" placeholder="Toshkent" value={f.city} onChange={e=>set('city',e.target.value)} /></FG>
              <FG label="Tajriba"><input className="input" placeholder="3+ yil" value={f.experience} onChange={e=>set('experience',e.target.value)} /></FG>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <FG label="Kutilayotgan maosh"><input className="input" placeholder="100$ - 300$" value={f.salary} onChange={e=>set('salary',e.target.value)} /></FG>
              <FG label="Ish turi">
                <select className="input" value={f.workType} onChange={e=>set('workType',e.target.value)} style={{height:44}}>
                  <option value="">Tanlang</option>
                  {WORKS.map(w=><option key={w} value={w}>{w}</option>)}
                </select>
              </FG>
            </div>
            <FG label="Murojaat qilish vaqti">
              <input className="input" placeholder="10:00 - 19:00" value={f.link} onChange={e=>set('link',e.target.value)} />
            </FG>
          </>)}

          {/* ── VACANCY ── */}
          {type === 'VACANCY' && (<>
            <FG label="Lavozim nomi" req>
              <input className="input" placeholder="Senior React Developer" value={f.title} onChange={e=>set('title',e.target.value)} />
            </FG>
            <FG label="Tavsif">
              <textarea className="input" rows={4} placeholder="Vazifalar, talablar, imkoniyatlar..." value={f.description} onChange={e=>set('description',e.target.value)} />
            </FG>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <FG label="Kompaniya"><input className="input" placeholder="Kompaniya nomi" value={f.company} onChange={e=>set('company',e.target.value)} /></FG>
              <FG label="Shahar"><input className="input" placeholder="Toshkent" value={f.city} onChange={e=>set('city',e.target.value)} /></FG>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <FG label="Maosh"><input className="input" placeholder="1000 - 2000 $" value={f.salary} onChange={e=>set('salary',e.target.value)} /></FG>
              <FG label="Tajriba"><input className="input" placeholder="3+ yil" value={f.experience} onChange={e=>set('experience',e.target.value)} /></FG>
            </div>
            <FG label="Ish turi">
              <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                {WORKS.map(w => (
                  <button key={w} type="button" onClick={() => set('workType',w)}
                    style={{fontSize:12,fontWeight:700,padding:'8px 16px',borderRadius:10,border:f.workType===w?'2px solid var(--navy)':'2px solid var(--border-strong)',background:f.workType===w?'var(--navy-light)':'#fff',color:f.workType===w?'var(--navy)':'var(--text-secondary)',cursor:'pointer',transition:'all 0.15s'}}>
                    {w}
                  </button>
                ))}
              </div>
            </FG>
            <FG label="Texnologiyalar" hint="vergul bilan">
              <input className="input" placeholder="React, Node.js, TypeScript" value={f.technologies} onChange={e=>set('technologies',e.target.value)} />
            </FG>
            <FG label="Havola">
              <input className="input" placeholder="https://..." value={f.link} onChange={e=>set('link',e.target.value)} />
            </FG>
          </>)}

          {/* ── MENTOR ── */}
          {type === 'MENTOR' && (<>
            <FG label="Mentorlik yo'nalishi" req>
              <input className="input" placeholder="Backend Development, DevOps..." value={f.title} onChange={e=>set('title',e.target.value)} />
            </FG>
            <FG label="O'zingiz haqida">
              <textarea className="input" rows={4} placeholder="Tajribangiz, nimalarni o'rgata olasiz..." value={f.description} onChange={e=>set('description',e.target.value)} />
            </FG>
            <FG label="Texnologiyalar" hint="vergul bilan">
              <input className="input" placeholder="Node.js, Docker, PostgreSQL" value={f.technologies} onChange={e=>set('technologies',e.target.value)} />
            </FG>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <FG label="Tajriba"><input className="input" placeholder="5+ yil" value={f.experience} onChange={e=>set('experience',e.target.value)} /></FG>
              <FG label="Hudud"><input className="input" placeholder="Toshkent / Onlayn" value={f.city} onChange={e=>set('city',e.target.value)} /></FG>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <FG label="Narxi"><input className="input" placeholder="50$ / oy" value={f.salary} onChange={e=>set('salary',e.target.value)} /></FG>
              <FG label="Format">
                <select className="input" value={f.workType} onChange={e=>set('workType',e.target.value)} style={{height:44}}>
                  <option value="">Tanlang</option>
                  <option value="Onlayn">Onlayn</option>
                  <option value="Oflayn">Oflayn</option>
                  <option value="Gibrid">Gibrid</option>
                </select>
              </FG>
            </div>
          </>)}

          {/* ── COURSE ── */}
          {type === 'COURSE' && (<>
            <FG label="Kurs nomi" req>
              <input className="input" placeholder="Node.js Full Course" value={f.title} onChange={e=>set('title',e.target.value)} />
            </FG>
            <FG label="Tavsif">
              <textarea className="input" rows={4} placeholder="Kurs haqida batafsil ma'lumot..." value={f.description} onChange={e=>set('description',e.target.value)} />
            </FG>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <FG label="O'quv markaz / Muallif"><input className="input" placeholder="Najot Ta'lim" value={f.company} onChange={e=>set('company',e.target.value)} /></FG>
              <FG label="Shahar"><input className="input" placeholder="Toshkent / Onlayn" value={f.city} onChange={e=>set('city',e.target.value)} /></FG>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <FG label="Narxi"><input className="input" placeholder="500 000 so'm" value={f.salary} onChange={e=>set('salary',e.target.value)} /></FG>
              <FG label="Format">
                <select className="input" value={f.workType} onChange={e=>set('workType',e.target.value)} style={{height:44}}>
                  <option value="">Tanlang</option>
                  <option value="Onlayn">Onlayn</option>
                  <option value="Oflayn">Oflayn</option>
                  <option value="Gibrid">Gibrid</option>
                </select>
              </FG>
            </div>
            <FG label="Texnologiyalar" hint="vergul bilan">
              <input className="input" placeholder="React, Node.js" value={f.technologies} onChange={e=>set('technologies',e.target.value)} />
            </FG>
            <FG label="Havola">
              <input className="input" placeholder="https://..." value={f.link} onChange={e=>set('link',e.target.value)} />
            </FG>
          </>)}

          {/* ── INTERNSHIP ── */}
          {type === 'INTERNSHIP' && (<>
            <FG label="Stajirovka nomi" req>
              <input className="input" placeholder="Junior Frontend Internship" value={f.title} onChange={e=>set('title',e.target.value)} />
            </FG>
            <FG label="Tavsif">
              <textarea className="input" rows={4} placeholder="Nimalar o'rganiladi, talablar..." value={f.description} onChange={e=>set('description',e.target.value)} />
            </FG>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <FG label="Kompaniya"><input className="input" placeholder="Kompaniya nomi" value={f.company} onChange={e=>set('company',e.target.value)} /></FG>
              <FG label="Shahar"><input className="input" placeholder="Toshkent" value={f.city} onChange={e=>set('city',e.target.value)} /></FG>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <FG label="Narxi / Stipendiya"><input className="input" placeholder="Bepul / 200$" value={f.salary} onChange={e=>set('salary',e.target.value)} /></FG>
              <FG label="Talab"><input className="input" placeholder="Boshlang'ich bilim" value={f.experience} onChange={e=>set('experience',e.target.value)} /></FG>
            </div>
            <FG label="Ish turi">
              <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                {WORKS.map(w => (
                  <button key={w} type="button" onClick={() => set('workType',w)}
                    style={{fontSize:12,fontWeight:700,padding:'8px 16px',borderRadius:10,border:f.workType===w?'2px solid var(--navy)':'2px solid var(--border-strong)',background:f.workType===w?'var(--navy-light)':'#fff',color:f.workType===w?'var(--navy)':'var(--text-secondary)',cursor:'pointer',transition:'all 0.15s'}}>
                    {w}
                  </button>
                ))}
              </div>
            </FG>
            <FG label="Texnologiyalar" hint="vergul bilan">
              <input className="input" placeholder="React, Git, HTML/CSS" value={f.technologies} onChange={e=>set('technologies',e.target.value)} />
            </FG>
          </>)}

          {/* ── Aloqa (hammasi uchun umumiy) ── */}
          <div className="divider" />
          <h3 style={{fontWeight:800,fontSize:14,color:'var(--navy)',display:'flex',alignItems:'center',gap:6}}>
            <svg width="15" height="15" fill="none" stroke="var(--navy)" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.11 2 2 0 014.11 2h3"/></svg>
            Aloqa ma&apos;lumotlari
          </h3>
          <FG label="Telegram"><input className="input" placeholder="@username" value={f.contactTelegram} onChange={e=>set('contactTelegram',e.target.value)} /></FG>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <FG label="Telefon"><input className="input" type="tel" placeholder="+998..." value={f.contactPhone} onChange={e=>set('contactPhone',e.target.value)} /></FG>
            <FG label="Email"><input className="input" type="email" placeholder="email@..." value={f.contactEmail} onChange={e=>set('contactEmail',e.target.value)} /></FG>
          </div>

          <button className="btn btn-primary" style={{width:'100%',marginTop:8}} disabled={!f.title.trim()||busy} onClick={submit}>
            {busy ? 'Yuklanmoqda...' : "E'lonni joylash"}
          </button>
        </div>
      )}
      <BottomNav />
    </div>
  );
}

function FG({label,req,hint,children}:{label:string;req?:boolean;hint?:string;children:React.ReactNode}) {
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
        <label style={{fontSize:13,fontWeight:700,color:'var(--navy)'}}>{label}</label>
        {req && <span style={{color:'var(--red)',fontSize:12}}>*</span>}
        {hint && <span style={{fontSize:11,color:'var(--text-muted)'}}>({hint})</span>}
      </div>
      {children}
    </div>
  );
}
