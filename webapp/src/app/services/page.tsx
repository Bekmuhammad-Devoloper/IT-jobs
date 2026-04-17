'use client';
import { useEffect, useState } from 'react';
import BottomNav from '@/components/BottomNav';
import { api } from '@/lib/api';

interface ServiceItem {
  id: number;
  title: string;
  description?: string;
  price?: string;
  icon?: string;
  link?: string;
  order: number;
  isActive: boolean;
}

const defaultIcon = '<svg width="22" height="22" fill="none" stroke="#1e3a5f" stroke-width="1.7" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>';

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.services.getAll()
      .then((res: any) => {
        const data = Array.isArray(res) ? res : (res.data || []);
        setServices(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{paddingBottom:100,minHeight:'100dvh'}}>
      <div className="glass" style={{position:'sticky',top:0,zIndex:30,padding:'18px 16px 12px'}}>
        <h1 style={{fontSize:20,fontWeight:900,color:'var(--navy)',marginBottom:2}}>Xizmatlar</h1>
        <p style={{fontSize:13,color:'var(--text-muted)'}}>Premium IT xizmatlar</p>
      </div>

      <div style={{padding:'12px 16px',display:'flex',flexDirection:'column',gap:8}}>
        {loading ? (
          <div style={{textAlign:'center',padding:40,color:'var(--text-muted)'}}>Yuklanmoqda...</div>
        ) : services.length === 0 ? (
          <div style={{textAlign:'center',padding:40,color:'var(--text-muted)'}}>Hozircha xizmatlar mavjud emas</div>
        ) : services.map((s, i) => {
          const iconContent = s.icon && (s.icon.startsWith('<svg') || s.icon.startsWith('http'))
            ? s.icon.startsWith('<svg') ? s.icon : null
            : null;
          const emojiIcon = s.icon && !s.icon.startsWith('<') && !s.icon.startsWith('http') ? s.icon : null;

          return (
            <a key={s.id} href={s.link || 'https://t.me/itjobs_support'} target="_blank" rel="noopener noreferrer"
              className={`card anim-fade d${i+1}`} style={{display:'flex',alignItems:'center',gap:14,padding:16,textDecoration:'none'}}>
              <div style={{width:48,height:48,borderRadius:14,background:'var(--navy-light)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:24}}>
                {emojiIcon ? emojiIcon : <span dangerouslySetInnerHTML={{__html: iconContent || defaultIcon}} />}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,marginBottom:4}}>
                  <h3 style={{fontWeight:700,fontSize:14,color:'var(--navy)'}}>{s.title}</h3>
                  {s.price && <span style={{fontSize:11,fontWeight:800,padding:'4px 10px',borderRadius:6,background:'var(--gold-light)',color:'var(--gold-dark)',whiteSpace:'nowrap',flexShrink:0}}>{s.price}</span>}
                </div>
                {s.description && <p style={{fontSize:12,color:'var(--text-muted)',lineHeight:1.4}}>{s.description}</p>}
              </div>
            </a>
          );
        })}
      </div>

      <div style={{padding:'8px 16px 0'}}>
        <div className="card gradient-hero anim-fade d6" style={{textAlign:'center',padding:'32px 20px',color:'#fff',border:'none'}}>
          <div style={{position:'relative',zIndex:2}}>
            <p style={{fontSize:18,fontWeight:800,marginBottom:6}}>Maxsus xizmat kerakmi?</p>
            <p style={{color:'rgba(255,255,255,0.45)',fontSize:13,marginBottom:20}}>Biz bilan bog&apos;laning</p>
            <a href="https://t.me/itjobs_support" target="_blank" rel="noopener noreferrer"
              style={{display:'inline-flex',alignItems:'center',justifyContent:'center',gap:8,padding:'12px 24px',borderRadius:10,background:'var(--gold)',color:'#fff',fontWeight:800,fontSize:14,textDecoration:'none',boxShadow:'0 4px 12px rgba(184,160,106,0.3)'}}>
              <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 5L2 12.5l7 1M21 5l-4 15-7-8.5M21 5l-12 8.5"/></svg>
              Telegram orqali yozish
            </a>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
