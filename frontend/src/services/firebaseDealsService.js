import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebaseConfig';

/**
 * Get today's deals (active deals)
 */
export const getTodayDeals = async (limit = 20) => {
  console.log('🔥 getTodayDeals called with limit:', limit);
  console.log('🔥 Firebase DB instance:', db ? 'Connected' : 'NOT connected');
  try {
    if (!db) {
      console.warn('❌ Firebase not available - returning empty array');
      return [];
    }

    const dealsCollection = collection(db, 'deals');
    const q = query(
      dealsCollection,
      where('status', '==', 'ACTIVE')
    );

    console.log('🔥 Executing Firestore query...');
    const querySnapshot = await getDocs(q);
    const deals = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.isVisible === false) return;
      deals.push({
        id: doc.id,
        ...data,
      });
    });

    console.log('📦 Fetched', deals.length, 'deals from Firebase (limit:', limit, ')');
    console.log('✅ getTodayDeals returning:', deals.length > 0 ? deals.length + ' deals' : 'EMPTY ARRAY');
    return deals.slice(0, limit);
  } catch (error) {
    console.error('❌ Error fetching today deals:', error);
    return [];
  }
};

/**
 * Get products for public listing (fallback when no deals)
 */
export const getAllProductsPublic = async (limit = 50) => {
  try {
    if (!db) {
      console.warn('Firebase not available');
      return [];
    }

    const productsCollection = collection(db, 'products');
    const snap = await getDocs(productsCollection);
    const products = [];

    snap.forEach((doc) => {
      const data = doc.data();
      if (data.isActive === false) return;
      products.push({ id: doc.id, ...data });
    });

    return products.slice(0, limit);
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    return [];
  }
};

/**
 * Get deals by category
 */
export const getDealsByCategory = async (category, limit = 20) => {
  try {
    if (!db) {
      console.warn('Firebase not available');
      return [];
    }

    const productsCollection = collection(db, 'products');
    const q = query(productsCollection, where('category', '==', category));

    const productSnapshot = await getDocs(q);
    const productIds = [];
    
    productSnapshot.forEach((doc) => {
      productIds.push(doc.id);
    });

    if (productIds.length === 0) {
      return [];
    }

    const dealsCollection = collection(db, 'deals');
    const dealsQuery = query(
      dealsCollection,
      where('productId', 'in', productIds),
      where('status', '==', 'ACTIVE')
    );

    const dealsSnapshot = await getDocs(dealsQuery);
    const deals = [];
    
    dealsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.isVisible === false) return;
      deals.push({
        id: doc.id,
        ...data,
      });
    });

    return deals.slice(0, limit);
  } catch (error) {
    console.error('❌ Error fetching category deals:', error);
    return [];
  }
};

/**
 * Get product with price comparison
 */
