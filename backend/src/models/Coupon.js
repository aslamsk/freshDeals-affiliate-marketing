import { db } from '../config/firebase.js';
import { COLLECTIONS } from '../config/constants.js';
import { v4 as uuidv4 } from 'uuid';

export class Coupon {
  /**
   * Create a new coupon
   * @param {Object} data - Coupon data
   * @returns {Promise<string>} Coupon ID
   */
  static async create(data) {
    const couponId = uuidv4();
    const couponData = {
      id: couponId,
      code: data.code,
      description: data.description,
      discount: data.discount,
      discountType: data.discountType, // 'percentage' or 'fixed'
      applicablePlatforms: data.applicablePlatforms || [],
      expiryDate: data.expiryDate,
      maxUses: data.maxUses || null,
      currentUses: 0,
      isActive: data.isActive !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.collection(COLLECTIONS.COUPONS).doc(couponId).set(couponData);
    return couponId;
  }

  /**
   * Get coupon by code
   * @param {string} code
   * @returns {Promise<Object|null>}
   */
  static async getByCode(code) {
    const snapshot = await db
      .collection(COLLECTIONS.COUPONS)
      .where('code', '==', code.toUpperCase())
      .limit(1)
      .get();

    return !snapshot.empty ? snapshot.docs[0].data() : null;
  }

  /**
   * Get coupon by ID
   * @param {string} couponId
   * @returns {Promise<Object|null>}
   */
  static async getById(couponId) {
    const doc = await db.collection(COLLECTIONS.COUPONS).doc(couponId).get();
    return doc.exists ? doc.data() : null;
  }

  /**
   * Get all active coupons
   * @returns {Promise<Array>}
   */
  static async getActive() {
    const now = new Date().toISOString();
    const snapshot = await db
      .collection(COLLECTIONS.COUPONS)
      .where('isActive', '==', true)
      .where('expiryDate', '>=', now)
      .get();

    return snapshot.docs.map((doc) => doc.data());
  }

  /**
   * Validate coupon
   * @param {string} code
   * @param {string} platform
   * @returns {Promise<Object|null>}
   */
  static async validate(code, platform) {
    const coupon = await this.getByCode(code);
    if (!coupon) return null;

    const now = new Date().toISOString();
    if (!coupon.isActive || coupon.expiryDate < now) return null;
    if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) return null;
    if (coupon.applicablePlatforms.length > 0 && !coupon.applicablePlatforms.includes(platform))
      return null;

    return coupon;
  }

  /**
   * Update coupon usage
   * @param {string} couponId
   * @returns {Promise<void>}
   */
  static async incrementUsage(couponId) {
    const coupon = await this.getById(couponId);
    if (coupon) {
      await db.collection(COLLECTIONS.COUPONS).doc(couponId).update({
        currentUses: (coupon.currentUses || 0) + 1,
      });
    }
  }

  /**
   * Update coupon
   * @param {string} couponId
   * @param {Object} data
   * @returns {Promise<void>}
   */
  static async update(couponId, data) {
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await db.collection(COLLECTIONS.COUPONS).doc(couponId).update(updateData);
  }

  /**
   * Delete coupon
   * @param {string} couponId
   * @returns {Promise<void>}
   */
  static async delete(couponId) {
    await db.collection(COLLECTIONS.COUPONS).doc(couponId).delete();
  }
}
