'use client';
import BottomNav from '@/components/BottomNav';

const SERVICES = [
  { title: 'Rezyume yozish', desc: 'Professional rezyume tayyorlash', price: '50 000', svg: '<svg width="22" height="22" fill="none" stroke="#1e3a5f" stroke-width="1.7" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>', color: '#1e3a5f' },
  { title: 'Intervyu tayyorgarlik', desc: "IT intervyuga to'liq tayyorgarlik", price: '100 000', svg: '<svg width="22" height="22" fill="none" stroke="#1e3a5f" stroke-width="1.7" viewBox="0 0 24 24"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/></svg>', color: '#1e3a5f' },
  { title: 'Portfolio yaratish', desc: 'Shaxsiy portfolio va web-sayt', price: '200 000', svg: '<svg width="22" height="22" fill="none" stroke="#1e3a5f" stroke-width="1.7" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>', color: '#1e3a5f' },
  { title: 'Mentorlik', desc: '1-on-1 mentorlik sessiyalari', price: '150 000', svg: '<svg width="22" height="22" fill="none" stroke="#1e3a5f" stroke-width="1.7" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M5 21a7 7 0 0114 0"/></svg>', color: '#1e3a5f' },
  { title: "E'lon ko'tarish", desc: "E'loningizni yuqoriga ko'tarish", price: '30 000', svg: '<svg width="22" height="22" fill="none" stroke="#1e3a5f" stroke-width="1.7" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>', color: '#1e3a5f' },
];

export default function ServicesPage() {
  return (
    <div style={{paddingBottom:100,minHeight:'100dvh'}}>
      <div className="glass" style={{position:'sticky',top:0,zIndex:30,padding:'18px 16px 12px'}}>
        <h1 style={{fontSize:20,fontWeight:900,color:'var(--navy)',marginBottom:2}}>Xizmatlar</h1>
        <p style={{fontSize:13,color:'var(--text-muted)'}}>Premium IT xizmatlar</p>
      </div>

      <div style={{padding:'12px 16px',display:'flex',flexDirection:'column',gap:8}}>
        {SERVICES.map((s, i) => (
          <a key={i} href="https://t.me/itjobs_support" target="_blank" rel="noopener noreferrer"
            className={`card anim-fade d${i+1}`} style={{display:'flex',alignItems:'center',gap:14,padding:16,textDecoration:'none'}}>
            <div style={{width:48,height:48,borderRadius:14,background:'var(--navy-light)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}} dangerouslySetInnerHTML={{__html:s.svg}}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,marginBottom:4}}>
                <h3 style={{fontWeight:700,fontSize:14,color:'var(--navy)'}}>{s.title}</h3>
                <span style={{fontSize:11,fontWeight:800,padding:'4px 10px',borderRadius:6,background:'var(--gold-light)',color:'var(--gold-dark)',whiteSpace:'nowrap',flexShrink:0}}>{s.price} UZS</span>
              </div>
              <p style={{fontSize:12,color:'var(--text-muted)',lineHeight:1.4}}>{s.desc}</p>
            </div>
          </a>
        ))}
      </div>

      <div style={{padding:'8px 16px 0'}}>
        <div className="card gradient-hero anim-fade d6" style={{textAlign:'center',padding:'32px 20px',color:'#fff',border:'none'}}>
          <div style={{position:'relative',zIndex:2}}>
            <p style={{fontSize:18,fontWeight:800,marginBottom:6}}>Maxsus xizmat kerakmi?</p>
            <p style={{color:'rgba(255,255,255,0.45)',fontSize:13,marginBottom:20}}>Biz bilan bog'laning</p>
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
