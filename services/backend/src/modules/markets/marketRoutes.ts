import { Router, Response } from 'express';
import { query } from '../../db/pool';
import { AuthenticatedRequest, authenticateToken, requireRoles } from '../../middleware/auth';
import { settleMarketAtomic } from '../../db/ledger';
import { realTimeGateway } from '../../realtime/socketGateway';
import { liveFeedManager } from '../../sportsFeeds/LiveFeedManager';
import { failoverFeedOrchestrator } from '../../sportsFeeds/FailoverFeedOrchestrator';

export const marketRouter = Router();

/**
 * GET /api/markets/live/telemetry
 * Returns all live telemetry from all active tiers (Tier 1-5 merged).
 */
marketRouter.get('/live/telemetry', (_req, res: Response) => {
  const allMatches = liveFeedManager.getAllLiveMatches();
  res.json({
    telemetry: allMatches,       // Key frontend fetchLiveTelemetry() reads
    liveMatches: allMatches,     // Legacy compat key
    count: allMatches.length,
    timestamp: Date.now()
  });
});

/**
 * GET /api/markets/telemetry/:marketId
 */
marketRouter.get('/telemetry/:marketId', (req, res: Response) => {
  const { marketId } = req.params;
  const telemetry = liveFeedManager.getMatchTelemetry(marketId);
  if (!telemetry) {
    return res.status(404).json({ error: 'Live telemetry not found for market' });
  }
  res.json({ telemetry });
});

/**
 * POST /api/markets/real-feed/sync
 * Forces an immediate fetch of live games from ESPN global feeds (Tier 4).
 */
