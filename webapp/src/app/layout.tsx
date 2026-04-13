import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import TelegramProvider from '@/components/TelegramProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'yuksalish.dev',
  description: "O'zbekiston IT vakansiya, rezyume, kurs va mentorlik platformasi",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1e3a5f',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        <TelegramProvider>
          {children}
        </TelegramProvider>
      </body>
    </html>
  );
}
