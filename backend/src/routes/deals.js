import express from 'express';
import dealsController from '../controllers/dealsController.js';

const router = express.Router();

/**
 * GET /api/deals/today
 * Get today's deals
 */
router.get('/today', dealsController.getTodayDeals);

/**
 * GET /api/deals/category
 * Get deals by category
 */
router.get('/category', dealsController.getDealsByCategory);

/**
 * GET /api/deals/:dealId/details
 * Get deal details
 */
router.get('/:dealId/details', dealsController.getDealDetails);

/**
 * POST /api/deals/:dealId/track-click
 * Track deal click
 */
router.post('/:dealId/track-click', dealsController.trackDealClick);

/**
 * GET /api/deals/product/:productId/comparison
 * Get product with price comparison
 */
router.get('/product/:productId/comparison', dealsController.getProductComparison);

export default router;
