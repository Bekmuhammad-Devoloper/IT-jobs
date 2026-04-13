'use client';
import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [info, setInfo] = useState<Record<string, string>>({});
  const [authResult, setAuthResult] = useState<string>('Not tested yet');
  const [storeState, setStoreState] = useState<string>('Loading...');

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

    const scripts = document.querySelectorAll('script[src*="telegram"]');
    data['telegram script tags count'] = String(scripts.length);
    scripts.forEach((s, i) => {
      data[`script[${i}].src`] = (s as HTMLScriptElement).src;
    });

    setInfo(data);
  }, []);

  // Check store state
  useEffect(() => {
    import('@/store').then(({ useAppStore }) => {
      const state = useAppStore.getState();
      setStoreState(JSON.stringify({
        user: state.user ? { id: state.user.id, firstName: state.user.firstName } : null,
        telegram: state.telegram ? 'EXISTS' : null,
        isLoading: state.isLoading,
        isAuthenticated: state.isAuthenticated,
        _initDone: state._initDone,
        error: state.error,
      }, null, 2));
    });
  }, []);

  const testAuth = async () => {
    setAuthResult('Testing...');
    try {
      const tg = window.Telegram?.WebApp;
      if (!tg?.initData) {
        setAuthResult('ERROR: No initData available');
        return;
      }
      setAuthResult(`Sending POST /api/auth/telegram (initData length: ${tg.initData.length})...`);

      const res = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: tg.initData }),
      });

      const text = await res.text();
      setAuthResult(`Status: ${res.status}\nResponse: ${text}`);
    } catch (err: any) {
      setAuthResult(`FETCH ERROR: ${err.message}`);
    }
  };

  const testStore = async () => {
    setStoreState('Calling initTelegram...');
    try {
      const { useAppStore } = await import('@/store');
      // Reset _initDone to force re-init
      useAppStore.setState({ _initDone: false, isLoading: true });
      useAppStore.getState().initTelegram();

      // Wait and check result
      setTimeout(() => {
        const state = useAppStore.getState();
        setStoreState(JSON.stringify({
          user: state.user ? { id: state.user.id, firstName: state.user.firstName } : null,
          telegram: state.telegram ? 'EXISTS' : null,
          isLoading: state.isLoading,
          isAuthenticated: state.isAuthenticated,
          _initDone: state._initDone,
          error: state.error,
        }, null, 2));
      }, 5000);
    } catch (err: any) {
      setStoreState(`ERROR: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: 'monospace', fontSize: 13 }}>
      <h1 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Telegram WebApp Debug</h1>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
        <tbody>
          {Object.entries(info).map(([key, value]) => (
            <tr key={key} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '6px 8px', fontWeight: 'bold', color: '#1e3a5f' }}>{key}</td>
              <td style={{ padding: '6px 8px', wordBreak: 'break-all' }}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginBottom: 20, padding: 12, background: '#f0f0f0', borderRadius: 8 }}>
        <h2 style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 8 }}>Store State</h2>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: 12 }}>{storeState}</pre>
        <button onClick={testStore} style={{ marginTop: 8, padding: '8px 16px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>
          Force Re-Init Store
        </button>
      </div>

      <div style={{ padding: 12, background: '#f0f0f0', borderRadius: 8 }}>
        <h2 style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 8 }}>Direct Auth Test</h2>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: 12 }}>{authResult}</pre>
        <button onClick={testAuth} style={{ marginTop: 8, padding: '8px 16px', background: '#b8a06a', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>
          Test POST /api/auth/telegram
        </button>
      </div>
    </div>
  );
}
