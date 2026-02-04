import { db } from '../config/firebase.js';
import { COLLECTIONS, PLATFORMS } from '../config/constants.js';

export class AffiliateSettings {
  /**
   * Get all affiliate settings
   * @returns {Promise<Object>}
   */
  static async getAll() {
    const doc = await db.collection(COLLECTIONS.SETTINGS).doc('affiliate').get();
    return doc.exists ? doc.data() : this.getDefaults();
  }

  /**
   * Get settings for a specific platform
   * @param {string} platform
   * @returns {Promise<Object>}
   */
  static async getPlatform(platform) {
    const settings = await this.getAll();
    return settings[platform] || null;
  }

  /**
   * Update platform settings
   * @param {string} platform
   * @param {Object} data
   * @returns {Promise<void>}
   */
  static async updatePlatform(platform, data) {
    const settings = await this.getAll();
    settings[platform] = {
      ...settings[platform],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await db.collection(COLLECTIONS.SETTINGS).doc('affiliate').set(settings, { merge: true });
  }

  /**
   * Get Amazon affiliate settings
   * @returns {Promise<Object>}
   */
  static async getAmazonSettings() {
    return this.getPlatform(PLATFORMS.AMAZON);
  }

  /**
   * Get Flipkart affiliate settings
   * @returns {Promise<Object>}
   */
  static async getFlipkartSettings() {
    return this.getPlatform(PLATFORMS.FLIPKART);
  }

  /**
   * Check if a platform is enabled
   * @param {string} platform
   * @returns {Promise<boolean>}
   */
  static async isPlatformEnabled(platform) {
    const settings = await this.getPlatform(platform);
    return settings ? settings.isEnabled !== false : false;
  }

  /**
   * Get defaults
   * @returns {Object}
   */
  static getDefaults() {
    return {
      [PLATFORMS.AMAZON]: {
        isEnabled: true,
        associateTag: process.env.AMAZON_ASSOCIATE_TAG || '',
        accessKey: process.env.AMAZON_ACCESS_KEY || '',
        secretKey: process.env.AMAZON_SECRET_KEY || '',
        updatedAt: new Date().toISOString(),
      },
      [PLATFORMS.FLIPKART]: {
        isEnabled: true,
        affiliateId: process.env.FLIPKART_AFFILIATE_ID || '',
        apiToken: process.env.FLIPKART_API_TOKEN || '',
        updatedAt: new Date().toISOString(),
      },
      [PLATFORMS.CUELINKS]: {
        isEnabled: true,
        apiKey: process.env.CUELINKS_API_KEY || '',
        updatedAt: new Date().toISOString(),
      },
      [PLATFORMS.VCOMMISSION]: {
        isEnabled: false,
        apiKey: '',
        updatedAt: new Date().toISOString(),
      },
    };
  }
}
