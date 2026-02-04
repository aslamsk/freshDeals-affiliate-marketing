/**
 * Request notification permission and subscribe
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

/**
 * Send notification
 */
export const sendNotification = (title, options = {}) => {
  if (Notification.permission === 'granted') {
    new Notification(title, options);
  }
};

/**
 * Request service worker permission and setup FCM
 */
export const setupFCM = async () => {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered');
      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }
  return false;
};

export default {
  requestNotificationPermission,
  sendNotification,
  setupFCM,
};
