import cron from 'node-cron';
import { Deal } from '../models/Deal.js';
import { DEAL_STATUS } from '../config/constants.js';

/**
 * Deal sync job
 * Marks expired deals as inactive
 */
export const initDealSyncJob = () => {
  if (process.env.ENABLE_DEAL_SYNC_JOB === 'false') {
    console.log('[JOBS] Deal sync job disabled');
    return;
  }

  // Run every 6 hours: 0 */6 * * *
  const job = cron.schedule(process.env.DEAL_SYNC_INTERVAL || '0 */6 * * *', async () => {
    try {
      console.log('[JOBS] Running deal sync job...');

      const expiringDeals = await Deal.getExpiringDeals(0);

      for (const deal of expiringDeals) {
        if (new Date(deal.expiryDate) < new Date()) {
          await Deal.update(deal.id, { status: DEAL_STATUS.EXPIRED });
        }
      }

      console.log('[JOBS] Deal sync job completed');
    } catch (error) {
      console.error('[JOBS] Deal sync job error:', error);
    }
  });

  return job;
};

export default { initDealSyncJob };
