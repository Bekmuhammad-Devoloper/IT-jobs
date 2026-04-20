'use client';
import type { Post } from '@/types';
import { timeAgo } from '@/lib/utils';
import Link from 'next/link';
import { Briefcase, MapPin, Eye, DollarSign } from 'lucide-react';

interface CourseCardProps {
  post: Post;
  index?: number;
}

export default function CourseCard({ post, index = 0 }: CourseCardProps) {
  const author = post.author;
  const photoUrl = author?.photoUrl || author?.photo;
  const name = [author?.firstName, author?.lastName].filter(Boolean).join(' ') || 'Nomalum';
  const views = (post as any).views || (post as any).viewCount || 0;
  const techs = post.technologies || [];
  const maxSkills = 4;
  const visibleSkills = techs.slice(0, maxSkills);
  const remainingCount = techs.length - maxSkills;

  // Parse title for "O'rgatish:" prefix — show on one line
  const title = post.title || 'Kurs';

  return (
    <Link href={`/posts/${post.id}`} style={{ display: 'block', textDecoration: 'none' }}>
      <article
        aria-label={`Kurs: ${title}`}
        style={{
          background: 'hsla(0, 0%, 100%, 0.55)',
          backdropFilter: 'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
          borderRadius: 24,
          border: '1px solid hsla(0, 0%, 100%, 0.7)',
          padding: 20,
          transition: 'transform 700ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 700ms cubic-bezier(0.22, 1, 0.36, 1)',
          boxShadow: '0 4px 24px hsla(222, 47%, 11%, 0.06)',
          animation: `courseFloatIn 700ms cubic-bezier(0.22, 1, 0.36, 1) ${index * 80}ms both`,
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.transform = 'translateY(-6px)';
          el.style.boxShadow = '0 24px 48px hsla(217, 91%, 60%, 0.15), 0 0 0 1px hsla(217, 91%, 60%, 0.3)';
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.transform = 'translateY(0)';
          el.style.boxShadow = '0 4px 24px hsla(222, 47%, 11%, 0.06)';
        }}
      >
        {/* 1. HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              background: 'linear-gradient(135deg, hsl(217, 91%, 60%), hsl(262, 83%, 65%))',
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.05em',
              padding: '6px 16px',
              borderRadius: 9999,
              boxShadow: '0 4px 14px hsla(217, 91%, 60%, 0.5)',
              whiteSpace: 'nowrap',
            }}
          >
            Kurs
          </span>
          <span style={{ fontSize: 12, color: 'hsl(215, 16%, 47%)', fontWeight: 500 }}>
            {timeAgo(post.createdAt)}
          </span>
        </div>

        {/* 2. KURS NOMI — "O'rgatish" va nom bir qatorda */}
        <h3
          style={{
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            color: 'hsl(222, 47%, 11%)',
            marginBottom: 12,
            fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
          }}
        >
          {title}
        </h3>

        {/* 3. META PILLS */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {post.company && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                fontWeight: 500,
                color: 'hsl(215, 16%, 47%)',
                background: 'hsla(0, 0%, 100%, 0.6)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid hsla(0, 0%, 100%, 0.5)',
                padding: '5px 12px',
                borderRadius: 10,
                transition: 'color 300ms, border-color 300ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'hsl(217, 91%, 60%)';
                e.currentTarget.style.borderColor = 'hsla(217, 91%, 60%, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'hsl(215, 16%, 47%)';
                e.currentTarget.style.borderColor = 'hsla(0, 0%, 100%, 0.5)';
              }}
            >
              <Briefcase size={14} /> {post.company}
            </span>
          )}
          {post.city && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                fontWeight: 500,
                color: 'hsl(215, 16%, 47%)',
                background: 'hsla(0, 0%, 100%, 0.6)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid hsla(0, 0%, 100%, 0.5)',
                padding: '5px 12px',
                borderRadius: 10,
                transition: 'color 300ms, border-color 300ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'hsl(217, 91%, 60%)';
                e.currentTarget.style.borderColor = 'hsla(217, 91%, 60%, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'hsl(215, 16%, 47%)';
                e.currentTarget.style.borderColor = 'hsla(0, 0%, 100%, 0.5)';
              }}
            >
              <MapPin size={14} /> {post.city}
            </span>
          )}
        </div>

        {/* 4. NARX PILL */}
        {post.salary && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'linear-gradient(135deg, hsla(38, 92%, 88%, 1), hsla(38, 92%, 80%, 1))',
              border: '1px solid hsla(38, 80%, 70%, 0.6)',
              color: 'hsl(28, 80%, 35%)',
              fontSize: 16,
              fontWeight: 700,
              padding: '8px 16px',
              borderRadius: 16,
              marginBottom: 12,
              width: 'fit-content',
            }}
          >
            <DollarSign size={16} /> {post.salary}
          </div>
        )}

        {/* 5. SKILL TEGLAR */}
        {techs.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {visibleSkills.map((t: any) => (
              <span
                key={typeof t === 'string' ? t : t.id}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '4px 12px',
                  borderRadius: 10,
                  background: 'hsla(0, 0%, 100%, 0.6)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: '1px solid hsla(0, 0%, 100%, 0.5)',
                  color: 'hsl(222, 47%, 11%)',
                }}
              >
                {typeof t === 'string' ? t : t.name}
              </span>
            ))}
            {remainingCount > 0 && (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '4px 12px',
                  borderRadius: 10,
                  background: 'hsla(217, 91%, 60%, 0.1)',
                  color: 'hsl(217, 91%, 60%)',
                }}
              >
                +{remainingCount}
              </span>
            )}
          </div>
        )}

        {/* 6. AJRATUVCHI CHIZIQ */}
        <div
          style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent, hsla(0, 0%, 100%, 0.7), transparent)',
            marginBottom: 14,
          }}
        />

        {/* 7. FOOTER */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 14,
              fontWeight: 500,
              color: 'hsl(215, 16%, 47%)',
            }}
          >
            <Eye size={16} /> {views}
          </span>
          {author && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={name}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #fff',
                    boxShadow: '0 2px 8px hsla(222, 47%, 11%, 0.1)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, hsl(217, 91%, 60%), hsl(262, 83%, 65%))',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 700,
                    border: '2px solid #fff',
                    boxShadow: '0 2px 8px hsla(222, 47%, 11%, 0.1)',
                  }}
                >
                  {name[0] || '?'}
                </div>
              )}
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'hsl(222, 47%, 11%)',
                }}
              >
                {author.firstName}
              </span>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
