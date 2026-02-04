import cron from 'node-cron';
import { PlatformPrice } from '../models/PlatformPrice.js';
import { db } from '../config/firebase.js';
import { COLLECTIONS } from '../config/constants.js';

/**
 * Price cache job
 * Records price history for analytics and caching
 */
export const initPriceCacheJob = () => {
  if (process.env.ENABLE_PRICE_CACHE_JOB === 'false') {
    console.log('[JOBS] Price cache job disabled');
    return;
  }

  // Run at midnight every day: 0 0 * * *
  const job = cron.schedule(process.env.PRICE_CACHE_INTERVAL || '0 0 * * *', async () => {
    try {
      console.log('[JOBS] Running price cache job...');

      const productsSnap = await db.collection(COLLECTIONS.PRODUCTS).get();

      for (const productDoc of productsSnap.docs) {
        const productId = productDoc.id;
        const prices = await PlatformPrice.getByProductId(productId);

        for (const price of prices) {
          await PlatformPrice.recordHistory({
            productId,
            platform: price.platform,
            price: price.price,
          });
        }
      }

      console.log('[JOBS] Price cache job completed');
    } catch (error) {
      console.error('[JOBS] Price cache job error:', error);
    }
  });

  return job;
};

export default { initPriceCacheJob };
