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

const emptyForm = { title: '', description: '', price: '', order: 0 };

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadServices(); }, []);

  async function loadServices() {
    try {
      setLoading(true);
      const res: any = await adminApi.services.getAll();
      const data = Array.isArray(res) ? res : (res.data || []);
      setServices(data);
    } catch (e: any) {
      setError(e.message || 'Xizmatlarni yuklashda xatolik');
    } finally { setLoading(false); }
  }

  function openCreate() {
    setEditId(null);
    setForm(emptyForm);
    setError('');
    setView('detail');
  }

  function openEdit(s: ServiceItem) {
    setEditId(s.id);
    setForm({
      title: s.title || '',
      description: s.description || '',
      price: s.price || '',
      order: s.order || 0,
    });
    setError('');
    setView('detail');
  }

  async function handleSave() {
    if (!form.title.trim()) { setError('Xizmat nomini kiriting'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        order: Number(form.order) || 0,
      };
      if (editId) {
        await adminApi.services.update(editId, payload);
      } else {
        await adminApi.services.create(payload);
      }
      await loadServices();
      setView('list');
    } catch (e: any) {
      setError(e.message || 'Saqlashda xatolik yuz berdi');
    }
    setSaving(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("Haqiqatan o'chirmoqchimisiz?")) return;
    try {
      await adminApi.services.delete(id);
      loadServices();
    } catch (e: any) {
      alert(e.message || 'Xatolik');
    }
  }

  async function handleToggle(s: ServiceItem) {
    try {
      await adminApi.services.update(s.id, { isActive: !s.isActive });
      loadServices();
    } catch { /* */ }
  }

  if (loading) return (
    <div className="loading-screen">
      <div className="admin-card" style={{padding:'60px 40px',textAlign:'center'}}>
        <div className="spinner" />
        <p style={{color:'#8896ab',fontWeight:600,fontSize:14}}>Yuklanmoqda...</p>
      </div>
    </div>
  );

  // ── Detail / Create / Edit view ──
  if (view === 'detail') {
    return (
      <div className="fade-in-up">
        <button className="btn btn-ghost btn-sm" onClick={() => setView('list')} style={{marginBottom:16}}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Orqaga
        </button>

        <div className="admin-card" style={{padding:28,maxWidth:640}}>
          <h2 style={{fontSize:20,fontWeight:800,color:'#1a2332',marginBottom:24}}>
            {editId ? '✏️ Xizmatni tahrirlash' : '➕ Yangi xizmat yaratish'}
          </h2>

          {error && (
            <div style={{padding:'10px 14px',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:8,color:'#dc2626',fontSize:13,fontWeight:600,marginBottom:16}}>
              {error}
            </div>
          )}

          <div style={{display:'flex',flexDirection:'column',gap:18}}>
            <div>
              <label style={{fontSize:13,fontWeight:700,color:'#1a2332',display:'block',marginBottom:6}}>Xizmat nomi *</label>
              <input
                className="admin-input"
                value={form.title}
                onChange={e => setForm({...form, title: e.target.value})}
                placeholder="Masalan: Rezyume yozish"
                style={{fontSize:15,padding:'12px 14px'}}
              />
            </div>

            <div>
              <label style={{fontSize:13,fontWeight:700,color:'#1a2332',display:'block',marginBottom:6}}>Tavsif</label>
              <textarea
                className="admin-input"
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                placeholder="Xizmat haqida batafsil ma'lumot..."
                rows={4}
                style={{resize:'vertical',padding:'12px 14px',lineHeight:1.6}}
              />
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
              <div>
                <label style={{fontSize:13,fontWeight:700,color:'#1a2332',display:'block',marginBottom:6}}>Narxi</label>
                <input
                  className="admin-input"
                  value={form.price}
                  onChange={e => setForm({...form, price: e.target.value})}
                  placeholder="100,000 so'm"
                  style={{padding:'12px 14px'}}
                />
              </div>
              <div>
                <label style={{fontSize:13,fontWeight:700,color:'#1a2332',display:'block',marginBottom:6}}>Tartib raqami</label>
                <input
                  className="admin-input"
                  type="number"
                  value={form.order}
                  onChange={e => setForm({...form, order: Number(e.target.value)})}
                  style={{padding:'12px 14px'}}
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          {form.title && (
            <div style={{marginTop:24,padding:16,background:'#f8fafc',borderRadius:12,border:'1px solid #e2e8f0'}}>
              <p style={{fontSize:11,fontWeight:700,color:'#8896ab',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:10}}>Ko&apos;rinishi (webapp)</p>
              <div style={{display:'flex',alignItems:'center',gap:14,padding:14,background:'#fff',borderRadius:10,border:'1px solid #e2e8f0'}}>
                <div style={{width:48,height:48,borderRadius:14,background:'#eef2f7',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>
                  📦
                </div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,marginBottom:4}}>
                    <h3 style={{fontWeight:700,fontSize:14,color:'#1e3a5f'}}>{form.title}</h3>
                    {form.price && <span style={{fontSize:11,fontWeight:800,padding:'4px 10px',borderRadius:6,background:'#fdf6e3',color:'#92780c',whiteSpace:'nowrap'}}>{form.price}</span>}
                  </div>
                  {form.description && <p style={{fontSize:12,color:'#6b7b8d',lineHeight:1.4}}>{form.description}</p>}
                </div>
              </div>
            </div>
          )}

          <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:28}}>
            <button className="btn btn-ghost" onClick={() => setView('list')}>Bekor qilish</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.title.trim()}>
              {saving ? 'Saqlanmoqda...' : (editId ? '💾 Saqlash' : '➕ Yaratish')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── List view ──
  return (
    <div className="fade-in-up">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <div>
          <h2 style={{fontSize:22,fontWeight:800,color:'#1a2332',marginBottom:4}}>Xizmatlar</h2>
          <p style={{color:'#8896ab',fontSize:14}}>Jami: {services.length} ta xizmat</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M12 5v14M5 12h14"/></svg>
          Yangi xizmat
        </button>
      </div>

      {services.length === 0 ? (
        <div className="admin-card" style={{textAlign:'center',padding:'60px 40px'}}>
          <div style={{fontSize:48,marginBottom:12}}>📦</div>
          <h3 style={{fontSize:18,fontWeight:800,color:'#1a2332',marginBottom:8}}>Hali xizmat qo&apos;shilmagan</h3>
          <p style={{color:'#8896ab',fontSize:14,marginBottom:20}}>Birinchi xizmatni yarating — u webapp&apos;da ko&apos;rinadi</p>
          <button className="btn btn-primary" onClick={openCreate}>➕ Birinchi xizmatni yaratish</button>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {services.map((s) => (
            <div key={s.id} className="admin-card" style={{padding:'16px 20px',display:'flex',alignItems:'center',gap:16,opacity: s.isActive ? 1 : 0.5}}>
              <div style={{width:48,height:48,borderRadius:14,background:'#f0f4f8',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>
                {s.icon || '📦'}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
                  <h3 style={{fontWeight:700,fontSize:15,color:'#1a2332'}}>{s.title}</h3>
                  <span className={`badge ${s.isActive ? 'badge-green' : 'badge-red'}`} style={{fontSize:10}}>{s.isActive ? 'Faol' : 'Nofaol'}</span>
                </div>
                {s.description && <p style={{fontSize:13,color:'#8896ab',marginBottom:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.description}</p>}
                <div style={{display:'flex',gap:12,fontSize:12,color:'#a0aec0',marginTop:4}}>
                  {s.price && <span>💰 {s.price}</span>}
                  {s.slug && <span>🔗 {s.slug}</span>}
                  <span>📊 Tartib: {s.order}</span>
                </div>
              </div>
              <div style={{display:'flex',gap:6,flexShrink:0}}>
                <button className="btn btn-ghost btn-sm" onClick={() => handleToggle(s)} title={s.isActive ? 'Nofaol qilish' : 'Faol qilish'}>
                  {s.isActive ? '🔴' : '🟢'}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)} title="Tahrirlash">
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(s.id)} title="O'chirish" style={{color:'#ef4444'}}>
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
