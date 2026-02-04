import { getFirestore, collection, doc, setDoc, updateDoc, deleteDoc, getDocs, addDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';
import { db, app } from './firebaseConfig';

// Get auth from shared app instance
const auth = getAuth(app);

/**
 * Product Operations
 */
export const createProduct = async (productData) => {
  try {
    const productId = uuidv4();
    const product = {
      id: productId,
      ...productData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(doc(db, 'products', productId), product);
    console.log('✅ Product created:', productId);
    return product;
  } catch (error) {
    console.error('❌ Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (productId, productData) => {
  try {
    await updateDoc(doc(db, 'products', productId), {
      ...productData,
      updatedAt: serverTimestamp(),
    });
    console.log('✅ Product updated:', productId);
  } catch (error) {
    console.error('❌ Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (productId) => {
  try {
    await deleteDoc(doc(db, 'products', productId));
    console.log('✅ Product deleted:', productId);
  } catch (error) {
    console.error('❌ Error deleting product:', error);
    throw error;
  }
};

/**
 * Deal Operations
 */
export const createDeal = async (dealData) => {
  try {
    const dealId = uuidv4();
    const deal = {
      id: dealId,
      ...dealData,
      title: dealData.title || dealData.title_en || dealData.title_te || 'Deal',
      description: dealData.description || dealData.title_en || dealData.title || '',
      isVisible: dealData.isVisible !== undefined ? dealData.isVisible : true,
      clicks: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(doc(db, 'deals', dealId), deal);
    console.log('✅ Deal created:', dealId);
    return deal;
  } catch (error) {
    console.error('❌ Error creating deal:', error);
    throw error;
  }
};

export const updateDeal = async (dealId, dealData) => {
  try {
    await updateDoc(doc(db, 'deals', dealId), {
      ...dealData,
      updatedAt: serverTimestamp(),
    });
    console.log('✅ Deal updated:', dealId);
  } catch (error) {
    console.error('❌ Error updating deal:', error);
    throw error;
  }
};

export const deleteDeal = async (dealId) => {
  try {
    await deleteDoc(doc(db, 'deals', dealId));
    console.log('✅ Deal deleted:', dealId);
  } catch (error) {
    console.error('❌ Error deleting deal:', error);
    throw error;
  }
};

/**
 * Coupon Operations
 */
export const createCoupon = async (couponData) => {
  try {
    const couponId = uuidv4();
    const coupon = {
      id: couponId,
      ...couponData,
      currentUses: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(doc(db, 'coupons', couponId), coupon);
    console.log('✅ Coupon created:', couponId);
    return coupon;
  } catch (error) {
    console.error('❌ Error creating coupon:', error);
    throw error;
  }
};

export const updateCoupon = async (couponId, couponData) => {
  try {
    await updateDoc(doc(db, 'coupons', couponId), {
      ...couponData,
      updatedAt: serverTimestamp(),
    });
    console.log('✅ Coupon updated:', couponId);
  } catch (error) {
    console.error('❌ Error updating coupon:', error);
    throw error;
  }
};

export const deleteCoupon = async (couponId) => {
  try {
    await deleteDoc(doc(db, 'coupons', couponId));
    console.log('✅ Coupon deleted:', couponId);
  } catch (error) {
    console.error('❌ Error deleting coupon:', error);
    throw error;
  }
};

/**
 * Platform Link Operations
 */
export const createPlatformLink = async (platformLinkData) => {
  try {
    const linkId = uuidv4();
    const link = {
      id: linkId,
      ...platformLinkData,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(doc(db, 'platformLinks', linkId), link);
    console.log('✅ Platform link created:', linkId);
    return link;
  } catch (error) {
    console.error('❌ Error creating platform link:', error);
    throw error;
  }
};

export const updatePlatformLink = async (linkId, platformLinkData) => {
  try {
    await updateDoc(doc(db, 'platformLinks', linkId), {
      ...platformLinkData,
      updatedAt: serverTimestamp(),
    });
    console.log('✅ Platform link updated:', linkId);
  } catch (error) {
    console.error('❌ Error updating platform link:', error);
    throw error;
  }
};

export const deletePlatformLink = async (linkId) => {
  try {
    await deleteDoc(doc(db, 'platformLinks', linkId));
    console.log('✅ Platform link deleted:', linkId);
  } catch (error) {
    console.error('❌ Error deleting platform link:', error);
    throw error;
  }
};

export const getPlatformLinksForProduct = async (productId) => {
  try {
    const q = collection(db, 'platformLinks');
    const snap = await getDocs(q);
    const links = [];
    snap.forEach((doc) => {
      const data = doc.data();
      if (data.productId === productId) {
        links.push({ id: doc.id, ...data });
      }
    });
    return links;
  } catch (error) {
    console.error('❌ Error fetching platform links:', error);
    return [];
  }
};

/**
 * Platform Price Operations
 */
export const updatePlatformPrice = async (productId, platform, priceData) => {
  try {
    const priceId = `${platform}-${Date.now()}`;
    const price = {
      platform,
      ...priceData,
      lastUpdated: serverTimestamp(),
    };
    
    await setDoc(doc(db, 'products', productId, 'platformPrices', priceId), price);
    console.log('✅ Platform price updated:', platform);
    return price;
  } catch (error) {
    console.error('❌ Error updating platform price:', error);
    throw error;
  }
};

/**
 * Affiliate Settings Operations
 */
export const updateAffiliateSettings = async (settings) => {
  try {
    await updateDoc(doc(db, 'settings', 'affiliate'), {
      ...settings,
      updatedAt: serverTimestamp(),
    });
    console.log('✅ Affiliate settings updated');
  } catch (error) {
    console.error('❌ Error updating affiliate settings:', error);
    throw error;
  }
};

export const getAffiliateSettings = async () => {
  try {
    const docSnap = await getDocs(collection(db, 'settings'));
    const settings = {};
    docSnap.forEach((doc) => {
      settings[doc.id] = doc.data();
    });
    return settings;
  } catch (error) {
    console.error('❌ Error fetching affiliate settings:', error);
    throw error;
  }
};

/**
 * Analytics - Track Deal Click
 */
export const trackDealClick = async (dealId) => {
  try {
    const dealRef = doc(db, 'deals', dealId);
    await updateDoc(dealRef, {
      clicks: await getDealClicks(dealId) + 1,
      lastClicked: serverTimestamp(),
    });
    console.log('📊 Click tracked for deal:', dealId);
  } catch (error) {
    console.error('❌ Error tracking click:', error);
    throw error;
  }
};

const getDealClicks = async (dealId) => {
  try {
    const deal = await getDocs(collection(db, 'deals'));
    let clicks = 0;
    deal.forEach((doc) => {
      if (doc.id === dealId) {
        clicks = doc.data().clicks || 0;
      }
    });
    return clicks;
  } catch (error) {
    return 0;
  }
};

/**
 * Batch Fetch Operations
 */
export const getAllProducts = async () => {
  try {
    console.log('📦 getAllProducts: Fetching products from Firestore...');
    const snap = await getDocs(collection(db, 'products'));
    const products = [];
    snap.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    console.log(`✅ getAllProducts: Found ${products.length} products`);
    return products;
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    return [];
  }
};

export const getAllDeals = async () => {
  try {
    const snap = await getDocs(collection(db, 'deals'));
    const deals = [];
    snap.forEach((doc) => {
      deals.push({ id: doc.id, ...doc.data() });
    });
    return deals;
  } catch (error) {
    console.error('❌ Error fetching deals:', error);
    return [];
  }
};

export const getAllCoupons = async () => {
  try {
    const snap = await getDocs(collection(db, 'coupons'));
    const coupons = [];
    snap.forEach((doc) => {
      coupons.push({ id: doc.id, ...doc.data() });
    });
    return coupons;
  } catch (error) {
    console.error('❌ Error fetching coupons:', error);
    return [];
  }
};

/**
 * Push Notification Operations
 */
export const sendPushNotification = async (notificationData) => {
  try {
    const notification = {
      id: uuidv4(),
      ...notificationData,
      status: 'sent',
      createdAt: serverTimestamp(),
    };
    
    await setDoc(doc(db, 'push_notifications', notification.id), notification);
    
    // Log to push_logs
    await setDoc(doc(db, 'push_logs', notification.id), {
      ...notification,
      deliveryStatus: 'sent',
    });
    
    console.log('✅ Push notification sent:', notification.id);
    return notification;
  } catch (error) {
    console.error('❌ Error sending push notification:', error);
    throw error;
  }
};

export const getPushLogs = async () => {
  try {
    const snap = await getDocs(collection(db, 'push_logs'));
    const logs = [];
    snap.forEach((doc) => {
      logs.push({ id: doc.id, ...doc.data() });
    });
    return logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error('❌ Error fetching push logs:', error);
    return [];
  }
};

/**
 * Analytics Events
 */
export const getAnalyticsEvents = async (limit = 50) => {
  try {
    const snap = await getDocs(collection(db, 'analytics_events'));
    const events = [];
    snap.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() });
    });
    return events
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  } catch (error) {
    console.error('❌ Error fetching analytics events:', error);
    return [];
  }
};

/**
 * Dashboard Stats
 */
export const getDashboardStats = async () => {
  try {
    const [products, deals, coupons] = await Promise.all([
      getAllProducts(),
      getAllDeals(),
      getAllCoupons(),
    ]);

    return {
      totalProducts: products.length,
      activeProducts: products.filter(p => p.isActive).length,
      totalDeals: deals.length,
      activeDeals: deals.filter(d => d.status === 'ACTIVE').length,
      totalCoupons: coupons.length,
      activeCoupons: coupons.filter(c => c.isActive).length,
      platformCount: new Set(products.flatMap(p => p.platforms || [])).size,
    };
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    return {
      totalProducts: 0,
      activeProducts: 0,
      totalDeals: 0,
      activeDeals: 0,
      totalCoupons: 0,
      activeCoupons: 0,
      platformCount: 0,
    };
  }
};

export default {
  // Products
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  
  // Deals
  createDeal,
  updateDeal,
  deleteDeal,
  getAllDeals,
  
  // Coupons
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getAllCoupons,
  
  // Platform Links
  createPlatformLink,
  addPlatformLink: createPlatformLink,  // Alias for component compatibility
  updatePlatformLink,
  deletePlatformLink,
  getPlatformLinksForProduct,
  
  // Prices
  updatePlatformPrice,
  
  // Settings
  updateAffiliateSettings,
  getAffiliateSettings,
  
  // Analytics
  trackDealClick,
  getAnalyticsEvents,
  getDashboardStats,
  
  // Push Notifications
  sendPushNotification,
  getPushLogs,
};
