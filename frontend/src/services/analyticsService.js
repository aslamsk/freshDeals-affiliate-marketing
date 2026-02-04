import { db } from '../services/firebaseDealsService';
import {
  collection,
  addDoc,
  serverTimestamp,
  increment,
  doc,
  updateDoc,
  getDoc,
} from 'firebase/firestore';

/**
 * Track deal click event
 */
export const trackDealClick = async (dealId, productId, platform) => {
  try {
    if (!db) return null;

    const event = {
      type: 'deal_click',
      dealId,
      productId,
      platform,
      timestamp: serverTimestamp(),
      userAgent: navigator.userAgent,
      pageUrl: window.location.href,
    };

    const docRef = await addDoc(collection(db, 'analytics'), event);
    console.log('📊 Deal click tracked:', dealId);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error tracking deal click:', error);
    return null;
  }
};

/**
 * Track deal view event
 */
export const trackDealView = async (dealId, productId) => {
  try {
    if (!db) return null;

    const event = {
      type: 'deal_view',
      dealId,
      productId,
      timestamp: serverTimestamp(),
      userAgent: navigator.userAgent,
      pageUrl: window.location.href,
    };

    const docRef = await addDoc(collection(db, 'analytics'), event);
    console.log('👀 Deal view tracked:', dealId);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error tracking deal view:', error);
    return null;
  }
};

/**
 * Track category page view
 */
export const trackCategoryView = async (category) => {
  try {
    if (!db) return null;

    const event = {
      type: 'category_view',
      category,
      timestamp: serverTimestamp(),
      userAgent: navigator.userAgent,
      pageUrl: window.location.href,
    };

    const docRef = await addDoc(collection(db, 'analytics'), event);
    console.log('📂 Category view tracked:', category);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error tracking category view:', error);
    return null;
  }
};

/**
 * Track notification received
 */
export const trackNotificationReceived = async (notificationTitle, notificationBody) => {
  try {
    if (!db) return null;

    const event = {
      type: 'notification_received',
      title: notificationTitle,
      body: notificationBody,
      timestamp: serverTimestamp(),
      userAgent: navigator.userAgent,
    };

    const docRef = await addDoc(collection(db, 'analytics'), event);
    console.log('📬 Notification received tracked');
    return docRef.id;
  } catch (error) {
    console.error('❌ Error tracking notification:', error);
    return null;
  }
};

/**
 * Track notification click
 */
export const trackNotificationClick = async (notificationTitle, linkClicked) => {
  try {
    if (!db) return null;

    const event = {
      type: 'notification_click',
      title: notificationTitle,
      linkClicked,
      timestamp: serverTimestamp(),
      userAgent: navigator.userAgent,
    };

    const docRef = await addDoc(collection(db, 'analytics'), event);
    console.log('🔔 Notification click tracked');
    return docRef.id;
  } catch (error) {
    console.error('❌ Error tracking notification click:', error);
    return null;
  }
};

/**
 * Track search query
 */
export const trackSearch = async (query, resultsCount) => {
  try {
    if (!db) return null;

    const event = {
      type: 'search',
      query,
      resultsCount,
      timestamp: serverTimestamp(),
      userAgent: navigator.userAgent,
      pageUrl: window.location.href,
    };

    const docRef = await addDoc(collection(db, 'analytics'), event);
    console.log('🔍 Search tracked:', query);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error tracking search:', error);
    return null;
  }
};

/**
 * Track language change
 */
export const trackLanguageChange = async (fromLanguage, toLanguage) => {
  try {
    if (!db) return null;

    const event = {
      type: 'language_change',
      fromLanguage,
      toLanguage,
      timestamp: serverTimestamp(),
      userAgent: navigator.userAgent,
    };

    const docRef = await addDoc(collection(db, 'analytics'), event);
    console.log('🌐 Language change tracked:', toLanguage);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error tracking language change:', error);
    return null;
  }
};

/**
 * Track PWA install
 */
export const trackPWAInstall = async () => {
  try {
    if (!db) return null;

    const event = {
      type: 'pwa_install',
      timestamp: serverTimestamp(),
      userAgent: navigator.userAgent,
    };

    const docRef = await addDoc(collection(db, 'analytics'), event);
    console.log('📱 PWA install tracked');
    return docRef.id;
  } catch (error) {
    console.error('❌ Error tracking PWA install:', error);
    return null;
  }
};

/**
 * Update platform conversion count
 */
export const trackPlatformConversion = async (platform) => {
  try {
    if (!db) return null;

    const settingsRef = doc(db, 'settings', 'platform-conversions');
    const settingsDoc = await getDoc(settingsRef);

    if (settingsDoc.exists()) {
      // Update existing
      await updateDoc(settingsRef, {
        [platform]: increment(1),
        lastUpdated: serverTimestamp(),
      });
    } else {
      // Create new
      await updateDoc(settingsRef, {
        [platform]: 1,
        lastUpdated: serverTimestamp(),
      });
    }

    console.log('✅ Platform conversion tracked:', platform);
    return true;
  } catch (error) {
    console.error('❌ Error tracking platform conversion:', error);
    return null;
  }
};

/**
 * Track ad impression (for AdSense tracking)
 */
export const trackAdImpression = async (adUnit, adType) => {
  try {
    if (!db) return null;

    const event = {
      type: 'ad_impression',
      adUnit,
      adType, // 'banner', 'interstitial', 'native'
      timestamp: serverTimestamp(),
      userAgent: navigator.userAgent,
      pageUrl: window.location.href,
    };

    const docRef = await addDoc(collection(db, 'analytics'), event);
    console.log('📢 Ad impression tracked:', adUnit);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error tracking ad impression:', error);
    return null;
  }
};

/**
 * Track ad click (for AdSense revenue tracking)
 */
export const trackAdClick = async (adUnit, adType) => {
  try {
    if (!db) return null;

    const event = {
      type: 'ad_click',
      adUnit,
      adType,
      timestamp: serverTimestamp(),
      userAgent: navigator.userAgent,
      pageUrl: window.location.href,
    };

    const docRef = await addDoc(collection(db, 'analytics'), event);
    console.log('📢 Ad click tracked:', adUnit);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error tracking ad click:', error);
    return null;
  }
};

export default {
  trackDealClick,
  trackDealView,
  trackCategoryView,
  trackNotificationReceived,
  trackNotificationClick,
  trackSearch,
  trackLanguageChange,
  trackPWAInstall,
  trackPlatformConversion,
  trackAdImpression,
  trackAdClick,
};
