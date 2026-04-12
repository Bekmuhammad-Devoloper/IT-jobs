'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';

interface Setting {
  id: number;
  key: string;
  value: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  type: string;
  isActive: boolean;
  order: number;
}

interface Technology {
  id: number;
  name: string;
  category: string;
}

const tabItems = [
  { key: 'settings', label: 'Sozlamalar', icon: '<svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>' },
  { key: 'categories', label: 'Kategoriyalar', icon: '<svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>' },
  { key: 'technologies', label: 'Texnologiyalar', icon: '<svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>' },
];

export default function SettingsPage() {
  const [tab, setTab] = useState<'settings' | 'categories' | 'technologies'>('settings');
  const [settings, setSettings] = useState<Setting[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const [newCat, setNewCat] = useState({ name: '', slug: '', type: 'profession' });
  const [newTech, setNewTech] = useState({ name: '', category: 'frontend' });

  useEffect(() => {
    loadData();
  }, [tab]);

  async function loadData() {
    setLoading(true);
    try {
      if (tab === 'settings') {
        const res: any = await adminApi.settings.getAll();
        setSettings(res.data || res || []);
      } else if (tab === 'categories') {
        const res: any = await adminApi.settings.getCategories();
        setCategories(res.data || res || []);
      } else {
        const res: any = await adminApi.settings.getTechnologies();
        setTechnologies(res.data || res || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function updateSetting(key: string, value: string) {
    setSaving(key);
    try {
      await adminApi.settings.update(key, value);
      setSettings((prev) =>
        prev.map((s) => (s.key === key ? { ...s, value } : s)),
      );
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(null);
    }
  }

  async function addCategory() {
    if (!newCat.name || !newCat.slug) return;
    try {
      await adminApi.settings.createCategory(newCat);
      setNewCat({ name: '', slug: '', type: 'profession' });
      loadData();
    } catch (e) {
      console.error(e);
    }
  }

  async function deleteCategory(id: number) {
    if (!confirm("O'chirmoqchimisiz?")) return;
    try {
      await adminApi.settings.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      console.error(e);
    }
  }

  async function addTechnology() {
    if (!newTech.name) return;
    try {
      await adminApi.settings.createTechnology(newTech);
      setNewTech({ name: '', category: 'frontend' });
      loadData();
    } catch (e) {
      console.error(e);
    }
  }

  async function deleteTechnology(id: number) {
    if (!confirm("O'chirmoqchimisiz?")) return;
    try {
      await adminApi.settings.deleteTechnology(id);
      setTechnologies((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="icon-box icon-box-navy">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" stroke="#b8a06a" strokeWidth="1.8" fill="rgba(184,160,106,0.1)"/>
            <path d="M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" stroke="#b8a06a" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <h1>Sozlamalar</h1>
      </div>

      {/* Tabs */}
      <div className="admin-tabs mb-6">
        <button className={`admin-tab ${tab === 'settings' ? 'active' : ''}`}
          onClick={() => setTab('settings')}>
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" className="tab-icon">
            <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.08"/>
            <path d="M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" strokeLinecap="round"/>
          </svg>
          Sozlamalar
        </button>
        <button className={`admin-tab ${tab === 'categories' ? 'active' : ''}`}
          onClick={() => setTab('categories')}>
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" className="tab-icon">
            <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" fill="currentColor" fillOpacity="0.06"/>
          </svg>
          Kategoriyalar
        </button>
        <button className={`admin-tab ${tab === 'technologies' ? 'active' : ''}`}
          onClick={() => setTab('technologies')}>
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" className="tab-icon">
            <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Texnologiyalar
        </button>
      </div>

      {loading ? (
        <div className="admin-card empty-state">
          <div className="spinner" />
          <p className="empty-text">Yuklanmoqda...</p>
        </div>
      ) : tab === 'settings' ? (
        <div className="admin-card">
          <table className="admin-table">
            <thead>
              <tr><th>Kalit</th><th>Qiymat</th><th>Amal</th></tr>
            </thead>
            <tbody>
              {settings.map((s) => (
                <tr key={s.key}>
                  <td>
                    <span className="settings-key">{s.key}</span>
                  </td>
                  <td>
                    <input className="admin-input" placeholder="Qiymat" value={s.value}
                      onChange={(e) => setSettings((prev) =>
                        prev.map((x) => (x.key === s.key ? { ...x, value: e.target.value } : x))
                      )} />
                  </td>
                  <td>
                    <button className="btn btn-primary btn-sm" disabled={saving === s.key}
                      onClick={() => updateSetting(s.key, s.value)}>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.08"/><path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Saqlash
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : tab === 'categories' ? (
        <div>
          {/* Add category form */}
          <div className="admin-card mb-4">
            <div className="form-label">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" stroke="#1e3a5f" strokeWidth="1.8" fill="rgba(30,58,95,0.04)"/>
                <path d="M12 8v8M8 12h8" stroke="#1e3a5f" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              Yangi kategoriya
            </div>
            <div className="form-row">
              <input className="admin-input" placeholder="Nomi" value={newCat.name}
                onChange={(e) => setNewCat({ ...newCat, name: e.target.value })} />
              <input className="admin-input" placeholder="Slug" value={newCat.slug}
                onChange={(e) => setNewCat({ ...newCat, slug: e.target.value })} />
              <select className="admin-input select-auto" title="Turi" value={newCat.type}
                onChange={(e) => setNewCat({ ...newCat, type: e.target.value })}>
                <option value="profession">Kasb</option>
                <option value="city">Shahar</option>
                <option value="work_type">Ish turi</option>
              </select>
              <button className="btn btn-gold nowrap" onClick={addCategory}>
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.08"/><path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                Qo&apos;shish
              </button>
            </div>
          </div>

          <div className="admin-card">
            <table className="admin-table">
              <thead><tr><th>ID</th><th>Nomi</th><th>Slug</th><th>Turi</th><th>Amal</th></tr></thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td className="td-id">#{c.id}</td>
                    <td className="td-bold">{c.name}</td>
                    <td className="td-muted code-slug">{c.slug}</td>
                    <td><span className="badge badge-blue">{c.type}</span></td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteCategory(c.id)} title="O'chirish">
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M19 6l-.9 12.1A2 2 0 0116.1 20H7.9a2 2 0 01-2-1.9L5 6" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.06"/><path d="M10 11v5M14 11v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div>
          {/* Add technology form */}
          <div className="admin-card mb-4">
            <div className="form-label">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" stroke="#1e3a5f" strokeWidth="1.8" fill="rgba(30,58,95,0.04)"/>
                <path d="M12 8v8M8 12h8" stroke="#1e3a5f" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              Yangi texnologiya
            </div>
            <div className="form-row">
              <input className="admin-input" placeholder="Nomi (React, Node.js...)" value={newTech.name}
                onChange={(e) => setNewTech({ ...newTech, name: e.target.value })} />
              <select className="admin-input select-auto-lg" title="Kategoriya" value={newTech.category}
                onChange={(e) => setNewTech({ ...newTech, category: e.target.value })}>
                <option value="frontend">Frontend</option>
                <option value="backend">Backend</option>
                <option value="mobile">Mobile</option>
                <option value="devops">DevOps</option>
                <option value="design">Design</option>
                <option value="other">Boshqa</option>
              </select>
              <button className="btn btn-gold nowrap" onClick={addTechnology}>
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.08"/><path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                Qo&apos;shish
              </button>
            </div>
          </div>

          <div className="admin-card">
            <table className="admin-table">
              <thead><tr><th>ID</th><th>Nomi</th><th>Kategoriya</th><th>Amal</th></tr></thead>
              <tbody>
                {technologies.map((t) => (
                  <tr key={t.id}>
                    <td className="td-id">#{t.id}</td>
                    <td>
                      <div className="flex-gap-2">
                        <div className="icon-box icon-box-sm">
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                            <path d="M10 20l4-16" stroke="#1e3a5f" strokeWidth="1.8" strokeLinecap="round"/>
                            <path d="M18 8l4 4-4 4M6 16l-4-4 4-4" stroke="#1e3a5f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <span className="td-bold">{t.name}</span>
                      </div>
                    </td>
                    <td><span className="badge badge-blue">{t.category}</span></td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteTechnology(t.id)} title="O'chirish">
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M19 6l-.9 12.1A2 2 0 0116.1 20H7.9a2 2 0 01-2-1.9L5 6" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.06"/><path d="M10 11v5M14 11v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
