import { useRegisterSW } from 'virtual:pwa-register/react';

export default function ReloadPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      registration && setInterval(() => registration.update(), 60 * 1000);
    },
  });

  if (!needRefresh) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 16, left: 16, right: 16,
      background: '#1B7340', color: 'white', padding: '12px 16px',
      borderRadius: 8, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: 12, zIndex: 9999,
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    }}>
      <span>Hay una nueva versión del checklist disponible.</span>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => updateServiceWorker(true)}
          style={{ background: 'white', color: '#1B7340', border: 'none', borderRadius: 4, padding: '6px 12px', fontWeight: 600, cursor: 'pointer' }}
        >
          Actualizar
        </button>
        <button
          onClick={() => setNeedRefresh(false)}
          style={{ background: 'transparent', color: 'white', border: '1px solid white', borderRadius: 4, padding: '6px 12px', cursor: 'pointer' }}
        >
          Ahora no
        </button>
      </div>
    </div>
  );
}