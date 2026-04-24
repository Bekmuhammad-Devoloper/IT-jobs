'use client';
import type { GeneratedResume, ResumeEntry } from '@/lib/api';

export default function ResumePaper({ data }: { data: GeneratedResume }) {
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
        width: 794,
        minHeight: 1123,
        background: '#fff',
        padding: '48px 56px',
        fontFamily: "'Times New Roman', Times, serif",
        color: '#000',
        lineHeight: 1.4,
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
        boxSizing: 'border-box',
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

export async function downloadResumePdf(element: HTMLElement, fullName: string) {
  const mod: any = await import('html2pdf.js');
  const html2pdf = mod.default || mod;
  await html2pdf()
    .set({
      margin: [10, 10, 10, 10],
      filename: `${(fullName || 'resume').replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    })
    .from(element)
    .save();
}
