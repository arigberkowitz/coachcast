// Local notifications for the installable PWA. This fires a notification while a
// tab / installed app is open (e.g. a new recap arrives in another window). True
// background push (app closed, cross-device) needs a push server + VAPID keys and
// is Phase-2 work — email is the reliable channel until then.

export function notifySupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function notifyPermission() {
  return notifySupported() ? Notification.permission : 'unsupported';
}

export async function ensureNotifyPermission() {
  if (!notifySupported()) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
}

export async function showLocalNotification(title, body) {
  if (!notifySupported() || Notification.permission !== 'granted') return false;
  const opts = { body, icon: '/icon-192.png', badge: '/icon-192.png' };
  try {
    const reg = await navigator.serviceWorker?.getRegistration?.();
    if (reg?.showNotification) {
      await reg.showNotification(title, opts);
      return true;
    }
    new Notification(title, opts);
    return true;
  } catch {
    return false;
  }
}
