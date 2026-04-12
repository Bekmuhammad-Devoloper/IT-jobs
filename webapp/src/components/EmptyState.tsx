'use client';
interface Props { icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode; }
export default function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="anim-fade" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'60px 24px',textAlign:'center'}}>
      <div className="anim-float" style={{width:72,height:72,borderRadius:24,background:'var(--navy-light)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20}}>
        {icon || <svg width="28" height="28" fill="none" stroke="var(--navy)" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M2 8l10 5 10-5"/></svg>}
      </div>
      <h3 style={{fontWeight:800,fontSize:17,marginBottom:6,color:'var(--navy)'}}>{title}</h3>
      {description && <p style={{fontSize:14,color:'var(--text-muted)',maxWidth:240,lineHeight:1.5}}>{description}</p>}
      {action && <div style={{marginTop:20}}>{action}</div>}
    </div>
  );
}