export const getProductComparison = async (productId) => {
  try {
    if (!db) {
      console.warn('Firebase not available');
      return null;
    }

    // Get product
    const productDoc = await getDoc(doc(db, 'products', productId));
    if (!productDoc.exists()) {
      return null;
    }

    const product = {
      id: productDoc.id,
      ...productDoc.data(),
    };

    // Get prices from subcollection
    const pricesCollection = collection(db, 'products', productId, 'platformPrices');
    const pricesSnapshot = await getDocs(pricesCollection);
    const prices = [];
    
    pricesSnapshot.forEach((doc) => {
      prices.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Fallback: use platformLinks as prices when platformPrices is empty
    if (prices.length === 0) {
      const linksCollection = collection(db, 'platformLinks');
      const linksSnapshot = await getDocs(linksCollection);
      linksSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.productId === productId) {
          prices.push({
            id: doc.id,
            platform: data.platform,
            price: data.price || 0,
            inStock: data.isActive !== false,
            productUrl: data.productUrl || '',
            affiliateUrl: data.affiliateUrl || '',
          });
        }
      });
    }

    // Get deals
    const dealsCollection = collection(db, 'deals');
    const q = query(
      dealsCollection,
      where('productId', '==', productId),
      where('status', '==', 'ACTIVE')
    );

    const dealsSnapshot = await getDocs(q);
    const deals = [];
    
    dealsSnapshot.forEach((doc) => {
      deals.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    const numericPrices = prices.map((p) => Number(p.price)).filter((p) => !Number.isNaN(p) && p > 0);
    const lowestPrice = numericPrices.length > 0 
      ? Math.min(...numericPrices)
      : null;

    return {
      product,
      prices,
      deals,
      lowestPrice,
    };
  } catch (error) {
    console.error('❌ Error getting product comparison:', error);
    return null;
  }
};

/**
 * Get deal details
 */
export const getDealDetails = async (dealId) => {
  try {
    if (!db) {
      console.warn('Firebase not available');
      return null;
    }

    const dealDoc = await getDoc(doc(db, 'deals', dealId));
    if (!dealDoc.exists()) {
      return null;
    }

    const deal = {
      id: dealDoc.id,
      ...dealDoc.data(),
    };

    // Get product
    const productDoc = await getDoc(doc(db, 'products', deal.productId));
    const product = productDoc.exists() ? {
      id: productDoc.id,
      ...productDoc.data(),
    } : null;

    // Get prices
    const pricesCollection = collection(db, 'products', deal.productId, 'platformPrices');
    const pricesSnapshot = await getDocs(pricesCollection);
    const prices = [];
    
    pricesSnapshot.forEach((doc) => {
      prices.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return {
      deal,
      product,
      prices,
    };
  } catch (error) {
    console.error('❌ Error getting deal details:', error);
    return null;
  }
};

/**
 * Track deal click
 */
export const trackDealClick = async (dealId) => {
  try {
    if (!db) {
      console.warn('Firebase not available');
      return;
    }

    const dealRef = doc(db, 'deals', dealId);
    const dealDoc = await getDoc(dealRef);
    
    if (dealDoc.exists()) {
      const currentClicks = dealDoc.data().clicks || 0;
      await updateDoc(dealRef, {
        clicks: currentClicks + 1,
        lastClicked: serverTimestamp(),
      });
      console.log('📊 Click tracked for deal:', dealId);
    }
  } catch (error) {
    console.error('❌ Error tracking click:', error);
  }
};

/**
 * Real-time deals listener
 */
export const listenToTodayDeals = (callback) => {
  try {
    if (!db) {
      console.warn('Firebase not available');
      callback([]);
      return () => {};
    }

    const dealsCollection = collection(db, 'deals');
    const q = query(
      dealsCollection,
      where('status', '==', 'ACTIVE'),
      where('isVisible', '==', true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const deals = [];
      snapshot.forEach((doc) => {
        deals.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      callback(deals);
    });

    return unsubscribe;
  } catch (error) {
    console.error('❌ Error setting up listener:', error);
    return () => {};
  }
};

/**
 * Search deals by query
 */
export const searchDeals = async (query) => {
  try {
    if (!db) return [];

    const dealsCollection = collection(db, 'deals');
    const q = query(
      dealsCollection,
      where('status', '==', 'ACTIVE')
    );

    const querySnapshot = await getDocs(q);
    const deals = [];
    const searchLower = query.toLowerCase();

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.isVisible === false) return;

      const title = (data.title || data.title_en || data.title_te || '').toLowerCase();
      const description = (data.description || '').toLowerCase();

      if (title.includes(searchLower) || description.includes(searchLower)) {
        deals.push({
          id: doc.id,
          ...data,
        });
      }
    });

    return deals;
  } catch (error) {
    console.error('❌ Error searching deals:', error);
    return [];
  }
};

/**
 * Search products by query
 */
export const searchProducts = async (query) => {
  try {
    if (!db) return [];

    const productsCollection = collection(db, 'products');
    const snap = await getDocs(productsCollection);
    const products = [];
    const searchLower = query.toLowerCase();

    snap.forEach((doc) => {
      const data = doc.data();
      if (data.isActive === false) return;

      const title = (data.title_en || data.title_te || '').toLowerCase();
      const description = (data.description || '').toLowerCase();
      const category = (data.category || '').toLowerCase();

      if (title.includes(searchLower) || description.includes(searchLower) || category.includes(searchLower)) {
        products.push({ id: doc.id, ...data });
      }
    });

    return products;
  } catch (error) {
    console.error('❌ Error searching products:', error);
    return [];
  }
};

/**
 * Get products by category
 */
export const getProductsByCategory = async (category, limit = 50) => {
  try {
    if (!db) return [];

    const productsCollection = collection(db, 'products');
    const q = query(productsCollection, where('category', '==', category));

    const snap = await getDocs(q);
    const products = [];

    snap.forEach((doc) => {
      const data = doc.data();
      if (data.isActive === false) return;
      products.push({ id: doc.id, ...data });
    });

    return products.slice(0, limit);
  } catch (error) {
    console.error('❌ Error fetching products by category:', error);
    return [];
  }
};

export default {
  getTodayDeals,
  getDealsByCategory,
  getAllProductsPublic,
  getProductComparison,
  getDealDetails,
  trackDealClick,
  listenToTodayDeals,
  searchDeals,
  searchProducts,
  getProductsByCategory,
};

export const firebaseDealsService = {
  getTodayDeals,
  getDealsByCategory,
  getAllProductsPublic,
  getProductComparison,
  getDealDetails,
  trackDealClick,
  listenToTodayDeals,
  searchDeals,
  searchProducts,
  getProductsByCategory,
};
