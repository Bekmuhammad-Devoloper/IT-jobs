'use client';
import type { Post } from '@/types';
import { timeAgo } from '@/lib/utils';
import Link from 'next/link';
import { Building2, MapPin, Eye, DollarSign } from 'lucide-react';
import { useBreakpoint } from '@/hooks/useBreakpoint';

interface VacancyCardProps {
  post: Post;
  index?: number;
}

export default function VacancyCard({ post, index = 0 }: VacancyCardProps) {
  const bp = useBreakpoint();
  const m = bp === 'mobile';
  const d = bp === 'desktop';

  const author = post.author;
  const photoUrl = author?.photoUrl || author?.photo;
  const name = [author?.firstName, author?.lastName].filter(Boolean).join(' ') || 'Nomalum';
  const views = (post as any).views || (post as any).viewCount || 0;
  const techs = post.technologies || [];
  const maxSkills = m ? 3 : 4;
  const visibleSkills = techs.slice(0, maxSkills);
  const remainingCount = techs.length - maxSkills;
  const dur = m ? 300 : 700;
  const ease = 'cubic-bezier(0.22, 1, 0.36, 1)';

  return (
    <Link href={`/posts/${post.id}`} style={{ display: 'block', textDecoration: 'none', minHeight: 44 }}>
      <article
        aria-label={`Vakansiya: ${post.title}`}
        style={{
          background: 'hsla(0, 0%, 100%, 0.55)',
          backdropFilter: 'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
          borderRadius: m ? 20 : 24,
          border: '1px solid hsla(0, 0%, 100%, 0.7)',
          padding: m ? 16 : d ? 24 : 20,
          transition: `transform ${dur}ms ${ease}, box-shadow ${dur}ms ${ease}`,
          boxShadow: '0 4px 24px hsla(222, 47%, 11%, 0.06)',
          animation: `vacancyFloatIn ${dur}ms ${ease} ${index * (m ? 50 : 80)}ms both`,
          cursor: 'pointer',
        }}
        onMouseEnter={!m ? (e) => {
          e.currentTarget.style.transform = 'translateY(-6px)';
          e.currentTarget.style.boxShadow = '0 24px 48px hsla(160, 84%, 39%, 0.15), 0 0 0 1px hsla(160, 84%, 39%, 0.3)';
        } : undefined}
        onMouseLeave={!m ? (e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 24px hsla(222, 47%, 11%, 0.06)';
        } : undefined}
        onTouchStart={(e) => { e.currentTarget.style.transform = 'scale(0.98)'; }}
        onTouchEnd={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        {/* 1. HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: m ? 10 : 14, gap: m ? 8 : 12 }}>
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: 'linear-gradient(135deg, hsl(160, 84%, 39%), hsl(190, 95%, 50%))',
              color: '#fff', fontSize: m ? 11 : 12, fontWeight: 600,
              letterSpacing: '0.05em', padding: m ? '4px 12px' : '6px 16px',
              borderRadius: 9999, boxShadow: '0 4px 14px hsla(160, 84%, 39%, 0.5)',
              whiteSpace: 'nowrap',
            }}
          >
            Vakansiya
          </span>
          <span style={{ fontSize: m ? 11 : 12, color: 'hsl(215, 16%, 47%)', fontWeight: 500 }}>
            {timeAgo(post.createdAt)}
          </span>
        </div>

        {/* 2. LAVOZIM NOMI */}
        <h3
          style={{
            fontSize: m ? 18 : d ? 24 : 20, fontWeight: 700,
            letterSpacing: '-0.02em', lineHeight: 1.2,
            color: 'hsl(222, 47%, 11%)', marginBottom: m ? 10 : 12,
            fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
          }}
        >
          {post.title}
        </h3>

        {/* 3. META PILLS */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: m ? 6 : 8, marginBottom: m ? 10 : 12 }}>
          {post.company && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: m ? 4 : 6,
              fontSize: m ? 11 : 13, fontWeight: 500, color: 'hsl(215, 16%, 47%)',
              background: 'hsla(0, 0%, 100%, 0.6)', backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)', border: '1px solid hsla(0, 0%, 100%, 0.5)',
              padding: m ? '5px 10px' : '5px 12px', borderRadius: 10,
            }}>
              <Building2 size={m ? 12 : 14} strokeWidth={2} /> {post.company}
            </span>
          )}
          {post.city && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: m ? 4 : 6,
              fontSize: m ? 11 : 13, fontWeight: 500, color: 'hsl(215, 16%, 47%)',
              background: 'hsla(0, 0%, 100%, 0.6)', backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)', border: '1px solid hsla(0, 0%, 100%, 0.5)',
              padding: m ? '5px 10px' : '5px 12px', borderRadius: 10,
            }}>
              <MapPin size={m ? 12 : 14} strokeWidth={2} /> {post.city}
            </span>
          )}
        </div>

        {/* 4. MAOSH PILL */}

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: m ? 4 : 6,
          background: 'linear-gradient(135deg, hsla(38, 92%, 88%, 1), hsla(38, 92%, 80%, 1))',
          border: '1px solid hsla(38, 80%, 70%, 0.6)', color: 'hsl(28, 80%, 35%)',
          fontSize: m ? 15 : 16, fontWeight: 700,
          padding: m ? '6px 12px' : '8px 16px', borderRadius: m ? 12 : 16,
          marginBottom: m ? 10 : 12, width: 'fit-content',
        }}>
          <DollarSign size={m ? 14 : 16} strokeWidth={2} />{' '}
          {post.salary && !isNaN(Number(post.salary)) && Number(post.salary) > 0
            ? Number(post.salary).toLocaleString('ru-RU')
            : 'Kelishiladi'}
        </div>

        {/* 5. SKILL TEGLAR */}
        {techs.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: m ? 4 : 6, marginBottom: m ? 10 : 14 }}>
            {visibleSkills.map((t: any) => (
              <span key={typeof t === 'string' ? t : t.id} style={{
                fontSize: m ? 11 : 12, fontWeight: 600, padding: m ? '3px 10px' : '4px 12px',
                borderRadius: 10, background: 'hsla(0, 0%, 100%, 0.6)',
                backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid hsla(0, 0%, 100%, 0.5)', color: 'hsl(222, 47%, 11%)',
              }}>
                {typeof t === 'string' ? t : t.name}
              </span>
            ))}
            {remainingCount > 0 && (
              <span style={{
                fontSize: m ? 11 : 12, fontWeight: 600, padding: m ? '3px 10px' : '4px 12px',
                borderRadius: 10, background: 'hsla(160, 84%, 39%, 0.1)', color: 'hsl(160, 84%, 39%)',
              }}>
                +{remainingCount}
              </span>
            )}
          </div>
        )}

        {/* 6. AJRATUVCHI CHIZIQ */}
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, hsla(0, 0%, 100%, 0.7), transparent)', marginBottom: m ? 10 : 14 }} />

        {/* 7. FOOTER */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: m ? 13 : 14, fontWeight: 500, color: 'hsl(215, 16%, 47%)' }}>
            <Eye size={m ? 14 : 16} strokeWidth={2} /> {views}
          </span>
          {author && (
            <div style={{ display: 'flex', alignItems: 'center', gap: m ? 6 : 8 }}>
              {photoUrl ? (
                <img src={photoUrl} alt={name} style={{
                  width: m ? 24 : 28, height: m ? 24 : 28, borderRadius: '50%',
                  objectFit: 'cover', border: '2px solid #fff',
                  boxShadow: '0 2px 8px hsla(222, 47%, 11%, 0.1)',
                }} />
              ) : (
                <div style={{
                  width: m ? 24 : 28, height: m ? 24 : 28, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(135deg, hsl(160, 84%, 39%), hsl(190, 95%, 50%))',
                  color: '#fff', fontSize: m ? 10 : 12, fontWeight: 700,
                  border: '2px solid #fff', boxShadow: '0 2px 8px hsla(222, 47%, 11%, 0.1)',
                }}>
                  {name[0] || '?'}
                </div>
              )}
              <span style={{ fontSize: m ? 13 : 14, fontWeight: 600, color: 'hsl(222, 47%, 11%)' }}>
                {author.firstName}
              </span>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
