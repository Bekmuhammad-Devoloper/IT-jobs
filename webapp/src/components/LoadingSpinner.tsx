export default function LoadingSpinner() {
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'60dvh',gap:16}}>
      <div style={{position:'relative',width:44,height:44}}>
        <div style={{position:'absolute',inset:0,borderRadius:'50%',border:'3px solid var(--navy-light)'}} />
        <div style={{position:'absolute',inset:0,borderRadius:'50%',border:'3px solid transparent',borderTopColor:'var(--navy)',animation:'spin 0.8s linear infinite'}} />
      </div>
      <p style={{fontSize:13,fontWeight:600,color:'var(--text-muted)'}}>Yuklanmoqda...</p>
    </div>
  );
}
