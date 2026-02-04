import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initPriceCacheJob } from './jobs/priceCacheJob.js';
import { initDealSyncJob } from './jobs/dealSyncJob.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), mode: 'lightweight-cron-server' });
});

// Block any /api/deals requests
app.get('/api/deals/*', (req, res) => {
  res.status(403).json({ 
    error: '❌ BLOCKED: Frontend should NOT call /api/deals! Use Firebase directly!',
    path: req.path,
    hint: 'Check console for fetch interceptor logs'
  });
});

// Initialize cron jobs
console.log('[INIT] Initializing cron jobs...');
initPriceCacheJob();
initDealSyncJob();
console.log('[INIT] Cron jobs initialized');

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`[SERVER] FreshDeals Backend (Lightweight) running on port ${PORT}`);
  console.log('[MODE] Cron jobs only - Admin operations via Firebase');
  console.log(`[ENV] Node environment: ${process.env.NODE_ENV}`);
});

export default app;
