'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShieldCheck,
  FileText,
  Users,
  Layers,
  Settings,
  Globe,
  LogOut,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/dashboard/moderation', label: 'Moderatsiya', Icon: ShieldCheck },
  { href: '/dashboard/posts', label: "E'lonlar", Icon: FileText },
  { href: '/dashboard/users', label: 'Foydalanuvchilar', Icon: Users },
  { href: '/dashboard/services', label: 'Xizmatlar', Icon: Layers },
  { href: '/dashboard/settings', label: 'Sozlamalar', Icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div style={{padding:'22px 20px',borderBottom:'1px solid rgba(184,160,106,0.1)',display:'flex',alignItems:'center',gap:12}}>
        <div style={{width:42,height:42,borderRadius:12,overflow:'hidden',flexShrink:0}}>
          <img src="/admin/logo.png" alt="Logo" width={42} height={42} style={{objectFit:'cover',borderRadius:12}} />
        </div>
        <div>
          <div style={{fontSize:16,fontWeight:800,color:'#fff',letterSpacing:'-0.02em'}}>Yuksalish<span style={{color:'#d4c494'}}>.dev</span></div>
          <div style={{fontSize:9,color:'rgba(255,255,255,0.3)',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase'}}>Admin Panel</div>
        </div>
      </div>

      <nav style={{padding:'14px 0',flex:1}}>
        <div style={{padding:'0 18px 10px',fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.2)',textTransform:'uppercase',letterSpacing:'0.1em'}}>Boshqaruv</div>
        {navItems.map(({ href, label, Icon }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link key={href} href={href} className={`sidebar-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
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
          <Globe size={18} strokeWidth={1.8} />
          <span>Web saytga o&apos;tish</span>
        </a>
        <button
          type="button"
          className="sidebar-link"
          style={{width:'100%',border:'none',background:'transparent',cursor:'pointer'}}
          onClick={() => { localStorage.removeItem('admin_token'); window.location.href = '/admin/login'; }}
        >
          <LogOut size={18} strokeWidth={1.8} />
          <span>Chiqish</span>
        </button>
      </div>
    </aside>
  );
}
