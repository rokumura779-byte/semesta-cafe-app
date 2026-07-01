import { useState, useEffect } from 'react';
import { subscribePushNotification, unsubscribePushNotification, isSubscribed } from '../utils/pushNotification';
import './NotificationBell.css';

const NotificationBell = ({ role = 'user' }) => {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    isSubscribed().then(setSubscribed);
  }, []);

  const handleToggle = async () => {
    setLoading(true);
    if (subscribed) {
      await unsubscribePushNotification(role);
      setSubscribed(false);
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2500);
    } else {
      const result = await subscribePushNotification(role);
      setSubscribed(result);
      if (result) {
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 2500);
      }
    }
    setLoading(false);
  };

  if (!('Notification' in window) || !('PushManager' in window)) return null;

  return (
    <div className="notif-bell-wrapper">
      <button
        className={`notif-bell-btn ${subscribed ? 'notif-active' : ''}`}
        onClick={handleToggle}
        disabled={loading}
        title={subscribed ? 'Matikan notifikasi' : 'Aktifkan notifikasi'}
        aria-label="Toggle notifikasi"
      >
        {loading ? (
          <span className="notif-spinner" />
        ) : subscribed ? (
          <span>🔔</span>
        ) : (
          <span>🔕</span>
        )}
      </button>
      {showTooltip && (
        <div className="notif-tooltip">
          {subscribed ? 'Notifikasi aktif!' : 'Notifikasi dimatikan'}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;