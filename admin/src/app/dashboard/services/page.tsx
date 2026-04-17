'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';

interface ServiceItem {
  id: number;
  title: string;
  slug?: string;
  description?: string;
  price?: string;
  icon?: string;
  link?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

const emptyForm = { title: '', slug: '', description: '', price: '', icon: '', link: '', order: 0 };

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => { loadServices(); }, []);

  async function loadServices() {
    try {
      setLoading(true);
      const res: any = await adminApi.services.getAll();
      const data = Array.isArray(res) ? res : (res.data || []);
      setServices(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  function openCreate() {
    setEditId(null);
    setForm(emptyForm);
    setSuccessMsg('');
    setView('form');
  }

  function openEdit(s: ServiceItem) {
    setEditId(s.id);
    setForm({
      title: s.title || '',
      slug: s.slug || '',
      description: s.description || '',
      price: s.price || '',
      icon: s.icon || '',
      link: s.link || '',
      order: s.order || 0,
    });
    setSuccessMsg('');
    setView('form');
  }

  function goBack() {
    setView('list');
    loadServices();
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.slug && payload.title) {
        payload.slug = payload.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      if (editId) {
        await adminApi.services.update(editId, payload);
        setSuccessMsg('Xizmat muvaffaqiyatli yangilandi!');
      } else {
        await adminApi.services.create(payload);
        setSuccessMsg('Xizmat muvaffaqiyatli yaratildi!');
      }
      setTimeout(() => goBack(), 1000);
    } catch (e: any) {
      alert(e.message || 'Xatolik yuz berdi');
    }
    setSaving(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("Haqiqatan o'chirmoqchimisiz?")) return;
    try {
      await adminApi.services.delete(id);
      loadServices();
    } catch { /* ignore */ }
  }

  async function handleToggle(s: ServiceItem) {
    try {
      await adminApi.services.update(s.id, { isActive: !s.isActive });
      loadServices();
    } catch { /* ignore */ }
  }

  if (loading) return (
    <div className="loading-screen">
      <div className="admin-card" style={{padding:'60px 40px',textAlign:'center'}}>
        <div className="spinner" />
        <p style={{color:'#8896ab',fontWeight:600,fontSize:14}}>Yuklanmoqda...</p>
      </div>
    </div>
  );

  // ── FORM VIEW ──────────────────────────────
  if (view === 'form') {
    return (
      <div className="fade-in-up">
        <button className="btn btn-ghost btn-sm" onClick={goBack} style={{marginBottom:16}}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Orqaga
        </button>

        <div className="admin-card" style={{maxWidth:700,padding:0,overflow:'hidden'}}>
          {/* Header */}
          <div style={{background:'linear-gradient(135deg,#1a2332 0%,#2d3748 100%)',padding:'28px 32px',color:'#fff'}}>
            <h2 style={{fontSize:20,fontWeight:800,marginBottom:4}}>
              {editId ? 'Xizmatni tahrirlash' : 'Yangi xizmat yaratish'}
            </h2>
            <p style={{color:'rgba(255,255,255,0.5)',fontSize:13}}>
              {editId ? "Xizmat ma'lumotlarini o'zgartiring" : "Barcha maydonlarni to'ldiring va saqlang"}
            </p>
          </div>

          {successMsg && (
            <div style={{padding:'12px 32px',background:'#f0fdf4',color:'#16a34a',fontWeight:600,fontSize:14,display:'flex',alignItems:'center',gap:8}}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              {successMsg}
            </div>
          )}

          <div style={{padding:'28px 32px'}}>
            {/* Preview */}
            <div style={{marginBottom:24,padding:16,borderRadius:12,background:'#f8fafc',border:'1px solid #e2e8f0'}}>
              <div style={{fontSize:11,fontWeight:700,color:'#8896ab',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:10}}>Ko&apos;rinishi (Preview)</div>
              <div style={{display:'flex',alignItems:'center',gap:14}}>
                <div style={{width:52,height:52,borderRadius:14,background:'linear-gradient(135deg,#e8e0cf 0%,#f5f0e5 100%)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>
                  {form.icon || '\uD83D\uDCE6'}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:15,color:'#1a2332',marginBottom:2}}>{form.title || 'Xizmat nomi'}</div>
                  <div style={{fontSize:12,color:'#8896ab'}}>{form.description || 'Xizmat tavsifi...'}</div>
                </div>
                {form.price && (
                  <span style={{fontSize:12,fontWeight:800,padding:'6px 14px',borderRadius:8,background:'#fdf6e3',color:'#92780c',whiteSpace:'nowrap'}}>{form.price}</span>
                )}
              </div>
            </div>

            {/* Form fields */}
            <div style={{display:'flex',flexDirection:'column',gap:20}}>
              <div>
                <label style={{fontSize:13,fontWeight:700,color:'#1a2332',display:'block',marginBottom:6}}>
                  Xizmat nomi <span style={{color:'#ef4444'}}>*</span>
                </label>
                <input className="admin-input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Masalan: Rezyume yozish" style={{fontSize:15,padding:'12px 16px'}} />
              </div>

              <div>
                <label style={{fontSize:13,fontWeight:700,color:'#1a2332',display:'block',marginBottom:6}}>
                  Slug <span style={{color:'#8896ab',fontWeight:400}}>(avtomatik yaratiladi)</span>
                </label>
                <input className="admin-input" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} placeholder="rezyume-yozish" style={{padding:'12px 16px'}} />
              </div>

              <div>
                <label style={{fontSize:13,fontWeight:700,color:'#1a2332',display:'block',marginBottom:6}}>Tavsif</label>
                <textarea className="admin-input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Xizmat haqida batafsil ma'lumot yozing..." rows={4} style={{resize:'vertical',padding:'12px 16px',lineHeight:1.6}} />
              </div>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                <div>
                  <label style={{fontSize:13,fontWeight:700,color:'#1a2332',display:'block',marginBottom:6}}>Narxi</label>
                  <input className="admin-input" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="100,000 so'm" style={{padding:'12px 16px'}} />
                </div>
                <div>
                  <label style={{fontSize:13,fontWeight:700,color:'#1a2332',display:'block',marginBottom:6}}>Tartib raqami</label>
                  <input className="admin-input" type="number" value={form.order} onChange={e => setForm({...form, order: Number(e.target.value)})} style={{padding:'12px 16px'}} />
                  <p style={{fontSize:11,color:'#8896ab',marginTop:4}}>Kichik raqam = yuqorida ko&apos;rinadi</p>
                </div>
              </div>

              <div>
                <label style={{fontSize:13,fontWeight:700,color:'#1a2332',display:'block',marginBottom:6}}>
                  Ikonka <span style={{color:'#8896ab',fontWeight:400}}>(emoji tanlang)</span>
                </label>
                <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:8}}>
                  {['\uD83D\uDCC4','\uD83D\uDCBC','\uD83C\uDFAF','\uD83D\uDC68\u200D\uD83D\uDCBB','\uD83D\uDE80','\uD83D\uDCA1','\uD83D\uDCCA','\uD83C\uDF93','\uD83D\uDD27','\uD83D\uDCB0','\uD83D\uDCF1','\uD83C\uDF10'].map(e => (
                    <button key={e} type="button" onClick={() => setForm({...form, icon: e})}
                      style={{width:42,height:42,borderRadius:10,border: form.icon === e ? '2px solid #b8a06a' : '2px solid #e2e8f0',background: form.icon === e ? '#fdf6e3' : '#fff',fontSize:20,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.15s'}}>
                      {e}
                    </button>
                  ))}
                </div>
                <input className="admin-input" value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} placeholder="Yoki o'z emoji kiriting" style={{padding:'10px 16px'}} />
              </div>

              <div>
                <label style={{fontSize:13,fontWeight:700,color:'#1a2332',display:'block',marginBottom:6}}>
                  Havola <span style={{color:'#8896ab',fontWeight:400}}>(ixtiyoriy)</span>
                </label>
                <input className="admin-input" value={form.link} onChange={e => setForm({...form, link: e.target.value})} placeholder="https://t.me/username yoki https://..." style={{padding:'12px 16px'}} />
                <p style={{fontSize:11,color:'#8896ab',marginTop:4}}>Foydalanuvchi xizmatni bosganda shu havolaga o&apos;tadi</p>
              </div>
            </div>

            {/* Actions */}
            <div style={{display:'flex',gap:12,justifyContent:'flex-end',marginTop:32,paddingTop:20,borderTop:'1px solid #e2e8f0'}}>
              <button className="btn btn-ghost" onClick={goBack} style={{padding:'12px 24px'}}>Bekor qilish</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.title.trim()} style={{padding:'12px 32px',fontSize:15}}>
                {saving ? 'Saqlanmoqda...' : (editId ? 'Saqlash' : 'Yaratish')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── LIST VIEW ──────────────────────────────
  return (
    <div className="fade-in-up">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <div>
          <h2 style={{fontSize:22,fontWeight:800,color:'#1a2332',marginBottom:4}}>Xizmatlar</h2>
          <p style={{color:'#8896ab',fontSize:14}}>Jami: {services.length} ta xizmat</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate} style={{display:'flex',alignItems:'center',gap:8}}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M12 5v14M5 12h14"/></svg>
          Yangi xizmat
        </button>
      </div>

      {services.length === 0 ? (
        <div className="admin-card" style={{textAlign:'center',padding:'60px 40px'}}>
          <div style={{fontSize:48,marginBottom:12}}>{'\uD83D\uDCE6'}</div>
          <h3 style={{fontSize:18,fontWeight:700,color:'#1a2332',marginBottom:8}}>Xizmatlar hali yo&apos;q</h3>
          <p style={{color:'#8896ab',fontSize:14,marginBottom:24}}>Birinchi xizmatni yarating va u webapp&apos;da ko&apos;rinadi</p>
          <button className="btn btn-primary" onClick={openCreate}>Birinchi xizmat yaratish</button>
        </div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:16}}>
          {services.map((s, i) => (
            <div key={s.id} className={`admin-card anim-fade d${i+1}`} style={{padding:0,overflow:'hidden',cursor:'pointer',transition:'transform 0.15s,box-shadow 0.15s'}} onClick={() => openEdit(s)}>
              <div style={{padding:'20px 20px 16px',display:'flex',alignItems:'flex-start',gap:14}}>
                <div style={{width:52,height:52,borderRadius:14,background:'linear-gradient(135deg,#e8e0cf 0%,#f5f0e5 100%)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>
                  {s.icon || '\uD83D\uDCE6'}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                    <h3 style={{fontWeight:700,fontSize:15,color:'#1a2332',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.title}</h3>
                    <span className={`badge ${s.isActive ? 'badge-green' : 'badge-red'}`} style={{fontSize:10,flexShrink:0}}>
                      {s.isActive ? 'Faol' : 'Nofaol'}
                    </span>
                  </div>
                  {s.description && (
                    <p style={{fontSize:12,color:'#8896ab',lineHeight:1.5,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{s.description}</p>
                  )}
                </div>
              </div>
              <div style={{padding:'12px 20px',borderTop:'1px solid #f0f0f0',display:'flex',alignItems:'center',justifyContent:'space-between',background:'#fafbfc'}}>
                <div style={{display:'flex',gap:16}}>
                  {s.price && <span style={{fontSize:12,fontWeight:700,color:'#92780c'}}>{s.price}</span>}
                  <span style={{fontSize:12,color:'#8896ab'}}>#{s.order}</span>
                  {s.slug && <span style={{fontSize:12,color:'#8896ab'}}>/{s.slug}</span>}
                </div>
                <div style={{display:'flex',gap:4}} onClick={e => e.stopPropagation()}>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleToggle(s)} title={s.isActive ? "Nofaol qilish" : "Faol qilish"} style={{fontSize:14}}>
                    {s.isActive ? '\u23F8\uFE0F' : '\u25B6\uFE0F'}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(s.id)} title="O'chirish" style={{color:'#ef4444',fontSize:14}}>
                    {'\uD83D\uDDD1\uFE0F'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
