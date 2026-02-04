import { db } from '../config/firebase.js';
import { COLLECTIONS } from '../config/constants.js';
import { v4 as uuidv4 } from 'uuid';

export class PlatformPrice {
  /**
   * Create or update platform price
   * @param {Object} data - Price data
   * @returns {Promise<string>} Price ID
   */
  static async upsert(data) {
    const priceId = uuidv4();
    const priceData = {
      id: priceId,
      productId: data.productId,
      platform: data.platform,
      price: data.price,
      currency: data.currency || 'INR',
      inStock: data.inStock !== false,
      url: data.url,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // Query for existing price
    const snapshot = await db
      .collection(COLLECTIONS.PRODUCTS)
      .doc(data.productId)
      .collection('platformPrices')
      .where('platform', '==', data.platform)
      .limit(1)
      .get();

    if (!snapshot.empty) {
      const docId = snapshot.docs[0].id;
      await db
        .collection(COLLECTIONS.PRODUCTS)
        .doc(data.productId)
        .collection('platformPrices')
        .doc(docId)
        .update({
          price: data.price,
          inStock: data.inStock,
          lastUpdated: new Date().toISOString(),
        });
      return docId;
    }

    const docId = uuidv4();
    await db
      .collection(COLLECTIONS.PRODUCTS)
      .doc(data.productId)
      .collection('platformPrices')
      .doc(docId)
      .set(priceData);
    return docId;
  }

  /**
   * Get prices for a product
   * @param {string} productId
   * @returns {Promise<Array>}
   */
  static async getByProductId(productId) {
    const snapshot = await db
      .collection(COLLECTIONS.PRODUCTS)
      .doc(productId)
      .collection('platformPrices')
      .get();

    return snapshot.docs.map((doc) => doc.data());
  }

  /**
   * Get prices for a specific platform
   * @param {string} productId
   * @param {string} platform
   * @returns {Promise<Object|null>}
   */
  static async getByPlatform(productId, platform) {
    const snapshot = await db
      .collection(COLLECTIONS.PRODUCTS)
      .doc(productId)
      .collection('platformPrices')
      .where('platform', '==', platform)
      .limit(1)
      .get();

    return !snapshot.empty ? snapshot.docs[0].data() : null;
  }

  /**
   * Get lowest price across platforms
   * @param {string} productId
   * @returns {Promise<Object|null>}
   */
  static async getLowestPrice(productId) {
    const prices = await this.getByProductId(productId);
    if (prices.length === 0) return null;

    return prices.reduce((lowest, current) =>
      current.price < lowest.price ? current : lowest
    );
  }

  /**
   * Delete price record
   * @param {string} productId
   * @param {string} priceId
   * @returns {Promise<void>}
   */
  static async delete(productId, priceId) {
    await db
      .collection(COLLECTIONS.PRODUCTS)
      .doc(productId)
      .collection('platformPrices')
      .doc(priceId)
      .delete();
  }

  /**
   * Record price history
   * @param {Object} data
   * @returns {Promise<void>}
   */
  static async recordHistory(data) {
    const historyData = {
      productId: data.productId,
      platform: data.platform,
      price: data.price,
      timestamp: new Date().toISOString(),
    };

    await db.collection(COLLECTIONS.PRICE_HISTORY).add(historyData);
  }
}
