'use client';
import type { GeneratedResume, ResumeEntry } from '@/lib/api';

const FONT_STACK = "'Tinos', 'Liberation Serif', 'Times New Roman', Times, serif";

export default function ResumePaper({ data }: { data: GeneratedResume }) {
  const { template, fullName, contact, education, experience, leadership, skills, interests } = data;

  const Entry = ({ e }: { e: ResumeEntry }) => (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontWeight: 700, fontSize: 13 }}>{e.headerLeft}</span>
        <span style={{ fontWeight: 700, fontSize: 13 }}>{e.headerRight}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 1 }}>
        <span style={{ fontStyle: 'italic', fontSize: 12.5 }}>{e.subLeft}</span>
        <span style={{ fontStyle: 'italic', fontSize: 12.5 }}>{e.subRight}</span>
      </div>
      {e.bullets.length > 0 && (
        <ul style={{ margin: '4px 0 0 0', paddingLeft: 22, fontSize: 12, lineHeight: 1.45, listStyleType: 'disc' }}>
          {e.bullets.map((b, i) => (
            <li key={i} style={{ margin: '2px 0', textAlign: 'justify' }}>{b}</li>
          ))}
        </ul>
      )}
    </div>
  );

  const Heading = ({ children }: { children: string }) => (
    <h2 style={{
      fontSize: 12.5, fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.02em', borderBottom: '1.4px solid #000',
      paddingBottom: 2, margin: '14px 0 7px', lineHeight: 1.2,
    }}>
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
        <p style={{ fontSize: 12, margin: '5px 0', lineHeight: 1.45, textAlign: 'justify' }}>
          <strong>Ko&apos;nikmalar:</strong> {skills}
        </p>
      )}
      {interests && (
        <p style={{ fontSize: 12, margin: '5px 0', lineHeight: 1.45, textAlign: 'justify' }}>
          <strong>Qiziqishlar:</strong> {interests}
        </p>
      )}
    </>
  );

  return (
    <>
      {/* Import Tinos (Times-compatible open font) so rendering matches across devices and in html2pdf canvas */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tinos:ital,wght@0,400;0,700;1,400;1,700&display=swap');
        .resume-paper-root, .resume-paper-root * {
          font-family: ${FONT_STACK};
          font-feature-settings: "kern" 1;
          -webkit-font-smoothing: antialiased;
        }
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
      <div
        className="resume-paper-wrap resume-paper-root"
        style={{
          width: 794,
          minHeight: 1123,
          background: '#fff',
          padding: '64px 72px',
          color: '#000',
          lineHeight: 1.4,
          boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
          boxSizing: 'border-box',
          transformOrigin: 'top center',
          fontFamily: FONT_STACK,
        }}
      >
        <h1 style={{
          textAlign: 'center', fontSize: 24, fontWeight: 700, margin: 0,
          letterSpacing: '0.005em', lineHeight: 1.15,
        }}>
          {fullName}
        </h1>
        {contact && (
          <p style={{
            textAlign: 'center', fontSize: 12, margin: '5px 0 14px',
            color: '#000', lineHeight: 1.3,
          }}>
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
      </div>
    </>
  );
}

export async function downloadResumePdf(element: HTMLElement, fullName: string) {
  // Ensure Google Font (Tinos) is fully loaded before html2canvas captures the element.
  // Without this, the canvas can fall back to a different serif and the output looks wrong.
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    try { await document.fonts.ready; } catch {}
  }

  // Temporarily remove any CSS scaling from the element & ancestors so html2canvas
  // captures the true A4 dimensions. We save and restore transforms.
  const touched: Array<{ el: HTMLElement; prev: string }> = [];
  let node: HTMLElement | null = element;
  while (node) {
    const t = node.style.transform;
    if (t) {
      touched.push({ el: node, prev: t });
      node.style.transform = 'none';
    }
    node = node.parentElement;
  }

  try {
    const mod: any = await import('html2pdf.js');
    const html2pdf = mod.default || mod;
    await html2pdf()
      .set({
        margin: 0,
        filename: `${(fullName || 'resume').replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true, windowWidth: 794 },
        jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      })
      .from(element)
      .save();
  } finally {
    for (const { el, prev } of touched) el.style.transform = prev;
  }
}
