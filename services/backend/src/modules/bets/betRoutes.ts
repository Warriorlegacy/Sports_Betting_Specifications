import { Router, Response } from 'express';
import { query } from '../../db/pool';
import { AuthenticatedRequest, authenticateToken } from '../../middleware/auth';
import { placeBetAtomic, cancelBetAtomic, calculateMarketExposure } from '../../db/ledger';
import { matchingEngineService } from '../../realtime/matchingEngineService';
import { realTimeGateway } from '../../realtime/socketGateway';

export const betRouter = Router();

function normalizeSelectionId(selectionId: any): number {
  if (typeof selectionId === 'number' && !isNaN(selectionId) && selectionId > 0) {
    return Math.floor(selectionId);
  }
  const parsed = parseInt(String(selectionId), 10);
  if (!isNaN(parsed) && parsed > 0) {
    return parsed;
  }
  let hash = 0;
  const str = String(selectionId || '1');
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 90000) + 10;
}

/**
 * POST /api/bets
 * Atomically places a Back or Lay order with worst-case exposure lock.
 */
betRouter.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { marketId, selectionId, type, price, stake, eventName, selectionName, sport } = req.body;

    if (!marketId || selectionId === undefined || !type || !price || !stake) {
      return res.status(400).json({ error: 'marketId, selectionId, type (BACK/LAY), price, and stake are required' });
    }

    if (type !== 'BACK' && type !== 'LAY') {
      return res.status(400).json({ error: "Bet type must be 'BACK' or 'LAY'" });
    }

    const priceNum = parseFloat(price);
    const stakeNum = parseFloat(stake);

    if (isNaN(priceNum) || priceNum <= 1.0) {
      return res.status(400).json({ error: 'Price must be a valid number strictly greater than 1.00' });
    }
    if (isNaN(stakeNum) || stakeNum <= 0) {
      return res.status(400).json({ error: 'Stake must be a positive number' });
    }

    const normalizedSelId = normalizeSelectionId(selectionId);
    const counterSelId = normalizedSelId === 1 ? 2 : 1;

    // Auto-ensure market and multi-runner selections exist in PostgreSQL
    try {
      await query(
        `INSERT INTO markets (id, event_name, market_type, sport, is_locked, in_play, status)
         VALUES ($1, $2, 'MATCH_ODDS', $3, false, true, 'OPEN')
         ON CONFLICT (id) DO UPDATE SET status = 'OPEN', is_locked = false`,
        [marketId, eventName || marketId, sport || 'Football']
      );

      // Primary Runner Selection
      await query(
        `INSERT INTO market_selections (market_id, selection_id, selection_name)
         VALUES ($1, $2, $3)
         ON CONFLICT (market_id, selection_id) DO UPDATE SET selection_name = EXCLUDED.selection_name`,
        [marketId, normalizedSelId, selectionName || `Selection ${normalizedSelId}`]
      );

      // Counter Runner Selection (Required for standard 2-way liability exposure netting)
      await query(
        `INSERT INTO market_selections (market_id, selection_id, selection_name)
         VALUES ($1, $2, $3)
         ON CONFLICT (market_id, selection_id) DO NOTHING`,
        [marketId, counterSelId, `Selection ${counterSelId}`]
      );
    } catch {
      // Ignore if already initialized concurrently
    }

    // 1. Atomically lock worst-case liability in PostgreSQL
    const { bet, availableCredit, exposure, deltaExposure } = await placeBetAtomic({
      userId,
      marketId,
      selectionId: normalizedSelId,
      type,
      price: priceNum,
      stake: stakeNum
    });

    // 2. Submit order to high-frequency matching engine
    const matchResult = await matchingEngineService.submitOrder({
      betId: bet.id,
      userId,
      marketId,
      selectionId: normalizedSelId,
      type,
      price: priceNum,
      stake: stakeNum
    });

    // 3. Emit real-time updates to user & market ladder rooms
    realTimeGateway.notifyUserBalance(userId, { availableCredit, exposure });
    realTimeGateway.broadcastOrderBookUpdate(marketId);

    res.status(201).json({
      message: 'Bet placed successfully',
      bet: {
        ...bet,
        status: matchResult.status,
        matchedStake: matchResult.matchedStake
      },
      availableCredit,
      exposure,
      deltaExposure,
      trades: matchResult.trades
    });
  } catch (error: any) {
    console.error('Error placing bet:', error);
    res.status(400).json({ error: error.message || 'Failed to place bet' });
  }
});

/**
 * POST /api/bets/:betId/cancel
 * Cancels unmatched portion of bet and unlocks credit.
 */
betRouter.post('/:betId/cancel', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { betId } = req.params;

    // Cancel in matching engine
    await matchingEngineService.cancelOrder(betId);

    // Cancel in DB and release locked liability
    const { bet, refundedCredit, availableCredit, exposure } = await cancelBetAtomic(userId, betId);

    realTimeGateway.notifyUserBalance(userId, { availableCredit, exposure });
    realTimeGateway.broadcastOrderBookUpdate(bet.market_id);

    res.json({
      message: 'Bet cancelled successfully',
      bet,
      refundedCredit,
      availableCredit,
      exposure
    });
  } catch (error: any) {
    console.error('Error cancelling bet:', error);
    res.status(400).json({ error: error.message || 'Failed to cancel bet' });
  }
});

