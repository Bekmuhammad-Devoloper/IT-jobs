'use client';

import { useEffect, useState, useRef } from 'react';
import { adminApi } from '@/lib/api';

interface FormField {
  key: string;
  label: string;
  placeholder: string;
  type: 'text' | 'textarea' | 'number' | 'tel' | 'email' | 'url';
  required: boolean;
}

interface ServiceChild {
  id: number;
  title: string;
  description?: string;
  price?: string;
  order: number;
  isActive: boolean;
  formFields?: FormField[];
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

function iconUrl(icon?: string) {
  if (!icon) return '';
  if (icon.startsWith('http') || icon.startsWith('/api/')) return icon;
  return `${API_URL}/upload/${icon}`;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Matn' },
  { value: 'textarea', label: 'Katta matn' },
  { value: 'number', label: 'Raqam' },
  { value: 'tel', label: 'Telefon' },
  { value: 'email', label: 'Email' },
  { value: 'url', label: 'Havola' },
];

export default function AdminServicesPage() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modal, setModal] = useState<'none' | 'category' | 'child'>('none');
  const [editId, setEditId] = useState<number | null>(null);
  const [parentId, setParentId] = useState<number | null>(null);

  const [form, setForm] = useState({ title: '', description: '', price: '', order: 0 });
  const [formFields, setFormFields] = useState<FormField[]>([]);
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
    setFormFields([]);
    setIconFile(null); setIconPreview(null); setError('');
    setModal('category');
  }

  function openEditCategory(c: ServiceCategory) {
    setEditId(c.id); setParentId(null);
    setForm({ title: c.title, description: c.description || '', price: '', order: c.order });
    setFormFields([]);
    setIconFile(null);
    setIconPreview(c.icon ? iconUrl(c.icon) : null);
    setError('');
    setModal('category');
  }

  function openCreateChild(catId: number) {
    setEditId(null); setParentId(catId);
    setForm({ title: '', description: '', price: '', order: 0 });
    setFormFields([]);
    setError('');
    setModal('child');
  }

  function openEditChild(child: ServiceChild, catId: number) {
    setEditId(child.id); setParentId(catId);
    setForm({ title: child.title, description: child.description || '', price: child.price || '', order: child.order });
    setFormFields(child.formFields || []);
    setError('');
    setModal('child');
  }

  function closeModal() { setModal('none'); }

  // Form fields management
  function addField() {
    setFormFields([...formFields, {
      key: `field_${Date.now()}`,
      label: '',
      placeholder: '',
      type: 'text',
      required: false,
    }]);
  }

  function updateField(idx: number, patch: Partial<FormField>) {
    setFormFields(formFields.map((f, i) => i === idx ? { ...f, ...patch } : f));
  }

  function removeField(idx: number) {
    setFormFields(formFields.filter((_, i) => i !== idx));
  }

  function moveField(idx: number, dir: -1 | 1) {
    const arr = [...formFields];
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= arr.length) return;
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    setFormFields(arr);
  }

  async function handleSave() {
    if (!form.title.trim()) { setError('Nomini kiriting'); return; }
    setSaving(true); setError('');
    try {
      let iconName: string | undefined;
      if (iconFile) {
        const up: any = await adminApi.upload.file(iconFile);
        const raw = up.filename || up.url || '';
        iconName = raw.split('/').pop();
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
        // Save form fields - only fields with labels
        const cleanFields = formFields.filter(f => f.label.trim()).map(f => ({
          ...f,
          key: f.key || `field_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        }));
        payload.formFields = cleanFields.length > 0 ? cleanFields : null;
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

  const st = {
    page: { maxWidth: 860, margin: '0 auto' } as React.CSSProperties,
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 } as React.CSSProperties,
    headerTitle: { fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' } as React.CSSProperties,
    headerSub: { fontSize: 13, color: '#94a3b8', fontWeight: 500, marginTop: 4 } as React.CSSProperties,
    addBtn: {
      display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 22px',
      background: '#0f172a', color: '#fff', border: 'none', borderRadius: 12,
      fontSize: 13.5, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
      boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
    } as React.CSSProperties,
    card: {
      background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden',
    } as React.CSSProperties,
    cardRow: {
      padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 16,
      cursor: 'pointer', transition: 'background 0.15s',
    } as React.CSSProperties,
    iconBox: {
      width: 48, height: 48, borderRadius: 12, background: '#f8fafc',
      border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexShrink: 0, overflow: 'hidden',
    } as React.CSSProperties,
    catTitle: { fontWeight: 600, fontSize: 15, color: '#0f172a' } as React.CSSProperties,
    badge: (active: boolean) => ({
      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
      background: active ? '#ecfdf5' : '#fef2f2',
      color: active ? '#059669' : '#dc2626',
    }) as React.CSSProperties,
    countBadge: {
      fontSize: 11, color: '#94a3b8', fontWeight: 500,
      background: '#f8fafc', padding: '2px 8px', borderRadius: 6,
    } as React.CSSProperties,
    desc: { fontSize: 13, color: '#94a3b8', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const } as React.CSSProperties,
    actionBtn: (color?: string) => ({
      width: 32, height: 32, borderRadius: 8, border: '1px solid #f1f5f9',
      background: '#fafbfc', display: 'inline-flex', alignItems: 'center',
      justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s', color: color || '#64748b',
    }) as React.CSSProperties,
    chevron: (open: boolean) => ({
      width: 20, height: 20, transition: 'transform 0.25s ease',
      transform: open ? 'rotate(180deg)' : 'rotate(0)', color: '#cbd5e1',
    }) as React.CSSProperties,
    childZone: { borderTop: '1px solid #f8fafc', background: '#fafbfc' } as React.CSSProperties,
    childRow: (isFirst: boolean) => ({
      padding: '14px 24px 14px 84px', display: 'flex', alignItems: 'center', gap: 12,
      borderTop: isFirst ? 'none' : '1px solid #f1f5f9',
    }) as React.CSSProperties,
    childDot: { width: 6, height: 6, borderRadius: '50%', background: '#cbd5e1', flexShrink: 0 } as React.CSSProperties,
    childTitle: { fontWeight: 500, fontSize: 14, color: '#334155' } as React.CSSProperties,
    priceBadge: {
      fontSize: 11.5, fontWeight: 600, padding: '3px 10px', borderRadius: 8,
      background: 'linear-gradient(135deg, #fef9c3, #fef3c7)', color: '#92400e',
      border: '1px solid #fde68a',
    } as React.CSSProperties,
    fieldsBadge: {
      fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4,
      background: '#eff6ff', color: '#3b82f6',
    } as React.CSSProperties,
    overlay: {
      position: 'fixed' as const, inset: 0, background: 'rgba(15,23,42,0.4)',
      backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 24,
    } as React.CSSProperties,
    modalBox: {
      background: '#fff', borderRadius: 20, padding: 0, maxWidth: 560,
      width: '100%', boxShadow: '0 25px 60px rgba(0,0,0,0.15)',
      overflow: 'hidden', animation: 'slideUp 0.25s ease',
      maxHeight: '90vh', display: 'flex', flexDirection: 'column' as const,
    } as React.CSSProperties,
    modalHeader: {
      padding: '24px 28px 0', fontSize: 18, fontWeight: 700, color: '#0f172a',
      flexShrink: 0,
    } as React.CSSProperties,
    modalBody: { padding: '20px 28px', display: 'flex', flexDirection: 'column' as const, gap: 18, overflowY: 'auto' as const, flex: 1 } as React.CSSProperties,
    modalFooter: {
      padding: '16px 28px 24px', display: 'flex', gap: 10,
      justifyContent: 'flex-end', flexShrink: 0, borderTop: '1px solid #f1f5f9',
    } as React.CSSProperties,
    label: { fontSize: 12.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.04em' } as React.CSSProperties,
    input: {
      width: '100%', padding: '11px 14px', fontSize: 14, border: '1.5px solid #e2e8f0',
      borderRadius: 10, outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
      background: '#fafbfc', color: '#0f172a',
    } as React.CSSProperties,
    inputSm: {
      width: '100%', padding: '8px 10px', fontSize: 13, border: '1.5px solid #e2e8f0',
      borderRadius: 8, outline: 'none', background: '#fafbfc', color: '#0f172a',
    } as React.CSSProperties,
    textarea: {
      width: '100%', padding: '11px 14px', fontSize: 14, border: '1.5px solid #e2e8f0',
      borderRadius: 10, outline: 'none', resize: 'vertical' as const, minHeight: 80,
      lineHeight: 1.6, background: '#fafbfc', color: '#0f172a',
    } as React.CSSProperties,
    iconUpload: {
      display: 'flex', alignItems: 'center', gap: 16, padding: 14,
      border: '1.5px dashed #e2e8f0', borderRadius: 14, background: '#fafbfc',
      cursor: 'pointer',
    } as React.CSSProperties,
    iconThumb: {
      width: 52, height: 52, borderRadius: 14, background: '#f1f5f9',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', flexShrink: 0,
    } as React.CSSProperties,
    cancelBtn: {
      padding: '10px 20px', fontSize: 13.5, fontWeight: 600, color: '#64748b',
      background: 'transparent', border: '1.5px solid #e2e8f0', borderRadius: 10,
      cursor: 'pointer',
    } as React.CSSProperties,
    saveBtn: (disabled: boolean) => ({
      padding: '10px 24px', fontSize: 13.5, fontWeight: 600, color: '#fff',
      background: disabled ? '#94a3b8' : '#0f172a', border: 'none', borderRadius: 10,
      cursor: disabled ? 'not-allowed' : 'pointer',
      boxShadow: disabled ? 'none' : '0 1px 3px rgba(0,0,0,0.12)',
    }) as React.CSSProperties,
    emptyState: {
      textAlign: 'center' as const, padding: '64px 40px',
      background: '#fff', borderRadius: 20, border: '1px solid #f1f5f9',
    } as React.CSSProperties,
    errorBox: {
      padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca',
      borderRadius: 10, color: '#dc2626', fontSize: 13, fontWeight: 500,
    } as React.CSSProperties,
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" />
        <p style={{ color: '#94a3b8', fontWeight: 500, fontSize: 13, marginTop: 12 }}>Yuklanmoqda...</p>
      </div>
    </div>
  );

  const modalContent = modal !== 'none' && (
    <div style={st.overlay} onClick={closeModal}>
      <div style={st.modalBox} onClick={e => e.stopPropagation()}>
        <div style={st.modalHeader}>
          {modal === 'category'
            ? (editId ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya')
            : (editId ? "Yo'nalishni tahrirlash" : "Yangi yo'nalish")}
        </div>

        <div style={st.modalBody}>
          {error && <div style={st.errorBox}>{error}</div>}

          {modal === 'category' && (
            <div>
              <label style={st.label}>Ikonka</label>
              <div style={st.iconUpload} onClick={() => fileRef.current?.click()}>
                <div style={st.iconThumb}>
                  {iconPreview
                    ? <img src={iconPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    : <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M6 21l5-5 3 3 4-6 3 4"/></svg>}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Rasm tanlash</p>
                  <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>PNG, JPG yoki SVG</p>
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={onIconChange} style={{ display: 'none' }} />
              </div>
            </div>
          )}

          <div>
            <label style={st.label}>{modal === 'category' ? 'Kategoriya nomi' : "Yo'nalish nomi"}</label>
            <input style={st.input} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder={modal === 'category' ? "Masalan: Resume yozish" : "Masalan: Dasturchi resume"} />
          </div>

          <div>
            <label style={st.label}>Tavsif</label>
            <textarea style={st.textarea} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Qisqacha izoh..." rows={3} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: modal === 'child' ? '1fr 1fr' : '1fr', gap: 14 }}>
            {modal === 'child' && (
              <div>
                <label style={st.label}>Narxi (so&apos;m)</label>
                <input style={st.input} value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="100 000" />
              </div>
            )}
            <div>
              <label style={st.label}>Tartib raqami</label>
              <input style={st.input} type="number" value={form.order} onChange={e => setForm({ ...form, order: Number(e.target.value) })} />
            </div>
          </div>

          {/* ====== FORM FIELDS EDITOR (child only) ====== */}
          {modal === 'child' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <label style={{ ...st.label, marginBottom: 0 }}>
                  Forma maydonlari
                  <span style={{ fontSize: 10, color: '#94a3b8', textTransform: 'none', letterSpacing: 0, marginLeft: 6 }}>
                    (foydalanuvchi to&apos;ldiradi)
                  </span>
                </label>
                <button onClick={addField} style={{
                  padding: '5px 12px', fontSize: 12, fontWeight: 600, color: '#3b82f6',
                  background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: 8,
                  cursor: 'pointer',
                }}>+ Maydon</button>
              </div>

              {formFields.length === 0 && (
                <div style={{ padding: '20px 16px', textAlign: 'center', background: '#f8fafc', borderRadius: 10, border: '1px dashed #e2e8f0' }}>
                  <p style={{ fontSize: 12, color: '#94a3b8' }}>Hali maydon qo&apos;shilmagan</p>
                  <p style={{ fontSize: 11, color: '#cbd5e1', marginTop: 4 }}>Foydalanuvchi to&apos;ldirishi kerak bo&apos;lgan maydonlarni qo&apos;shing</p>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {formFields.map((field, idx) => (
                  <div key={idx} style={{
                    padding: '12px', background: '#f8fafc', borderRadius: 10,
                    border: '1px solid #f1f5f9',
                  }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <input style={{ ...st.inputSm, flex: 2 }} value={field.label}
                        onChange={e => updateField(idx, { label: e.target.value })}
                        placeholder="Maydon nomi (masalan: Ism)" />
                      <select style={{ ...st.inputSm, flex: 1 }} value={field.type}
                        onChange={e => updateField(idx, { type: e.target.value as FormField['type'] })}>
                        {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input style={{ ...st.inputSm, flex: 1 }} value={field.placeholder}
                        onChange={e => updateField(idx, { placeholder: e.target.value })}
                        placeholder="Placeholder..." />
                      <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#64748b', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                        <input type="checkbox" checked={field.required}
                          onChange={e => updateField(idx, { required: e.target.checked })} />
                        Majburiy
                      </label>
                      <button onClick={() => moveField(idx, -1)} style={{ width: 24, height: 24, border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#94a3b8' }}>▲</button>
                      <button onClick={() => moveField(idx, 1)} style={{ width: 24, height: 24, border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#94a3b8' }}>▼</button>
                      <button onClick={() => removeField(idx)} style={{ width: 24, height: 24, border: '1px solid #fecaca', borderRadius: 6, background: '#fef2f2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#ef4444' }}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={st.modalFooter}>
          <button style={st.cancelBtn} onClick={closeModal}>Bekor qilish</button>
          <button style={st.saveBtn(saving || !form.title.trim())} onClick={handleSave} disabled={saving || !form.title.trim()}>
            {saving ? 'Saqlanmoqda...' : (editId ? 'Saqlash' : 'Yaratish')}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fade-in-up" style={st.page}>
      <style>{`@keyframes slideUp { from { opacity:0;transform:translateY(12px) } to { opacity:1;transform:translateY(0) } }`}</style>
      {modalContent}

      <div style={st.header}>
        <div>
          <h2 style={st.headerTitle}>Xizmatlar</h2>
          <p style={st.headerSub}>
            {categories.length} kategoriya · {categories.reduce((a, c) => a + (c.children?.length || 0), 0)} yo&apos;nalish
          </p>
        </div>
        <button style={st.addBtn} onClick={openCreateCategory}>
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" d="M12 5v14M5 12h14"/></svg>
          Kategoriya
        </button>
      </div>

      {categories.length === 0 ? (
        <div style={st.emptyState}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: '#f8fafc', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#cbd5e1" strokeWidth="1.5"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Hali kategoriya yo&apos;q</h3>
          <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 20 }}>Birinchi kategoriyangizni yarating</p>
          <button style={st.addBtn} onClick={openCreateCategory}>+ Yangi kategoriya</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {categories.map(cat => {
            const isOpen = expanded.has(cat.id);
            const children = cat.children || [];
            return (
              <div key={cat.id} style={{ ...st.card, opacity: cat.isActive ? 1 : 0.55 }}>
                <div style={st.cardRow} onClick={() => toggleExpand(cat.id)}>
                  <div style={st.iconBox}>
                    {cat.icon
                      ? <img src={iconUrl(cat.icon)} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      : <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth="1.5"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={st.catTitle}>{cat.title}</span>
                      <span style={st.badge(cat.isActive)}>{cat.isActive ? 'Faol' : 'Nofaol'}</span>
                      <span style={st.countBadge}>{children.length}</span>
                    </div>
                    {cat.description && <p style={st.desc}>{cat.description}</p>}
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                    <button style={st.actionBtn('#3b82f6')} onClick={() => openCreateChild(cat.id)} title="Yo'nalish qo'shish">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" d="M12 5v14M5 12h14"/></svg>
                    </button>
                    <button style={st.actionBtn()} onClick={() => handleToggle(cat.id, cat.isActive)}>
                      {cat.isActive
                        ? <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="4"/></svg>
                        : <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#22c55e" strokeWidth="2"><circle cx="12" cy="12" r="4"/></svg>}
                    </button>
                    <button style={st.actionBtn()} onClick={() => openEditCategory(cat)}>
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button style={st.actionBtn('#ef4444')} onClick={() => handleDelete(cat.id, true)}>
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14"/></svg>
                    </button>
                  </div>
                  <svg style={st.chevron(isOpen)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>

                {isOpen && (
                  <div style={st.childZone}>
                    {children.length === 0 ? (
                      <div style={{ padding: '28px 24px', textAlign: 'center' }}>
                        <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 10 }}>Bu kategoriyada hali yo&apos;nalish yo&apos;q</p>
                        <button style={{ ...st.cancelBtn, fontSize: 12.5, padding: '7px 16px' }} onClick={() => openCreateChild(cat.id)}>+ Yo&apos;nalish qo&apos;shish</button>
                      </div>
                    ) : (
                      children.map((ch, idx) => (
                        <div key={ch.id} style={{ ...st.childRow(idx === 0), opacity: ch.isActive ? 1 : 0.5 }}>
                          <div style={st.childDot} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <span style={st.childTitle}>{ch.title}</span>
                              {ch.price && <span style={st.priceBadge}>{formatPrice(ch.price)}</span>}
                              {ch.formFields && ch.formFields.length > 0 && (
                                <span style={st.fieldsBadge}>{ch.formFields.length} maydon</span>
                              )}
                            </div>
                            {ch.description && <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{ch.description}</p>}
                          </div>
                          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                            <button style={{ ...st.actionBtn(), width: 28, height: 28 }} onClick={() => handleToggle(ch.id, ch.isActive)}>
                              {ch.isActive
                                ? <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="4"/></svg>
                                : <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#22c55e" strokeWidth="2"><circle cx="12" cy="12" r="4"/></svg>}
                            </button>
                            <button style={{ ...st.actionBtn(), width: 28, height: 28 }} onClick={() => openEditChild(ch, cat.id)}>
                              <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="#64748b" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button style={{ ...st.actionBtn('#ef4444'), width: 28, height: 28 }} onClick={() => handleDelete(ch.id, false)}>
                              <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14"/></svg>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                    {children.length > 0 && (
                      <div style={{ padding: '12px 24px 12px 84px', borderTop: '1px solid #f1f5f9' }}>
                        <button style={{ background: 'none', border: 'none', fontSize: 12.5, fontWeight: 600, color: '#3b82f6', cursor: 'pointer', padding: '4px 0' }}
                          onClick={() => openCreateChild(cat.id)}>+ Yo&apos;nalish qo&apos;shish</button>
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