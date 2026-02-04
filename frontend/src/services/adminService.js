import firebaseAdminService from './firebaseAdminService';

/**
 * Admin Service - Uses Firebase directly for all operations
 * No backend API calls needed for admin operations
 */

export const adminService = {
  /**
   * Create product
   */
  async createProduct(data) {
    return firebaseAdminService.createProduct(data);
  },

  /**
   * Update product
   */
  async updateProduct(productId, data) {
    return firebaseAdminService.updateProduct(productId, data);
  },

  /**
   * Delete product
   */
  async deleteProduct(productId) {
    return firebaseAdminService.deleteProduct(productId);
  },

  /**
   * Create deal
   */
  async createDeal(data) {
    return firebaseAdminService.createDeal(data);
  },

  /**
   * Update deal
   */
  async updateDeal(dealId, data) {
    return firebaseAdminService.updateDeal(dealId, data);
  },

  /**
   * Delete deal
   */
  async deleteDeal(dealId) {
    return firebaseAdminService.deleteDeal(dealId);
  },

  /**
   * Create coupon
   */
  async createCoupon(data) {
    return firebaseAdminService.createCoupon(data);
  },

  /**
   * Update coupon
   */
  async updateCoupon(couponId, data) {
    return firebaseAdminService.updateCoupon(couponId, data);
  },

  /**
   * Delete coupon
   */
  async deleteCoupon(couponId) {
    return firebaseAdminService.deleteCoupon(couponId);
  },

  /**
   * Get affiliate settings
   */
  async getAffiliateSettings() {
    return firebaseAdminService.getAffiliateSettings();
  },

  /**
   * Update affiliate settings
   */
  async updateAffiliateSettings(settings) {
    return firebaseAdminService.updateAffiliateSettings(settings);
  },

  /**
   * Update platform price
   */
  async updatePlatformPrice(productId, platform, data) {
    return firebaseAdminService.updatePlatformPrice(productId, platform, data);
  },
};

export default adminService;