/**
 * POST /api/bets/:betId/cashout
 * Executes early full or partial cash-out and unlocks credit.
 */
betRouter.post('/:betId/cashout', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { betId } = req.params;
    const { cashOutAmount, percentage = 100 } = req.body;

    if (!cashOutAmount || cashOutAmount <= 0) {
      return res.status(400).json({ error: 'Valid cashOutAmount is required' });
    }

    const betRes = await query(`SELECT * FROM bets WHERE id = $1 AND user_id = $2`, [betId, userId]);
    if (betRes.rows.length === 0) {
      return res.status(404).json({ error: 'Bet not found' });
    }

    const bet = betRes.rows[0];
    const payout = parseFloat(cashOutAmount);

    // Update user available credit
    await query(
      `UPDATE users 
       SET available_credit = available_credit + $1,
           exposure = GREATEST(0, exposure - $2)
       WHERE id = $3`,
      [payout, parseFloat(bet.liability) * (percentage / 100), userId]
    );

    // Update bet status
    const newStatus = percentage >= 100 ? 'SETTLED' : 'PARTIALLY_MATCHED';
    await query(
      `UPDATE bets 
       SET status = $1, 
           pnl = pnl + $2,
           settled_at = NOW() 
       WHERE id = $3`,
      [newStatus, payout - parseFloat(bet.stake) * (percentage / 100), betId]
    );

    const userRes = await query(`SELECT available_credit, exposure FROM users WHERE id = $1`, [userId]);
    const { available_credit, exposure } = userRes.rows[0];

    realTimeGateway.notifyUserBalance(userId, {
      availableCredit: parseFloat(available_credit),
      exposure: parseFloat(exposure)
    });

    res.json({
      message: 'Early cash-out executed successfully',
      payout,
      availableCredit: parseFloat(available_credit),
      exposure: parseFloat(exposure)
    });
  } catch (error: any) {
    console.error('Error executing cashout:', error);
    res.status(400).json({ error: error.message || 'Failed to cash out bet' });
  }
});

/**
 * GET /api/bets/my-bets
 * Fetches user's open and settled bets.
 */
betRouter.get('/my-bets', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const marketId = req.query.marketId as string;
    const status = req.query.status as string;

    let sql = `
      SELECT b.id, b.user_id, b.market_id, b.selection_id, b.type, b.price, b.stake, b.matched_stake,
             b.liability, b.status, b.pnl, b.created_at, b.matched_at, b.settled_at,
             m.event_name, ms.selection_name
      FROM bets b
      JOIN markets m ON b.market_id = m.id
      JOIN market_selections ms ON b.market_id = ms.market_id AND b.selection_id = ms.selection_id
      WHERE b.user_id = $1
    `;
    const params: any[] = [userId];

    if (marketId) {
      params.push(marketId);
      sql += ` AND b.market_id = $${params.length}`;
    }

    if (status) {
      params.push(status);
      sql += ` AND b.status = $${params.length}`;
    }

    sql += ` ORDER BY b.created_at DESC LIMIT 100`;

    const result = await query(sql, params);

    const bets = result.rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      marketId: r.market_id,
      eventName: r.event_name,
      selectionId: r.selection_id,
      selectionName: r.selection_name,
      type: r.type,
      price: parseFloat(r.price),
      stake: parseFloat(r.stake),
      matchedStake: parseFloat(r.matched_stake),
      unmatchedStake: Math.max(0, parseFloat(r.stake) - parseFloat(r.matched_stake)),
      liability: parseFloat(r.liability),
      status: r.status,
      pnl: parseFloat(r.pnl || '0'),
      createdAt: r.created_at,
      matchedAt: r.matched_at,
      settledAt: r.settled_at
    }));

    res.json({ bets });
  } catch (error) {
    console.error('Error fetching user bets:', error);
    res.status(500).json({ error: 'Failed to fetch bets' });
  }
});

/**
 * GET /api/bets/market/:marketId/exposure
 * Computes live multi-runner P&L matrix for the logged-in user.
 */
betRouter.get('/market/:marketId/exposure', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { marketId } = req.params;

    const { netExposure, pnlMatrix } = await calculateMarketExposure(query as any, userId, marketId);

    res.json({
      marketId,
      netExposure,
      pnlMatrix
    });
  } catch (error: any) {
    console.error('Error calculating market exposure:', error);
    res.status(500).json({ error: error.message || 'Failed to calculate market exposure' });
  }
});

/**
 * GET /api/bets/records
 * Admin / Master view of bet records across all users or downline subtree with multi-criteria filters.
 */
