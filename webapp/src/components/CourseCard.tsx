'use client';
import type { Post } from '@/types';
import Link from 'next/link';
import { Eye, Clock, Calendar, CalendarDays, DollarSign, Briefcase, GraduationCap } from 'lucide-react';
import { useBreakpoint } from '@/hooks/useBreakpoint';

interface CourseCardProps {
  post: Post;
  index?: number;
}

export default function CourseCard({ post, index = 0 }: CourseCardProps) {
  const bp = useBreakpoint();
  const m = bp === 'mobile';

  const author = post.author;
  const photoUrl = author?.photoUrl || author?.photo;
  const teacherName = [author?.firstName, author?.lastName].filter(Boolean).join(' ') || 'Nomalum';
  const views = (post as any).views || (post as any).viewCount || 0;
  const rating = parseFloat(String((post as any).rating)) || 0;
  const title = post.title || 'Kurs';

  const extra = (post.extra || {}) as Record<string, any>;
  const durationHours = extra.durationHours ?? extra.duration ?? null;
  const daysPerWeek = extra.daysPerWeek ?? null;
  const months = extra.months ?? extra.durationMonths ?? null;

  const techs = post.technologies || [];
  const maxTechs = m ? 3 : 5;
  const visibleTechs = techs.slice(0, maxTechs);
  const remainingCount = techs.length - maxTechs;

  const salaryNum = post.salary && !isNaN(Number(post.salary)) ? Number(post.salary) : null;
  const salaryLabel = salaryNum && salaryNum > 0
    ? Number(salaryNum).toLocaleString('ru-RU')
    : post.salary || 'Kelishiladi';

  const dur = m ? 300 : 600;
  const ease = 'cubic-bezier(0.22, 1, 0.36, 1)';

  return (
    <Link href={`/posts/${post.id}`} style={{ display: 'block', textDecoration: 'none' }}>
      <article
        aria-label={`Kurs: ${title}`}
        style={{
          position: 'relative',
          background: 'linear-gradient(135deg, hsla(217, 90%, 98%, 0.9), hsla(200, 90%, 97%, 0.9))',
          backdropFilter: 'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
          borderRadius: m ? 18 : 22,
          border: '1px solid hsla(217, 70%, 85%, 0.5)',
          padding: m ? 14 : 18,
          boxShadow: '0 4px 24px hsla(217, 40%, 40%, 0.08)',
          animation: `courseFloatIn ${dur}ms ${ease} ${index * (m ? 50 : 80)}ms both`,
          cursor: 'pointer',
          transition: `transform ${dur}ms ${ease}, box-shadow ${dur}ms ${ease}`,
          overflow: 'hidden',
        }}
        onTouchStart={(e) => { e.currentTarget.style.transform = 'scale(0.98)'; }}
        onTouchEnd={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        onMouseEnter={!m ? (e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 20px 40px hsla(217, 91%, 60%, 0.15), 0 0 0 1px hsla(217, 91%, 60%, 0.25)';
        } : undefined}
        onMouseLeave={!m ? (e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 24px hsla(217, 40%, 40%, 0.08)';
        } : undefined}
      >
        {/* Decorative gradient blob */}
        <div aria-hidden style={{
          position: 'absolute', top: -40, right: -40, width: 120, height: 120,
          borderRadius: '50%',
          background: 'radial-gradient(circle, hsla(217, 91%, 70%, 0.15), transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Top row: photo | info | price */}
        <div style={{ display: 'flex', gap: m ? 10 : 14, alignItems: 'flex-start', position: 'relative' }}>
          {/* Col 1: Teacher photo */}
          <div style={{ flexShrink: 0, position: 'relative' }}>
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={teacherName}
                style={{
                  width: m ? 68 : 84,
                  height: m ? 68 : 84,
                  borderRadius: m ? 16 : 18,
                  objectFit: 'cover',
                  border: '2px solid #fff',
                  boxShadow: '0 4px 14px hsla(217, 60%, 40%, 0.18)',
                }}
              />
            ) : (
              <div style={{
                width: m ? 68 : 84,
                height: m ? 68 : 84,
                borderRadius: m ? 16 : 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, hsl(217, 91%, 60%), hsl(200, 85%, 55%))',
                color: '#fff', fontSize: m ? 24 : 30, fontWeight: 800,
                border: '2px solid #fff',
                boxShadow: '0 4px 14px hsla(217, 60%, 40%, 0.18)',
              }}>
                {teacherName[0] || '?'}
              </div>
            )}
            {/* Graduation cap badge */}
            <div aria-hidden style={{
              position: 'absolute', bottom: -4, right: -4,
              width: m ? 22 : 26, height: m ? 22 : 26,
              borderRadius: '50%', background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px hsla(217, 60%, 40%, 0.25)',
              border: '1.5px solid hsla(217, 91%, 60%, 0.2)',
            }}>
              <GraduationCap size={m ? 12 : 14} color="hsl(217, 91%, 55%)" strokeWidth={2.2} />
            </div>
          </div>

          {/* Col 2: Course info */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: m ? 4 : 6 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
              color: '#fff', textTransform: 'uppercase',
              background: 'linear-gradient(135deg, hsl(217, 91%, 60%), hsl(262, 83%, 65%))',
              padding: '3px 10px', borderRadius: 9999, width: 'fit-content',
              boxShadow: '0 2px 8px hsla(217, 91%, 60%, 0.35)',
            }}>
              Kurs
            </span>
            <h3 style={{
              fontSize: m ? 16 : 18, fontWeight: 800, lineHeight: 1.25,
              letterSpacing: '-0.01em',
              color: 'hsl(222, 47%, 11%)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
            }}>
              {title}
            </h3>
            <div style={{ fontSize: m ? 12 : 13, fontWeight: 600, color: 'hsl(215, 16%, 35%)' }}>
              {teacherName}
            </div>
            {(durationHours || daysPerWeek || months) && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: m ? 4 : 6, marginTop: 2 }}>
                {durationHours && (
                  <span style={metaPillStyle(m)}>
                    <Clock size={m ? 10 : 11} strokeWidth={2} /> {durationHours} soat
                  </span>
                )}
                {daysPerWeek && (
                  <span style={metaPillStyle(m)}>
                    <Calendar size={m ? 10 : 11} strokeWidth={2} /> {daysPerWeek} kun/hafta
                  </span>
                )}
                {months && (
                  <span style={metaPillStyle(m)}>
                    <CalendarDays size={m ? 10 : 11} strokeWidth={2} /> {months} oy
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Col 3: Price + Experience */}
          <div style={{
            flexShrink: 0, textAlign: 'right',
            display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end',
          }}>
            <div style={{
              fontSize: m ? 13 : 15, fontWeight: 800,
              padding: m ? '5px 10px' : '6px 12px', borderRadius: 10,
              background: 'linear-gradient(135deg, hsla(38, 92%, 88%, 1), hsla(38, 92%, 78%, 1))',
              color: 'hsl(28, 80%, 30%)',
              whiteSpace: 'nowrap',
              display: 'inline-flex', alignItems: 'center', gap: 3,
              boxShadow: '0 2px 8px hsla(38, 80%, 60%, 0.2)',
              border: '1px solid hsla(38, 80%, 70%, 0.5)',
            }}>
              <DollarSign size={m ? 12 : 14} strokeWidth={2.3} />
              <span>{salaryLabel}</span>
            </div>
            {post.experience && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 3,
                fontSize: m ? 10 : 11, fontWeight: 600, color: 'hsl(215, 16%, 47%)',
                whiteSpace: 'nowrap',
              }}>
                <Briefcase size={m ? 10 : 11} strokeWidth={2} /> {post.experience}
              </span>
            )}
            {post.company && (
              <span style={{
                fontSize: m ? 10 : 11, fontWeight: 600, color: 'hsl(217, 91%, 45%)',
                whiteSpace: 'nowrap', maxWidth: m ? 100 : 140,
                overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                🏫 {post.company}
              </span>
            )}
          </div>
        </div>

        {/* Technologies row */}
        {visibleTechs.length > 0 && (
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: m ? 4 : 5,
            marginTop: m ? 10 : 12,
            paddingLeft: m ? 78 : 98,
          }}>
            {visibleTechs.map((t: any, i) => (
              <span key={typeof t === 'string' ? `${t}-${i}` : t.id} style={{
                fontSize: m ? 10 : 11, fontWeight: 600,
                padding: m ? '3px 8px' : '3px 9px', borderRadius: 8,
                background: 'hsla(217, 60%, 96%, 0.8)', color: 'hsl(217, 70%, 35%)',
                border: '1px solid hsla(217, 60%, 85%, 0.5)',
              }}>
                {typeof t === 'string' ? t : t.name}
              </span>
            ))}
            {remainingCount > 0 && (
              <span style={{
                fontSize: m ? 10 : 11, fontWeight: 600,
                padding: m ? '3px 8px' : '3px 9px', borderRadius: 8,
                background: 'hsla(217, 91%, 60%, 0.12)', color: 'hsl(217, 91%, 45%)',
              }}>
                +{remainingCount}
              </span>
            )}
          </div>
        )}

        {/* Divider */}
        <div style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent, hsla(217, 40%, 80%, 0.4), transparent)',
          marginTop: m ? 10 : 12, marginBottom: m ? 10 : 12,
        }} />

        {/* Footer: rating | views | price | author */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <svg
                key={i}
                width={m ? 12 : 14}
                height={m ? 12 : 14}
                viewBox="0 0 24 24"
                fill={i <= Math.round(rating) ? '#f5b731' : 'none'}
                stroke={i <= Math.round(rating) ? '#f5b731' : '#d1d5db'}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
            {rating > 0 && (
              <span style={{ fontSize: m ? 10 : 11, fontWeight: 700, color: 'hsl(215, 16%, 47%)', marginLeft: 2 }}>
                {rating.toFixed(1)}
              </span>
            )}
          </div>

          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: m ? 11 : 12, fontWeight: 500, color: 'hsl(215, 16%, 47%)' }}>
            <Eye size={m ? 12 : 14} strokeWidth={2} /> {views}
          </span>

          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: m ? 11 : 12, fontWeight: 700, color: 'hsl(28, 80%, 35%)' }}>
            <DollarSign size={m ? 11 : 13} strokeWidth={2.2} /> {salaryLabel}
          </span>

          {author && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={teacherName}
                  style={{
                    width: m ? 20 : 22, height: m ? 20 : 22, borderRadius: '50%',
                    objectFit: 'cover', border: '1.5px solid #fff',
                    boxShadow: '0 1px 4px hsla(222, 47%, 11%, 0.12)',
                  }}
                />
              ) : (
                <div style={{
                  width: m ? 20 : 22, height: m ? 20 : 22, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(135deg, hsl(217, 91%, 60%), hsl(200, 85%, 55%))',
                  color: '#fff', fontSize: 9, fontWeight: 800, border: '1.5px solid #fff',
                }}>
                  {teacherName[0] || '?'}
                </div>
              )}
              <span style={{ fontSize: m ? 11 : 12, fontWeight: 600, color: 'hsl(222, 47%, 11%)' }}>
                {author.firstName}
              </span>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}

function metaPillStyle(m: boolean): React.CSSProperties {
  return {
    display: 'inline-flex', alignItems: 'center', gap: 3,
    fontSize: m ? 10 : 11, fontWeight: 600,
    padding: m ? '2px 7px' : '3px 8px', borderRadius: 6,
    background: 'hsla(0, 0%, 100%, 0.75)',
    border: '1px solid hsla(217, 30%, 80%, 0.45)',
    color: 'hsl(217, 25%, 35%)', whiteSpace: 'nowrap',
  };
}
