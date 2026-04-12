'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const items = [
  { href: '/', label: 'Asosiy', icon: (a:boolean) => <svg width="22" height="22" fill={a?'var(--navy)':'none'} stroke={a?'var(--navy)':'#8896ab'} strokeWidth={a?'2':'1.7'} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg> },
  { href: '/posts', label: "E'lonlar", icon: (a:boolean) => <svg width="22" height="22" fill={a?'var(--navy)':'none'} stroke={a?'var(--navy)':'#8896ab'} strokeWidth={a?'2':'1.7'} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg> },
  { href: '/create', label: 'Yaratish', isCenter: true },
  { href: '/services', label: 'Xizmatlar', icon: (a:boolean) => <svg width="22" height="22" fill={a?'var(--navy)':'none'} stroke={a?'var(--navy)':'#8896ab'} strokeWidth={a?'2':'1.7'} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg> },
  { href: '/profile', label: 'Profil', icon: (a:boolean) => <svg width="22" height="22" fill={a?'var(--navy)':'none'} stroke={a?'var(--navy)':'#8896ab'} strokeWidth={a?'2':'1.7'} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M5 21a7 7 0 0114 0"/></svg> },
];

export default function BottomNav() {
  const p = usePathname();
  return (
    <nav style={{position:'fixed',bottom:0,left:0,right:0,zIndex:50}}>
      <div className="glass" style={{maxWidth:480,margin:'0 auto',borderTop:'1px solid rgba(30,58,95,0.06)'}}>
        <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-around',padding:'6px 0',paddingBottom:'max(8px, env(safe-area-inset-bottom))'}}>
          {items.map(tab => {
            const active = tab.href === '/' ? p === '/' : p.startsWith(tab.href);
            if (tab.isCenter) return (
              <Link key={tab.href} href={tab.href} style={{display:'flex',flexDirection:'column',alignItems:'center',marginTop:-24,textDecoration:'none'}}>
                <div style={{width:62,height:62,borderRadius:18,display:'flex',alignItems:'center',justifyContent:'center',background:'#fff',boxShadow:'0 4px 20px rgba(30,58,95,0.22)',border:'2.5px solid var(--navy)',overflow:'hidden'}}>
                  <Image src="/logo.png" alt="Yaratish" width={52} height={52} style={{objectFit:'contain'}} />
                </div>
                <span style={{fontSize:10,fontWeight:700,marginTop:3,color:'var(--navy)'}}>{tab.label}</span>
              </Link>
            );
            return (
              <Link key={tab.href} href={tab.href} style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'6px 0',minWidth:48,gap:3,textDecoration:'none'}}>
                <div style={{position:'relative'}}>
                  {tab.icon!(active)}
                  {active && <div style={{position:'absolute',top:-2,right:-2,width:5,height:5,borderRadius:'50%',background:'var(--gold)'}} />}
                </div>
                <span style={{fontSize:10,fontWeight:active?700:500,color:active?'var(--navy)':'#8896ab'}}>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
