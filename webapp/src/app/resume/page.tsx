'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import { api, type GeneratedResume, type ResumeEntry } from '@/lib/api';
import {
  ArrowLeft,
  Sparkles,
  GraduationCap,
  Briefcase,
  Plus,
  Trash2,
  Check,
  Loader2,
  User,
  Phone,
  Mail,
  MapPin,
  Linkedin,
  Target,
  BookOpen,
  Award,
  Languages,
  Heart,
  Download,
  FileText,
} from 'lucide-react';

type Template = 'STUDENT' | 'PROFESSIONAL';

type Edu = { university: string; city: string; degree: string; graduationYear: string; coursework: string };
type Exp = { company: string; city: string; position: string; period: string; description: string };

const EMPTY_EDU: Edu = { university: '', city: '', degree: '', graduationYear: '', coursework: '' };
const EMPTY_EXP: Exp = { company: '', city: '', position: '', period: '', description: '' };

export default function ResumePage() {
  const [template, setTemplate] = useState<Template | null>(null);
  const [step, setStep] = useState<'form' | 'result'>('form');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<GeneratedResume | null>(null);
  const resumeRef = useRef<HTMLDivElement>(null);

  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [education, setEducation] = useState<Edu[]>([{ ...EMPTY_EDU }]);
  const [experience, setExperience] = useState<Exp[]>([{ ...EMPTY_EXP }]);
  const [leadership, setLeadership] = useState<Exp[]>([]);
  const [skills, setSkills] = useState('');
  const [languages, setLanguages] = useState('');
  const [interests, setInterests] = useState('');

  function reset() {
    setTemplate(null);
    setStep('form');
    setResult(null);
    setError('');
  }

  async function generate() {
    setError('');
    if (!fullName.trim()) { setError('Ism va familiya majburiy'); return; }
    if (!template) return;

    const hasEdu = education.some(e => e.university.trim() && e.degree.trim());
    const hasExp = experience.some(e => e.company.trim() && e.position.trim());
    if (!hasEdu && !hasExp) {
      setError("Kamida bitta ta'lim yoki ish tajribasini to'ldiring");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        template,
        fullName: fullName.trim(),
        city: city.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        linkedin: linkedin.trim() || undefined,
        targetRole: targetRole.trim() || undefined,
        education: education
          .filter(e => e.university.trim() && e.degree.trim())
          .map(e => ({
            university: e.university.trim(),
            city: e.city.trim() || undefined,
            degree: e.degree.trim(),
            graduationYear: e.graduationYear.trim() || undefined,
            coursework: e.coursework.trim() || undefined,
          })),
        experience: experience
          .filter(e => e.company.trim() && e.position.trim())
          .map(e => ({
            company: e.company.trim(),
            city: e.city.trim() || undefined,
            position: e.position.trim(),
            period: e.period.trim() || undefined,
            description: e.description.trim() || undefined,
          })),
        leadership: leadership
          .filter(e => e.company.trim() && e.position.trim())
          .map(e => ({
            company: e.company.trim(),
            city: e.city.trim() || undefined,
            position: e.position.trim(),
            period: e.period.trim() || undefined,
            description: e.description.trim() || undefined,
          })),
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        languages: languages.split(',').map(s => s.trim()).filter(Boolean),
        interests: interests.trim() || undefined,
      };
      const res = await api.resume.generate(payload);
      setResult(res);
      setStep('result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e: any) {
      setError(e.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }

  async function downloadPdf() {
    if (!resumeRef.current || !result) return;
    setDownloading(true);
    try {
      const mod: any = await import('html2pdf.js');
      const html2pdf = mod.default || mod;
      await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: `${(result.fullName || 'resume').replace(/\s+/g, '_')}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, letterRendering: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        })
        .from(resumeRef.current)
        .save();
    } catch (e: any) {
      alert('PDF yaratishda xatolik: ' + (e?.message || 'noma\'lum'));
    } finally {
      setDownloading(false);
    }
  }

  if (!template) {
    return (
      <div style={{ paddingBottom: 100, minHeight: '100dvh', background: '#f8fafc' }}>
        <div className="gradient-hero" style={{ padding: '28px 20px 56px' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.7)', fontSize: 13, textDecoration: 'none', marginBottom: 14 }}>
            <ArrowLeft size={16} /> Orqaga
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <Sparkles size={22} color="#d4c494" />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#d4c494', letterSpacing: '0.1em', textTransform: 'uppercase' }}>AI Resume Builder</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2 }}>Professional rezyume<br />bir necha daqiqada</h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, marginTop: 10, maxWidth: 320 }}>
            Shablonni tanlang, ma&apos;lumotlaringizni to&apos;ldiring — AI siz uchun toza, professional rezyume tayyorlaydi.
          </p>
        </div>

        <div style={{ padding: '0 16px', marginTop: -32, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button type="button" onClick={() => setTemplate('STUDENT')} className="card"
            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 18, textAlign: 'left', border: 'none', background: '#fff', cursor: 'pointer' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <GraduationCap size={26} color="#6d28d9" strokeWidth={1.8} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 2 }}>Student</div>
              <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>Stajirovka yoki birinchi ish uchun · Ta&apos;lim birinchi</div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#6d28d9', padding: '4px 10px', borderRadius: 20, background: '#f5f3ff' }}>Yangi</span>
          </button>

          <button type="button" onClick={() => setTemplate('PROFESSIONAL')} className="card"
            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 18, textAlign: 'left', border: 'none', background: '#fff', cursor: 'pointer' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Briefcase size={26} color="#1e40af" strokeWidth={1.8} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 2 }}>Professional</div>
              <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>Ish tajribasi bor uchun · Tajriba birinchi</div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#1e40af', padding: '4px 10px', borderRadius: 20, background: '#eff6ff' }}>Mutaxassis</span>
          </button>

          <div style={{ padding: '16px', borderRadius: 14, background: '#fff', border: '1px dashed #cbd5e1', marginTop: 8 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Sparkles size={18} color="#b8a06a" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>AI qanday yordam beradi?</div>
                <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
                  Har bir ish tajribasi uchun 2–5 ta professional bullet-point yozadi, kuchli harakat fe&apos;llari bilan. Natija shablonga aynan mos — PDF qilib yuklab olishingiz mumkin.
                </div>
              </div>
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (step === 'result' && result) {
    return (
      <div style={{ minHeight: '100dvh', background: '#e2e8f0', paddingBottom: 120 }}>
        <div style={{ position: 'sticky', top: 0, zIndex: 30, background: '#fff', borderBottom: '1px solid #f1f5f9', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="button" onClick={() => setStep('form')} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowLeft size={18} color="#475569" />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Rezyume tayyor</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{template === 'STUDENT' ? 'Student shablon' : 'Professional shablon'}</div>
          </div>
          <button type="button" onClick={reset} style={{ fontSize: 12, fontWeight: 700, color: '#6d28d9', background: 'none', border: 'none', cursor: 'pointer' }}>Yangidan</button>
        </div>

        <div style={{ padding: '20px 12px', display: 'flex', justifyContent: 'center' }}>
          <div ref={resumeRef}>
            <ResumePaper data={result} />
          </div>
        </div>

        <div style={{ position: 'fixed', bottom: 76, left: 0, right: 0, padding: '10px 16px', zIndex: 20, background: 'linear-gradient(to top, rgba(226,232,240,0.95), rgba(226,232,240,0.7) 60%, transparent)' }}>
          <div style={{ maxWidth: 480, margin: '0 auto' }}>
            <button type="button" onClick={downloadPdf} disabled={downloading}
              style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none',
                background: downloading ? '#94a3b8' : 'linear-gradient(135deg, #1e3a5f, #6d28d9)',
                color: '#fff', fontSize: 15, fontWeight: 800, cursor: downloading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 8px 24px rgba(109,40,217,0.28)' }}>
              {downloading ? <><Loader2 size={18} className="spin" /> PDF tayyorlanmoqda…</> : <><Download size={18} /> PDF yuklab olish</>}
            </button>
          </div>
        </div>
        <style>{`@keyframes spinR{to{transform:rotate(360deg)}} .spin{animation:spinR 0.9s linear infinite}`}</style>
        <BottomNav />
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 140, minHeight: '100dvh', background: '#f8fafc' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 30, background: '#fff', borderBottom: '1px solid #f1f5f9', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button type="button" onClick={() => setTemplate(null)} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ArrowLeft size={18} color="#475569" />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{template === 'STUDENT' ? 'Student shablon' : 'Professional shablon'}</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>Ma&apos;lumotlarni to&apos;ldiring</div>
        </div>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Section icon={<User size={16} />} title="Shaxsiy ma'lumot">
          <Field label="Ism va familiya *" value={fullName} onChange={setFullName} placeholder="Jasurbek Aliyev" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field icon={<MapPin size={14} />} label="Shahar" value={city} onChange={setCity} placeholder="Toshkent" />
            <Field icon={<Phone size={14} />} label="Telefon" value={phone} onChange={setPhone} placeholder="+998 90 123 45 67" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field icon={<Mail size={14} />} label="Email" value={email} onChange={setEmail} placeholder="siz@example.com" />
            <Field icon={<Linkedin size={14} />} label="LinkedIn" value={linkedin} onChange={setLinkedin} placeholder="linkedin.com/in/..." />
          </div>
          <Field icon={<Target size={14} />} label="Maqsadli lavozim" value={targetRole} onChange={setTargetRole} placeholder="Frontend Developer stajirovka" />
        </Section>

        <Section icon={<GraduationCap size={16} />} title="Ta'lim">
          {education.map((edu, i) => (
            <RowCard key={i} onRemove={education.length > 1 ? () => setEducation(education.filter((_, j) => j !== i)) : undefined}>
              <Field label="Universitet *" value={edu.university} onChange={v => setEducation(education.map((e, j) => j === i ? { ...e, university: v } : e))} placeholder="TATU" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Field label="Daraja/Mutaxassislik *" value={edu.degree} onChange={v => setEducation(education.map((e, j) => j === i ? { ...e, degree: v } : e))} placeholder="Dasturiy injiniring" />
                <Field label="Bitirish yili" value={edu.graduationYear} onChange={v => setEducation(education.map((e, j) => j === i ? { ...e, graduationYear: v } : e))} placeholder="2026" />
              </div>
              <Field label="Shahar" value={edu.city} onChange={v => setEducation(education.map((e, j) => j === i ? { ...e, city: v } : e))} placeholder="Toshkent" />
              <Field label="Kurs ishlari / yutuqlar" value={edu.coursework} onChange={v => setEducation(education.map((e, j) => j === i ? { ...e, coursework: v } : e))} placeholder="Data Structures, GPA 4.5, Hackathon 1-o'rin" multiline />
            </RowCard>
          ))}
          <AddBtn label="Yana ta'lim qo'shish" onClick={() => setEducation([...education, { ...EMPTY_EDU }])} />
        </Section>

        <Section icon={<Briefcase size={16} />} title="Ish tajribasi">
          {experience.map((exp, i) => (
            <RowCard key={i} onRemove={experience.length > 1 ? () => setExperience(experience.filter((_, j) => j !== i)) : undefined}>
              <Field label="Kompaniya *" value={exp.company} onChange={v => setExperience(experience.map((e, j) => j === i ? { ...e, company: v } : e))} placeholder="Acme Corp" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Field label="Lavozim *" value={exp.position} onChange={v => setExperience(experience.map((e, j) => j === i ? { ...e, position: v } : e))} placeholder="Frontend Developer" />
                <Field label="Muddat" value={exp.period} onChange={v => setExperience(experience.map((e, j) => j === i ? { ...e, period: v } : e))} placeholder="Yan 2024 - hozir" />
              </div>
              <Field label="Shahar" value={exp.city} onChange={v => setExperience(experience.map((e, j) => j === i ? { ...e, city: v } : e))} placeholder="Toshkent" />
              <Field label="Yutuqlar / tajriba" value={exp.description} onChange={v => setExperience(experience.map((e, j) => j === i ? { ...e, description: v } : e))} placeholder="Har bir gapni yangi qatordan boshlang.&#10;React bilan 5 ta dashboard yasadim&#10;Sahifa yuklanishini 40% tezlashtirdim" multiline rows={5} />
            </RowCard>
          ))}
          <AddBtn label="Yana ish qo'shish" onClick={() => setExperience([...experience, { ...EMPTY_EXP }])} />
        </Section>

        <Section icon={<Award size={16} />} title="Yetakchilik tajribasi" optional>
          {leadership.length === 0 ? (
            <AddBtn label="Yetakchilik tajribasi qo'shish" onClick={() => setLeadership([{ ...EMPTY_EXP }])} />
          ) : (
            <>
              {leadership.map((exp, i) => (
                <RowCard key={i} onRemove={() => setLeadership(leadership.filter((_, j) => j !== i))}>
                  <Field label="Tashkilot" value={exp.company} onChange={v => setLeadership(leadership.map((e, j) => j === i ? { ...e, company: v } : e))} placeholder="IT Club" />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <Field label="Rol" value={exp.position} onChange={v => setLeadership(leadership.map((e, j) => j === i ? { ...e, position: v } : e))} placeholder="Prezident" />
                    <Field label="Muddat" value={exp.period} onChange={v => setLeadership(leadership.map((e, j) => j === i ? { ...e, period: v } : e))} placeholder="2023-2024" />
                  </div>
                  <Field label="Yutuqlar" value={exp.description} onChange={v => setLeadership(leadership.map((e, j) => j === i ? { ...e, description: v } : e))} multiline rows={3} />
                </RowCard>
              ))}
              <AddBtn label="Yana qo'shish" onClick={() => setLeadership([...leadership, { ...EMPTY_EXP }])} />
            </>
          )}
        </Section>

        <Section icon={<BookOpen size={16} />} title="Ko'nikmalar va tillar">
          <Field label="Ko'nikmalar (vergul bilan)" value={skills} onChange={setSkills} placeholder="React, TypeScript, SQL, Figma" />
          <Field icon={<Languages size={14} />} label="Tillar" value={languages} onChange={setLanguages} placeholder="O'zbek (ona), Ingliz (B2), Rus (B1)" />
          <Field icon={<Heart size={14} />} label="Qiziqishlar" value={interests} onChange={setInterests} placeholder="Ochiq manba loyihalar, shaxmat" multiline rows={2} />
        </Section>

        {error && (
          <div style={{ padding: '12px 14px', borderRadius: 12, background: '#fef2f2', color: '#b91c1c', fontSize: 13, fontWeight: 600, border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}
      </div>

      <div style={{ position: 'fixed', bottom: 80, left: 0, right: 0, padding: '12px 16px', zIndex: 20 }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <button type="button" onClick={generate} disabled={loading}
            style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none',
              background: loading ? '#94a3b8' : 'linear-gradient(135deg, #1e3a5f, #2a4f7a)',
              color: '#fff', fontSize: 15, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 8px 24px rgba(30,58,95,0.3)' }}>
            {loading ? <><Loader2 size={18} className="spin" /> AI yozmoqda...</> : <><Sparkles size={18} /> Rezyume yaratish</>}
          </button>
        </div>
      </div>
      <style>{`@keyframes spinR{to{transform:rotate(360deg)}} .spin{animation:spinR 0.9s linear infinite}`}</style>
      <BottomNav />
    </div>
  );
}

/* ==================== RESUME PAPER ==================== */

function ResumePaper({ data }: { data: GeneratedResume }) {
  const { template, fullName, contact, education, experience, leadership, skills, interests } = data;

  const Entry = ({ e }: { e: ResumeEntry }) => (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontWeight: 'bold', fontSize: 12 }}>
        <span>{e.headerLeft}</span>
        <span>{e.headerRight}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontStyle: 'italic', fontSize: 12, marginTop: 1 }}>
        <span>{e.subLeft}</span>
        <span>{e.subRight}</span>
      </div>
      {e.bullets.length > 0 && (
        <ul style={{ margin: '3px 0 0 0', paddingLeft: 18, fontSize: 11.5, lineHeight: 1.4 }}>
          {e.bullets.map((b, i) => (
            <li key={i} style={{ margin: '1.5px 0' }}>{b}</li>
          ))}
        </ul>
      )}
    </div>
  );

  const Heading = ({ children }: { children: string }) => (
    <h2 style={{ fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.02em', borderBottom: '1.2px solid #000', paddingBottom: 2, margin: '12px 0 6px' }}>
      {children}
    </h2>
  );

  const educationBlock = education.length > 0 && (
    <>
      <Heading>Ta&apos;lim</Heading>
      {education.map((e, i) => <Entry key={i} e={e} />)}
    </>
  );

  const experienceBlock = experience.length > 0 && (
    <>
      <Heading>Ish tajribasi</Heading>
      {experience.map((e, i) => <Entry key={i} e={e} />)}
    </>
  );

  const leadershipBlock = leadership.length > 0 && (
    <>
      <Heading>Etakchilik tajribasi (Leadership Experience)</Heading>
      {leadership.map((e, i) => <Entry key={i} e={e} />)}
    </>
  );

  const skillsBlock = (skills || interests) && (
    <>
      <Heading>Qiziqishlaringiz / Ko&apos;nikmalaringiz</Heading>
      {skills && (
        <p style={{ fontSize: 11.5, margin: '4px 0', lineHeight: 1.4 }}>
          <strong>Ko&apos;nikmalar:</strong> {skills}
        </p>
      )}
      {interests && (
        <p style={{ fontSize: 11.5, margin: '4px 0', lineHeight: 1.4 }}>
          <strong>Qiziqishlar:</strong> {interests}
        </p>
      )}
    </>
  );

  return (
    <div
      style={{
        width: 794, // A4 width at 96dpi ≈ 210mm
        minHeight: 1123, // A4 height
        background: '#fff',
        padding: '48px 56px',
        fontFamily: "'Times New Roman', Times, serif",
        color: '#000',
        lineHeight: 1.4,
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
        boxSizing: 'border-box',
        // Scale down on small screens for preview
        transformOrigin: 'top center',
      }}
      className="resume-paper-wrap"
    >
      <h1 style={{ textAlign: 'center', fontSize: 22, fontWeight: 'bold', margin: 0, letterSpacing: '0.01em' }}>
        {fullName}
      </h1>
      {contact && (
        <p style={{ textAlign: 'center', fontSize: 11.5, margin: '4px 0 12px', color: '#000' }}>
          {contact}
        </p>
      )}

      {template === 'STUDENT' ? (
        <>
          {educationBlock}
          {experienceBlock}
          {leadershipBlock}
          {skillsBlock}
        </>
      ) : (
        <>
          {experienceBlock}
          {leadershipBlock}
          {educationBlock}
          {skillsBlock}
        </>
      )}

      <style>{`
        @media (max-width: 820px) {
          .resume-paper-wrap {
            transform: scale(0.46);
            margin-bottom: -600px;
          }
        }
        @media (min-width: 821px) and (max-width: 1100px) {
          .resume-paper-wrap {
            transform: scale(0.75);
            margin-bottom: -280px;
          }
        }
      `}</style>
    </div>
  );
}

/* ==================== FORM HELPERS ==================== */

function Section({ icon, title, children, optional }: { icon: React.ReactNode; title: string; children: React.ReactNode; optional?: boolean }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: 16, border: '1px solid #f1f5f9' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e3a5f' }}>
          {icon}
        </div>
        <h2 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', flex: 1 }}>{title}</h2>
        {optional && <span style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', padding: '2px 8px', borderRadius: 12, background: '#f1f5f9' }}>Ixtiyoriy</span>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, icon, multiline, rows }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
  icon?: React.ReactNode; multiline?: boolean; rows?: number;
}) {
  const style: React.CSSProperties = {
    width: '100%', padding: icon ? '10px 12px 10px 34px' : '10px 12px',
    fontSize: 13, border: '1.5px solid #e2e8f0', borderRadius: 10,
    outline: 'none', background: '#fff', color: '#0f172a',
    fontFamily: 'inherit', lineHeight: 1.4, resize: 'vertical',
  };
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4, display: 'block' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none', display: 'flex' }}>
            {icon}
          </span>
        )}
        {multiline ? (
          <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows || 3} style={style} />
        ) : (
          <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={style} />
        )}
      </div>
    </div>
  );
}

function RowCard({ children, onRemove }: { children: React.ReactNode; onRemove?: () => void }) {
  return (
    <div style={{ position: 'relative', padding: 12, borderRadius: 12, background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {onRemove && (
        <button type="button" onClick={onRemove} style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 8, border: 'none', background: '#fee2e2', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Trash2 size={13} />
        </button>
      )}
      {children}
    </div>
  );
}

function AddBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{ padding: '10px 14px', borderRadius: 10, border: '1.5px dashed #cbd5e1', background: '#fff', color: '#475569', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
      <Plus size={14} /> {label}
    </button>
  );
}
