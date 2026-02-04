import { Product } from '../models/Product.js';
import { Deal } from '../models/Deal.js';
import { PlatformPrice } from '../models/PlatformPrice.js';
import { Coupon } from '../models/Coupon.js';
import { AffiliateSettings } from '../models/AffiliateSettings.js';

/**
 * Create product
 */
export const createProduct = async (req, res, next) => {
  try {
    const { name, description, imageUrl, category, tags, isVisible } = req.body;

    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required' });
    }

    const productId = await Product.create({
      name,
      description,
      imageUrl,
      category,
      tags,
      isVisible,
    });

    res.status(201).json({
      success: true,
      data: { id: productId },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update product
 */
export const updateProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { name, description, imageUrl, category, tags, isVisible } = req.body;

    await Product.update(productId, {
      name,
      description,
      imageUrl,
      category,
      tags,
      isVisible,
    });

    res.json({
      success: true,
      message: 'Product updated',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create deal
 */
export const createDeal = async (req, res, next) => {
  try {
    const { productId, title, description, discount, originalPrice, dealPrice, platform, affiliateLink, expiryDate, status } = req.body;

    if (!productId || !title || !platform || !affiliateLink) {
      return res.status(400).json({
        error: 'productId, title, platform, and affiliateLink are required',
      });
    }

    const dealId = await Deal.create({
      productId,
      title,
      description,
      discount,
      originalPrice,
      dealPrice,
      platform,
      affiliateLink,
      expiryDate,
      status,
    });

    res.status(201).json({
      success: true,
      data: { id: dealId },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update deal
 */
export const updateDeal = async (req, res, next) => {
  try {
    const { dealId } = req.params;
    const updateData = req.body;

    await Deal.update(dealId, updateData);

    res.json({
      success: true,
      message: 'Deal updated',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete deal
 */
export const deleteDeal = async (req, res, next) => {
  try {
    const { dealId } = req.params;

    await Deal.delete(dealId);

    res.json({
      success: true,
      message: 'Deal deleted',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create coupon
 */
export const createCoupon = async (req, res, next) => {
  try {
    const { code, description, discount, discountType, applicablePlatforms, expiryDate } = req.body;

    if (!code || !discount || !discountType || !expiryDate) {
      return res.status(400).json({
        error: 'code, discount, discountType, and expiryDate are required',
      });
    }

    const couponId = await Coupon.create({
      code: code.toUpperCase(),
      description,
      discount,
      discountType,
      applicablePlatforms,
      expiryDate,
    });

    res.status(201).json({
      success: true,
      data: { id: couponId },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update coupon
 */
export const updateCoupon = async (req, res, next) => {
  try {
    const { couponId } = req.params;
    const updateData = req.body;

    await Coupon.update(couponId, updateData);

    res.json({
      success: true,
      message: 'Coupon updated',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete coupon
 */
export const deleteCoupon = async (req, res, next) => {
  try {
    const { couponId } = req.params;

    await Coupon.delete(couponId);

    res.json({
      success: true,
      message: 'Coupon deleted',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update affiliate settings
 */
export const updateAffiliateSettings = async (req, res, next) => {
  try {
    const { platform, settings } = req.body;

    if (!platform || !settings) {
      return res.status(400).json({
        error: 'platform and settings are required',
      });
    }

    await AffiliateSettings.updatePlatform(platform, settings);

    res.json({
      success: true,
      message: 'Affiliate settings updated',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get affiliate settings
 */
export const getAffiliateSettings = async (req, res, next) => {
  try {
    const settings = await AffiliateSettings.getAll();

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update platform price
 */
export const updatePlatformPrice = async (req, res, next) => {
  try {
    const { productId, platform, price, inStock, url } = req.body;

    if (!productId || !platform || price === undefined) {
      return res.status(400).json({
        error: 'productId, platform, and price are required',
      });
    }

    const priceId = await PlatformPrice.upsert({
      productId,
      platform,
      price,
      inStock,
      url,
    });

    res.json({
      success: true,
      data: { id: priceId },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createProduct,
  updateProduct,
  createDeal,
  updateDeal,
  deleteDeal,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  updateAffiliateSettings,
  getAffiliateSettings,
  updatePlatformPrice,
};
