import { query } from '../db/pool';

export interface Order {
  betId: string;
  userId: string;
  marketId: string;
  selectionId: number;
  type: 'BACK' | 'LAY';
  price: number;
  stake: number;
  matchedStake: number;
  createdAt: number;
}

export interface Trade {
  marketId: string;
  selectionId: number;
  backBetId: string;
  layBetId: string;
  backUserId: string;
  layUserId: string;
  price: number;
  stake: number;
  timestamp: number;
}

export interface LadderLevel {
  price: number;
  size: number;
}

export interface SelectionLadder {
  selectionId: number;
  back: LadderLevel[]; // Top 3 Back odds (sorted DESC)
  lay: LadderLevel[];  // Top 3 Lay odds (sorted ASC)
}

export class MatchingEngineService {
  // Key: `${marketId}:${selectionId}`
  private backBooks: Map<string, Order[]> = new Map();
  private layBooks: Map<string, Order[]> = new Map();

  constructor() {
    this.initFromDatabase().catch((err) => {
      console.warn('Initial orderbook hydration skipped (DB might be booting):', err.message);
    });
  }

  private getKey(marketId: string, selectionId: number): string {
    return `${marketId}:${selectionId}`;
  }

  /**
   * Hydrates in-memory order books with unmatched bets from database on startup.
   */
  public async initFromDatabase(): Promise<void> {
    try {
      const res = await query(
        `SELECT id, user_id, market_id, selection_id, type, price, stake, matched_stake, created_at 
         FROM bets 
         WHERE status IN ('UNMATCHED', 'PARTIALLY_MATCHED')
         ORDER BY created_at ASC`
      );

      for (const row of res.rows) {
        const order: Order = {
          betId: row.id,
          userId: row.user_id,
          marketId: row.market_id,
          selectionId: parseInt(row.selection_id, 10),
          type: row.type as 'BACK' | 'LAY',
          price: parseFloat(row.price),
          stake: parseFloat(row.stake),
          matchedStake: parseFloat(row.matched_stake),
          createdAt: new Date(row.created_at).getTime()
        };

        const key = this.getKey(order.marketId, order.selectionId);
        if (order.type === 'BACK') {
          const list = this.backBooks.get(key) || [];
          list.push(order);
          this.backBooks.set(key, list);
        } else {
          const list = this.layBooks.get(key) || [];
          list.push(order);
          this.layBooks.set(key, list);
        }
      }
    } catch (e: any) {
      // Ignored if DB table not yet ready
    }
  }

