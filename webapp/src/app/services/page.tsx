'use client';
import { useEffect, useRef, useState } from 'react';
import BottomNav from '@/components/BottomNav';
import ResumePaper, { downloadResumePdf } from '@/components/ResumePaper';
import { api, type GeneratedResume } from '@/lib/api';

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

function iconUrl(icon?: string) {
  if (!icon) return '';
  if (icon.startsWith('http') || icon.startsWith('/api/')) return icon;
  return `${API_URL}/upload/${icon}`;
}

function formatPrice(p?: string) {
  if (!p) return '';
  const num = parseInt(p.replace(/\D/g, ''));
  if (!num) return p;
  return num.toLocaleString('uz-UZ') + " so'm";
}

/* ============ RESUME SAVOLLARI ============ */
const RESUME_QUESTIONS = [
  { key: 'fullName', label: "To'liq ismingiz", placeholder: 'Masalan: Aliyev Jasurbek', type: 'text' },
  { key: 'phone', label: 'Telefon raqamingiz', placeholder: '+998 90 123 45 67', type: 'tel' },
  { key: 'email', label: 'Email manzilingiz', placeholder: 'example@gmail.com', type: 'email' },
  { key: 'birthYear', label: "Tug'ilgan yilingiz", placeholder: '2000', type: 'number' },
  { key: 'city', label: 'Yashash shahringiz', placeholder: "Masalan: Toshkent", type: 'text' },
  { key: 'position', label: 'Qaysi lavozimga murojaat qilyapsiz?', placeholder: 'Masalan: Frontend Developer', type: 'text' },
  { key: 'experience', label: 'Ish tajribangiz (yillar)', placeholder: "Masalan: 2 yil", type: 'text' },
  { key: 'skills', label: "Asosiy ko'nikmalaringiz (vergul bilan)", placeholder: 'React, TypeScript, Node.js, Figma', type: 'text' },
  { key: 'education', label: "Ta'lim (universitet, yo'nalish, yil)", placeholder: "TATU, Dasturiy injiniring, 2022", type: 'text' },
  { key: 'languages', label: "Tillar (daraja bilan)", placeholder: "O'zbek (ona tili), Ingliz (B2), Rus (B1)", type: 'text' },
  { key: 'about', label: "O'zingiz haqingizda qisqacha", placeholder: "Nima qilishni yaxshi ko'rasiz, kuchli tomonlaringiz...", type: 'textarea' },
  { key: 'workHistory', label: "Oldingi ish joylari (kompaniya — lavozim — muddat)", placeholder: "TechCorp — Junior Dev — 2022-2023\nStartupX — Frontend — 2023-hozir", type: 'textarea' },
  { key: 'projects', label: "Loyihalaringiz (nom — texnologiya — link)", placeholder: "E-commerce app — React, Node.js — github.com/...", type: 'textarea' },
  { key: 'github', label: 'GitHub profil (ixtiyoriy)', placeholder: 'https://github.com/username', type: 'url' },
  { key: 'portfolio', label: 'Portfolio yoki LinkedIn (ixtiyoriy)', placeholder: 'https://linkedin.com/in/username', type: 'url' },
];

