'use client';
import type { Post } from '@/types';
import Link from 'next/link';
import { Eye, Clock, Calendar, CalendarDays, DollarSign, Briefcase } from 'lucide-react';
import { useBreakpoint } from '@/hooks/useBreakpoint';

interface MentorCardProps {
  post: Post;
  index?: number;
}

export default function MentorCard({ post, index = 0 }: MentorCardProps) {
  const bp = useBreakpoint();
  const m = bp === 'mobile';

  const author = post.author;
  const photoUrl = author?.photoUrl || author?.photo;
  const mentorName = [author?.firstName, author?.lastName].filter(Boolean).join(' ') || 'Nomalum';
  const views = (post as any).views || (post as any).viewCount || 0;
  const rating = parseFloat(String((post as any).rating)) || 0;
  const title = post.title || 'Kurs';

  const extra = (post.extra || {}) as Record<string, any>;
  const durationHours = extra.durationHours || extra.duration || null;
  const daysPerWeek = extra.daysPerWeek || null;
  const months = extra.months || extra.durationMonths || null;

  const techs = post.technologies || [];
  const maxTechs = m ? 3 : 5;
  const visibleTechs = techs.slice(0, maxTechs);
  const remainingCount = techs.length - maxTechs;

  const salaryNum = post.salary && !isNaN(Number(post.salary)) ? Number(post.salary) : null;
  const salaryLabel = salaryNum && salaryNum > 0
    ? `${salaryNum.toLocaleString('ru-RU')} so'm`
    : post.salary || 'Kelishiladi';

  const dur = m ? 300 : 600;
  const ease = 'cubic-bezier(0.22, 1, 0.36, 1)';

  return (
    <Link href={`/posts/${post.id}`} style={{ display: 'block', textDecoration: 'none' }}>
      <article
        aria-label={`Mentor: ${title}`}
        style={{
          background: 'hsla(0, 0%, 100%, 0.65)',
          backdropFilter: 'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
          borderRadius: m ? 18 : 22,
          border: '1px solid hsla(262, 60%, 80%, 0.35)',
          padding: m ? 14 : 18,
          boxShadow: '0 4px 24px hsla(262, 30%, 40%, 0.08)',
          animation: `mentorFloatIn ${dur}ms ${ease} ${index * (m ? 50 : 80)}ms both`,
          cursor: 'pointer',
          transition: `transform ${dur}ms ${ease}, box-shadow ${dur}ms ${ease}`,
        }}
        onTouchStart={(e) => { e.currentTarget.style.transform = 'scale(0.98)'; }}
        onTouchEnd={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        {/* Top row: photo | middle | right */}
        <div style={{ display: 'flex', gap: m ? 10 : 14, alignItems: 'flex-start' }}>
          {/* Col 1: TG photo */}
          <div style={{ flexShrink: 0 }}>
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={mentorName}
                style={{
                  width: m ? 68 : 84,
                  height: m ? 68 : 84,
                  borderRadius: m ? 16 : 18,
                  objectFit: 'cover',
                  border: '2px solid #fff',
                  boxShadow: '0 4px 14px hsla(262, 40%, 40%, 0.18)',
                }}
              />
            ) : (
              <div style={{
                width: m ? 68 : 84,
                height: m ? 68 : 84,
                borderRadius: m ? 16 : 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, hsl(262, 65%, 60%), hsl(290, 60%, 55%))',
                color: '#fff', fontSize: m ? 24 : 30, fontWeight: 800,
                border: '2px solid #fff',
                boxShadow: '0 4px 14px hsla(262, 40%, 40%, 0.18)',
              }}>
                {mentorName[0] || '?'}
              </div>
            )}
          </div>

          {/* Col 2: course info */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: m ? 4 : 6 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
              color: 'hsl(262, 60%, 45%)', textTransform: 'uppercase',
              background: 'hsla(262, 60%, 90%, 0.7)',
              padding: '2px 8px', borderRadius: 6, width: 'fit-content',
            }}>
              Mentor
            </span>
            <h3 style={{
              fontSize: m ? 15 : 17, fontWeight: 800, lineHeight: 1.25,
              color: 'hsl(222, 47%, 11%)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {title}
            </h3>
            <div style={{ fontSize: m ? 12 : 13, fontWeight: 600, color: 'hsl(215, 16%, 35%)' }}>
              {mentorName}
            </div>
            {/* Duration meta row */}
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

          {/* Col 3: price + experience */}
          <div style={{
            flexShrink: 0, textAlign: 'right',
            display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end',
          }}>
            <div style={{
              fontSize: m ? 12 : 13, fontWeight: 800,
              padding: m ? '4px 8px' : '5px 10px', borderRadius: 8,
              background: 'linear-gradient(135deg, hsla(38, 92%, 88%, 1), hsla(38, 92%, 80%, 1))',
              color: 'hsl(28, 80%, 35%)',
              whiteSpace: 'nowrap',
            }}>
              {salaryLabel}
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
          </div>
        </div>

        {/* Technologies row (below top) */}
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
                background: 'hsla(262, 60%, 96%, 0.8)', color: 'hsl(262, 50%, 35%)',
                border: '1px solid hsla(262, 60%, 85%, 0.5)',
              }}>
                {typeof t === 'string' ? t : t.name}
              </span>
            ))}
            {remainingCount > 0 && (
              <span style={{
                fontSize: m ? 10 : 11, fontWeight: 600,
                padding: m ? '3px 8px' : '3px 9px', borderRadius: 8,
                background: 'hsla(262, 60%, 50%, 0.1)', color: 'hsl(262, 60%, 45%)',
              }}>
                +{remainingCount}
              </span>
            )}
          </div>
        )}

        {/* Divider */}
        <div style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent, hsla(262, 40%, 80%, 0.4), transparent)',
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
                  alt={mentorName}
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
                  background: 'linear-gradient(135deg, hsl(262, 65%, 60%), hsl(290, 60%, 55%))',
                  color: '#fff', fontSize: 9, fontWeight: 800, border: '1.5px solid #fff',
                }}>
                  {mentorName[0] || '?'}
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
    background: 'hsla(0, 0%, 100%, 0.7)',
    border: '1px solid hsla(215, 20%, 80%, 0.4)',
    color: 'hsl(215, 16%, 35%)', whiteSpace: 'nowrap',
  };
}
