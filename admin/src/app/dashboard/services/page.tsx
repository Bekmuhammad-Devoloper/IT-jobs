'use client';'use client';



import { useEffect, useState, useRef } from 'react';import { useEffect, useState } from 'react';

import { adminApi } from '@/lib/api';import { adminApi } from '@/lib/api';



interface ServiceChild {interface ServiceItem {

  id: number;  id: number;

  title: string;  title: string;

  description?: string;  slug?: string;

  price?: string;  description?: string;

  order: number;  price?: string;

  isActive: boolean;  icon?: string;

}  link?: string;

  order: number;

interface ServiceCategory {  isActive: boolean;

  id: number;  createdAt: string;

  title: string;}

  description?: string;

  icon?: string;const emptyForm = { title: '', description: '', price: '', order: 0 };

  order: number;

  isActive: boolean;export default function AdminServicesPage() {

  children: ServiceChild[];  const [services, setServices] = useState<ServiceItem[]>([]);

}  const [loading, setLoading] = useState(true);

  const [view, setView] = useState<'list' | 'detail'>('list');

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';  const [editId, setEditId] = useState<number | null>(null);

  const [form, setForm] = useState(emptyForm);

export default function AdminServicesPage() {  const [saving, setSaving] = useState(false);

  const [categories, setCategories] = useState<ServiceCategory[]>([]);  const [error, setError] = useState('');

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');  useEffect(() => { loadServices(); }, []);



  const [modal, setModal] = useState<'none' | 'category' | 'child'>('none');  async function loadServices() {

  const [editId, setEditId] = useState<number | null>(null);    try {

  const [parentId, setParentId] = useState<number | null>(null);      setLoading(true);

      const res: any = await adminApi.services.getAll();

  const [form, setForm] = useState({ title: '', description: '', price: '', order: 0 });      const data = Array.isArray(res) ? res : (res.data || []);

  const [iconFile, setIconFile] = useState<File | null>(null);      setServices(data);

  const [iconPreview, setIconPreview] = useState<string | null>(null);    } catch (e: any) {

  const [saving, setSaving] = useState(false);      setError(e.message || 'Xizmatlarni yuklashda xatolik');

  const fileRef = useRef<HTMLInputElement>(null);    } finally { setLoading(false); }

  }

  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  function openCreate() {

  useEffect(() => { loadData(); }, []);    setEditId(null);

    setForm(emptyForm);

  async function loadData() {    setError('');

    try {    setView('detail');

      setLoading(true);  }

      const res: any = await adminApi.services.getAll();

      const data = Array.isArray(res) ? res : (res.data || []);  function openEdit(s: ServiceItem) {

      setCategories(data);    setEditId(s.id);

    } catch (e: any) {    setForm({

      setError(e.message || 'Yuklashda xatolik');      title: s.title || '',

    } finally { setLoading(false); }      description: s.description || '',

  }      price: s.price || '',

      order: s.order || 0,

  function toggleExpand(id: number) {    });

    setExpanded(prev => {    setError('');

      const s = new Set(prev);    setView('detail');

      s.has(id) ? s.delete(id) : s.add(id);  }

      return s;

    });  async function handleSave() {

  }    if (!form.title.trim()) { setError('Xizmat nomini kiriting'); return; }

    setSaving(true);

  function openCreateCategory() {    setError('');

    setEditId(null); setParentId(null);    try {

    setForm({ title: '', description: '', price: '', order: 0 });      const payload = {

    setIconFile(null); setIconPreview(null); setError('');        ...form,

    setModal('category');        order: Number(form.order) || 0,

  }      };

      if (editId) {

  function openEditCategory(c: ServiceCategory) {        await adminApi.services.update(editId, payload);

    setEditId(c.id); setParentId(null);      } else {

    setForm({ title: c.title, description: c.description || '', price: '', order: c.order });        await adminApi.services.create(payload);

    setIconFile(null);      }

    setIconPreview(c.icon ? `${API_URL}/upload/${c.icon}` : null);      await loadServices();

    setError('');      setView('list');

    setModal('category');    } catch (e: any) {

  }      setError(e.message || 'Saqlashda xatolik yuz berdi');

    }

  function openCreateChild(catId: number) {    setSaving(false);

    setEditId(null); setParentId(catId);  }

    setForm({ title: '', description: '', price: '', order: 0 });

    setError('');  async function handleDelete(id: number) {

    setModal('child');    if (!confirm("Haqiqatan o'chirmoqchimisiz?")) return;

  }    try {

      await adminApi.services.delete(id);

  function openEditChild(child: ServiceChild, catId: number) {      loadServices();

    setEditId(child.id); setParentId(catId);    } catch (e: any) {

    setForm({ title: child.title, description: child.description || '', price: child.price || '', order: child.order });      alert(e.message || 'Xatolik');

    setError('');    }

    setModal('child');  }

  }

  async function handleToggle(s: ServiceItem) {

  function closeModal() { setModal('none'); }    try {

      await adminApi.services.update(s.id, { isActive: !s.isActive });

  async function handleSave() {      loadServices();

    if (!form.title.trim()) { setError('Nomini kiriting'); return; }    } catch { /* */ }

    setSaving(true); setError('');  }

    try {

      let iconName: string | undefined;  if (loading) return (

      if (iconFile) {    <div className="loading-screen">

        const up: any = await adminApi.upload.file(iconFile);      <div className="admin-card" style={{padding:'60px 40px',textAlign:'center'}}>

        iconName = up.url || up.filename;        <div className="spinner" />

      }        <p style={{color:'#8896ab',fontWeight:600,fontSize:14}}>Yuklanmoqda...</p>

      </div>

      const payload: any = {    </div>

        title: form.title,  );

        description: form.description || undefined,

        order: Number(form.order) || 0,  // ── Detail / Create / Edit view ──

      };  if (view === 'detail') {

    return (

      if (modal === 'category' && iconName) payload.icon = iconName;      <div className="fade-in-up">

      if (modal === 'child') {        <button className="btn btn-ghost btn-sm" onClick={() => setView('list')} style={{marginBottom:16}}>

        payload.parentId = parentId;          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>

        payload.price = form.price || undefined;          Orqaga

      }        </button>



      if (editId) {        <div className="admin-card" style={{padding:28,maxWidth:640}}>

        await adminApi.services.update(editId, payload);          <h2 style={{fontSize:20,fontWeight:800,color:'#1a2332',marginBottom:24}}>

      } else {            {editId ? '✏️ Xizmatni tahrirlash' : '➕ Yangi xizmat yaratish'}

        await adminApi.services.create(payload);          </h2>

      }

      await loadData();          {error && (

      closeModal();            <div style={{padding:'10px 14px',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:8,color:'#dc2626',fontSize:13,fontWeight:600,marginBottom:16}}>

      if (parentId) setExpanded(prev => new Set(prev).add(parentId));              {error}

    } catch (e: any) {            </div>

      setError(e.message || 'Saqlashda xatolik');          )}

    }

    setSaving(false);          <div style={{display:'flex',flexDirection:'column',gap:18}}>

  }            <div>

              <label style={{fontSize:13,fontWeight:700,color:'#1a2332',display:'block',marginBottom:6}}>Xizmat nomi *</label>

  async function handleDelete(id: number, isCategory: boolean) {              <input

    const msg = isCategory ? "Bu kategoriya va barcha yo'nalishlari o'chiriladi. Davom etasizmi?" : "Bu yo'nalishni o'chirmoqchimisiz?";                className="admin-input"

    if (!confirm(msg)) return;                value={form.title}

    try { await adminApi.services.delete(id); loadData(); } catch (e: any) { alert(e.message || 'Xatolik'); }                onChange={e => setForm({...form, title: e.target.value})}

  }                placeholder="Masalan: Rezyume yozish"

                style={{fontSize:15,padding:'12px 14px'}}

  async function handleToggle(id: number, current: boolean) {              />

    try { await adminApi.services.update(id, { isActive: !current }); loadData(); } catch { /* */ }            </div>

  }

            <div>

  function onIconChange(e: React.ChangeEvent<HTMLInputElement>) {              <label style={{fontSize:13,fontWeight:700,color:'#1a2332',display:'block',marginBottom:6}}>Tavsif</label>

    const f = e.target.files?.[0];              <textarea

    if (!f) return;                className="admin-input"

    setIconFile(f); setIconPreview(URL.createObjectURL(f));                value={form.description}

  }                onChange={e => setForm({...form, description: e.target.value})}

                placeholder="Xizmat haqida batafsil ma'lumot..."

  function formatPrice(p?: string) {                rows={4}

    if (!p) return '';                style={{resize:'vertical',padding:'12px 14px',lineHeight:1.6}}

    const num = parseInt(p.replace(/\D/g, ''));              />

    if (!num) return p;            </div>

    return num.toLocaleString('uz-UZ') + " so'm";

  }            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>

              <div>

  if (loading) return (                <label style={{fontSize:13,fontWeight:700,color:'#1a2332',display:'block',marginBottom:6}}>Narxi</label>

    <div className="loading-screen">                <input

      <div className="admin-card" style={{ padding: '60px 40px', textAlign: 'center' }}>                  className="admin-input"

        <div className="spinner" />                  value={form.price}

        <p style={{ color: '#8896ab', fontWeight: 600, fontSize: 14 }}>Yuklanmoqda...</p>                  onChange={e => setForm({...form, price: e.target.value})}

      </div>                  placeholder="100,000 so'm"

    </div>                  style={{padding:'12px 14px'}}

  );                />

              </div>

  const modalContent = modal !== 'none' && (              <div>

    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={closeModal}>                <label style={{fontSize:13,fontWeight:700,color:'#1a2332',display:'block',marginBottom:6}}>Tartib raqami</label>

      <div className="admin-card" style={{ padding: 28, maxWidth: 520, width: '100%' }} onClick={e => e.stopPropagation()}>                <input

        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a2332', marginBottom: 20 }}>                  className="admin-input"

          {modal === 'category'                  type="number"

            ? (editId ? '✏️ Kategoriyani tahrirlash' : '➕ Yangi kategoriya')                  value={form.order}

            : (editId ? "✏️ Yo'nalishni tahrirlash" : "➕ Yangi yo'nalish")}                  onChange={e => setForm({...form, order: Number(e.target.value)})}

        </h2>                  style={{padding:'12px 14px'}}

                />

        {error && (              </div>

          <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>            </div>

            {error}          </div>

          </div>

        )}          {/* Preview */}

          {form.title && (

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>            <div style={{marginTop:24,padding:16,background:'#f8fafc',borderRadius:12,border:'1px solid #e2e8f0'}}>

          {modal === 'category' && (              <p style={{fontSize:11,fontWeight:700,color:'#8896ab',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:10}}>Ko&apos;rinishi (webapp)</p>

            <div>              <div style={{display:'flex',alignItems:'center',gap:14,padding:14,background:'#fff',borderRadius:10,border:'1px solid #e2e8f0'}}>

              <label style={{ fontSize: 13, fontWeight: 700, color: '#1a2332', display: 'block', marginBottom: 6 }}>Ikonka</label>                <div style={{width:48,height:48,borderRadius:14,background:'#eef2f7',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>                  📦

                <div onClick={() => fileRef.current?.click()} style={{ width: 64, height: 64, borderRadius: 16, background: '#f0f4f8', border: '2px dashed #d0d7e0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', flexShrink: 0 }}>                </div>

                  {iconPreview                <div style={{flex:1}}>

                    ? <img src={iconPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,marginBottom:4}}>

                    : <span style={{ fontSize: 28, color: '#a0aec0' }}>📷</span>}                    <h3 style={{fontWeight:700,fontSize:14,color:'#1e3a5f'}}>{form.title}</h3>

                </div>                    {form.price && <span style={{fontSize:11,fontWeight:800,padding:'4px 10px',borderRadius:6,background:'#fdf6e3',color:'#92780c',whiteSpace:'nowrap'}}>{form.price}</span>}

                <div>                  </div>

                  <button className="btn btn-ghost btn-sm" type="button" onClick={() => fileRef.current?.click()}>Rasm tanlash</button>                  {form.description && <p style={{fontSize:12,color:'#6b7b8d',lineHeight:1.4}}>{form.description}</p>}

                  <p style={{ fontSize: 11, color: '#a0aec0', marginTop: 4 }}>PNG, JPG, SVG</p>                </div>

                </div>              </div>

                <input ref={fileRef} type="file" accept="image/*" onChange={onIconChange} style={{ display: 'none' }} />            </div>

              </div>          )}

            </div>

          )}          <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:28}}>

            <button className="btn btn-ghost" onClick={() => setView('list')}>Bekor qilish</button>

          <div>            <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.title.trim()}>

            <label style={{ fontSize: 13, fontWeight: 700, color: '#1a2332', display: 'block', marginBottom: 6 }}>              {saving ? 'Saqlanmoqda...' : (editId ? '💾 Saqlash' : '➕ Yaratish')}

              {modal === 'category' ? 'Kategoriya nomi *' : "Yo'nalish nomi *"}            </button>

            </label>          </div>

            <input className="admin-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder={modal === 'category' ? "Masalan: Resume yozish" : "Masalan: Dasturchi resume"} style={{ fontSize: 15, padding: '12px 14px' }} />        </div>

          </div>      </div>

    );

          <div>  }

