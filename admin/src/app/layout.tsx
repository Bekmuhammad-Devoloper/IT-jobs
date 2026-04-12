import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Yuksalish.dev Admin',
  description: 'Admin panel for Yuksalish.dev IT Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body>{children}</body>
    </html>
  );
}
