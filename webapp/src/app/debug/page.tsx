'use client';
import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [info, setInfo] = useState<Record<string, string>>({});

  useEffect(() => {
    const data: Record<string, string> = {};

    data['timestamp'] = new Date().toISOString();
    data['userAgent'] = navigator.userAgent;
    data['window.Telegram exists'] = String(!!window.Telegram);
    data['window.Telegram.WebApp exists'] = String(!!window.Telegram?.WebApp);

    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      data['initData length'] = String(tg.initData?.length || 0);
      data['initData (first 100)'] = (tg.initData || '').substring(0, 100);
      data['colorScheme'] = tg.colorScheme || 'N/A';
      data['isExpanded'] = String(tg.isExpanded);
      data['viewportHeight'] = String(tg.viewportHeight);

      if (tg.initDataUnsafe?.user) {
        data['user.id'] = String(tg.initDataUnsafe.user.id);
        data['user.first_name'] = tg.initDataUnsafe.user.first_name || 'N/A';
        data['user.last_name'] = tg.initDataUnsafe.user.last_name || 'N/A';
        data['user.username'] = tg.initDataUnsafe.user.username || 'N/A';
        data['user.photo_url'] = tg.initDataUnsafe.user.photo_url || 'N/A';
      } else {
        data['initDataUnsafe.user'] = 'NOT AVAILABLE';
      }
    }

    // Also check scripts
    const scripts = document.querySelectorAll('script[src*="telegram"]');
    data['telegram script tags count'] = String(scripts.length);
    scripts.forEach((s, i) => {
      data[`script[${i}].src`] = (s as HTMLScriptElement).src;
    });

    setInfo(data);
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: 'monospace', fontSize: 13 }}>
      <h1 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Telegram WebApp Debug</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {Object.entries(info).map(([key, value]) => (
            <tr key={key} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '6px 8px', fontWeight: 'bold', color: '#1e3a5f' }}>{key}</td>
              <td style={{ padding: '6px 8px', wordBreak: 'break-all' }}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
