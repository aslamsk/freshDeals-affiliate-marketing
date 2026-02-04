/**
 * PROFESSIONAL DEAL MANAGEMENT SERVICE
 * Real CRUD operations with proper validation, audit trails, and business logic
 */

import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  increment,
  writeBatch
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { db } from './firebaseConfig';

// Import admin auth service for activity logging
import { logAdminActivity } from './adminAuthService';

/**
 * VALIDATION LAYER - Ensure data quality
 */
const validateDealData = (dealData) => {
  const errors = [];

  if (!dealData.title || dealData.title.trim().length < 3) {
    errors.push('Title must be at least 3 characters');
  }

  if (!dealData.category) {
    errors.push('Category is required');
  }

  if (!dealData.dealPrice || dealData.dealPrice < 0) {
    errors.push('Deal price must be valid');
  }

  if (!dealData.originalPrice || dealData.originalPrice < dealData.dealPrice) {
    errors.push('Original price must be greater than deal price');
  }

  if (!dealData.platform) {
    errors.push('Platform is required');
  }

  if (!dealData.affiliateUrl || !isValidUrl(dealData.affiliateUrl)) {
    errors.push('Valid affiliate URL is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const calculateDiscount = (dealPrice, originalPrice) => {
  return Math.round(((originalPrice - dealPrice) / originalPrice) * 100);
};

/**
 * CREATE DEAL - Professional implementation
 */
export const createDeal = async (dealData, adminId) => {
  try {
    // Validate data
    const validation = validateDealData(dealData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const dealId = uuidv4();
    const discount = calculateDiscount(dealData.dealPrice, dealData.originalPrice);

    const deal = {
      id: dealId,
      
      // Basic Info
      title: dealData.title.trim(),
      description: dealData.description || '',
      image: dealData.image || null,
      
      // Pricing
      dealPrice: parseFloat(dealData.dealPrice),
      originalPrice: parseFloat(dealData.originalPrice),
      discount,
      
      // Classification
      category: dealData.category,
      platform: dealData.platform,
      tags: dealData.tags || [],
      
      // Affiliate
      affiliateUrl: dealData.affiliateUrl,
      affiliateNetwork: dealData.affiliateNetwork || 'unknown',
      affiliateCommissionRate: dealData.affiliateCommissionRate || 0,
      
      // Status & Visibility
      isActive: dealData.isActive !== false,
      isVisibleOnHomepage: dealData.isVisibleOnHomepage !== false,
      expiresAt: dealData.expiresAt || null,
      
      // Metrics
      clicks: 0,
      conversions: 0,
      earnings: 0,
      
      // SEO & Analytics
      slug: generateSlug(dealData.title),
      source: dealData.source || 'manual',
      
      // Admin Info
      createdBy: adminId,
      createdAt: serverTimestamp(),
      updatedBy: adminId,
      updatedAt: serverTimestamp(),
      
      // Audit
      viewCount: 0,
      lastViewedAt: null,
      status: 'ACTIVE' // ACTIVE, ARCHIVED, EXPIRED - uppercase to match real data
    };

    // Save to Firestore
    await setDoc(doc(db, 'deals', dealId), deal);

    // Log activity
    await logAdminActivity(adminId, 'CREATE_DEAL', {
      dealId,
      title: dealData.title,
      platform: dealData.platform,
      dealPrice: dealData.dealPrice
    });

    console.log('✅ Deal created:', dealId);
    return deal;
  } catch (error) {
    console.error('❌ Error creating deal:', error);
    throw error;
  }
};

/**
 * UPDATE DEAL - Professional implementation
 */
export const updateDeal = async (dealId, updateData, adminId) => {
  try {
    // Get current deal
    const dealRef = doc(db, 'deals', dealId);
    const dealSnap = await getDocs(query(collection(db, 'deals'), where('id', '==', dealId)));
    
    if (dealSnap.empty) {
      throw new Error('Deal not found');
    }

    const currentDeal = dealSnap.docs[0].data();

    // Validate if pricing is updated
    if (updateData.dealPrice && updateData.originalPrice) {
      const testData = {
        ...currentDeal,
        ...updateData
      };
      const validation = validateDealData(testData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
    }

    // Prepare update
    const updates = {
      ...updateData,
      updatedBy: adminId,
      updatedAt: serverTimestamp()
    };

    // Recalculate discount if pricing changed
    if (updateData.dealPrice || updateData.originalPrice) {
      updates.discount = calculateDiscount(
        updateData.dealPrice || currentDeal.dealPrice,
        updateData.originalPrice || currentDeal.originalPrice
      );
    }

    // Update title slug if title changed
    if (updateData.title) {
      updates.slug = generateSlug(updateData.title);
    }

    // Update deal
    await updateDoc(dealRef, updates);

    // Log activity
    await logAdminActivity(adminId, 'UPDATE_DEAL', {
      dealId,
      changedFields: Object.keys(updateData)
    });

    console.log('✅ Deal updated:', dealId);
    return { ...currentDeal, ...updates };
  } catch (error) {
    console.error('❌ Error updating deal:', error);
    throw error;
  }
};

/**
 * DELETE DEAL - Soft delete for audit trail
 */
export const deleteDeal = async (dealId, adminId, reason = '') => {
  try {
    const dealRef = doc(db, 'deals', dealId);
    
    // Soft delete
    await updateDoc(dealRef, {
      status: 'deleted',
      isActive: false,
      deletedBy: adminId,
      deletedAt: serverTimestamp(),
      deletionReason: reason
    });

    // Log activity
    await logAdminActivity(adminId, 'DELETE_DEAL', {
      dealId,
      reason
    });

    console.log('✅ Deal deleted:', dealId);
    return true;
  } catch (error) {
    console.error('❌ Error deleting deal:', error);
    throw error;
  }
};

/**
 * GET DEALS - Professional pagination and filtering
 */
export const getDealsWithFilters = async (filters = {}) => {
  try {
    console.log('🔍 Fetching deals with filters:', filters);
    let q = collection(db, 'deals');
    const constraints = [];

    // Filter by status - use 'ACTIVE' uppercase to match real data
    if (filters.status && filters.status !== 'all') {
      constraints.push(where('status', '==', filters.status));
      console.log('📌 Filtering by status:', filters.status);
    } else if (!filters.status || filters.status === 'all') {
      // If 'all' or no status, get ACTIVE deals by default
      constraints.push(where('status', '==', 'ACTIVE'));
      console.log('📌 Default filter: ACTIVE status');
    }

    // Filter by category
    if (filters.category) {
      constraints.push(where('category', '==', filters.category));
      console.log('📌 Filtering by category:', filters.category);
    }

    // Filter by platform
    if (filters.platform) {
      constraints.push(where('platform', '==', filters.platform));
    }

    // Filter by visibility
    if (filters.isVisible !== undefined) {
      constraints.push(where('isVisible', '==', filters.isVisible));
    }

    // Order by
    const orderByField = filters.orderBy || 'createdAt';
    const orderDirection = filters.orderDirection || 'desc';

    // Build query
    const builtQuery = query(
      q,
      ...constraints,
      orderBy(orderByField, orderDirection),
      limit(filters.limit || 100)
    );

    console.log('🔥 Executing Firestore query...');
    const snapshot = await getDocs(builtQuery);
    console.log('✅ Found', snapshot.docs.length, 'deals from Firestore');
    
    let deals = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Client-side search filter for title and description
    if (filters.search && filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      const beforeSearch = deals.length;
      deals = deals.filter(deal =>
        (deal.title && deal.title.toLowerCase().includes(searchLower)) ||
        (deal.description && deal.description.toLowerCase().includes(searchLower))
      );
      console.log(`🔍 Search filtered: ${beforeSearch} → ${deals.length} deals`);
    }

    console.log('📦 Returning', deals.length, 'deals');
    return deals;
  } catch (error) {
    console.error('❌ Error fetching deals:', error);
    return [];
  }
};

/**
 * TRACK CLICK - Real user interaction tracking
 */
export const trackDealClick = async (dealId, metadata = {}) => {
  try {
    const dealRef = doc(db, 'deals', dealId);
    
    await updateDoc(dealRef, {
      clicks: increment(1),
      lastViewedAt: serverTimestamp()
    });

    // Log to clicks collection for detailed analytics
    await setDoc(
      doc(db, 'deal_clicks', `${dealId}_${Date.now()}`),
      {
        dealId,
        timestamp: serverTimestamp(),
        userAgent: metadata.userAgent || 'unknown',
        source: metadata.source || 'direct',
        referrer: metadata.referrer || null
      }
    );

    console.log('✅ Click tracked:', dealId);
    return true;
  } catch (error) {
    console.error('❌ Error tracking click:', error);
    return false;
  }
};

/**
 * SYNC CONVERSIONS FROM AFFILIATE NETWORK
 * This will be called by backend function or manually
 */
export const syncConversionsFromAffiliate = async (dealId, conversionData) => {
  try {
    const dealRef = doc(db, 'deals', dealId);
    
    await updateDoc(dealRef, {
      conversions: increment(conversionData.count),
      earnings: increment(conversionData.earnings),
      lastSyncedAt: serverTimestamp()
    });

    // Log sync event
    await setDoc(
      doc(db, 'conversion_syncs', `${dealId}_${Date.now()}`),
      {
        dealId,
        conversions: conversionData.count,
        earnings: conversionData.earnings,
        source: conversionData.source || 'affiliate_api',
        timestamp: serverTimestamp()
      }
    );

    console.log('✅ Conversions synced:', dealId);
    return true;
  } catch (error) {
    console.error('❌ Error syncing conversions:', error);
    throw error;
  }
};

/**
 * BULK OPERATIONS - Efficient batch updates
 */
export const deactivateExpiredDeals = async () => {
  try {
    const now = new Date();
    const expiredQuery = query(
      collection(db, 'deals'),
      where('expiresAt', '<', now),
      where('status', '==', 'active')
    );

    const snapshot = await getDocs(expiredQuery);
    const batch = writeBatch(db);
    let count = 0;

    snapshot.forEach(doc => {
      batch.update(doc.ref, {
        status: 'expired',
        isActive: false,
        updatedAt: serverTimestamp()
      });
      count++;
    });

    await batch.commit();
    console.log(`✅ ${count} deals marked as expired`);
    return count;
  } catch (error) {
    console.error('❌ Error deactivating deals:', error);
    throw error;
  }
};

/**
 * ANALYTICS - Deal performance metrics
 */
export const getDealAnalytics = async (dealId) => {
  try {
    const dealRef = doc(db, 'deals', dealId);
    const dealSnap = await getDocs(query(collection(db, 'deals'), where('id', '==', dealId)));
    
    if (dealSnap.empty) {
      throw new Error('Deal not found');
    }

    const deal = dealSnap.docs[0].data();
    const conversionRate = deal.clicks > 0 ? (deal.conversions / deal.clicks * 100).toFixed(2) : 0;

    return {
      dealId,
      title: deal.title,
      platform: deal.platform,
      dealPrice: deal.dealPrice,
      discount: deal.discount,
      metrics: {
        clicks: deal.clicks,
        conversions: deal.conversions,
        earnings: deal.earnings,
        conversionRate: parseFloat(conversionRate),
        averageEarningsPerClick: deal.clicks > 0 ? (deal.earnings / deal.clicks).toFixed(2) : 0
      }
    };
  } catch (error) {
    console.error('❌ Error fetching deal analytics:', error);
    throw error;
  }
};

/**
 * UTILITY FUNCTIONS
 */
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

export default {
  createDeal,
  updateDeal,
  deleteDeal,
  getDealsWithFilters,
  trackDealClick,
  syncConversionsFromAffiliate,
  deactivateExpiredDeals,
  getDealAnalytics
};
