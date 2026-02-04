import { initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

let messaging = null;

/**
 * Initialize Firebase Admin Messaging
 * This is called from backend service account credentials
 */
export const initializeAdminMessaging = (serviceAccountKey) => {
  try {
    if (!messaging) {
      const app = initializeApp({
        credential: cert(serviceAccountKey),
        projectId: serviceAccountKey.project_id,
      });
      
      messaging = getMessaging(app);
      console.log('[Messaging] Firebase Admin Messaging initialized');
    }
    
    return messaging;
  } catch (error) {
    console.error('[Messaging] Error initializing Firebase Admin Messaging:', error);
    return null;
  }
};

/**
 * Send notification to single user
 */
export const sendNotificationToUser = async (fcmToken, title, body, data = {}) => {
  try {
    if (!messaging) {
      console.error('[Messaging] Messaging not initialized');
      return null;
    }

    const message = {
      token: fcmToken,
      notification: {
        title,
        body,
      },
      data,
      webpush: {
        fcmOptions: {
          link: data.link || '/',
        },
      },
    };

    const response = await messaging.send(message);
    console.log('[Messaging] Successfully sent message:', response);
    return response;
  } catch (error) {
    console.error('[Messaging] Error sending notification:', error);
    return null;
  }
};

/**
 * Send notification to multiple users
 */
export const sendNotificationToUsers = async (fcmTokens, title, body, data = {}) => {
  try {
    if (!messaging) {
      console.error('[Messaging] Messaging not initialized');
      return null;
    }

    const message = {
      notification: {
        title,
        body,
      },
      data,
      webpush: {
        fcmOptions: {
          link: data.link || '/',
        },
      },
    };

    const responses = await Promise.all(
      fcmTokens.map((token) =>
        messaging.send({
          ...message,
          token,
        }).catch((err) => {
          console.error(`[Messaging] Error sending to token ${token}:`, err);
          return null;
        })
      )
    );

    console.log('[Messaging] Batch sent to', responses.filter(r => r).length, '/', fcmTokens.length);
    return responses;
  } catch (error) {
    console.error('[Messaging] Error in batch send:', error);
    return null;
  }
};

/**
 * Send notification to a topic
 * Useful for broadcasts
 */
export const sendNotificationToTopic = async (topic, title, body, data = {}) => {
  try {
    if (!messaging) {
      console.error('[Messaging] Messaging not initialized');
      return null;
    }

    const message = {
      topic,
      notification: {
        title,
        body,
      },
      data,
      webpush: {
        fcmOptions: {
          link: data.link || '/',
        },
      },
    };

    const response = await messaging.send(message);
    console.log('[Messaging] Successfully sent topic message:', response);
    return response;
  } catch (error) {
    console.error('[Messaging] Error sending topic notification:', error);
    return null;
  }
};

/**
 * Subscribe user to topic
 */
export const subscribeToTopic = async (fcmTokens, topic) => {
  try {
    if (!messaging) {
      console.error('[Messaging] Messaging not initialized');
      return null;
    }

    const response = await messaging.subscribeToTopic(fcmTokens, topic);
    console.log('[Messaging] Subscribed to topic:', topic, response);
    return response;
  } catch (error) {
    console.error('[Messaging] Error subscribing to topic:', error);
    return null;
  }
};

/**
 * Unsubscribe user from topic
 */
export const unsubscribeFromTopic = async (fcmTokens, topic) => {
  try {
    if (!messaging) {
      console.error('[Messaging] Messaging not initialized');
      return null;
    }

    const response = await messaging.unsubscribeFromTopic(fcmTokens, topic);
    console.log('[Messaging] Unsubscribed from topic:', topic);
    return response;
  } catch (error) {
    console.error('[Messaging] Error unsubscribing from topic:', error);
    return null;
  }
};

export default {
  initializeAdminMessaging,
  sendNotificationToUser,
  sendNotificationToUsers,
  sendNotificationToTopic,
  subscribeToTopic,
  unsubscribeFromTopic,
};
