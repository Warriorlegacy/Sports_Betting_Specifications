import { Router, Response } from 'express';
import { query } from '../../db/pool';
import { AuthenticatedRequest, authenticateToken, requireRoles } from '../../middleware/auth';
import { settleMarketAtomic } from '../../db/ledger';
import { realTimeGateway } from '../../realtime/socketGateway';
import { liveFeedManager } from '../../sportsFeeds/LiveFeedManager';

export const marketRouter = Router();

/**
 * GET /api/markets/live/telemetry
 * Returns active live in-play telemetry for all sports.
 */
marketRouter.get('/live/telemetry', (_req, res: Response) => {
  res.json({
    liveMatches: liveFeedManager.getAllLiveMatches(),
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
 * POST /api/markets/telemetry/ingest
 * Webhook endpoint for external sports data providers (Sportmonks / The-Odds-API / CricAPI).
 */
marketRouter.post('/telemetry/ingest', async (req, res: Response) => {
  try {
    const telemetry = req.body;
    if (!telemetry || !telemetry.marketId) {
      return res.status(400).json({ error: 'Invalid telemetry payload. marketId required.' });
    }
    await liveFeedManager.submitExternalTelemetry(telemetry);
    res.json({ success: true, message: 'Telemetry ingested successfully', marketId: telemetry.marketId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
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
