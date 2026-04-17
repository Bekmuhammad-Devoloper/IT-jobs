'use client';

import { useEffect, useState, useRef } from 'react';
import { adminApi } from '@/lib/api';

interface ServiceChild {
  id: number;
  title: string;
  description?: string;
  price?: string;
  order: number;
  isActive: boolean;
}

interface ServiceCategory {
  id: number;
  title: string;
  description?: string;
  icon?: string;
  order: number;
  isActive: boolean;
  children: ServiceChild[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export default function AdminServicesPage() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modal, setModal] = useState<'none' | 'category' | 'child'>('none');
  const [editId, setEditId] = useState<number | null>(null);
  const [parentId, setParentId] = useState<number | null>(null);

  const [form, setForm] = useState({ title: '', description: '', price: '', order: 0 });
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      setLoading(true);
      const res: any = await adminApi.services.getAll();
      const data = Array.isArray(res) ? res : (res.data || []);
      setCategories(data);
    } catch (e: any) {
      setError(e.message || 'Yuklashda xatolik');
    } finally { setLoading(false); }
  }

  function toggleExpand(id: number) {
    setExpanded(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }

  function openCreateCategory() {
    setEditId(null); setParentId(null);
    setForm({ title: '', description: '', price: '', order: 0 });
    setIconFile(null); setIconPreview(null); setError('');
    setModal('category');
  }

  function openEditCategory(c: ServiceCategory) {
    setEditId(c.id); setParentId(null);
    setForm({ title: c.title, description: c.description || '', price: '', order: c.order });
    setIconFile(null);
    setIconPreview(c.icon ? `${API_URL}/upload/${c.icon}` : null);
    setError('');
    setModal('category');
  }

  function openCreateChild(catId: number) {
    setEditId(null); setParentId(catId);
    setForm({ title: '', description: '', price: '', order: 0 });
    setError('');
    setModal('child');
  }

  function openEditChild(child: ServiceChild, catId: number) {
    setEditId(child.id); setParentId(catId);
    setForm({ title: child.title, description: child.description || '', price: child.price || '', order: child.order });
    setError('');
    setModal('child');
  }

  function closeModal() { setModal('none'); }

  async function handleSave() {
    if (!form.title.trim()) { setError('Nomini kiriting'); return; }
    setSaving(true); setError('');
    try {
      let iconName: string | undefined;
      if (iconFile) {
        const up: any = await adminApi.upload.file(iconFile);
        iconName = up.url || up.filename;
      }

      const payload: any = {
        title: form.title,
        description: form.description || undefined,
        order: Number(form.order) || 0,
      };

      if (modal === 'category' && iconName) payload.icon = iconName;
      if (modal === 'child') {
        payload.parentId = parentId;
        payload.price = form.price || undefined;
      }

      if (editId) {
        await adminApi.services.update(editId, payload);
      } else {
        await adminApi.services.create(payload);
      }
      await loadData();
      closeModal();
      if (parentId) setExpanded(prev => new Set(prev).add(parentId));
    } catch (e: any) {
      setError(e.message || 'Saqlashda xatolik');
    }
    setSaving(false);
  }

  async function handleDelete(id: number, isCategory: boolean) {
    const msg = isCategory ? "Bu kategoriya va barcha yo'nalishlari o'chiriladi. Davom etasizmi?" : "Bu yo'nalishni o'chirmoqchimisiz?";
    if (!confirm(msg)) return;
    try { await adminApi.services.delete(id); loadData(); } catch (e: any) { alert(e.message || 'Xatolik'); }
  }

  async function handleToggle(id: number, current: boolean) {
    try { await adminApi.services.update(id, { isActive: !current }); loadData(); } catch { /* */ }
  }

  function onIconChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setIconFile(f); setIconPreview(URL.createObjectURL(f));
  }

  function formatPrice(p?: string) {
    if (!p) return '';
    const num = parseInt(p.replace(/\D/g, ''));
    if (!num) return p;
    return num.toLocaleString('uz-UZ') + " so'm";
  }

  if (loading) return (
    <div className="loading-screen">
      <div className="admin-card" style={{ padding: '60px 40px', textAlign: 'center' }}>
        <div className="spinner" />
        <p style={{ color: '#8896ab', fontWeight: 600, fontSize: 14 }}>Yuklanmoqda...</p>
      </div>
    </div>
  );

  const modalContent = modal !== 'none' && (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={closeModal}>
      <div className="admin-card" style={{ padding: 28, maxWidth: 520, width: '100%' }} onClick={e => e.stopPropagation()}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a2332', marginBottom: 20 }}>
          {modal === 'category'
            ? (editId ? '✏️ Kategoriyani tahrirlash' : '➕ Yangi kategoriya')
            : (editId ? "✏️ Yo'nalishni tahrirlash" : "➕ Yangi yo'nalish")}
        </h2>

        {error && (
          <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {modal === 'category' && (
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#1a2332', display: 'block', marginBottom: 6 }}>Ikonka</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div onClick={() => fileRef.current?.click()} style={{ width: 64, height: 64, borderRadius: 16, background: '#f0f4f8', border: '2px dashed #d0d7e0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', flexShrink: 0 }}>
                  {iconPreview
                    ? <img src={iconPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: 28, color: '#a0aec0' }}>📷</span>}
                </div>
                <div>
                  <button className="btn btn-ghost btn-sm" type="button" onClick={() => fileRef.current?.click()}>Rasm tanlash</button>
                  <p style={{ fontSize: 11, color: '#a0aec0', marginTop: 4 }}>PNG, JPG, SVG</p>
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={onIconChange} style={{ display: 'none' }} />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: '#1a2332', display: 'block', marginBottom: 6 }}>
              {modal === 'category' ? 'Kategoriya nomi *' : "Yo'nalish nomi *"}
            </label>
            <input className="admin-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder={modal === 'category' ? "Masalan: Resume yozish" : "Masalan: Dasturchi resume"} style={{ fontSize: 15, padding: '12px 14px' }} />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: '#1a2332', display: 'block', marginBottom: 6 }}>Tavsif</label>
            <textarea className="admin-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Qisqacha izoh..." rows={3} style={{ resize: 'vertical', padding: '12px 14px', lineHeight: 1.6 }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: modal === 'child' ? '1fr 1fr' : '1fr', gap: 14 }}>
            {modal === 'child' && (
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#1a2332', display: 'block', marginBottom: 6 }}>Narxi (so&apos;m)</label>
                <input className="admin-input" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="100000" style={{ padding: '12px 14px' }} />
              </div>
            )}
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#1a2332', display: 'block', marginBottom: 6 }}>Tartib raqami</label>
              <input className="admin-input" type="number" value={form.order} onChange={e => setForm({ ...form, order: Number(e.target.value) })} style={{ padding: '12px 14px' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
          <button className="btn btn-ghost" onClick={closeModal}>Bekor qilish</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.title.trim()}>
            {saving ? 'Saqlanmoqda...' : (editId ? '💾 Saqlash' : '➕ Yaratish')}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fade-in-up">
      {modalContent}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a2332', marginBottom: 4 }}>Xizmat kategoriyalari</h2>
          <p style={{ color: '#8896ab', fontSize: 14 }}>
            {categories.length} ta kategoriya, {categories.reduce((a, c) => a + (c.children?.length || 0), 0)} ta yo&apos;nalish
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreateCategory}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M12 5v14M5 12h14" /></svg>
          Yangi kategoriya
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📂</div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1a2332', marginBottom: 8 }}>Hali kategoriya qo&apos;shilmagan</h3>
          <p style={{ color: '#8896ab', fontSize: 14, marginBottom: 20 }}>Birinchi kategoriyani yarating</p>
          <button className="btn btn-primary" onClick={openCreateCategory}>➕ Birinchi kategoriya</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {categories.map(cat => {
            const isOpen = expanded.has(cat.id);
            const children = cat.children || [];
            return (
              <div key={cat.id} className="admin-card" style={{ padding: 0, overflow: 'hidden', opacity: cat.isActive ? 1 : 0.5 }}>
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