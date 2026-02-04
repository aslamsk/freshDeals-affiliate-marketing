/**
 * MOCK DEAL MANAGEMENT SERVICE
 * For development/testing when Firestore is not configured
 * This provides sample deal data for testing the UI
 */

import { v4 as uuidv4 } from 'uuid';

// Mock deals data
const MOCK_DEALS = [
  {
    id: uuidv4(),
    title: '50% Off Samsung 55" 4K Smart TV',
    description: 'Huge discount on latest Samsung 4K Smart TV with HDR support',
    image: 'https://via.placeholder.com/300x200?text=Samsung+TV',
    dealPrice: 25000,
    originalPrice: 50000,
    discount: 50,
    category: 'Electronics',
    platform: 'Amazon',
    tags: ['TV', 'Electronics', 'Hot Deal'],
    affiliateUrl: 'https://amazon.in/Samsung-TV?tag=freshdeals',
    affiliateNetwork: 'Amazon Associates',
    affiliateCommissionRate: 5,
    isActive: true,
    isVisibleOnHomepage: true,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    clicks: 245,
    conversions: 18,
    earnings: 2250,
    slug: '50-off-samsung-55-4k-smart-tv',
    source: 'direct',
    createdBy: 'mock_admin_123',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedBy: 'mock_admin_123',
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    lastViewedAt: new Date().toISOString(),
    viewCount: 156
  },
  {
    id: uuidv4(),
    title: 'Sony WH-1000XM5 Wireless Headphones - 30% Off',
    description: 'Industry-leading noise cancellation wireless headphones',
    image: 'https://via.placeholder.com/300x200?text=Sony+Headphones',
    dealPrice: 24500,
    originalPrice: 35000,
    discount: 30,
    category: 'Electronics',
    platform: 'Amazon',
    tags: ['Headphones', 'Audio', 'Deal'],
    affiliateUrl: 'https://amazon.in/Sony-Headphones?tag=freshdeals',
    affiliateNetwork: 'Amazon Associates',
    affiliateCommissionRate: 5,
    isActive: true,
    isVisibleOnHomepage: true,
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    clicks: 178,
    conversions: 12,
    earnings: 1500,
    slug: 'sony-wh-1000xm5-headphones-30-off',
    source: 'direct',
    createdBy: 'mock_admin_123',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedBy: 'mock_admin_123',
    updatedAt: new Date().toISOString(),
    status: 'active',
    lastViewedAt: new Date().toISOString(),
    viewCount: 234
  },
  {
    id: uuidv4(),
    title: 'Apple MacBook Air M2 - 15% Discount',
    description: 'Latest Apple MacBook Air with M2 chip and 16GB RAM',
    image: 'https://via.placeholder.com/300x200?text=MacBook+Air',
    dealPrice: 99999,
    originalPrice: 117999,
    discount: 15,
    category: 'Electronics',
    platform: 'Flipkart',
    tags: ['Laptop', 'Apple', 'Tech'],
    affiliateUrl: 'https://flipkart.com/MacBook?affid=freshdeals',
    affiliateNetwork: 'Flipkart Affiliate',
    affiliateCommissionRate: 3,
    isActive: true,
    isVisibleOnHomepage: true,
    expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    clicks: 567,
    conversions: 28,
    earnings: 9000,
    slug: 'apple-macbook-air-m2-15-discount',
    source: 'direct',
    createdBy: 'mock_admin_123',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedBy: 'mock_admin_123',
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    lastViewedAt: new Date().toISOString(),
    viewCount: 892
  },
  {
    id: uuidv4(),
    title: 'Nike Running Shoes - Extra 20% Off',
    description: 'Comfortable and stylish Nike running shoes for everyday wear',
    image: 'https://via.placeholder.com/300x200?text=Nike+Shoes',
    dealPrice: 3199,
    originalPrice: 5999,
    discount: 47,
    category: 'Fashion',
    platform: 'Amazon',
    tags: ['Shoes', 'Fashion', 'Sports'],
    affiliateUrl: 'https://amazon.in/Nike-Shoes?tag=freshdeals',
    affiliateNetwork: 'Amazon Associates',
    affiliateCommissionRate: 5,
    isActive: true,
    isVisibleOnHomepage: true,
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    clicks: 342,
    conversions: 45,
    earnings: 850,
    slug: 'nike-running-shoes-extra-20-off',
    source: 'direct',
    createdBy: 'mock_admin_123',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedBy: 'mock_admin_123',
    updatedAt: new Date().toISOString(),
    status: 'active',
    lastViewedAt: new Date().toISOString(),
    viewCount: 456
  },
  {
    id: uuidv4(),
    title: 'LG 65" 4K OLED TV - Flat 25% Off',
    description: 'Premium LG OLED TV with stunning picture quality and gaming features',
    image: 'https://via.placeholder.com/300x200?text=LG+OLED+TV',
    dealPrice: 112500,
    originalPrice: 150000,
    discount: 25,
    category: 'Electronics',
    platform: 'Amazon',
    tags: ['TV', 'OLED', 'Premium'],
    affiliateUrl: 'https://amazon.in/LG-OLED-TV?tag=freshdeals',
    affiliateNetwork: 'Amazon Associates',
    affiliateCommissionRate: 5,
    isActive: true,
    isVisibleOnHomepage: true,
    expiresAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    clicks: 189,
    conversions: 8,
    earnings: 4500,
    slug: 'lg-65-4k-oled-tv-flat-25-off',
    source: 'direct',
    createdBy: 'mock_admin_123',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedBy: 'mock_admin_123',
    updatedAt: new Date().toISOString(),
    status: 'active',
    lastViewedAt: new Date().toISOString(),
    viewCount: 324
  }
];

