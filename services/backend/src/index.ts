import express from 'express';
import http from 'http';
import cors from 'cors';
import { config } from './config';
import { initializeDatabase } from './db/init';
import { realTimeGateway } from './realtime/socketGateway';
import { matchingEngineService } from './realtime/matchingEngineService';
import { inactivityMonitor } from './inactivity/inactivityMonitor';
import { liveFeedManager } from './sportsFeeds/LiveFeedManager';

// Module Routers
import { authRouter } from './modules/auth/authRoutes';
import { hierarchyRouter } from './modules/hierarchy/hierarchyRoutes';
import { ledgerRouter } from './modules/ledger/ledgerRoutes';
import { marketRouter } from './modules/markets/marketRoutes';
import { betRouter } from './modules/bets/betRoutes';
import { reportRouter } from './modules/reports/reportRoutes';
import { paymentWebhookRouter } from './modules/ledger/paymentWebhookRoutes';
import { paymentMethodRouter } from './modules/paymentMethods/paymentMethodRoutes';

export const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(inactivityMonitor.middleware());

// Real-Time Socket Gateway
realTimeGateway.initialize(server);
app.set('io', realTimeGateway.getIO());

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/hierarchy', hierarchyRouter);
app.use('/api/ledger', ledgerRouter);
app.use('/api/payment-methods', paymentMethodRouter);
app.use('/api/markets', marketRouter);
app.use('/api/bets', betRouter);
app.use('/api/reports', reportRouter);
app.use('/api/webhooks/payment', paymentWebhookRouter);

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Sports Exchange Backend Engine',
    version: '1.0.0',
    inactivity: inactivityMonitor.getStatus()
  });
});

// Inactivity Management & Status Endpoints
app.get('/api/inactivity/status', (_req, res) => {
  res.json(inactivityMonitor.getStatus());
});

app.post('/api/inactivity/wake', (_req, res) => {
  inactivityMonitor.wakeUp('explicit_api_wake');
  res.json({ message: 'Server woken up successfully', status: inactivityMonitor.getStatus() });
});

app.post('/api/inactivity/sleep', async (_req, res) => {
  await inactivityMonitor.putToSleep();
  res.json({ message: 'Sleep mode initiated', status: inactivityMonitor.getStatus() });
});

// Start server if not running in test mode
if (process.env.NODE_ENV !== 'test') {
  const PORT = config.port;
  server.listen(PORT, async () => {
    console.log(`====================================================`);
    console.log(` SPORTS BETTING EXCHANGE BACKEND INITIALIZED`);
    console.log(` Server running on http://localhost:${PORT}`);
    console.log(` Socket.io Gateway ready for real-time streaming`);
    console.log(`====================================================`);

    // Auto-run DB initialization & seeding
    await initializeDatabase();

    // Hydrate matching engine order books
    await matchingEngineService.initFromDatabase();

    // Start real-world multi-sport live feed engine (The-Odds-API, CricAPI, Sportmonks, ESPN)
    setTimeout(() => {
      liveFeedManager.start();
      console.log('[Boot] LiveFeedManager (100% Real Live Sports Feeder) started.');
    }, 3000);

    // Start inactivity monitor cron
    inactivityMonitor.start();
  });
}

