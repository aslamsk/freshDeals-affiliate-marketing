import { db } from '../config/firebase.js';
import { COLLECTIONS, DEAL_STATUS } from '../config/constants.js';
import { v4 as uuidv4 } from 'uuid';

export class Deal {
  /**
   * Create a new deal
   * @param {Object} data - Deal data
   * @returns {Promise<string>} Deal ID
   */
  static async create(data) {
    const dealId = uuidv4();
    const dealData = {
      id: dealId,
      productId: data.productId,
      title: data.title,
      description: data.description || '',
      discount: data.discount || 0,
      originalPrice: data.originalPrice,
      dealPrice: data.dealPrice,
      platform: data.platform,
      affiliateLink: data.affiliateLink,
      expiryDate: data.expiryDate,
      status: data.status || DEAL_STATUS.ACTIVE,
      isVisible: data.isVisible !== false,
      clicks: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.collection(COLLECTIONS.DEALS).doc(dealId).set(dealData);
    return dealId;
  }

  /**
   * Get deal by ID
   * @param {string} dealId
   * @returns {Promise<Object|null>}
   */
  static async getById(dealId) {
    const doc = await db.collection(COLLECTIONS.DEALS).doc(dealId).get();
    return doc.exists ? doc.data() : null;
  }

  /**
   * Get today's deals
   * @param {number} limit
   * @returns {Promise<Array>}
   */
  static async getTodayDeals(limit = 20) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    const snapshot = await db
      .collection(COLLECTIONS.DEALS)
      .where('status', '==', DEAL_STATUS.ACTIVE)
      .where('isVisible', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => doc.data());
  }

  /**
   * Get deals by product ID
   * @param {string} productId
   * @returns {Promise<Array>}
   */
  static async getByProductId(productId) {
    const snapshot = await db
      .collection(COLLECTIONS.DEALS)
      .where('productId', '==', productId)
      .where('status', '==', DEAL_STATUS.ACTIVE)
      .where('isVisible', '==', true)
      .get();

    return snapshot.docs.map((doc) => doc.data());
  }

  /**
   * Get deals by platform
   * @param {string} platform
   * @returns {Promise<Array>}
   */
  static async getByPlatform(platform) {
    const snapshot = await db
      .collection(COLLECTIONS.DEALS)
      .where('platform', '==', platform)
      .where('status', '==', DEAL_STATUS.ACTIVE)
      .where('isVisible', '==', true)
      .get();

    return snapshot.docs.map((doc) => doc.data());
  }

  /**
   * Update deal
   * @param {string} dealId
   * @param {Object} data
   * @returns {Promise<void>}
   */
  static async update(dealId, data) {
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await db.collection(COLLECTIONS.DEALS).doc(dealId).update(updateData);
  }

  /**
   * Track deal click
   * @param {string} dealId
   * @returns {Promise<void>}
   */
  static async trackClick(dealId) {
    const deal = await this.getById(dealId);
    if (deal) {
      await this.update(dealId, { clicks: (deal.clicks || 0) + 1 });
    }
  }

  /**
   * Delete deal
   * @param {string} dealId
   * @returns {Promise<void>}
   */
  static async delete(dealId) {
    await db.collection(COLLECTIONS.DEALS).doc(dealId).delete();
  }

  /**
   * Get deals expiring soon
   * @param {number} days - Days threshold
   * @returns {Promise<Array>}
   */
  static async getExpiringDeals(days = 1) {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

    const snapshot = await db
      .collection(COLLECTIONS.DEALS)
      .where('status', '==', DEAL_STATUS.ACTIVE)
      .where('expiryDate', '<=', futureDate)
      .where('expiryDate', '>=', now.toISOString())
      .get();

    return snapshot.docs.map((doc) => doc.data());
  }
}
