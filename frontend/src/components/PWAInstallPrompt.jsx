import { useState, useEffect } from 'react';
import './PWAInstallPrompt.css';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Cek apakah sudah diinstall (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Deteksi iOS
    const ios = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    setIsIOS(ios);

    // Tangkap event beforeinstallprompt (Android / Desktop Chrome)
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Tampilkan panduan iOS setelah 3 detik
    if (ios && !localStorage.getItem('pwa-ios-dismissed')) {
      setTimeout(() => setShowPrompt(true), 3000);
    }

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    if (isIOS) localStorage.setItem('pwa-ios-dismissed', 'true');
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <div className="pwa-install-overlay">
      <div className="pwa-install-card">
        <button className="pwa-close-btn" onClick={handleDismiss} aria-label="Tutup">✕</button>
        <div className="pwa-install-icon">
          <img src="/icons/icon-96x96.png" alt="Semesta Coffee" />
        </div>
        <div className="pwa-install-content">
          <h3>Install Semesta Coffee</h3>
          <p>Tambahkan ke layar utama untuk akses cepat menu, pesanan, dan reservasi — bahkan tanpa internet!</p>

          {isIOS ? (
            <div className="pwa-ios-guide">
              <p className="pwa-ios-steps">
                Ketuk <span className="pwa-share-icon">⎙</span> lalu pilih <strong>"Add to Home Screen"</strong>
              </p>
              <button className="pwa-btn pwa-btn-secondary" onClick={handleDismiss}>
                Mengerti
              </button>
            </div>
          ) : (
            <div className="pwa-actions">
              <button className="pwa-btn pwa-btn-secondary" onClick={handleDismiss}>
                Nanti Saja
              </button>
              <button className="pwa-btn pwa-btn-primary" onClick={handleInstall}>
                Install Sekarang
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;