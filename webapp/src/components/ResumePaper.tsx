'use client';
import { useEffect } from 'react';
import type { GeneratedResume, ResumeEntry } from '@/lib/api';
import ResumeDocument from './ResumeDocument';

const FONT_STACK = "'Tinos', 'Liberation Serif', 'Times New Roman', Times, serif";
const FONT_CSS_URL =
  'https://fonts.googleapis.com/css2?family=Tinos:ital,wght@0,400;0,700;1,400;1,700&display=swap';

function useEnsureTinos() {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const id = 'tinos-font-link';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = FONT_CSS_URL;
      document.head.appendChild(link);
    }
    const pre = 'tinos-font-preconnect';
    if (!document.getElementById(pre)) {
      const p = document.createElement('link');
      p.id = pre;
      p.rel = 'preconnect';
      p.href = 'https://fonts.gstatic.com';
      p.crossOrigin = 'anonymous';
      document.head.appendChild(p);
    }
    if (document.fonts?.load) {
      Promise.allSettled([
        document.fonts.load('400 14px Tinos'),
        document.fonts.load('700 14px Tinos'),
        document.fonts.load('italic 400 14px Tinos'),
        document.fonts.load('italic 700 14px Tinos'),
      ]).catch(() => {});
    }
  }, []);
}

export default function ResumePaper({ data }: { data: GeneratedResume }) {
  useEnsureTinos();
  const { template, fullName, contact, education, experience, leadership, skills, interests } = data;

  const Bullet = ({ children }: { children: React.ReactNode }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, margin: '2.5px 0' }}>
      <span style={{ flexShrink: 0, fontSize: 13, lineHeight: 1.45, color: '#000', marginTop: 0 }}>●</span>
      <span style={{ flex: 1, fontSize: 12.5, lineHeight: 1.5, textAlign: 'justify' }}>{children}</span>
    </div>
  );

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
        <div style={{ marginTop: 4, paddingLeft: 8 }}>
          {e.bullets.map((b, i) => (
            <Bullet key={i}>{b}</Bullet>
          ))}
        </div>
      )}
    </div>
  );

  const Heading = ({ children }: { children: string }) => (
    <h2 style={{
      fontSize: 13, fontWeight: 700, textTransform: 'uppercase',
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
        <p style={{ fontSize: 12.5, margin: '5px 0', lineHeight: 1.5, textAlign: 'justify' }}>
          <strong>Ko&apos;nikmalar:</strong> {skills}
        </p>
      )}
      {interests && (
        <p style={{ fontSize: 12.5, margin: '5px 0', lineHeight: 1.5, textAlign: 'justify' }}>
          <strong>Qiziqishlar:</strong> {interests}
        </p>
      )}
    </>
  );

  return (
    <>
      <style>{`
        .resume-paper-root, .resume-paper-root * {
          font-family: ${FONT_STACK};
          font-feature-settings: "kern" 1, "liga" 1;
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
          textAlign: 'center', fontSize: 26, fontWeight: 700, margin: 0,
          letterSpacing: '0.005em', lineHeight: 1.15,
        }}>
          {fullName}
        </h1>
        {contact && (
          <p style={{
            textAlign: 'center', fontSize: 12.5, margin: '6px 0 14px',
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

/**
 * Download the resume as a pixel-perfect PDF using @react-pdf/renderer.
 * This renders directly to PDF using standard Times-Roman — identical to
 * what Microsoft Word produces for the reference template (no HTML-to-canvas
 * conversion, no font fallback issues).
 */
export async function downloadResumePdf(
  _element: HTMLElement | null,
  fullName: string,
  data?: GeneratedResume,
) {
  if (!data) throw new Error('Resume data required for PDF generation');
  const { pdf } = await import('@react-pdf/renderer');
  const blob = await pdf(<ResumeDocument data={data} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(fullName || 'resume').replace(/\s+/g, '_')}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