  /**
   * Submits an order into the matching engine and executes FIFO matching against opposing orders.
   */
  public async submitOrder(orderParams: {
    betId: string;
    userId: string;
    marketId: string;
    selectionId: number;
    type: 'BACK' | 'LAY';
    price: number;
    stake: number;
  }): Promise<{
    status: 'MATCHED' | 'PARTIALLY_MATCHED' | 'UNMATCHED';
    matchedStake: number;
    trades: Trade[];
  }> {
    const key = this.getKey(orderParams.marketId, orderParams.selectionId);
    let remainingStake = orderParams.stake;
    let matchedStake = 0;
    const executedTrades: Trade[] = [];

    const incomingOrder: Order = {
      betId: orderParams.betId,
      userId: orderParams.userId,
      marketId: orderParams.marketId,
      selectionId: orderParams.selectionId,
      type: orderParams.type,
      price: orderParams.price,
      stake: orderParams.stake,
      matchedStake: 0,
      createdAt: Date.now()
    };

    if (orderParams.type === 'BACK') {
      // Match incoming Back order against Lay book (asks)
      // Sort Lay book: lowest price first (Price ASC, Time ASC)
      const layList = this.layBooks.get(key) || [];
      layList.sort((a, b) => (a.price !== b.price ? a.price - b.price : a.createdAt - b.createdAt));

      const survivingLays: Order[] = [];

      for (const layOrder of layList) {
        if (remainingStake <= 0) {
          survivingLays.push(layOrder);
          continue;
        }

        // Check if Lay price is acceptable (layPrice <= backPrice)
        if (layOrder.price <= incomingOrder.price && layOrder.userId !== incomingOrder.userId) {
          const layUnmatched = layOrder.stake - layOrder.matchedStake;
          const fillAmount = Math.min(remainingStake, layUnmatched);
          const matchPrice = layOrder.price; // Best price execution (price improvement)

          remainingStake -= fillAmount;
          matchedStake += fillAmount;
          layOrder.matchedStake += fillAmount;

          const trade: Trade = {
            marketId: orderParams.marketId,
            selectionId: orderParams.selectionId,
            backBetId: incomingOrder.betId,
            layBetId: layOrder.betId,
            backUserId: incomingOrder.userId,
            layUserId: layOrder.userId,
            price: matchPrice,
            stake: fillAmount,
            timestamp: Date.now()
          };

          executedTrades.push(trade);
          await this.persistTrade(trade);

          // Update lay order in database if it is a real DB-backed bet
          const isUuid = (id?: string) => Boolean(id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));
          if (isUuid(layOrder.betId)) {
            const layStatus = layOrder.matchedStake >= layOrder.stake ? 'MATCHED' : 'PARTIALLY_MATCHED';
            await query(
              `UPDATE bets SET matched_stake = $1, status = $2, matched_at = NOW(), updated_at = NOW() WHERE id = $3`,
              [layOrder.matchedStake, layStatus, layOrder.betId]
            ).catch(() => {});
          }

          if (layOrder.matchedStake < layOrder.stake) {
            survivingLays.push(layOrder);
          }
        } else {
          survivingLays.push(layOrder);
        }
      }

      this.layBooks.set(key, survivingLays);

      // If residual Back stake remains, add to Back book
      if (remainingStake > 0) {
        incomingOrder.matchedStake = matchedStake;
        const backList = this.backBooks.get(key) || [];
        backList.push(incomingOrder);
        this.backBooks.set(key, backList);
      }
    } else {
      // Match incoming Lay order against Back book (bids)
      // Sort Back book: highest price first (Price DESC, Time ASC)
      const backList = this.backBooks.get(key) || [];
      backList.sort((a, b) => (a.price !== b.price ? b.price - a.price : a.createdAt - b.createdAt));

      const survivingBacks: Order[] = [];

      for (const backOrder of backList) {
        if (remainingStake <= 0) {
          survivingBacks.push(backOrder);
          continue;
        }

        // Check if Back price is acceptable (backPrice >= layPrice)
        if (backOrder.price >= incomingOrder.price && backOrder.userId !== incomingOrder.userId) {
          const backUnmatched = backOrder.stake - backOrder.matchedStake;
          const fillAmount = Math.min(remainingStake, backUnmatched);
          const matchPrice = backOrder.price; // Best price execution

          remainingStake -= fillAmount;
          matchedStake += fillAmount;
          backOrder.matchedStake += fillAmount;

          const trade: Trade = {
            marketId: orderParams.marketId,
            selectionId: orderParams.selectionId,
            backBetId: backOrder.betId,
            layBetId: incomingOrder.betId,
            backUserId: backOrder.userId,
            layUserId: incomingOrder.userId,
            price: matchPrice,
            stake: fillAmount,
            timestamp: Date.now()
          };

          executedTrades.push(trade);
          await this.persistTrade(trade);

          const isUuid = (id?: string) => Boolean(id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));
          if (isUuid(backOrder.betId)) {
            const backStatus = backOrder.matchedStake >= backOrder.stake ? 'MATCHED' : 'PARTIALLY_MATCHED';
            await query(
              `UPDATE bets SET matched_stake = $1, status = $2, matched_at = NOW(), updated_at = NOW() WHERE id = $3`,
              [backOrder.matchedStake, backStatus, backOrder.betId]
            ).catch(() => {});
          }

          if (backOrder.matchedStake < backOrder.stake) {
            survivingBacks.push(backOrder);
          }
        } else {
          survivingBacks.push(backOrder);
        }
      }

      this.backBooks.set(key, survivingBacks);

