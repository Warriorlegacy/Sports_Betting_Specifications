export interface Order {
  id: string;
  userId: string;
  marketId: string;
  selectionId: number;
  type: 'BACK' | 'LAY';
  price: number;
  stake: number;
  matchedStake: number;
  timestamp: number;
}

export interface MatchResult {
  tradeId: string;
  marketId: string;
  selectionId: number;
  backOrderId: string;
  layOrderId: string;
  backUserId: string;
  layUserId: string;
  matchedPrice: number;
  matchedStake: number;
  timestamp: number;
}

export class OrderBook {
  public readonly marketId: string;
  public readonly selectionId: number;
  private backOrders: Order[] = []; // Bids sorted by price DESC, time ASC
  private layOrders: Order[] = [];  // Asks sorted by price ASC, time ASC

  constructor(marketId: string, selectionId: number) {
    this.marketId = marketId;
    this.selectionId = selectionId;
  }

  public placeOrder(order: Order): MatchResult[] {
    const matches: MatchResult[] = [];
    let remainingStake = order.stake - order.matchedStake;

    if (order.type === 'BACK') {
      // Sort Lay book: lowest Lay price first
      this.layOrders.sort((a, b) => (a.price !== b.price ? a.price - b.price : a.timestamp - b.timestamp));

      const activeLays: Order[] = [];

      for (const lay of this.layOrders) {
        if (remainingStake <= 0) {
          activeLays.push(lay);
          continue;
        }

        // Back matches if lay price <= back price and not self-trading
        if (lay.price <= order.price && lay.userId !== order.userId) {
          const layRemaining = lay.stake - lay.matchedStake;
          const fill = Math.min(remainingStake, layRemaining);
          const executionPrice = lay.price; // Best execution

          remainingStake -= fill;
          order.matchedStake += fill;
          lay.matchedStake += fill;

          matches.push({
            tradeId: `TR_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            marketId: this.marketId,
            selectionId: this.selectionId,
            backOrderId: order.id,
            layOrderId: lay.id,
            backUserId: order.userId,
            layUserId: lay.userId,
            matchedPrice: executionPrice,
            matchedStake: fill,
            timestamp: Date.now()
          });

          if (lay.matchedStake < lay.stake) {
            activeLays.push(lay);
          }
        } else {
          activeLays.push(lay);
        }
      }

      this.layOrders = activeLays;

      if (remainingStake > 0) {
        this.backOrders.push(order);
      }
    } else {
      // Lay order: match against highest Back prices
      this.backOrders.sort((a, b) => (a.price !== b.price ? b.price - a.price : a.timestamp - b.timestamp));

      const activeBacks: Order[] = [];

      for (const back of this.backOrders) {
        if (remainingStake <= 0) {
          activeBacks.push(back);
          continue;
        }

        // Lay matches if back price >= lay price and not self-trading
        if (back.price >= order.price && back.userId !== order.userId) {
          const backRemaining = back.stake - back.matchedStake;
          const fill = Math.min(remainingStake, backRemaining);
          const executionPrice = back.price;

          remainingStake -= fill;
          order.matchedStake += fill;
          back.matchedStake += fill;

          matches.push({
            tradeId: `TR_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            marketId: this.marketId,
            selectionId: this.selectionId,
            backOrderId: back.id,
            layOrderId: order.id,
            backUserId: back.userId,
            layUserId: order.userId,
            matchedPrice: executionPrice,
            matchedStake: fill,
            timestamp: Date.now()
          });

          if (back.matchedStake < back.stake) {
            activeBacks.push(back);
          }
        } else {
          activeBacks.push(back);
        }
      }

      this.backOrders = activeBacks;

      if (remainingStake > 0) {
        this.layOrders.push(order);
      }
    }

    return matches;
  }

  public cancelOrder(orderId: string): boolean {
    const backLen = this.backOrders.length;
    this.backOrders = this.backOrders.filter((o) => o.id !== orderId);
    if (this.backOrders.length !== backLen) return true;

    const layLen = this.layOrders.length;
    this.layOrders = this.layOrders.filter((o) => o.id !== orderId);
    return this.layOrders.length !== layLen;
  }

  public getDepth(depthCount: number = 3) {
    const backMap: Record<number, number> = {};
    for (const b of this.backOrders) {
      const rem = b.stake - b.matchedStake;
      if (rem > 0) backMap[b.price] = (backMap[b.price] || 0) + rem;
    }

    const layMap: Record<number, number> = {};
    for (const l of this.layOrders) {
      const rem = l.stake - l.matchedStake;
      if (rem > 0) layMap[l.price] = (layMap[l.price] || 0) + rem;
    }

    const backs = Object.keys(backMap)
      .map(Number)
      .sort((a, b) => b - a)
      .slice(0, depthCount)
      .map((price) => ({ price, size: Math.round(backMap[price]) }));

    const lays = Object.keys(layMap)
      .map(Number)
      .sort((a, b) => a - b)
      .slice(0, depthCount)
      .map((price) => ({ price, size: Math.round(layMap[price]) }));

    return { backs, lays };
  }
}
