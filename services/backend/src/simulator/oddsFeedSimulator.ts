import { matchingEngineService } from '../realtime/matchingEngineService';
import { realTimeGateway } from '../realtime/socketGateway';
import { query } from '../db/pool';

interface MarketSimulationConfig {
  marketId: string;
  selections: {
    selectionId: number;
    basePrice: number;
    volatility: number;
  }[];
}

export class OddsFeedSimulator {
  private intervalTimer: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  private simulationMarkets: MarketSimulationConfig[] = [
    {
      marketId: 'MKT_IND_AUS_T20',
      selections: [
        { selectionId: 1, basePrice: 1.82, volatility: 0.04 }, // India
        { selectionId: 2, basePrice: 2.18, volatility: 0.05 }  // Australia
      ]
    },
    {
      marketId: 'MKT_ARS_CHE_PL',
      selections: [
        { selectionId: 1, basePrice: 2.04, volatility: 0.03 }, // Arsenal
        { selectionId: 2, basePrice: 3.65, volatility: 0.06 }, // Chelsea
        { selectionId: 3, basePrice: 3.40, volatility: 0.04 }  // Draw
      ]
    },
    {
      marketId: 'MKT_ALC_SIN_WIM',
      selections: [
        { selectionId: 1, basePrice: 1.91, volatility: 0.03 }, // Alcaraz
        { selectionId: 2, basePrice: 1.95, volatility: 0.03 }  // Sinner
      ]
    }
  ];

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('Odds Feed Simulator & Liquidity Seeder started.');

    // Seed initial liquidity
    this.seedAllMarkets();

    // Run periodic market price oscillations & liquidity refreshes every 2.5 seconds
    this.intervalTimer = setInterval(() => {
      this.tick();
    }, 2500);
  }

  public stop(): void {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
    this.isRunning = false;
    console.log('Odds Feed Simulator stopped.');
  }

  private async seedAllMarkets(): Promise<void> {
    for (const sim of this.simulationMarkets) {
      await this.seedMarketLiquidity(sim);
    }
  }

  private async seedMarketLiquidity(sim: MarketSimulationConfig): Promise<void> {
    const botUserId = '00000000-0000-0000-0000-000000000000'; // Admin genesis account acts as LP

    for (const sel of sim.selections) {
      // Random price wiggle
      const delta = (Math.random() - 0.5) * sel.volatility;
      const currentMid = Math.max(1.05, Math.round((sel.basePrice + delta) * 100) / 100);

      const bestBack = Math.max(1.02, Math.round((currentMid - 0.01) * 100) / 100);
      const back2 = Math.max(1.01, Math.round((bestBack - 0.02) * 100) / 100);
      const back3 = Math.max(1.01, Math.round((bestBack - 0.04) * 100) / 100);

      const bestLay = Math.round((currentMid + 0.01) * 100) / 100;
      const lay2 = Math.round((bestLay + 0.02) * 100) / 100;
      const lay3 = Math.round((bestLay + 0.04) * 100) / 100;

      // Seed 3 depth levels of Back orders (Bids)
      const backQuotes = [
        { price: bestBack, stake: 500 + Math.floor(Math.random() * 2500) },
        { price: back2, stake: 1000 + Math.floor(Math.random() * 5000) },
        { price: back3, stake: 2500 + Math.floor(Math.random() * 10000) }
      ];

      // Seed 3 depth levels of Lay orders (Asks)
      const layQuotes = [
        { price: bestLay, stake: 500 + Math.floor(Math.random() * 2500) },
        { price: lay2, stake: 1000 + Math.floor(Math.random() * 5000) },
        { price: lay3, stake: 2500 + Math.floor(Math.random() * 10000) }
      ];

      for (const bq of backQuotes) {
        const betId = `BOT_B_${sim.marketId}_${sel.selectionId}_${bq.price.toFixed(2)}`;
        await matchingEngineService.submitOrder({
          betId,
          userId: botUserId,
          marketId: sim.marketId,
          selectionId: sel.selectionId,
          type: 'BACK',
          price: bq.price,
          stake: bq.stake
        }).catch(() => {});
      }

      for (const lq of layQuotes) {
        const betId = `BOT_L_${sim.marketId}_${sel.selectionId}_${lq.price.toFixed(2)}`;
        await matchingEngineService.submitOrder({
          betId,
          userId: botUserId,
          marketId: sim.marketId,
          selectionId: sel.selectionId,
          type: 'LAY',
          price: lq.price,
          stake: lq.stake
        }).catch(() => {});
      }
    }

    realTimeGateway.broadcastOrderBookUpdate(sim.marketId);
  }

  private async tick(): Promise<void> {
    try {
      // Pick a random market to update
      const sim = this.simulationMarkets[Math.floor(Math.random() * this.simulationMarkets.length)];
      await this.seedMarketLiquidity(sim);
    } catch (e) {
      // Simulator errors ignored silently
    }
  }
}

export const oddsFeedSimulator = new OddsFeedSimulator();
