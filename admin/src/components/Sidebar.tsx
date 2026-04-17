'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '<svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity="0.08"/><rect x="14" y="3" width="7" height="7" rx="2" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity="0.15"/><rect x="3" y="14" width="7" height="7" rx="2" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity="0.15"/><rect x="14" y="14" width="7" height="7" rx="2" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity="0.08"/></svg>' },
  { href: '/dashboard/moderation', label: 'Moderatsiya', icon: '<svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity="0.06"/><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
  { href: '/dashboard/posts', label: "E'lonlar", icon: '<svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2.5" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity="0.06"/><path d="M8 8h8M8 12h5M8 16h3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity="0.7"/></svg>' },
  { href: '/dashboard/users', label: 'Foydalanuvchilar', icon: '<svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="9" cy="7" r="3.5" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity="0.08"/><path d="M2 20v-1a5 5 0 015-5h4a5 5 0 015 5v1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="17" cy="7" r="2" stroke="currentColor" stroke-width="1.4" stroke-dasharray="2 2" opacity="0.5"/><path d="M19 15c1.2.5 2 1.7 2 3v1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity="0.4"/></svg>' },
  { href: '/dashboard/settings', label: 'Sozlamalar', icon: '<svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity="0.1"/><path d="M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div style={{padding:'22px 20px',borderBottom:'1px solid rgba(184,160,106,0.1)',display:'flex',alignItems:'center',gap:12}}>
        <div style={{width:42,height:42,borderRadius:12,overflow:'hidden',background:'linear-gradient(135deg, #1a3a2a 0%, #2d5a3d 100%)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 10px rgba(0,0,0,0.3)',flexShrink:0}}>
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
            <rect x="4" y="8" width="14" height="24" rx="2" fill="#d4c494" opacity="0.9"/>
            <rect x="12" y="4" width="14" height="24" rx="2" fill="#fff" opacity="0.85"/>
            <rect x="20" y="12" width="14" height="24" rx="2" fill="#d4c494" opacity="0.7"/>
          </svg>
        </div>
        <div>
          <div style={{fontSize:16,fontWeight:800,color:'#fff',letterSpacing:'-0.02em'}}>Yuksalish<span style={{color:'#d4c494'}}>.dev</span></div>
          <div style={{fontSize:9,color:'rgba(255,255,255,0.3)',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase'}}>Admin Panel</div>
        </div>
      </div>

      <nav style={{padding:'14px 0',flex:1}}>
        <div style={{padding:'0 18px 10px',fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.2)',textTransform:'uppercase',letterSpacing:'0.1em'}}>Boshqaruv</div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className={`sidebar-link ${isActive ? 'active' : ''}`}>
              <span dangerouslySetInnerHTML={{__html: item.icon}} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div style={{padding:'16px 10px',borderTop:'1px solid rgba(184,160,106,0.08)'}}>
        <a
          href="https://it-jobs.bekmuhammad.uz"
          target="_blank"
          rel="noopener noreferrer"
          className="sidebar-link"
          style={{textDecoration:'none',marginBottom:4}}
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.06"/>
            <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.8"/>
            <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke="currentColor" strokeWidth="1.8"/>
          </svg>
          <span>Web saytga o&apos;tish</span>
        </a>
        <button
          className="sidebar-link"
          style={{width:'100%',border:'none',background:'transparent',cursor:'pointer'}}
          onClick={() => { localStorage.removeItem('admin_token'); window.location.href = '/login'; }}
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <span>Chiqish</span>
        </button>
      </div>
    </aside>
  );
}
