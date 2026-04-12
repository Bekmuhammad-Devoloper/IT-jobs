'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res: any = await adminApi.auth.login(username, password);
      const token = res.data?.token || res.token;
      if (token) {
        localStorage.setItem('admin_token', token);
        router.push('/dashboard');
      } else {
        setError('Token olinmadi');
      }
    } catch (err: any) {
      setError(err.message || 'Login yoki parol noto\'g\'ri');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg, #0f2439 0%, #1e3a5f 50%, #2a4f7a 100%)',padding:20}}>
      <div style={{width:'100%',maxWidth:420,background:'#fff',borderRadius:20,padding:'40px 32px',boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{display:'flex',justifyContent:'center',marginBottom:16}}>
            <Image src="/logo.png" alt="Yuksalish.dev" width={72} height={72} style={{objectFit:'contain'}} priority/>
          </div>
          <h1 style={{fontSize:24,fontWeight:900,color:'#1e3a5f',marginBottom:4}}>Yuksalish<span style={{color:'#b8a06a'}}>.dev</span></h1>
          <p style={{fontSize:13,color:'#8896ab',fontWeight:500}}>Admin paneliga kirish</p>
        </div>

        {error && (
          <div style={{padding:'10px 14px',marginBottom:16,borderRadius:10,background:'#fef2f2',color:'#dc2626',fontSize:13,fontWeight:500,border:'1px solid #fecaca'}}>{error}</div>
        )}

        <form onSubmit={handleLogin} style={{display:'flex',flexDirection:'column',gap:16}}>
          <div>
            <label style={{fontSize:13,fontWeight:600,color:'#1e3a5f',marginBottom:6,display:'block'}}>Login</label>
            <input
              style={{width:'100%',padding:'12px 14px',borderRadius:12,border:'1.5px solid #e2e8f0',fontSize:14,outline:'none',transition:'border-color 0.2s',background:'#f8fafc'}}
              placeholder="Login kiriting"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{fontSize:13,fontWeight:600,color:'#1e3a5f',marginBottom:6,display:'block'}}>Parol</label>
            <input
              style={{width:'100%',padding:'12px 14px',borderRadius:12,border:'1.5px solid #e2e8f0',fontSize:14,outline:'none',transition:'border-color 0.2s',background:'#f8fafc'}}
              type="password"
              placeholder="Parolni kiriting"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{width:'100%',padding:'12px',borderRadius:12,border:'none',fontSize:15,fontWeight:700,color:'#fff',background: loading ? '#8896ab' : 'linear-gradient(135deg, #1e3a5f, #2a4f7a)',cursor: loading ? 'not-allowed' : 'pointer',marginTop:4,boxShadow:'0 4px 14px rgba(30,58,95,0.3)',transition:'all 0.2s'}}
          >
            {loading ? 'Kirish...' : 'Kirish'}
          </button>
        </form>

        <div style={{textAlign:'center',marginTop:24}}>
          <span style={{fontSize:11,color:'#b8a06a',fontWeight:600,letterSpacing:'0.05em'}}>YUKSALISH.DEV IT PLATFORMASI</span>
        </div>
      </div>
    </div>
  );
}
