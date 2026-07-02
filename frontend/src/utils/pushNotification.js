const BACKEND_URL = import.meta.env.VITE_API_URL || 'semesta-cafe-app-production-08e0.up.railway.app';

export async function subscribePushNotification(role = 'user') {
  try {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notification tidak didukung browser ini');
      return false;
    }
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return false;

    const res = await fetch(`${BACKEND_URL}/api/push/vapid-public-key`);
    const { publicKey } = await res.json();

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    });

    await fetch(`${BACKEND_URL}/api/push/subscribe/${role}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription)
    });

    return true;
  } catch (error) {
    console.error('Gagal subscribe push notification:', error);
    return false;
  }
}

export async function unsubscribePushNotification(role = 'user') {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return;
    await fetch(`${BACKEND_URL}/api/push/unsubscribe`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: subscription.endpoint, role })
    });
    await subscription.unsubscribe();
  } catch (error) {
    console.error('Gagal unsubscribe:', error);
  }
}

export async function isSubscribed() {
  try {
    if (!('serviceWorker' in navigator)) return false;
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch {
    return false;
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}