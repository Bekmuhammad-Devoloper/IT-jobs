'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import ResumePaper, { downloadResumePdf } from '@/components/ResumePaper';
import { api, type GeneratedResume } from '@/lib/api';
import {
  ArrowLeft,
  Sparkles,
  GraduationCap,
  Briefcase,
  Loader2,
  Download,
  Check,
  ChevronRight,
} from 'lucide-react';

type Template = 'STUDENT' | 'PROFESSIONAL';

type QuestionType = 'text' | 'tel' | 'email' | 'number' | 'url' | 'textarea';
interface Question {
  key: string;
  label: string;
  placeholder: string;
  type: QuestionType;
  required?: boolean;
}

const STUDENT_QUESTIONS: Question[] = [
  { key: 'fullName', label: "To'liq ismingiz", placeholder: 'Aliyev Jasurbek', type: 'text', required: true },
  { key: 'phone', label: 'Telefon raqamingiz', placeholder: '+998 90 123 45 67', type: 'tel' },
  { key: 'email', label: 'Email manzilingiz', placeholder: 'example@gmail.com', type: 'email' },
  { key: 'city', label: 'Yashash shahringiz', placeholder: 'Toshkent', type: 'text' },
  { key: 'targetRole', label: 'Qaysi lavozimga qiziqasiz?', placeholder: 'Frontend Developer stajirovka', type: 'text' },
  { key: 'university', label: "Universitet nomi", placeholder: 'TATU', type: 'text', required: true },
  { key: 'degree', label: "Mutaxassislik / yo'nalish", placeholder: 'Dasturiy injiniring', type: 'text', required: true },
  { key: 'graduationYear', label: 'Bitirish yili', placeholder: '2026', type: 'text' },
  { key: 'coursework', label: 'Kurs ishlari, yutuqlar, GPA', placeholder: 'Data Structures, GPA 4.5, Hackathon 1-o\'rin', type: 'textarea' },
  { key: 'experience', label: "Ish tajribangiz (bo'lsa)", placeholder: "Kompaniya — lavozim — muddat\nYutuqlar...", type: 'textarea' },
  { key: 'skills', label: "Ko'nikmalaringiz (vergul bilan)", placeholder: 'React, TypeScript, SQL, Figma', type: 'text' },
  { key: 'languages', label: 'Tillar (daraja bilan)', placeholder: "O'zbek (ona), Ingliz (B2), Rus (B1)", type: 'text' },
  { key: 'linkedin', label: 'LinkedIn yoki GitHub (ixtiyoriy)', placeholder: 'linkedin.com/in/username', type: 'url' },
  { key: 'interests', label: 'Qiziqishlaringiz (ixtiyoriy)', placeholder: "Ochiq manba loyihalar, shaxmat", type: 'textarea' },
];

const PROFESSIONAL_QUESTIONS: Question[] = [
  { key: 'fullName', label: "To'liq ismingiz", placeholder: 'Aliyev Jasurbek', type: 'text', required: true },
  { key: 'phone', label: 'Telefon raqamingiz', placeholder: '+998 90 123 45 67', type: 'tel' },
  { key: 'email', label: 'Email manzilingiz', placeholder: 'example@gmail.com', type: 'email' },
  { key: 'city', label: 'Yashash shahringiz', placeholder: 'Toshkent', type: 'text' },
  { key: 'targetRole', label: 'Maqsadli lavozim', placeholder: 'Senior Frontend Developer', type: 'text', required: true },
  { key: 'workHistory', label: 'Ish tajribangiz (har bir ishni yangi qatordan)', placeholder: 'Acme Corp — Frontend Developer — 2022-hozir\nReact bilan 5 ta dashboard yasadim\nSahifa yuklanishini 40% tezlashtirdim', type: 'textarea', required: true },
  { key: 'skills', label: "Asosiy ko'nikmalaringiz (vergul bilan)", placeholder: 'React, TypeScript, Node.js, AWS', type: 'text', required: true },
  { key: 'university', label: 'Universitet nomi', placeholder: 'TATU', type: 'text' },
  { key: 'degree', label: "Mutaxassislik / daraja", placeholder: 'Dasturiy injiniring', type: 'text' },
  { key: 'graduationYear', label: 'Bitirish yili', placeholder: '2020', type: 'text' },
  { key: 'languages', label: 'Tillar (daraja bilan)', placeholder: "O'zbek (ona), Ingliz (C1), Rus (B2)", type: 'text' },
  { key: 'linkedin', label: 'LinkedIn yoki portfolio (ixtiyoriy)', placeholder: 'linkedin.com/in/username', type: 'url' },
  { key: 'interests', label: 'Qiziqishlaringiz (ixtiyoriy)', placeholder: 'Ochiq manba loyihalar, texnik maqolalar', type: 'textarea' },
];