betRouter.get(
  '/records',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const requester = req.user!;
      const allowedRoles = ['ADMIN', 'SUPER_MASTER', 'MASTER', 'AGENT'];
      if (!allowedRoles.includes(requester.role)) {
        return res.status(403).json({ error: 'Access denied to global bet records' });
      }

      const {
        username,
        userId,
        marketId,
        sport,
        type,
        status,
        dateFrom,
        dateTo,
        limit = '50',
        offset = '0'
      } = req.query;

      const limitNum = Math.min(200, parseInt(limit as string, 10) || 50);
      const offsetNum = Math.max(0, parseInt(offset as string, 10) || 0);

      let whereConditions: string[] = [];
      let params: any[] = [];
      let pIdx = 1;

      // Downline isolation if not ADMIN
      if (requester.role !== 'ADMIN') {
        whereConditions.push(`b.user_id IN (
          WITH RECURSIVE downline AS (
            SELECT id FROM users WHERE id = $${pIdx++}
            UNION ALL
            SELECT u.id FROM users u INNER JOIN downline d ON u.parent_id = d.id
          )
          SELECT id FROM downline
        )`);
        params.push(requester.id);
      }

      if (username) {
        whereConditions.push(`u.username ILIKE $${pIdx++}`);
        params.push(`%${username}%`);
      }

      if (userId) {
        whereConditions.push(`b.user_id = $${pIdx++}`);
        params.push(userId);
      }

      if (marketId) {
        whereConditions.push(`b.market_id = $${pIdx++}`);
        params.push(marketId);
      }

      if (sport) {
        whereConditions.push(`m.sport ILIKE $${pIdx++}`);
        params.push(sport);
      }

      if (type) {
        whereConditions.push(`b.type = $${pIdx++}`);
        params.push(type);
      }

      if (status) {
        whereConditions.push(`b.status = $${pIdx++}`);
        params.push(status);
      }

      if (dateFrom) {
        whereConditions.push(`b.created_at >= $${pIdx++}`);
        params.push(dateFrom);
      }

      if (dateTo) {
        whereConditions.push(`b.created_at <= $${pIdx++}`);
        params.push(dateTo);
      }

      const whereSql = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Count query
      const countSql = `
        SELECT 
          COUNT(b.id) as total_count,
          COALESCE(SUM(b.stake), 0) as total_volume,
          COALESCE(SUM(b.liability), 0) as total_liability,
          COALESCE(SUM(b.pnl), 0) as total_pnl,
          COUNT(CASE WHEN b.status = 'MATCHED' THEN 1 END) as matched_count,
          COUNT(CASE WHEN b.status = 'UNMATCHED' THEN 1 END) as unmatched_count,
          COUNT(CASE WHEN b.status = 'SETTLED' THEN 1 END) as settled_count
        FROM bets b
        JOIN users u ON b.user_id = u.id
        JOIN markets m ON b.market_id = m.id
        ${whereSql}
      `;
      const countRes = await query(countSql, params);
      const agg = countRes.rows[0];

      // Records query
      const listSql = `
        SELECT b.id, b.user_id, b.market_id, b.selection_id, b.type, b.price, b.stake, b.matched_stake,
               b.liability, b.status, b.pnl, b.created_at, b.matched_at, b.settled_at,
               u.username, u.role as user_role,
               m.event_name, m.sport, ms.selection_name
        FROM bets b
        JOIN users u ON b.user_id = u.id
        JOIN markets m ON b.market_id = m.id
        JOIN market_selections ms ON b.market_id = ms.market_id AND b.selection_id = ms.selection_id
        ${whereSql}
        ORDER BY b.created_at DESC
        LIMIT $${pIdx++} OFFSET $${pIdx++}
      `;
      const listRes = await query(listSql, [...params, limitNum, offsetNum]);

      const bets = listRes.rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        username: r.username,
        userRole: r.user_role,
        marketId: r.market_id,
        eventName: r.event_name,
        sport: r.sport,
        selectionId: r.selection_id,
        selectionName: r.selection_name,
        type: r.type,
        price: parseFloat(r.price),
        stake: parseFloat(r.stake),
        matchedStake: parseFloat(r.matched_stake),
        unmatchedStake: Math.max(0, parseFloat(r.stake) - parseFloat(r.matched_stake)),
        liability: parseFloat(r.liability),
        status: r.status,
        pnl: parseFloat(r.pnl || '0'),
        createdAt: r.created_at,
        matchedAt: r.matched_at,
        settledAt: r.settled_at
      }));

      res.json({
        bets,
        total: parseInt(agg.total_count || '0', 10),
        stats: {
          totalVolume: parseFloat(agg.total_volume || '0'),
          totalLiability: parseFloat(agg.total_liability || '0'),
          totalPnL: parseFloat(agg.total_pnl || '0'),
          matchedCount: parseInt(agg.matched_count || '0', 10),
          unmatchedCount: parseInt(agg.unmatched_count || '0', 10),
          settledCount: parseInt(agg.settled_count || '0', 10)
        }
      });
    } catch (error) {
      console.error('Error fetching bet records:', error);
      res.status(500).json({ error: 'Failed to fetch bet records' });
    }
  }
);

