import admin from 'firebase-admin';

/**
 * Initialize Firebase for push notifications
 */
export const initializeFirebaseMessaging = async () => {
  const messaging = admin.messaging();
  return messaging;
};

/**
 * Send push notification to device
 */
export const sendPushNotification = async (deviceToken, notification) => {
  const messaging = admin.messaging();

  try {
    const response = await messaging.send({
      token: deviceToken,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: {
        dealId: notification.dealId || '',
        link: notification.link || '',
      },
      webpush: {
        fcmOptions: {
          link: notification.link || '/',
        },
      },
      android: {
        priority: 'high',
      },
    });

    return response;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

/**
 * Send bulk notifications
 */
export const sendBulkNotifications = async (deviceTokens, notification) => {
  const messaging = admin.messaging();

  const messages = deviceTokens.map((token) => ({
    token,
    notification: {
      title: notification.title,
      body: notification.body,
    },
    data: {
      dealId: notification.dealId || '',
      link: notification.link || '',
    },
  }));

  try {
    const response = await messaging.sendAll(messages);
    return response;
  } catch (error) {
    console.error('Error sending bulk notifications:', error);
    throw error;
  }
};

export default {
  initializeFirebaseMessaging,
  sendPushNotification,
  sendBulkNotifications,
};
