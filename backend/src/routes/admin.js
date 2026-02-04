import express from 'express';
import adminController from '../controllers/adminController.js';
import { verifyAdminSecret } from '../middleware/auth.js';
import { db } from '../config/firebase.js';

const router = express.Router();

// Admin authentication check
const handleAdminRoute = (req, res, next) => {
  if (!db) {
    return res.status(503).json({
      error: 'Firebase not configured',
      message: 'Admin operations require Firebase. Please configure .env with Firebase credentials.',
      status: 'DEVELOPMENT_MODE',
    });
  }
  next();
};

// Apply admin authentication to all routes
router.use(verifyAdminSecret);
router.use(handleAdminRoute);

/**
 * Products
 */
router.post('/products', adminController.createProduct);
router.put('/products/:productId', adminController.updateProduct);

/**
 * Deals
 */
router.post('/deals', adminController.createDeal);
router.put('/deals/:dealId', adminController.updateDeal);
router.delete('/deals/:dealId', adminController.deleteDeal);

/**
 * Coupons
 */
router.post('/coupons', adminController.createCoupon);
router.put('/coupons/:couponId', adminController.updateCoupon);
router.delete('/coupons/:couponId', adminController.deleteCoupon);

/**
 * Affiliate Settings
 */
router.get('/affiliate-settings', adminController.getAffiliateSettings);
router.put('/affiliate-settings', adminController.updateAffiliateSettings);

/**
 * Platform Prices
 */
router.post('/platform-prices', adminController.updatePlatformPrice);

export default router;
