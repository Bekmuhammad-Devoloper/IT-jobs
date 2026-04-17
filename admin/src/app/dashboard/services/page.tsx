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
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

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
    setShowModal(true);
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
    setShowModal(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editId) {
        await adminApi.services.update(editId, form);
      } else {
        await adminApi.services.create(form);
      }
      setShowModal(false);
      loadServices();
    } catch (e: any) {
      alert(e.message || 'Xatolik');
    }
    setSaving(false);
  }

  async function handleDelete(id: number) {
    if (!confirm('Haqiqatan o\'chirmoqchimisiz?')) return;
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

      <div className="admin-card" style={{overflow:'hidden'}}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nomi</th>
              <th>Slug</th>
              <th>Narxi</th>
              <th>Tartib</th>
              <th>Holati</th>
              <th style={{textAlign:'right'}}>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {services.length === 0 ? (
              <tr><td colSpan={7} style={{textAlign:'center',padding:40,color:'#8896ab'}}>Xizmatlar topilmadi</td></tr>
            ) : services.map((s) => (
              <tr key={s.id}>
                <td style={{fontWeight:700,color:'#8896ab'}}>{s.id}</td>
                <td>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    {s.icon && <span style={{fontSize:20}}>{s.icon}</span>}
                    <div>
                      <div style={{fontWeight:700,color:'#1a2332'}}>{s.title}</div>
                      {s.description && <div style={{fontSize:12,color:'#8896ab',maxWidth:250,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.description}</div>}
                    </div>
                  </div>
                </td>
                <td style={{color:'#8896ab',fontSize:13}}>{s.slug || '-'}</td>
                <td style={{fontWeight:600}}>{s.price || '-'}</td>
                <td style={{textAlign:'center'}}>{s.order}</td>
                <td>
                  <button
                    onClick={() => handleToggle(s)}
                    className={`badge ${s.isActive ? 'badge-green' : 'badge-red'}`}
                    style={{cursor:'pointer',border:'none'}}
                  >
                    {s.isActive ? 'Faol' : 'Nofaol'}
                  </button>
                </td>
                <td style={{textAlign:'right'}}>
                  <div style={{display:'flex',gap:6,justifyContent:'flex-end'}}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)} title="Tahrirlash">
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(s.id)} title="O'chirish" style={{color:'#ef4444'}}>
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}} onClick={() => setShowModal(false)}>
          <div className="admin-card" style={{width:'100%',maxWidth:520,maxHeight:'90vh',overflow:'auto',padding:28}} onClick={e => e.stopPropagation()}>
            <h3 style={{fontSize:18,fontWeight:800,color:'#1a2332',marginBottom:20}}>
              {editId ? 'Xizmatni tahrirlash' : 'Yangi xizmat qo\'shish'}
            </h3>

            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              <div>
                <label style={{fontSize:13,fontWeight:600,color:'#4a5568',display:'block',marginBottom:4}}>Nomi *</label>
                <input className="admin-input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Xizmat nomi" />
              </div>
              <div>
                <label style={{fontSize:13,fontWeight:600,color:'#4a5568',display:'block',marginBottom:4}}>Slug</label>
                <input className="admin-input" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} placeholder="xizmat-slug" />
              </div>
              <div>
                <label style={{fontSize:13,fontWeight:600,color:'#4a5568',display:'block',marginBottom:4}}>Tavsif</label>
                <textarea className="admin-input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Xizmat haqida..." rows={3} style={{resize:'vertical'}} />
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <div>
                  <label style={{fontSize:13,fontWeight:600,color:'#4a5568',display:'block',marginBottom:4}}>Narxi</label>
                  <input className="admin-input" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="100,000 so'm" />
                </div>
                <div>
                  <label style={{fontSize:13,fontWeight:600,color:'#4a5568',display:'block',marginBottom:4}}>Tartib</label>
                  <input className="admin-input" type="number" value={form.order} onChange={e => setForm({...form, order: Number(e.target.value)})} />
                </div>
              </div>
              <div>
                <label style={{fontSize:13,fontWeight:600,color:'#4a5568',display:'block',marginBottom:4}}>Ikonka (emoji yoki URL)</label>
                <input className="admin-input" value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} placeholder="💼 yoki https://..." />
              </div>
              <div>
                <label style={{fontSize:13,fontWeight:600,color:'#4a5568',display:'block',marginBottom:4}}>Havola</label>
                <input className="admin-input" value={form.link} onChange={e => setForm({...form, link: e.target.value})} placeholder="https://..." />
              </div>
            </div>

            <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:24}}>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Bekor qilish</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.title.trim()}>
                {saving ? 'Saqlanmoqda...' : (editId ? 'Saqlash' : 'Qo\'shish')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
