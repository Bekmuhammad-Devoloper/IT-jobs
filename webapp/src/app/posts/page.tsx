'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { api } from '@/lib/api';
import type { Post } from '@/types';
import PostCard from '@/components/PostCard';
import BottomNav from '@/components/BottomNav';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import Link from 'next/link';

const TYPES = [
  { value: '', label: 'Barchasi' },
  { value: 'VACANCY', label: 'Vakansiya' },
  { value: 'RESUME', label: 'Rezyume' },
  { value: 'COURSE', label: 'Kurs' },
  { value: 'MENTOR', label: 'Mentor' },
  { value: 'INTERNSHIP', label: 'Stajirovka' },
];

function Content() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [type, setType] = useState(sp.get('type') || '');
  const [search, setSearch] = useState(sp.get('q') || '');
  const [page, setPage] = useState(Math.max(1, Number(sp.get('page')) || 1));
  const [totalPages, setTP] = useState(1);

  useEffect(() => {
    const urlType = sp.get('type') || '';
    const urlPage = Math.max(1, Number(sp.get('page')) || 1);
    const urlSearch = sp.get('q') || '';
    if (urlType !== type) setType(urlType);
    if (urlPage !== page) setPage(urlPage);
    if (urlSearch !== search) setSearch(urlSearch);
  }, [sp]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [type, page, sp.get('q')]); // eslint-disable-line react-hooks/exhaustive-deps

  function updateUrl(next: { type?: string; page?: number; q?: string }) {
    const params = new URLSearchParams(sp.toString());
    const nextType = next.type !== undefined ? next.type : type;
    const nextPage = next.page !== undefined ? next.page : page;
    const nextQ = next.q !== undefined ? next.q : (sp.get('q') || '');
    if (nextType) params.set('type', nextType); else params.delete('type');
    if (nextPage > 1) params.set('page', String(nextPage)); else params.delete('page');
    if (nextQ) params.set('q', nextQ); else params.delete('q');
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  async function load(signal?: AbortSignal) {
    setLoading(true);
    setLoadError(null);
    try {
      const params: Record<string, string> = { page: String(page), limit: '20' };
      if (type) params.type = type;
      const q = sp.get('q');
      if (q) params.q = q;
      const res: any = await api.posts.getAll(params, signal);
      if (signal?.aborted) return;
      const d = res.data || res;
      setPosts(Array.isArray(d) ? d : d?.data || []);
      setTP(d?.meta?.totalPages || res?.meta?.totalPages || 1);
      setLoading(false);
    } catch (e: any) {
      if (e?.name === 'AbortError') return;
      console.error(e);
      setLoadError(e?.message || 'Yuklashda xatolik');
      setLoading(false);
    }
  }

  return (
    <div style={{paddingBottom:100,minHeight:'100dvh'}}>
      <div className="glass" style={{position:'sticky',top:0,zIndex:30,padding:'16px 16px 12px'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
          <h1 style={{fontSize:20,fontWeight:900,color:'var(--navy)'}}>E'lonlar</h1>
          <Link href="/create" className="btn btn-primary btn-sm" style={{gap:6}}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Yaratish
          </Link>
        </div>

        <div style={{position:'relative',marginBottom:10}}>
          <svg style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)'}} width="16" height="16" fill="none" stroke="var(--text-muted)" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
          <input className="input" style={{paddingLeft:40,fontSize:14,borderRadius:12,background:'var(--navy-50)',border:'none'}} placeholder="Qidirish..." value={search}
            onChange={e => setSearch(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { setPage(1); updateUrl({ page: 1, q: search }); } }} />
        </div>

        <div className="tab-nav">
          {TYPES.map(t => (
            <button key={t.value} className={`tab-item ${type===t.value?'active':''}`} onClick={() => { setType(t.value); setPage(1); updateUrl({ type: t.value, page: 1 }); }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{padding:'12px 16px'}}>
        {loading ? <LoadingSpinner /> : loadError ? (
          <EmptyState title="Xatolik" description={loadError}
            action={<button type="button" className="btn btn-primary btn-sm" onClick={() => load()}>Qayta urinish</button>} />
        ) : posts.length === 0 ? (
          <EmptyState title="E'lonlar topilmadi" description="Boshqa filtrlar bilan sinab ko'ring"
            action={<Link href="/create" className="btn btn-primary btn-sm">E'lon yaratish</Link>} />
        ) : (
          <>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {posts.map((post, i) => <div key={post.id} className={`anim-fade d${Math.min(i+1,6)}`}><PostCard post={post}/></div>)}
            </div>
            {totalPages > 1 && (
              <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:16,marginTop:24}}>
                <button className="btn btn-secondary btn-sm" disabled={page<=1} onClick={() => setPage(page-1)}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
                  Oldingi
                </button>
                <span style={{fontSize:14,fontWeight:800,color:'var(--navy)'}}>{page} <span style={{fontWeight:400,color:'var(--text-muted)'}}>/  {totalPages}</span></span>
                <button className="btn btn-secondary btn-sm" disabled={page>=totalPages} onClick={() => setPage(page+1)}>
                  Keyingi
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

export default function PostsPage() {
  return <Suspense fallback={<LoadingSpinner />}><Content /></Suspense>;
}
