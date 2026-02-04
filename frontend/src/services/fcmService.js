import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from './firebaseConfig';

let messaging = null;

try {
  messaging = getMessaging(app);
  console.log('✅ FCM initialized successfully');
} catch (error) {
  console.warn('⚠️ FCM initialization failed:', error.message);
}

/**
 * Request permission and get FCM token
 */
export const requestNotificationPermission = async () => {
  try {
    if (!messaging) {
      console.warn('FCM not available');
      return null;
    }

    // Check if service worker is supported
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Workers not supported');
      return null;
    }

    // Request notification permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      
      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || '',
      });

      if (token) {
        console.log('📱 FCM Token:', token);
        
        // Store token for user
        localStorage.setItem('fcmToken', token);
        return token;
      }
    } else {
      console.log('❌ Notification permission denied');
    }

    return null;
  } catch (error) {
    console.error('❌ Error requesting notification permission:', error);
    return null;
  }
};

/**
 * Listen for incoming messages
 */
export const listenToNotifications = (callback) => {
  try {
    if (!messaging) {
      console.warn('FCM not available');
      return () => {};
    }

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('📬 Message received:', payload);
      
      // Foreground notification
      if ('notification' in payload) {
        const { title, body, icon, image } = payload.notification;
        
        // Show notification in foreground
        if (Notification.permission === 'granted') {
          new Notification(title || 'FreshDeals', {
            body: body || '',
            icon: icon || '/logo.png',
            image: image || '',
            badge: '/logo-small.png',
            tag: 'freshdeals-notification',
          });
        }
      }

      // Callback with full payload
      callback(payload);
    });

    return unsubscribe;
  } catch (error) {
    console.error('❌ Error setting up notification listener:', error);
    return () => {};
  }
};

/**
 * Get stored FCM token
 */
export const getFCMToken = () => {
  return localStorage.getItem('fcmToken');
};

/**
 * Clear FCM token (on logout)
 */
export const clearFCMToken = () => {
  localStorage.removeItem('fcmToken');
  console.log('🗑️ FCM token cleared');
};

export default {
  requestNotificationPermission,
  listenToNotifications,
  getFCMToken,
  clearFCMToken,
};