      // If residual Lay stake remains, add to Lay book
      if (remainingStake > 0) {
        incomingOrder.matchedStake = matchedStake;
        const layList = this.layBooks.get(key) || [];
        layList.push(incomingOrder);
        this.layBooks.set(key, layList);
      }
    }

    // Determine final status of the incoming bet
    let finalStatus: 'MATCHED' | 'PARTIALLY_MATCHED' | 'UNMATCHED' = 'UNMATCHED';
    if (matchedStake >= orderParams.stake) {
      finalStatus = 'MATCHED';
    } else if (matchedStake > 0) {
      finalStatus = 'PARTIALLY_MATCHED';
    }

    // Update incoming bet in database
    const isUuid = (id?: string) => Boolean(id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));
    if (isUuid(orderParams.betId)) {
      await query(
        `UPDATE bets 
         SET matched_stake = $1, 
             status = $2, 
             matched_at = CASE WHEN $1::numeric > 0 THEN NOW() ELSE NULL END, 
             updated_at = NOW() 
         WHERE id = $3`,
        [matchedStake, finalStatus, orderParams.betId]
      );
    }


    return {
      status: finalStatus,
      matchedStake: Math.round(matchedStake * 100) / 100,
      trades: executedTrades
    };
  }

  /**
   * Removes an order from in-memory books when cancelled.
   */
  public async cancelOrder(betId: string): Promise<void> {
    for (const [key, list] of this.backBooks.entries()) {
      const filtered = list.filter((o) => o.betId !== betId);
      if (filtered.length !== list.length) {
        this.backBooks.set(key, filtered);
        return;
      }
    }

    for (const [key, list] of this.layBooks.entries()) {
      const filtered = list.filter((o) => o.betId !== betId);
      if (filtered.length !== list.length) {
        this.layBooks.set(key, filtered);
        return;
      }
    }
  }

  /**
   * Persists a matched trade into PostgreSQL.
   */
  private async persistTrade(trade: Trade): Promise<void> {
    try {
      const isUuid = (id?: string) => Boolean(id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));
      
      // Both legs must be valid UUID foreign keys to write to trades table
      if (isUuid(trade.backBetId) && isUuid(trade.layBetId)) {
        await query(
          `INSERT INTO trades (market_id, selection_id, back_bet_id, lay_bet_id, back_user_id, lay_user_id, price, stake)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            trade.marketId,
            trade.selectionId,
            trade.backBetId,
            trade.layBetId,
            isUuid(trade.backUserId) ? trade.backUserId : '00000000-0000-0000-0000-000000000000',
            isUuid(trade.layUserId) ? trade.layUserId : '00000000-0000-0000-0000-000000000000',
            trade.price,
            trade.stake
          ]
        );
      }
    } catch (err) {
      console.error('Error persisting trade record:', err);
    }
  }


  /**
   * Generates Betfair-standard 3-tier Back/Lay ladder depth for all runners in a market.
   */
  public getMarketLadder(marketId: string, selections: number[]): Record<number, SelectionLadder> {
    const result: Record<number, SelectionLadder> = {};

    for (const selectionId of selections) {
      const key = this.getKey(marketId, selectionId);
      const backOrders = this.backBooks.get(key) || [];
      const layOrders = this.layBooks.get(key) || [];

      // Group Backs by price
      const backPriceMap: Record<number, number> = {};
      for (const o of backOrders) {
        const remaining = o.stake - o.matchedStake;
        if (remaining > 0) {
          backPriceMap[o.price] = (backPriceMap[o.price] || 0) + remaining;
        }
      }

      // Group Lays by price
      const layPriceMap: Record<number, number> = {};
      for (const o of layOrders) {
        const remaining = o.stake - o.matchedStake;
        if (remaining > 0) {
          layPriceMap[o.price] = (layPriceMap[o.price] || 0) + remaining;
        }
      }

      // Back Ladder: highest prices first (Top 3)
      const sortedBackPrices = Object.keys(backPriceMap)
        .map(Number)
        .sort((a, b) => b - a)
        .slice(0, 3);

      const backLevels: LadderLevel[] = sortedBackPrices.map((price) => ({
        price,
        size: Math.round(backPriceMap[price])
      }));

      // Lay Ladder: lowest prices first (Top 3)
      const sortedLayPrices = Object.keys(layPriceMap)
        .map(Number)
        .sort((a, b) => a - b)
        .slice(0, 3);

      const layLevels: LadderLevel[] = sortedLayPrices.map((price) => ({
        price,
        size: Math.round(layPriceMap[price])
      }));

      result[selectionId] = {
        selectionId,
        back: backLevels,
        lay: layLevels
      };
    }

    return result;
  }
}

export const matchingEngineService = new MatchingEngineService();