/**
 * Create Deal (Mock)
 */
export const createDeal = async (dealData, adminId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newDeal = {
        id: uuidv4(),
        ...dealData,
        discount: Math.round(((dealData.originalPrice - dealData.dealPrice) / dealData.originalPrice) * 100),
        slug: generateSlug(dealData.title),
        clicks: 0,
        conversions: 0,
        earnings: 0,
        createdBy: adminId,
        createdAt: new Date().toISOString(),
        updatedBy: adminId,
        updatedAt: new Date().toISOString(),
        status: 'active',
        lastViewedAt: null,
        viewCount: 0
      };
      
      MOCK_DEALS.push(newDeal);
      console.log('✅ Mock deal created:', newDeal);
      resolve(newDeal);
    }, 500);
  });
};

/**
 * Get Deals with Filters (Mock)
 */
export const getDealsWithFilters = async (filters = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let results = [...MOCK_DEALS];

      // Apply filters
      if (filters.status) {
        results = results.filter(d => d.status === filters.status);
      }

      if (filters.category) {
        results = results.filter(d => d.category === filters.category);
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        results = results.filter(d =>
          d.title.toLowerCase().includes(searchLower) ||
          d.description.toLowerCase().includes(searchLower)
        );
      }

      // Apply ordering
      if (filters.orderBy === 'createdAt') {
        results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      // Apply pagination
      const limit = filters.limit || 10;
      const offset = filters.offset || 0;
      results = results.slice(offset, offset + limit);

      console.log('✅ Mock deals fetched:', results.length);
      resolve(results);
    }, 500);
  });
};

/**
 * Update Deal (Mock)
 */
export const updateDeal = async (dealId, updateData, adminId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const dealIndex = MOCK_DEALS.findIndex(d => d.id === dealId);
      if (dealIndex === -1) {
        reject(new Error('Deal not found'));
        return;
      }

      const updatedDeal = {
        ...MOCK_DEALS[dealIndex],
        ...updateData,
        updatedBy: adminId,
        updatedAt: new Date().toISOString()
      };

      // Recalculate discount if prices changed
      if (updateData.originalPrice || updateData.dealPrice) {
        updatedDeal.discount = Math.round(
          ((updatedDeal.originalPrice - updatedDeal.dealPrice) / updatedDeal.originalPrice) * 100
        );
      }

      MOCK_DEALS[dealIndex] = updatedDeal;
      console.log('✅ Mock deal updated:', updatedDeal);
      resolve(updatedDeal);
    }, 500);
  });
};

/**
 * Delete Deal (Mock - Soft Delete)
 */
export const deleteDeal = async (dealId, adminId, reason) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const dealIndex = MOCK_DEALS.findIndex(d => d.id === dealId);
      if (dealIndex === -1) {
        reject(new Error('Deal not found'));
        return;
      }

      MOCK_DEALS[dealIndex] = {
        ...MOCK_DEALS[dealIndex],
        status: 'deleted',
        deletedBy: adminId,
        deletedAt: new Date().toISOString(),
        deletionReason: reason
      };

      console.log('✅ Mock deal soft deleted:', dealId);
      resolve(true);
    }, 500);
  });
};

/**
 * Track Deal Click (Mock)
 */
export const trackDealClick = async (dealId, metadata) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const deal = MOCK_DEALS.find(d => d.id === dealId);
      if (deal) {
        deal.clicks++;
        deal.lastViewedAt = new Date().toISOString();
        console.log('✅ Mock click tracked:', dealId);
      }
      resolve(true);
    }, 300);
  });
};

/**
 * Sync Conversions (Mock)
 */
export const syncConversionsFromAffiliate = async (dealId, conversionData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const deal = MOCK_DEALS.find(d => d.id === dealId);
      if (deal) {
        deal.conversions += conversionData.count || 0;
        deal.earnings += conversionData.earnings || 0;
        console.log('✅ Mock conversions synced:', dealId);
      }
      resolve(true);
    }, 500);
  });
};

/**
 * Get Deal Analytics (Mock)
 */
export const getDealAnalytics = async (dealId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const deal = MOCK_DEALS.find(d => d.id === dealId);
      if (deal) {
        const conversionRate = deal.clicks > 0 ? (deal.conversions / deal.clicks) * 100 : 0;
        const earningsPerClick = deal.clicks > 0 ? deal.earnings / deal.clicks : 0;

        const analytics = {
          dealId: deal.id,
          clicks: deal.clicks,
          conversions: deal.conversions,
          conversionRate: conversionRate.toFixed(2),
          earnings: deal.earnings,
          earningsPerClick: earningsPerClick.toFixed(2),
          lastViewedAt: deal.lastViewedAt
        };

        console.log('✅ Mock analytics fetched:', analytics);
        resolve(analytics);
      } else {
        resolve(null);
      }
    }, 300);
  });
};

/**
 * Deactivate Expired Deals (Mock)
 */
export const deactivateExpiredDeals = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const now = new Date();
      let count = 0;

      MOCK_DEALS.forEach(deal => {
        if (deal.expiresAt && new Date(deal.expiresAt) < now && deal.status === 'active') {
          deal.status = 'expired';
          count++;
        }
      });

      console.log(`✅ ${count} mock deals expired`);
      resolve({ expiredCount: count });
    }, 500);
  });
};

/**
 * Generate URL-friendly slug
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
  getDealsWithFilters,
  updateDeal,
  deleteDeal,
  trackDealClick,
  syncConversionsFromAffiliate,
  getDealAnalytics,
  deactivateExpiredDeals
};
