import { Deal } from '../models/Deal.js';
import { Product } from '../models/Product.js';
import { PlatformPrice } from '../models/PlatformPrice.js';
import { SAMPLE_DEALS, SAMPLE_PRODUCTS, SAMPLE_PRICES } from '../data/sampleData.js';
import { db } from '../config/firebase.js';

/**
 * Get today's deals
 */
export const getTodayDeals = async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;
    
    // If Firebase is not available, return sample data
    if (!db) {
      return res.json({
        success: true,
        data: SAMPLE_DEALS.slice(0, parseInt(limit)),
        isDemoData: true,
        message: 'Demo data: Firebase not configured. Add .env credentials to use real data.',
      });
    }
    
    const deals = await Deal.getTodayDeals(parseInt(limit));

    res.json({
      success: true,
      data: deals,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get deals by category
 */
export const getDealsByCategory = async (req, res, next) => {
  try {
    const { category, limit = 20 } = req.query;

    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }

    // If Firebase is not available, return sample data
    if (!db) {
      return res.json({
        success: true,
        data: SAMPLE_DEALS.filter(d => SAMPLE_PRODUCTS.find(p => p.id === d.productId && p.category === category))
          .slice(0, parseInt(limit)),
        isDemoData: true,
      });
    }

    const products = await Product.getByCategory(category);
    const deals = await Promise.all(products.map((p) => Deal.getByProductId(p.id)));
    const allDeals = deals.flat().slice(0, parseInt(limit));

    res.json({
      success: true,
      data: allDeals,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get product with price comparison
 */
export const getProductComparison = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // If Firebase is not available, return sample data
    if (!db) {
      const product = SAMPLE_PRODUCTS.find(p => p.id === productId);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      const prices = SAMPLE_PRICES.filter(p => p.productId === productId);
      const deals = SAMPLE_DEALS.filter(d => d.productId === productId);
      
      return res.json({
        success: true,
        data: {
          product,
          prices,
          deals,
          lowestPrice: prices.length > 0 ? Math.min(...prices.map((p) => p.price)) : null,
        },
        isDemoData: true,
      });
    }

    const product = await Product.getById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const prices = await PlatformPrice.getByProductId(productId);
    const deals = await Deal.getByProductId(productId);

    const comparison = {
      product,
      prices,
      deals,
      lowestPrice: prices.length > 0 ? Math.min(...prices.map((p) => p.price)) : null,
    };

    res.json({
      success: true,
      data: comparison,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Track deal click for analytics
 */
export const trackDealClick = async (req, res, next) => {
  try {
    const { dealId } = req.params;

    // If Firebase is not available, log and return success
    if (!db) {
      console.log('[TRACK] Demo click tracked for deal:', dealId);
      return res.json({
        success: true,
        message: 'Click tracked (demo)',
        isDemoData: true,
      });
    }

    await Deal.trackClick(dealId);

    res.json({
      success: true,
      message: 'Click tracked',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get deal details
 */
export const getDealDetails = async (req, res, next) => {
  try {
    const { dealId } = req.params;

    // If Firebase is not available, return sample data
    if (!db) {
      const deal = SAMPLE_DEALS.find(d => d.id === dealId);
      if (!deal) {
        return res.status(404).json({ error: 'Deal not found' });
      }
      const product = SAMPLE_PRODUCTS.find(p => p.id === deal.productId);
      const prices = SAMPLE_PRICES.filter(p => p.productId === deal.productId);

      return res.json({
        success: true,
        data: {
          deal,
          product,
          prices,
        },
        isDemoData: true,
      });
    }

    const deal = await Deal.getById(dealId);
    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    const product = await Product.getById(deal.productId);
    const prices = await PlatformPrice.getByProductId(deal.productId);

    res.json({
      success: true,
      data: {
        deal,
        product,
        prices,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getTodayDeals,
  getDealsByCategory,
  getProductComparison,
  trackDealClick,
  getDealDetails,
};