export default function ServicesPage() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCat, setOpenCat] = useState<number | null>(null);

  // Questionnaire state
  const [selectedService, setSelectedService] = useState<ServiceChild | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [step, setStep] = useState(0); // 0=list, 1..N=questions, N+1=generating, N+2=result
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [resumeResult, setResumeResult] = useState<GeneratedResume | null>(null);
  const [genError, setGenError] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const resumePaperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.services.getAll()
      .then((res: any) => {
        const data = Array.isArray(res) ? res : (res.data || []);
        setCategories(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function selectService(child: ServiceChild, cat: ServiceCategory) {
    setSelectedService(child);
    setSelectedCategory(cat);
    setStep(1);
    setAnswers({});
    setResumeResult(null);
    setGenError('');
    setSent(false);
  }

  function goBack() {
    if (step <= 1) {
      setSelectedService(null);
      setSelectedCategory(null);
      setStep(0);
    } else {
      setStep(step - 1);
    }
  }

  function nextStep() {
    if (step < RESUME_QUESTIONS.length) {
      setStep(step + 1);
    } else {
      generateResume();
    }
  }

  function detectTemplate(): 'STUDENT' | 'PROFESSIONAL' {
    const blob = `${selectedCategory?.title || ''} ${selectedService?.title || ''}`.toLowerCase();
    if (/student|stajirovka|talaba|o['’`]quvchi/.test(blob)) return 'STUDENT';
    return 'PROFESSIONAL';
  }

  function buildResumePayload() {
    const a = answers;
    const eduParts = (a.education || '').split(/[,;]|\s—\s|\s-\s/).map(s => s.trim()).filter(Boolean);
    const education = a.education?.trim()
      ? [{
          university: eduParts[0] || a.education.trim(),
          degree: eduParts[1] || 'Mutaxassislik kiritilmagan',
          graduationYear: eduParts[2] || undefined,
          city: a.city || undefined,
          coursework: undefined,
        }]
      : [];

    const workLines = (a.workHistory || '')
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);
    const experience = workLines.length > 0
      ? workLines.map(line => {
          const parts = line.split(/\s—\s|\s-\s|\s\|\s/).map(s => s.trim());
          return {
            company: parts[0] || line,
            position: parts[1] || a.position || 'Lavozim',
            period: parts[2] || undefined,
            city: a.city || undefined,
            description: a.about || a.experience || undefined,
          };
        })
      : (a.about || a.experience || a.projects
          ? [{
              company: a.position ? `${a.position} tajribasi` : 'Ish tajribasi',
              position: a.position || 'Mutaxassis',
              period: a.experience || undefined,
              city: a.city || undefined,
              description: [a.about, a.experience, a.projects].filter(Boolean).join('\n'),
            }]
          : []);

    return {
      template: detectTemplate(),
      fullName: a.fullName?.trim() || 'Ism kiritilmagan',
      city: a.city?.trim() || undefined,
      phone: a.phone?.trim() || undefined,
      email: a.email?.trim() || undefined,
      linkedin: a.portfolio?.trim() || a.github?.trim() || undefined,
      targetRole: a.position?.trim() || undefined,
      education,
      experience,
      leadership: [],
      skills: (a.skills || '').split(',').map(s => s.trim()).filter(Boolean),
      languages: (a.languages || '').split(',').map(s => s.trim()).filter(Boolean),
      interests: undefined,
    };
  }

  async function generateResume() {
    setStep(RESUME_QUESTIONS.length + 1);
    setGenError('');
    try {
      const payload = buildResumePayload();
      const res = await api.resume.generate(payload);
      setResumeResult(res);
      setStep(RESUME_QUESTIONS.length + 2);
    } catch (e: any) {
      setGenError(e?.message || 'Xatolik yuz berdi');
      setStep(RESUME_QUESTIONS.length); // back to last question
    }
  }

  async function sendToTelegram() {
    if (!resumeResult) return;
    setSending(true);
    const support = (process.env.NEXT_PUBLIC_SUPPORT_TG || 'itjobs_support').replace('@', '');
    const supportUrl = `https://t.me/${support}`;
    try {
      const msg = [
        `Resume buyurtma: ${resumeResult.fullName}`,
        `Xizmat: ${selectedCategory?.title} → ${selectedService?.title}`,
        selectedService?.price ? `Narxi: ${formatPrice(selectedService.price)}` : '',
        '',
        'Resume tayyorlandi, PDF yuborishim mumkinmi?',
      ].filter(Boolean).join('\n');
      window.open(`${supportUrl}?text=${encodeURIComponent(msg)}`, '_blank');
      setSent(true);
    } catch {
      window.open(supportUrl, '_blank');
    }
    setSending(false);
  }

  async function downloadPdf() {
    if (!resumePaperRef.current || !resumeResult) return;
    setDownloading(true);
    try {
      await downloadResumePdf(resumePaperRef.current, resumeResult.fullName);
    } catch (e: any) {
      alert('PDF yaratishda xatolik: ' + (e?.message || 'noma\'lum'));
    } finally {
      setDownloading(false);
    }
  }

  // ============ QUESTIONNAIRE UI ============
  if (selectedService && step > 0) {
    const totalQ = RESUME_QUESTIONS.length;
    const isGenerating = step === totalQ + 1;
    const isResult = step === totalQ + 2;
    const currentQ = step <= totalQ ? RESUME_QUESTIONS[step - 1] : null;
    const progress = isResult ? 100 : isGenerating ? 95 : Math.round((step / totalQ) * 90);

    return (
      <div style={{ minHeight: '100dvh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '16px 16px 12px', background: '#fff', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <button onClick={goBack} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#475569" strokeWidth="2"><path strokeLinecap="round" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{selectedService.title}</p>
              <p style={{ fontSize: 11, color: '#94a3b8' }}>{selectedCategory?.title}</p>
            </div>
            {selectedService.price && (
              <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 8, background: '#fef3c7', color: '#92400e' }}>
                {formatPrice(selectedService.price)}
              </span>
            )}
          </div>
          {/* Progress bar */}
          <div style={{ height: 4, background: '#f1f5f9', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #1e3a5f, #b8a06a)', borderRadius: 2, transition: 'width 0.4s ease' }} />
          </div>
          {!isResult && !isGenerating && (
            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 6, textAlign: 'right' }}>{step}/{totalQ}</p>
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column' }}>
          {isGenerating ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', border: '3px solid #f1f5f9', borderTopColor: '#1e3a5f', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>AI resume yozmoqda...</p>
              <p style={{ fontSize: 13, color: '#94a3b8' }}>Bir necha soniya</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : isResult && resumeResult ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#ecfdf5', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Resume tayyor!</h2>
                <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Shablon: {resumeResult.template === 'STUDENT' ? 'Student' : 'Professional'}</p>
              </div>

              <div style={{ background: '#e2e8f0', borderRadius: 14, padding: '16px 8px', overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
                <div ref={resumePaperRef}>
                  <ResumePaper data={resumeResult} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 16 }}>
                <button type="button" onClick={downloadPdf} disabled={downloading} style={{
                  padding: '14px', borderRadius: 12, border: 'none', fontSize: 14, fontWeight: 800, cursor: downloading ? 'not-allowed' : 'pointer',
                  background: downloading ? '#94a3b8' : 'linear-gradient(135deg, #1e3a5f, #6d28d9)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 4px 14px rgba(109,40,217,0.25)'
                }}>
                  {downloading ? 'PDF tayyorlanmoqda...' : 'PDF yuklab olish'}
                </button>
                <button type="button" onClick={sendToTelegram} disabled={sending} style={{
                  padding: '13px', borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  background: sent ? '#059669' : '#fff', color: sent ? '#fff' : '#1e3a5f',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}>
                  {sent ? 'Telegram ochildi' : (sending ? 'Yuborilmoqda...' : 'Telegramda qo\'llab-quvvatlash')}
                </button>
              </div>
            </div>
          ) : currentQ ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16 }}>
                <label style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', lineHeight: 1.4 }}>{currentQ.label}</label>
                {currentQ.type === 'textarea' ? (
                  <textarea
                    value={answers[currentQ.key] || ''}
                    onChange={e => setAnswers({ ...answers, [currentQ.key]: e.target.value })}
                    placeholder={currentQ.placeholder}
                    rows={4}
                    style={{
                      width: '100%', padding: '14px 16px', fontSize: 15, border: '2px solid #e2e8f0',
                      borderRadius: 14, outline: 'none', background: '#fff', color: '#0f172a',
                      lineHeight: 1.5, resize: 'vertical', minHeight: 100,
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => { e.target.style.borderColor = '#1e3a5f'; }}
                    onBlur={e => { e.target.style.borderColor = '#e2e8f0'; }}
                    autoFocus
                  />
                ) : (
                  <input
                    type={currentQ.type}
                    value={answers[currentQ.key] || ''}
                    onChange={e => setAnswers({ ...answers, [currentQ.key]: e.target.value })}
                    placeholder={currentQ.placeholder}
                    style={{
                      width: '100%', padding: '14px 16px', fontSize: 15, border: '2px solid #e2e8f0',
                      borderRadius: 14, outline: 'none', background: '#fff', color: '#0f172a',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => { e.target.style.borderColor = '#1e3a5f'; }}
                    onBlur={e => { e.target.style.borderColor = '#e2e8f0'; }}
                    autoFocus
                  />
                )}
                <p style={{ fontSize: 12, color: '#94a3b8' }}>
                  {step <= 5 ? "* Majburiy" : "Ixtiyoriy — o'tkazib yuborish mumkin"}
                </p>
                {genError && (
                  <div style={{ padding: '10px 12px', borderRadius: 10, background: '#fef2f2', color: '#b91c1c', fontSize: 12, fontWeight: 600, border: '1px solid #fecaca' }}>
                    {genError}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10, paddingBottom: 24 }}>
                {step > 5 && (
                  <button onClick={nextStep} style={{
                    flex: 1, padding: '14px', borderRadius: 12,
                    border: '1.5px solid #e2e8f0', background: '#fff',
                    fontSize: 14, fontWeight: 600, color: '#64748b', cursor: 'pointer',
                  }}>O&apos;tkazish</button>
                )}
                <button onClick={() => {
                  if (step <= 5 && !answers[currentQ.key]?.trim()) return;
                  nextStep();
                }} style={{
                  flex: 2, padding: '14px', borderRadius: 12, border: 'none',
                  background: (step <= 5 && !answers[currentQ.key]?.trim()) ? '#cbd5e1' : '#1e3a5f',
                  fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer',
                  transition: 'background 0.2s',
                }}>
                  {step === totalQ ? 'Resume yaratish ✨' : 'Davom etish →'}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  // ============ SERVICE LIST UI ============
  return (
    <div style={{ paddingBottom: 100, minHeight: '100dvh' }}>
      <div className="glass" style={{ position: 'sticky', top: 0, zIndex: 30, padding: '18px 16px 12px' }}>
        <h1 style={{ fontSize: 20, fontWeight: 900, color: 'var(--navy)', marginBottom: 2 }}>Xizmatlar</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Premium IT xizmatlar</p>
      </div>

      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Yuklanmoqda...</div>
        ) : categories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Hozircha xizmatlar mavjud emas</div>
        ) : categories.map((cat, i) => {
          const isOpen = openCat === cat.id;
          const children = (cat.children || []).filter(c => c.isActive);

          return (
            <div key={cat.id} className={`card anim-fade d${i + 1}`} style={{ padding: 0, overflow: 'hidden' }}>
              <div
                onClick={() => setOpenCat(isOpen ? null : cat.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, cursor: 'pointer' }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--navy-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 24, overflow: 'hidden' }}>
                  {cat.icon
                    ? <img src={iconUrl(cat.icon)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="var(--navy)" strokeWidth="1.5"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 15, color: 'var(--navy)', marginBottom: 2 }}>{cat.title}</h3>
                  {cat.description && (
                    <p style={{
                      fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4,
                      display: '-webkit-box', WebkitLineClamp: isOpen ? 999 : 2,
                      WebkitBoxOrient: 'vertical' as any, overflow: 'hidden',
                    }}>{cat.description}</p>
                  )}
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'inline-block' }}>{children.length} ta yo&apos;nalish</span>
                </div>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="var(--text-muted)" strokeWidth="2" style={{ transition: 'transform 0.25s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', flexShrink: 0 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {isOpen && children.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-secondary, #f8fafc)' }}>
                  {children.map((ch, idx) => (
                    <div key={ch.id}
                      onClick={() => selectService(ch, cat)}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px 12px 28px', cursor: 'pointer', borderTop: idx > 0 ? '1px solid var(--border)' : 'none', transition: 'background 0.15s' }}
                    >
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontWeight: 600, fontSize: 14, color: 'var(--navy)', marginBottom: 2 }}>{ch.title}</h4>
                        {ch.description && (
                          <p style={{
                            fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.3,
                            display: '-webkit-box', WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical' as any, overflow: 'hidden',
                          }}>{ch.description}</p>
                        )}
                      </div>
                      {ch.price && (
                        <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 6, background: 'var(--gold-light)', color: 'var(--gold-dark)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                          {formatPrice(ch.price)}
                        </span>
                      )}
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--text-muted)" strokeWidth="2" style={{ flexShrink: 0 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ padding: '8px 16px 0' }}>
        <div className="card gradient-hero anim-fade d6" style={{ textAlign: 'center', padding: '32px 20px', color: '#fff', border: 'none' }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <p style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Maxsus xizmat kerakmi?</p>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginBottom: 20 }}>Biz bilan bog&apos;laning</p>
            <a href={`https://t.me/${(process.env.NEXT_PUBLIC_CONTACT_TG || 'Khamidov_onine').replace('@','')}`} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 24px', borderRadius: 10, background: 'var(--gold)', color: '#fff', fontWeight: 800, fontSize: 14, textDecoration: 'none', boxShadow: '0 4px 12px rgba(184,160,106,0.3)' }}>
              <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 5L2 12.5l7 1M21 5l-4 15-7-8.5M21 5l-12 8.5" /></svg>
              Telegram orqali yozish
            </a>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}