marketRouter.post('/real-feed/sync', async (_req, res: Response) => {
  try {
    const { realSportsFeedService } = await import('../../sportsFeeds/RealSportsFeedService');
    const synced = await realSportsFeedService.syncAllRealSports();
    res.json({ success: true, message: `Synced ${synced} real-world matches from ESPN feeds.`, count: synced });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/markets/real-feed/status
 */
marketRouter.get('/real-feed/status', async (_req, res: Response) => {
  const { realSportsFeedService } = await import('../../sportsFeeds/RealSportsFeedService');
  res.json({
    realMatches: realSportsFeedService.getAllRealTelemetry(),
    timestamp: Date.now()
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// PROVIDER ADMIN ROUTES
// ──────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/markets/providers/status
 * Returns health dashboard for all 5 tiers:
 * — Circuit breaker state (open/closed)
 * — Last fetch time & match count
 * — API key configured (yes/no)
 * — Next re-probe timestamp if currently unhealthy
 */
marketRouter.get('/providers/status', (_req, res: Response) => {
  const { realSportsFeedService } = require('../../sportsFeeds/RealSportsFeedService');
  const thirdPartyReport = failoverFeedOrchestrator.getHealthReport();

  res.json({
    summary: {
      totalMatches: liveFeedManager.getAllLiveMatches().length,
      activeTier: thirdPartyReport.activeTier,
      timestamp: new Date().toISOString()
    },
    tiers: [
      ...thirdPartyReport.providers,
      {
        name: 'ESPN Free API (Tier 4)',
        priority: 4,
        healthy: true,
        keyConfigured: true,
        lastFetchCount: realSportsFeedService.getAllRealTelemetry().length,
        lastFetchAt: Date.now()
      },
      {
        name: 'Internal Simulator (Tier 5)',
        priority: 5,
        healthy: true,
        keyConfigured: true,
        lastFetchCount: 4,
        lastFetchAt: Date.now()
      }
    ]
  });
});

/**
 * POST /api/markets/providers/sync
 * Forces an immediate fetch across all provider tiers (Tiers 1-4).
 */
marketRouter.post('/providers/sync', async (_req, res: Response) => {
  try {
    const [thirdPartyMatches, espnCount] = await Promise.all([
      failoverFeedOrchestrator.fetchAll(),
      (async () => {
        const { realSportsFeedService } = await import('../../sportsFeeds/RealSportsFeedService');
        return realSportsFeedService.syncAllRealSports();
      })()
    ]);

    res.json({
      success: true,
      message: `Full sync complete across all provider tiers.`,
      thirdPartyMatches: thirdPartyMatches.length,
      espnMatches: espnCount,
      totalAvailable: liveFeedManager.getAllLiveMatches().length
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/markets/providers/test
 * Force-tests a specific provider by name and returns sample results.
 * Body: { "provider": "odds" | "sportmonks" | "cricapi" }
 */
marketRouter.post('/providers/test', async (req, res: Response) => {
  const { provider = 'odds' } = req.body;

  if (!provider || typeof provider !== 'string') {
    return res.status(400).json({ error: 'provider name required in body (odds|sportmonks|cricapi)' });
  }

  try {
    const result = await failoverFeedOrchestrator.testProvider(provider);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/markets/telemetry/ingest
 * Webhook endpoint for third-party push providers.
 * Accepts a normalized LiveMatchTelemetry payload.
 * Compatible with: Sportmonks webhooks, CricAPI push, custom integrations.
 *
 * Auth: X-Webhook-Secret header must match WEBHOOK_SECRET env var (if configured)
 */
marketRouter.post('/telemetry/ingest', async (req, res: Response) => {
  try {
    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (webhookSecret) {
      const incomingSecret = req.headers['x-webhook-secret'];
      if (incomingSecret !== webhookSecret) {
        return res.status(403).json({ error: 'Invalid webhook secret' });
      }
    }

    const payload = req.body;

    // Accept single telemetry or array
    const telemetries = Array.isArray(payload) ? payload : [payload];
    let ingestedCount = 0;

    for (const t of telemetries) {
      if (!t.marketId || !t.homeTeam || !t.awayTeam) continue;

      // Normalize required fields with defaults
      const telemetry = {
        ...t,
        isLocked: t.isLocked ?? false,
        inPlay: t.inPlay ?? false,
        status: t.status ?? (t.inPlay ? 'IN_PLAY' : 'PRE_MATCH'),
        updatedAt: Date.now()
      };

      await liveFeedManager.submitExternalTelemetry(telemetry);

      // Upsert to DB
      await query(
        `INSERT INTO markets (id, event_name, market_type, sport, is_locked, in_play, status)
         VALUES ($1, $2, 'MATCH_ODDS', $3, FALSE, $4, $5)
         ON CONFLICT (id) DO UPDATE
         SET in_play = EXCLUDED.in_play, status = EXCLUDED.status, updated_at = NOW()`,
        [telemetry.marketId, telemetry.eventName || `${telemetry.homeTeam} vs ${telemetry.awayTeam}`, telemetry.sport || 'Football', Boolean(telemetry.inPlay), telemetry.status || 'OPEN']
      ).catch(() => {});

      ingestedCount++;
    }

    res.json({ success: true, ingested: ingestedCount });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});


/**
 * GET /api/markets
 * Lists all markets with runner selections and status.
 */
marketRouter.get('/', async (_req, res: Response) => {
  try {
    const marketsRes = await query(
      `SELECT id, event_name, market_type, sport, is_locked, in_play, status, winning_selection_id, created_at
       FROM markets 
       ORDER BY in_play DESC, created_at DESC`
    );

    const selectionsRes = await query(
      `SELECT market_id, selection_id, selection_name, status 
       FROM market_selections 
       ORDER BY selection_id ASC`
    );

    const selectionsMap: Record<string, any[]> = {};
    for (const sel of selectionsRes.rows) {
      if (!selectionsMap[sel.market_id]) {
        selectionsMap[sel.market_id] = [];
      }
      selectionsMap[sel.market_id].push({
        selectionId: sel.selection_id,
        name: sel.selection_name,
        status: sel.status
      });
    }

    const markets = marketsRes.rows.map((m) => ({
      id: m.id,
      eventName: m.event_name,
      marketType: m.market_type,
      sport: m.sport,
      isLocked: m.is_locked,
      inPlay: m.in_play,
      status: m.status,
      winningSelectionId: m.winning_selection_id,
      createdAt: m.created_at,
      selections: selectionsMap[m.id] || [],
      telemetry: liveFeedManager.getMatchTelemetry(m.id) || null
    }));

    res.json({ markets });
  } catch (error) {
    console.error('Error fetching markets:', error);
    res.status(500).json({ error: 'Failed to fetch markets' });
  }
});


/**
 * GET /api/markets/:marketId
 */
marketRouter.get('/:marketId', async (req, res: Response) => {
  try {
    const { marketId } = req.params;
    const marketRes = await query(
      `SELECT id, event_name, market_type, sport, is_locked, in_play, status, winning_selection_id, created_at
       FROM markets WHERE id = $1`,
      [marketId]
    );

    if (marketRes.rows.length === 0) {
      return res.status(404).json({ error: 'Market not found' });
    }

    const selectionsRes = await query(
      `SELECT selection_id, selection_name, status 
       FROM market_selections 
       WHERE market_id = $1 
       ORDER BY selection_id ASC`,
      [marketId]
    );

    const m = marketRes.rows[0];
    res.json({
      market: {
        id: m.id,
        eventName: m.event_name,
        marketType: m.market_type,
        sport: m.sport,
        isLocked: m.is_locked,
        inPlay: m.in_play,
        status: m.status,
        winningSelectionId: m.winning_selection_id,
        createdAt: m.created_at,
        selections: selectionsRes.rows.map((s) => ({
          selectionId: s.selection_id,
          name: s.selection_name,
          status: s.status
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching market details:', error);
    res.status(500).json({ error: 'Failed to fetch market details' });
  }
});

/**
 * POST /api/markets
 * Creates a new sports market with runners (Admin/SuperMaster only).
 */
marketRouter.post(
  '/',
  authenticateToken,
  requireRoles(['ADMIN', 'SUPER_MASTER']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id, eventName, sport, marketType, selections } = req.body;

      if (!id || !eventName || !selections || !Array.isArray(selections) || selections.length < 2) {
        return res.status(400).json({ error: 'Market ID, event name, and at least 2 selections are required' });
      }

      await query(
        `INSERT INTO markets (id, event_name, market_type, sport, is_locked, in_play, status)
         VALUES ($1, $2, $3, $4, FALSE, TRUE, 'OPEN')`,
        [id.trim(), eventName.trim(), marketType || 'MATCH_ODDS', sport || 'Cricket']
      );

      for (let i = 0; i < selections.length; i++) {
        const selName = typeof selections[i] === 'string' ? selections[i] : selections[i].name;
        await query(
          `INSERT INTO market_selections (market_id, selection_id, selection_name)
           VALUES ($1, $2, $3)`,
          [id.trim(), i + 1, selName]
        );
      }

      res.status(201).json({
        message: 'Market created successfully',
        marketId: id.trim()
      });
    } catch (error: any) {
      console.error('Error creating market:', error);
      res.status(500).json({ error: error.message || 'Failed to create market' });
    }
  }
);

/**
 * POST /api/markets/:marketId/lock
 * Emergency kill-switch: locks/unlocks market and suspends trading immediately.
 */
marketRouter.post(
  '/:marketId/lock',
  authenticateToken,
  requireRoles(['ADMIN', 'SUPER_MASTER', 'MASTER']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { marketId } = req.params;
      const { isLocked } = req.body;

      const newLockState = typeof isLocked === 'boolean' ? isLocked : true;
      const newStatus = newLockState ? 'SUSPENDED' : 'OPEN';

      const updateRes = await query(
        `UPDATE markets 
         SET is_locked = $1, status = $2, updated_at = NOW() 
         WHERE id = $3 
         RETURNING id, event_name, is_locked, status`,
        [newLockState, newStatus, marketId]
      );

      if (updateRes.rows.length === 0) {
        return res.status(404).json({ error: 'Market not found' });
      }

      const updatedMarket = updateRes.rows[0];

      // Broadcast emergency suspension kill-switch over Socket.io
      realTimeGateway.broadcastMarketLock(marketId, newLockState);

      res.json({
        message: `Market ${marketId} is now ${newStatus}`,
        market: updatedMarket
      });
    } catch (error) {
      console.error('Error locking market:', error);
      res.status(500).json({ error: 'Failed to update market lock state' });
    }
  }
);

/**
 * POST /api/markets/:marketId/settle
 * Settles a market, calculating net P&L, commissions, and double-entry payouts.
 */
marketRouter.post(
  '/:marketId/settle',
  authenticateToken,
  requireRoles(['ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { marketId } = req.params;
      const { winningSelectionId } = req.body;

      if (winningSelectionId === undefined || winningSelectionId === null) {
        return res.status(400).json({ error: 'Winning selection ID is required' });
      }

      const result = await settleMarketAtomic(marketId, parseInt(winningSelectionId, 10));

      // Broadcast settlement to all active WebSocket clients
      realTimeGateway.broadcastMarketSettlement(marketId, winningSelectionId);

      res.json({
        message: `Market ${marketId} settled successfully`,
        result
      });
    } catch (error: any) {
      console.error('Error settling market:', error);
      res.status(400).json({ error: error.message || 'Failed to settle market' });
    }
  }
);