            <label style={{ fontSize: 13, fontWeight: 700, color: '#1a2332', display: 'block', marginBottom: 6 }}>Tavsif</label>

            <textarea className="admin-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Qisqacha izoh..." rows={3} style={{ resize: 'vertical', padding: '12px 14px', lineHeight: 1.6 }} />  // ── List view ──

          </div>  return (

    <div className="fade-in-up">

          <div style={{ display: 'grid', gridTemplateColumns: modal === 'child' ? '1fr 1fr' : '1fr', gap: 14 }}>      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>

            {modal === 'child' && (        <div>

              <div>          <h2 style={{fontSize:22,fontWeight:800,color:'#1a2332',marginBottom:4}}>Xizmatlar</h2>

                <label style={{ fontSize: 13, fontWeight: 700, color: '#1a2332', display: 'block', marginBottom: 6 }}>Narxi (so&apos;m)</label>          <p style={{color:'#8896ab',fontSize:14}}>Jami: {services.length} ta xizmat</p>

                <input className="admin-input" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="100000" style={{ padding: '12px 14px' }} />        </div>

              </div>        <button className="btn btn-primary" onClick={openCreate}>

            )}          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M12 5v14M5 12h14"/></svg>

            <div>          Yangi xizmat

              <label style={{ fontSize: 13, fontWeight: 700, color: '#1a2332', display: 'block', marginBottom: 6 }}>Tartib raqami</label>        </button>

              <input className="admin-input" type="number" value={form.order} onChange={e => setForm({ ...form, order: Number(e.target.value) })} style={{ padding: '12px 14px' }} />      </div>

            </div>

          </div>      {services.length === 0 ? (

        </div>        <div className="admin-card" style={{textAlign:'center',padding:'60px 40px'}}>

          <div style={{fontSize:48,marginBottom:12}}>📦</div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>          <h3 style={{fontSize:18,fontWeight:800,color:'#1a2332',marginBottom:8}}>Hali xizmat qo&apos;shilmagan</h3>

          <button className="btn btn-ghost" onClick={closeModal}>Bekor qilish</button>          <p style={{color:'#8896ab',fontSize:14,marginBottom:20}}>Birinchi xizmatni yarating — u webapp&apos;da ko&apos;rinadi</p>

          <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.title.trim()}>          <button className="btn btn-primary" onClick={openCreate}>➕ Birinchi xizmatni yaratish</button>

            {saving ? 'Saqlanmoqda...' : (editId ? '💾 Saqlash' : '➕ Yaratish')}        </div>

          </button>      ) : (

        </div>        <div style={{display:'flex',flexDirection:'column',gap:10}}>

      </div>          {services.map((s) => (

    </div>            <div key={s.id} className="admin-card" style={{padding:'16px 20px',display:'flex',alignItems:'center',gap:16,opacity: s.isActive ? 1 : 0.5}}>

  );              <div style={{width:48,height:48,borderRadius:14,background:'#f0f4f8',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>

                {s.icon || '📦'}

  return (              </div>

    <div className="fade-in-up">              <div style={{flex:1,minWidth:0}}>

      {modalContent}                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>

                  <h3 style={{fontWeight:700,fontSize:15,color:'#1a2332'}}>{s.title}</h3>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>                  <span className={`badge ${s.isActive ? 'badge-green' : 'badge-red'}`} style={{fontSize:10}}>{s.isActive ? 'Faol' : 'Nofaol'}</span>

        <div>                </div>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a2332', marginBottom: 4 }}>Xizmat kategoriyalari</h2>                {s.description && <p style={{fontSize:13,color:'#8896ab',marginBottom:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.description}</p>}

          <p style={{ color: '#8896ab', fontSize: 14 }}>                <div style={{display:'flex',gap:12,fontSize:12,color:'#a0aec0',marginTop:4}}>

            {categories.length} ta kategoriya, {categories.reduce((a, c) => a + (c.children?.length || 0), 0)} ta yo&apos;nalish                  {s.price && <span>💰 {s.price}</span>}

          </p>                  {s.slug && <span>🔗 {s.slug}</span>}

        </div>                  <span>📊 Tartib: {s.order}</span>

        <button className="btn btn-primary" onClick={openCreateCategory}>                </div>

          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M12 5v14M5 12h14" /></svg>              </div>

          Yangi kategoriya              <div style={{display:'flex',gap:6,flexShrink:0}}>

        </button>                <button className="btn btn-ghost btn-sm" onClick={() => handleToggle(s)} title={s.isActive ? 'Nofaol qilish' : 'Faol qilish'}>

      </div>                  {s.isActive ? '🔴' : '🟢'}

                </button>

      {categories.length === 0 ? (                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)} title="Tahrirlash">

        <div className="admin-card" style={{ textAlign: 'center', padding: '60px 40px' }}>                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>

          <div style={{ fontSize: 48, marginBottom: 12 }}>📂</div>                </button>

          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1a2332', marginBottom: 8 }}>Hali kategoriya qo&apos;shilmagan</h3>                <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(s.id)} title="O'chirish" style={{color:'#ef4444'}}>

          <p style={{ color: '#8896ab', fontSize: 14, marginBottom: 20 }}>Birinchi kategoriyani yarating</p>                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>

          <button className="btn btn-primary" onClick={openCreateCategory}>➕ Birinchi kategoriya</button>                </button>

        </div>              </div>

      ) : (            </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>          ))}

          {categories.map(cat => {        </div>

            const isOpen = expanded.has(cat.id);      )}

            const children = cat.children || [];    </div>

            return (  );

              <div key={cat.id} className="admin-card" style={{ padding: 0, overflow: 'hidden', opacity: cat.isActive ? 1 : 0.5 }}>}

                <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }} onClick={() => toggleExpand(cat.id)}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, overflow: 'hidden' }}>
                    {cat.icon
                      ? <img src={`${API_URL}/upload/${cat.icon}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : '📂'}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <h3 style={{ fontWeight: 700, fontSize: 16, color: '#1a2332' }}>{cat.title}</h3>
                      <span className={`badge ${cat.isActive ? 'badge-green' : 'badge-red'}`} style={{ fontSize: 10 }}>{cat.isActive ? 'Faol' : 'Nofaol'}</span>
                      <span style={{ fontSize: 12, color: '#a0aec0', marginLeft: 4 }}>{children.length} ta yo&apos;nalish</span>
                    </div>
                    {cat.description && <p style={{ fontSize: 13, color: '#8896ab', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.description}</p>}
                  </div>

                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openCreateChild(cat.id)} title="Yo'nalish qo'shish">➕</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleToggle(cat.id, cat.isActive)}>{cat.isActive ? '🔴' : '🟢'}</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEditCategory(cat)}>✏️</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(cat.id, true)} style={{ color: '#ef4444' }}>🗑️</button>
                  </div>

                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#a0aec0" strokeWidth="2" style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {isOpen && (
                  <div style={{ borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    {children.length === 0 ? (
                      <div style={{ padding: '24px 20px', textAlign: 'center' }}>
                        <p style={{ color: '#a0aec0', fontSize: 13, marginBottom: 10 }}>Bu kategoriyada hali yo&apos;nalish yo&apos;q</p>
                        <button className="btn btn-ghost btn-sm" onClick={() => openCreateChild(cat.id)}>➕ Yo&apos;nalish qo&apos;shish</button>
                      </div>
                    ) : (
                      children.map((ch, idx) => (
                        <div key={ch.id} style={{ padding: '12px 20px 12px 82px', display: 'flex', alignItems: 'center', gap: 12, borderTop: idx > 0 ? '1px solid #edf2f7' : 'none', opacity: ch.isActive ? 1 : 0.5 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#cbd5e0', flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontWeight: 600, fontSize: 14, color: '#1e3a5f' }}>{ch.title}</span>
                              {ch.price && <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: '#fdf6e3', color: '#92780c' }}>{formatPrice(ch.price)}</span>}
                            </div>
                            {ch.description && <p style={{ fontSize: 12, color: '#8896ab', marginTop: 2 }}>{ch.description}</p>}
                          </div>
                          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => handleToggle(ch.id, ch.isActive)} style={{ fontSize: 12 }}>{ch.isActive ? '🔴' : '🟢'}</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => openEditChild(ch, cat.id)} style={{ fontSize: 12 }}>✏️</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(ch.id, false)} style={{ color: '#ef4444', fontSize: 12 }}>🗑️</button>
                          </div>
                        </div>
                      ))
                    )}
                    {children.length > 0 && (
                      <div style={{ padding: '10px 20px 10px 82px', borderTop: '1px solid #edf2f7' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openCreateChild(cat.id)} style={{ fontSize: 12, color: '#3b82f6' }}>➕ Yo&apos;nalish qo&apos;shish</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
