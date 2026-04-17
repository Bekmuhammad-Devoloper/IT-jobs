'use client';'use client';

import { useEffect, useState } from 'react';import { useEffect, useState } from 'react';

import BottomNav from '@/components/BottomNav';import BottomNav from '@/components/BottomNav';

import { api } from '@/lib/api';import { api } from '@/lib/api';



interface ServiceChild {interface ServiceItem {

  id: number;  id: number;

  title: string;  title: string;

  description?: string;  description?: string;

  price?: string;  price?: string;

  order: number;  icon?: string;

  isActive: boolean;  link?: string;

}  order: number;

  isActive: boolean;

interface ServiceCategory {}

  id: number;

  title: string;const defaultIcon = '<svg width="22" height="22" fill="none" stroke="#1e3a5f" stroke-width="1.7" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>';

  description?: string;

  icon?: string;export default function ServicesPage() {

  order: number;  const [services, setServices] = useState<ServiceItem[]>([]);

  isActive: boolean;  const [loading, setLoading] = useState(true);

  children: ServiceChild[];

}  useEffect(() => {

    api.services.getAll()

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';      .then((res: any) => {

        const data = Array.isArray(res) ? res : (res.data || []);

function formatPrice(p?: string) {        setServices(data);

  if (!p) return '';      })

  const num = parseInt(p.replace(/\D/g, ''));      .catch(() => {})

  if (!num) return p;      .finally(() => setLoading(false));

  return num.toLocaleString('uz-UZ') + " so'm";  }, []);

}

  return (

export default function ServicesPage() {    <div style={{paddingBottom:100,minHeight:'100dvh'}}>

  const [categories, setCategories] = useState<ServiceCategory[]>([]);      <div className="glass" style={{position:'sticky',top:0,zIndex:30,padding:'18px 16px 12px'}}>

  const [loading, setLoading] = useState(true);        <h1 style={{fontSize:20,fontWeight:900,color:'var(--navy)',marginBottom:2}}>Xizmatlar</h1>

  const [openCat, setOpenCat] = useState<number | null>(null);        <p style={{fontSize:13,color:'var(--text-muted)'}}>Premium IT xizmatlar</p>

      </div>

  useEffect(() => {

    api.services.getAll()      <div style={{padding:'12px 16px',display:'flex',flexDirection:'column',gap:8}}>

      .then((res: any) => {        {loading ? (

        const data = Array.isArray(res) ? res : (res.data || []);          <div style={{textAlign:'center',padding:40,color:'var(--text-muted)'}}>Yuklanmoqda...</div>

        setCategories(data);        ) : services.length === 0 ? (

      })          <div style={{textAlign:'center',padding:40,color:'var(--text-muted)'}}>Hozircha xizmatlar mavjud emas</div>

      .catch(() => {})        ) : services.map((s, i) => {

      .finally(() => setLoading(false));          const iconContent = s.icon && (s.icon.startsWith('<svg') || s.icon.startsWith('http'))

  }, []);            ? s.icon.startsWith('<svg') ? s.icon : null

            : null;

  return (          const emojiIcon = s.icon && !s.icon.startsWith('<') && !s.icon.startsWith('http') ? s.icon : null;

    <div style={{ paddingBottom: 100, minHeight: '100dvh' }}>

      <div className="glass" style={{ position: 'sticky', top: 0, zIndex: 30, padding: '18px 16px 12px' }}>          return (

        <h1 style={{ fontSize: 20, fontWeight: 900, color: 'var(--navy)', marginBottom: 2 }}>Xizmatlar</h1>            <a key={s.id} href={s.link || 'https://t.me/itjobs_support'} target="_blank" rel="noopener noreferrer"

        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Premium IT xizmatlar</p>              className={`card anim-fade d${i+1}`} style={{display:'flex',alignItems:'center',gap:14,padding:16,textDecoration:'none'}}>

      </div>              <div style={{width:48,height:48,borderRadius:14,background:'var(--navy-light)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:24}}>

                {emojiIcon ? emojiIcon : <span dangerouslySetInnerHTML={{__html: iconContent || defaultIcon}} />}

      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>              </div>

        {loading ? (              <div style={{flex:1,minWidth:0}}>

          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Yuklanmoqda...</div>                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,marginBottom:4}}>

        ) : categories.length === 0 ? (                  <h3 style={{fontWeight:700,fontSize:14,color:'var(--navy)'}}>{s.title}</h3>

          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Hozircha xizmatlar mavjud emas</div>                  {s.price && <span style={{fontSize:11,fontWeight:800,padding:'4px 10px',borderRadius:6,background:'var(--gold-light)',color:'var(--gold-dark)',whiteSpace:'nowrap',flexShrink:0}}>{s.price}</span>}

        ) : categories.map((cat, i) => {                </div>

          const isOpen = openCat === cat.id;                {s.description && <p style={{fontSize:12,color:'var(--text-muted)',lineHeight:1.4}}>{s.description}</p>}

          const children = (cat.children || []).filter(c => c.isActive);              </div>

            </a>

          return (          );

            <div key={cat.id} className={`card anim-fade d${i + 1}`} style={{ padding: 0, overflow: 'hidden' }}>        })}

              {/* Category header */}      </div>

              <div

                onClick={() => setOpenCat(isOpen ? null : cat.id)}      <div style={{padding:'8px 16px 0'}}>

                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, cursor: 'pointer' }}        <div className="card gradient-hero anim-fade d6" style={{textAlign:'center',padding:'32px 20px',color:'#fff',border:'none'}}>

              >          <div style={{position:'relative',zIndex:2}}>

                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--navy-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 24, overflow: 'hidden' }}>            <p style={{fontSize:18,fontWeight:800,marginBottom:6}}>Maxsus xizmat kerakmi?</p>

                  {cat.icon            <p style={{color:'rgba(255,255,255,0.45)',fontSize:13,marginBottom:20}}>Biz bilan bog&apos;laning</p>

                    ? <img src={`${API_URL}/upload/${cat.icon}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />            <a href="https://t.me/itjobs_support" target="_blank" rel="noopener noreferrer"

                    : '📂'}              style={{display:'inline-flex',alignItems:'center',justifyContent:'center',gap:8,padding:'12px 24px',borderRadius:10,background:'var(--gold)',color:'#fff',fontWeight:800,fontSize:14,textDecoration:'none',boxShadow:'0 4px 12px rgba(184,160,106,0.3)'}}>

                </div>              <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 5L2 12.5l7 1M21 5l-4 15-7-8.5M21 5l-12 8.5"/></svg>

                <div style={{ flex: 1, minWidth: 0 }}>              Telegram orqali yozish

                  <h3 style={{ fontWeight: 700, fontSize: 15, color: 'var(--navy)', marginBottom: 2 }}>{cat.title}</h3>            </a>

                  {cat.description && <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>{cat.description}</p>}          </div>

                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'inline-block' }}>{children.length} ta yo&apos;nalish</span>        </div>

                </div>      </div>

                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="var(--text-muted)" strokeWidth="2" style={{ transition: 'transform 0.25s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', flexShrink: 0 }}>      <BottomNav />

                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />    </div>

                </svg>  );

              </div>}


              {/* Children */}
              {isOpen && children.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-secondary, #f8fafc)' }}>
                  {children.map((ch, idx) => (
                    <a key={ch.id} href="https://t.me/itjobs_support" target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px 12px 28px', textDecoration: 'none', borderTop: idx > 0 ? '1px solid var(--border)' : 'none' }}
                    >
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontWeight: 600, fontSize: 14, color: 'var(--navy)', marginBottom: 2 }}>{ch.title}</h4>
                        {ch.description && <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.3 }}>{ch.description}</p>}
                      </div>
                      {ch.price && (
                        <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 6, background: 'var(--gold-light)', color: 'var(--gold-dark)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                          {formatPrice(ch.price)}
                        </span>
                      )}
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--text-muted)" strokeWidth="2" style={{ flexShrink: 0 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ padding: '8px 16px 0' }}>
        <div className="card gradient-hero anim-fade d6" style={{ textAlign: 'center', padding: '32px 20px', color: '#fff', border: 'none' }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <p style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Maxsus xizmat kerakmi?</p>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginBottom: 20 }}>Biz bilan bog&apos;laning</p>
            <a href="https://t.me/itjobs_support" target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 24px', borderRadius: 10, background: 'var(--gold)', color: '#fff', fontWeight: 800, fontSize: 14, textDecoration: 'none', boxShadow: '0 4px 12px rgba(184,160,106,0.3)' }}>
              <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 5L2 12.5l7 1M21 5l-4 15-7-8.5M21 5l-12 8.5" /></svg>
              Telegram orqali yozish
            </a>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
