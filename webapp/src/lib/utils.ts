import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('uz-UZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

export function timeAgo(date: string | Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);

  if (seconds < 60) return 'hozirgina';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} daqiqa oldin`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} soat oldin`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)} kun oldin`;
  return formatDate(date);
}

export function getPostTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    VACANCY: 'Vakansiya',
    RESUME: 'Rezyume',
    COURSE: 'Kurs',
    MENTOR: 'Mentor',
    INTERNSHIP: 'Stajirovka',
  };
  return labels[type] || type;
}

export function getPostTypeColor(type: string): string {
  const colors: Record<string, string> = {
    VACANCY: '#1e3a5f',
    RESUME: '#22865a',
    COURSE: '#b8860b',
    MENTOR: '#6b4fa0',
    INTERNSHIP: '#c44540',
  };
  return colors[type] || '#4a5568';
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Kutilmoqda',
    APPROVED: 'Tasdiqlangan',
    REJECTED: 'Rad etilgan',
    EXPIRED: 'Muddati tugagan',
  };
  return labels[status] || status;
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

export function generateFingerprint(): string {
  if (typeof window === 'undefined') return '';
  const nav = window.navigator;
  const screen = window.screen;
  const raw = [
    nav.userAgent,
    nav.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
  ].join('|');
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}