export default function ResumePage() {
  const [template, setTemplate] = useState<Template | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<GeneratedResume | null>(null);
  const resumeRef = useRef<HTMLDivElement>(null);

  const questions = template === 'STUDENT' ? STUDENT_QUESTIONS : PROFESSIONAL_QUESTIONS;
  const totalQ = questions.length;
  const isGenerating = step === totalQ + 1;
  const isResult = step === totalQ + 2;
  const currentQ = step >= 1 && step <= totalQ ? questions[step - 1] : null;
  const progress = isResult ? 100 : isGenerating ? 96 : Math.round((step / totalQ) * 90);

  function pickTemplate(t: Template) {
    setTemplate(t);
    setStep(1);
    setAnswers({});
    setResult(null);
    setError('');
  }

  function reset() {
    setTemplate(null);
    setStep(0);
    setAnswers({});
    setResult(null);
    setError('');
  }

  function goBack() {
    setError('');
    if (step <= 1) {
      reset();
    } else if (isResult || isGenerating) {
      setStep(totalQ);
    } else {
      setStep(step - 1);
    }
  }

  function nextStep() {
    setError('');
    if (currentQ?.required && !answers[currentQ.key]?.trim()) return;
    if (step < totalQ) {
      setStep(step + 1);
    } else {
      generate();
    }
  }

  function skipStep() {
    setError('');
    if (step < totalQ) setStep(step + 1);
    else generate();
  }

  function buildPayload() {
    const a = answers;
    const education = (a.university?.trim() && a.degree?.trim())
      ? [{
          university: a.university.trim(),
          degree: a.degree.trim(),
          graduationYear: a.graduationYear?.trim() || undefined,
          city: a.city?.trim() || undefined,
          coursework: a.coursework?.trim() || undefined,
        }]
      : [];

    const workLines = (a.workHistory || '').split('\n').map(l => l.trim()).filter(Boolean);
    let experience: any[] = [];
    if (workLines.length > 0) {
      let current: any = null;
      for (const line of workLines) {
        if (line.includes('—') || line.includes(' - ') || line.includes(' | ')) {
          if (current) experience.push(current);
          const parts = line.split(/\s—\s|\s-\s|\s\|\s/).map(s => s.trim());
          current = {
            company: parts[0] || line,
            position: parts[1] || a.targetRole?.trim() || 'Mutaxassis',
            period: parts[2] || undefined,
            city: a.city?.trim() || undefined,
            description: '',
          };
        } else if (current) {
          current.description = current.description ? current.description + '\n' + line : line;
        } else {
          current = {
            company: a.targetRole?.trim() || 'Ish tajribasi',
            position: a.targetRole?.trim() || 'Mutaxassis',
            city: a.city?.trim() || undefined,
            description: line,
          };
        }
      }
      if (current) experience.push(current);
    } else if (a.experience?.trim()) {
      experience = [{
        company: a.targetRole?.trim() || 'Tajriba',
        position: a.targetRole?.trim() || 'Mutaxassis',
        city: a.city?.trim() || undefined,
        description: a.experience.trim(),
      }];
    }

    return {
      template: template!,
      fullName: a.fullName?.trim() || 'Ism kiritilmagan',
      city: a.city?.trim() || undefined,
      phone: a.phone?.trim() || undefined,
      email: a.email?.trim() || undefined,
      linkedin: a.linkedin?.trim() || undefined,
      targetRole: a.targetRole?.trim() || undefined,
      education,
      experience,
      leadership: [],
      skills: (a.skills || '').split(',').map(s => s.trim()).filter(Boolean),
      languages: (a.languages || '').split(',').map(s => s.trim()).filter(Boolean),
      interests: a.interests?.trim() || undefined,
    };
  }

  async function generate() {
    setError('');
    setStep(totalQ + 1);
    setLoading(true);
    try {
      const payload = buildPayload();
      const res = await api.resume.generate(payload);
      setResult(res);
      setStep(totalQ + 2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e: any) {
      setError(e?.message || 'Xatolik yuz berdi');
      setStep(totalQ);
    } finally {
      setLoading(false);
    }
  }

  async function downloadPdf() {
    if (!resumeRef.current || !result) return;
    setDownloading(true);
    try {
      await downloadResumePdf(resumeRef.current, result.fullName, result);
    } catch (e: any) {
      alert('PDF yaratishda xatolik: ' + (e?.message || 'noma\'lum'));
    } finally {
      setDownloading(false);
    }
  }

  /* ==================== TEMPLATE PICKER ==================== */
  if (!template) {
    return (
      <div style={{ paddingBottom: 100, minHeight: '100dvh', background: '#f8fafc' }}>
        <div style={{ padding: '20px 16px 16px', background: '#fff', borderBottom: '1px solid #f1f5f9' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 13, textDecoration: 'none', marginBottom: 16, fontWeight: 600 }}>
            <ArrowLeft size={16} /> Orqaga
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #1e3a5f, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={16} color="#d4c494" strokeWidth={2.2} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#6d28d9', letterSpacing: '0.14em', textTransform: 'uppercase' }}>AI Resume Builder</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.2, marginTop: 2 }}>
            Professional rezyume<br />bir necha daqiqada
          </h1>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 8, maxWidth: 340, lineHeight: 1.5 }}>
            Shablonni tanlang, savollarga javob bering — AI siz uchun toza, professional rezyume tayyorlaydi.
          </p>
        </div>

        <div style={{ padding: '20px 16px 0' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Shablon tanlang</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button type="button" onClick={() => pickTemplate('STUDENT')}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, textAlign: 'left', border: '1px solid #f1f5f9', borderRadius: 16, background: '#fff', cursor: 'pointer', width: '100%', boxShadow: '0 1px 3px rgba(15,23,42,0.04)', transition: 'transform 0.15s, box-shadow 0.15s' }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <GraduationCap size={24} color="#6d28d9" strokeWidth={1.9} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Student</div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#6d28d9', padding: '2px 8px', borderRadius: 20, background: '#f5f3ff' }}>Yangi</span>
                </div>
                <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>Stajirovka yoki birinchi ish · Ta&apos;lim birinchi</div>
              </div>
              <ChevronRight size={18} color="#cbd5e1" />
            </button>

            <button type="button" onClick={() => pickTemplate('PROFESSIONAL')}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, textAlign: 'left', border: '1px solid #f1f5f9', borderRadius: 16, background: '#fff', cursor: 'pointer', width: '100%', boxShadow: '0 1px 3px rgba(15,23,42,0.04)', transition: 'transform 0.15s, box-shadow 0.15s' }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Briefcase size={24} color="#1e40af" strokeWidth={1.9} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Professional</div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#1e40af', padding: '2px 8px', borderRadius: 20, background: '#eff6ff' }}>Mutaxassis</span>
                </div>
                <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>Ish tajribasi bor uchun · Tajriba birinchi</div>
              </div>
              <ChevronRight size={18} color="#cbd5e1" />
            </button>
          </div>

          <div style={{ marginTop: 16, padding: 14, borderRadius: 14, background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', border: '1px solid #fde68a' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Sparkles size={14} color="#b8a06a" strokeWidth={2.2} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#78350f', marginBottom: 3 }}>AI qanday yordam beradi?</div>
                <div style={{ fontSize: 12, color: '#92400e', lineHeight: 1.5 }}>
                  Har bir tajriba uchun 2–5 ta professional bullet-point yozadi, kuchli fe&apos;llar bilan. Natija shablonga aynan mos — PDF qilib yuklab olasiz.
                </div>
              </div>
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  /* ==================== RESULT ==================== */
  if (isResult && result) {
    return (
      <div style={{ minHeight: '100dvh', background: '#f8fafc', display: 'flex', flexDirection: 'column', paddingBottom: 140 }}>
        <div style={{ padding: '14px 16px 12px', background: '#fff', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <button type="button" onClick={reset} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <ArrowLeft size={18} color="#475569" />
            </button>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Rezyume tayyor</p>
              <p style={{ fontSize: 11, color: '#94a3b8' }}>{template === 'STUDENT' ? 'Student shablon' : 'Professional shablon'}</p>
            </div>
            <button type="button" onClick={reset} style={{ fontSize: 12, fontWeight: 700, color: '#6d28d9', background: 'none', border: 'none', cursor: 'pointer' }}>Yangidan</button>
          </div>
          <div style={{ height: 4, background: '#f1f5f9', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '100%', background: 'linear-gradient(90deg, #1e3a5f, #6d28d9, #b8a06a)', borderRadius: 2 }} />
          </div>
        </div>

        <div style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#ecfdf5', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
            <Check size={24} color="#059669" strokeWidth={2.5} />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Rezyume tayyor!</h2>
          <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Pastda ko&apos;rib chiqing va PDF yuklab oling</p>
        </div>

        <div style={{ padding: '0 12px 20px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: '#e2e8f0', borderRadius: 14, padding: '16px 8px', display: 'flex', justifyContent: 'center', width: '100%', overflow: 'hidden' }}>
            <div ref={resumeRef}>
              <ResumePaper data={result} />
            </div>
          </div>
        </div>

        <div style={{ position: 'fixed', bottom: 76, left: 0, right: 0, padding: '10px 16px', zIndex: 20, background: 'linear-gradient(to top, rgba(248,250,252,0.97), rgba(248,250,252,0.7) 60%, transparent)' }}>
          <div style={{ maxWidth: 480, margin: '0 auto' }}>
            <button type="button" onClick={downloadPdf} disabled={downloading}
              style={{
                width: '100%', padding: '14px', borderRadius: 14, border: 'none',
                background: downloading ? '#94a3b8' : 'linear-gradient(135deg, #1e3a5f, #6d28d9)',
                color: '#fff', fontSize: 15, fontWeight: 800, cursor: downloading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 8px 24px rgba(109,40,217,0.28)'
              }}>
              {downloading ? <><Loader2 size={18} className="spin" /> PDF tayyorlanmoqda…</> : <><Download size={18} /> PDF yuklab olish</>}
            </button>
          </div>
        </div>
        <style>{`@keyframes spinR{to{transform:rotate(360deg)}} .spin{animation:spinR 0.9s linear infinite}`}</style>
        <BottomNav />
      </div>
    );
  }

  /* ==================== GENERATING ==================== */
  if (isGenerating) {
    return (
      <div style={{ minHeight: '100dvh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 16px 12px', background: '#fff', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc' }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{template === 'STUDENT' ? 'Student shablon' : 'Professional shablon'}</p>
              <p style={{ fontSize: 11, color: '#94a3b8' }}>AI yozmoqda...</p>
            </div>
          </div>
          <div style={{ height: 4, background: '#f1f5f9', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #1e3a5f, #6d28d9)', borderRadius: 2, transition: 'width 0.4s' }} />
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 24 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', border: '3px solid #f1f5f9', borderTopColor: '#6d28d9', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>AI rezyume yozmoqda...</p>
          <p style={{ fontSize: 13, color: '#94a3b8' }}>Bir necha soniya kuting</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  /* ==================== QUESTIONS ==================== */
  return (
    <div style={{ minHeight: '100dvh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 16px 12px', background: '#fff', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <button onClick={goBack} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowLeft size={18} color="#475569" />
          </button>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{template === 'STUDENT' ? 'Student shablon' : 'Professional shablon'}</p>
            <p style={{ fontSize: 11, color: '#94a3b8' }}>Ma&apos;lumotlarni to&apos;ldiring</p>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#6d28d9', padding: '4px 10px', borderRadius: 8, background: '#f5f3ff' }}>
            {step}/{totalQ}
          </span>
        </div>
        <div style={{ height: 4, background: '#f1f5f9', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #1e3a5f, #6d28d9)', borderRadius: 2, transition: 'width 0.4s' }} />
        </div>
      </div>

      {currentQ && (
        <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16, maxWidth: 480, width: '100%', margin: '0 auto' }}>
            <div>
              <label style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', lineHeight: 1.35, display: 'block' }}>
                {currentQ.label}
                {currentQ.required && <span style={{ color: '#ef4444', marginLeft: 4 }}>*</span>}
              </label>
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>
                {currentQ.required ? '* Majburiy' : "Ixtiyoriy — o'tkazib yuborish mumkin"}
              </p>
            </div>

            {currentQ.type === 'textarea' ? (
              <textarea
                key={currentQ.key}
                value={answers[currentQ.key] || ''}
                onChange={e => setAnswers({ ...answers, [currentQ.key]: e.target.value })}
                placeholder={currentQ.placeholder}
                rows={5}
                style={{
                  width: '100%', padding: '14px 16px', fontSize: 15, border: '2px solid #e2e8f0',
                  borderRadius: 14, outline: 'none', background: '#fff', color: '#0f172a',
                  lineHeight: 1.5, resize: 'vertical', minHeight: 120, fontFamily: 'inherit',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = '#6d28d9'; }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; }}
                autoFocus
              />
            ) : (
              <input
                key={currentQ.key}
                type={currentQ.type}
                value={answers[currentQ.key] || ''}
                onChange={e => setAnswers({ ...answers, [currentQ.key]: e.target.value })}
                placeholder={currentQ.placeholder}
                style={{
                  width: '100%', padding: '14px 16px', fontSize: 15, border: '2px solid #e2e8f0',
                  borderRadius: 14, outline: 'none', background: '#fff', color: '#0f172a',
                  fontFamily: 'inherit', transition: 'border-color 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = '#6d28d9'; }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; }}
                autoFocus
              />
            )}

            {error && (
              <div style={{ padding: '10px 12px', borderRadius: 10, background: '#fef2f2', color: '#b91c1c', fontSize: 12, fontWeight: 600, border: '1px solid #fecaca' }}>
                {error}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, paddingBottom: 20, paddingTop: 16, maxWidth: 480, width: '100%', margin: '0 auto' }}>
            {!currentQ.required && (
              <button onClick={skipStep} disabled={loading} style={{
                flex: 1, padding: '14px', borderRadius: 12,
                border: '1.5px solid #e2e8f0', background: '#fff',
                fontSize: 14, fontWeight: 700, color: '#64748b', cursor: 'pointer',
              }}>O&apos;tkazish</button>
            )}
            <button onClick={nextStep} disabled={loading || (currentQ.required && !answers[currentQ.key]?.trim())} style={{
              flex: currentQ.required ? 1 : 2, padding: '14px', borderRadius: 12, border: 'none',
              background: (currentQ.required && !answers[currentQ.key]?.trim())
                ? '#cbd5e1'
                : 'linear-gradient(135deg, #1e3a5f, #6d28d9)',
              fontSize: 14, fontWeight: 800, color: '#fff',
              cursor: (currentQ.required && !answers[currentQ.key]?.trim()) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: (currentQ.required && !answers[currentQ.key]?.trim()) ? 'none' : '0 4px 14px rgba(109,40,217,0.25)',
              transition: 'all 0.2s',
            }}>
              {step === totalQ ? <><Sparkles size={16} /> Rezyume yaratish</> : <>Davom etish <ChevronRight size={16} /></>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
