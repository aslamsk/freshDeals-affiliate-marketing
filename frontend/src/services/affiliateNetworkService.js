/**
 * AFFILIATE NETWORK INTEGRATION SERVICE
 * Handles integration with Amazon Associates, Flipkart, and other affiliate networks
 */

import { getFirestore, doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

const db = getFirestore();

/**
 * AMAZON ASSOCIATES INTEGRATION
 */
export const amazonAssociatesService = {
  // Amazon API endpoint (would be called from backend in production)
  apiEndpoint: 'https://api.amazon.com/associates',

  /**
   * Sync earnings from Amazon Associates API
   * In production, this would be called by a backend Cloud Function
   */
  syncEarnings: async (accountId, associateTag) => {
    try {
      // PLACEHOLDER: This would call Amazon's API via your backend
      // Frontend should NOT have direct API keys
      
      const response = await fetch('/api/affiliates/amazon/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getStoredToken()}`
        },
        body: JSON.stringify({
          accountId,
          associateTag,
          dateRange: 'last_30_days'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to sync Amazon earnings');
      }

      const data = await response.json();
      
      // Log sync event
      await setDoc(
        doc(db, 'affiliate_syncs', `amazon_${Date.now()}`),
        {
          provider: 'amazon_associates',
          associateTag,
          earnings: data.totalEarnings,
          clicks: data.totalClicks,
          conversions: data.totalConversions,
          syncedAt: serverTimestamp(),
          dateRange: data.dateRange
        }
      );

      return data;
    } catch (error) {
      console.error('❌ Amazon sync failed:', error);
      throw error;
    }
  },

  /**
   * Get Amazon Associates account status
   */
  getAccountStatus: async (accountId) => {
    try {
      const response = await fetch(`/api/affiliates/amazon/status/${accountId}`, {
        headers: {
          'Authorization': `Bearer ${getStoredToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch account status');
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Failed to get account status:', error);
      throw error;
    }
  },

  /**
   * Validate affiliate link format
   */
  validateLink: (url) => {
    const amazonPattern = /^https:\/\/amazon\.(in|com)\/.+\?tag=[a-zA-Z0-9-]+/;
    return amazonPattern.test(url);
  }
};

/**
 * FLIPKART AFFILIATE INTEGRATION
 */
export const flipkartAffiliateService = {
  apiEndpoint: 'https://api.flipkart.com/affiliate',

  /**
   * Sync earnings from Flipkart Affiliate
   */
  syncEarnings: async (accountId, apiKey) => {
    try {
      const response = await fetch('/api/affiliates/flipkart/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getStoredToken()}`
        },
        body: JSON.stringify({
          accountId,
          dateRange: 'last_30_days'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to sync Flipkart earnings');
      }

      const data = await response.json();

      await setDoc(
        doc(db, 'affiliate_syncs', `flipkart_${Date.now()}`),
        {
          provider: 'flipkart_affiliate',
          accountId,
          earnings: data.totalEarnings,
          clicks: data.totalClicks,
          conversions: data.totalConversions,
          syncedAt: serverTimestamp()
        }
      );

      return data;
    } catch (error) {
      console.error('❌ Flipkart sync failed:', error);
      throw error;
    }
  },

  /**
   * Validate Flipkart affiliate link
   */
  validateLink: (url) => {
    const flipkartPattern = /^https:\/\/(www\.)?flipkart\.com\/.+[?&]affid=[a-zA-Z0-9]+/;
    return flipkartPattern.test(url);
  }
};

/**
 * MYNTRA AFFILIATE INTEGRATION
 */
export const myntraAffiliateService = {
  apiEndpoint: 'https://api.myntra.com/affiliate',

  syncEarnings: async (accountId) => {
    try {
      const response = await fetch('/api/affiliates/myntra/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getStoredToken()}`
        },
        body: JSON.stringify({ accountId })
      });

      const data = await response.json();

      await setDoc(
        doc(db, 'affiliate_syncs', `myntra_${Date.now()}`),
        {
          provider: 'myntra_affiliate',
          accountId,
          earnings: data.totalEarnings,
          clicks: data.totalClicks,
          conversions: data.totalConversions,
          syncedAt: serverTimestamp()
        }
      );

      return data;
    } catch (error) {
      console.error('❌ Myntra sync failed:', error);
      throw error;
    }
  },

  validateLink: (url) => {
    return url.includes('myntra.com') && url.includes('aff');
  }
};

/**
 * UNIFIED AFFILIATE MANAGER
 * Handles multiple affiliate networks
 */
export const affiliateManager = {
  /**
   * Sync all registered affiliate accounts
   */
  syncAllAccounts: async (adminId) => {
    try {
      const accounts = await getRegisteredAccounts();
      const results = {
        successful: 0,
        failed: 0,
        totalEarnings: 0,
        errors: []
      };

      for (const account of accounts) {
        try {
          let syncResult;
          
          switch (account.provider) {
            case 'amazon_associates':
              syncResult = await amazonAssociatesService.syncEarnings(
                account.accountId,
                account.associateTag
              );
              break;
            case 'flipkart_affiliate':
              syncResult = await flipkartAffiliateService.syncEarnings(
                account.accountId,
                account.apiKey
              );
              break;
            case 'myntra_affiliate':
              syncResult = await myntraAffiliateService.syncEarnings(account.accountId);
              break;
            default:
              throw new Error(`Unknown provider: ${account.provider}`);
          }

          results.successful++;
          results.totalEarnings += syncResult.totalEarnings || 0;
        } catch (error) {
          results.failed++;
          results.errors.push({
            provider: account.provider,
            error: error.message
          });
        }
      }

      // Log bulk sync
      await setDoc(
        doc(db, 'bulk_syncs', `sync_${Date.now()}`),
        {
          adminId,
          results,
          timestamp: serverTimestamp()
        }
      );

      return results;
    } catch (error) {
      console.error('❌ Bulk sync failed:', error);
      throw error;
    }
  },

  /**
   * Validate affiliate URL against all networks
   */
  validateAffiliateUrl: (url) => {
    const validators = [
      amazonAssociatesService.validateLink,
      flipkartAffiliateService.validateLink,
      myntraAffiliateService.validateLink
    ];

    return validators.some(validator => {
      try {
        return validator(url);
      } catch {
        return false;
      }
    });
  },

  /**
   * Extract network from URL
   */
  extractNetwork: (url) => {
    if (amazonAssociatesService.validateLink(url)) return 'amazon_associates';
    if (flipkartAffiliateService.validateLink(url)) return 'flipkart_affiliate';
    if (myntraAffiliateService.validateLink(url)) return 'myntra_affiliate';
    return 'unknown';
  }
};

/**
 * HELPER FUNCTIONS
 */

/**
 * Get all registered affiliate accounts
 */
const getRegisteredAccounts = async () => {
  // In production, fetch from Firestore collection 'affiliate_accounts'
  // For now, return empty array
  return [];
};

/**
 * Get stored authentication token (from session/localStorage)
 */
const getStoredToken = () => {
  return localStorage.getItem('admin_token') || '';
};

/**
 * Register a new affiliate account
 */
export const registerAffiliateAccount = async (adminId, accountData) => {
  try {
    const accountId = `${accountData.provider}_${Date.now()}`;

    const account = {
      id: accountId,
      provider: accountData.provider,
      accountId: accountData.accountId,
      associateTag: accountData.associateTag || null,
      apiKey: accountData.apiKey || null,
      status: 'active',
      registeredBy: adminId,
      registeredAt: serverTimestamp(),
      lastSyncedAt: null,
      totalEarnings: 0
    };

    // Save to Firestore
    await setDoc(
      doc(db, 'affiliate_accounts', accountId),
      account
    );

    console.log('✅ Affiliate account registered:', accountId);
    return account;
  } catch (error) {
    console.error('❌ Failed to register affiliate account:', error);
    throw error;
  }
};

export default {
  amazonAssociatesService,
  flipkartAffiliateService,
  myntraAffiliateService,
  affiliateManager,
  registerAffiliateAccount
};
