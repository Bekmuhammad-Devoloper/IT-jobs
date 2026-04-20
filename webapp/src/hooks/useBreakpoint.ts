'use client';
import { useState, useEffect } from 'react';

export function useBreakpoint() {
  const [bp, setBp] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      setBp(w >= 1024 ? 'desktop' : w >= 640 ? 'tablet' : 'mobile');
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return bp;
}
