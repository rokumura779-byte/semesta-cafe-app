import { useState, useEffect } from 'react';

const OfflineBanner = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="pwa-offline-banner">
      <span className="pwa-offline-dot"></span>
      Anda sedang offline — menampilkan data dari cache
    </div>
  );
};

export default OfflineBanner;