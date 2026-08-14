import { IFeedAdapter } from './interfaces/IFeedAdapter';
import { LiveMatchTelemetry, SportType } from './types';
import { CricketFeedAdapter } from './adapters/CricketFeedAdapter';
import { TennisFeedAdapter } from './adapters/TennisFeedAdapter';
import { BasketballFeedAdapter } from './adapters/BasketballFeedAdapter';
import { FootballFeedAdapter } from './adapters/FootballFeedAdapter';
import { matchingEngineService } from '../realtime/matchingEngineService';
import { realTimeGateway } from '../realtime/socketGateway';
import { query } from '../db/pool';
import { realSportsFeedService } from './RealSportsFeedService';

export class LiveFeedManager {

  private adapters: Map<SportType, IFeedAdapter> = new Map();
  private liveMatches: Map<string, LiveMatchTelemetry> = new Map();
  private intervalTimer: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  constructor() {
    this.registerAdapter('CRICKET', new CricketFeedAdapter());
    this.registerAdapter('TENNIS', new TennisFeedAdapter());
    this.registerAdapter('BASKETBALL', new BasketballFeedAdapter());
    this.registerAdapter('FOOTBALL', new FootballFeedAdapter());
  }

  public registerAdapter(sport: SportType, adapter: IFeedAdapter): void {
    this.adapters.set(sport, adapter);
  }

  public initDefaultMatches(): void {
    const defaultConfigs: {
      marketId: string;
      eventName: string;
      sport: SportType;
      homeTeam: string;
      awayTeam: string;
    }[] = [
      {
        marketId: 'MKT_IND_AUS_T20',
        eventName: 'India vs Australia - 2nd T20 International',
        sport: 'CRICKET',
        homeTeam: 'India',
        awayTeam: 'Australia'
      },
      {
        marketId: 'MKT_ARS_CHE_PL',
        eventName: 'Arsenal vs Chelsea - Premier League Derby',
        sport: 'FOOTBALL',
        homeTeam: 'Arsenal',
        awayTeam: 'Chelsea'
      },
      {
        marketId: 'MKT_ALC_SIN_WIM',
        eventName: 'Carlos Alcaraz vs Jannik Sinner - Wimbledon Final',
        sport: 'TENNIS',
        homeTeam: 'Carlos Alcaraz',
        awayTeam: 'Jannik Sinner'
      },
      {
        marketId: 'MKT_LAL_BOS_NBA',
        eventName: 'Los Angeles Lakers vs Boston Celtics - NBA Showcase',
        sport: 'BASKETBALL',
        homeTeam: 'LA Lakers',
        awayTeam: 'Boston Celtics'
      }
    ];

    for (const conf of defaultConfigs) {
      const adapter = this.adapters.get(conf.sport);
      if (adapter) {
        const initial = adapter.getInitialTelemetry(conf.marketId, conf.eventName, conf.homeTeam, conf.awayTeam);
        this.liveMatches.set(conf.marketId, initial);
      }
    }
  }

  public start(): void {

    if (this.isRunning) return;
    this.isRunning = true;
    this.initDefaultMatches();

    console.log('[LiveFeedManager] Multi-Sport In-Play Ingestion Engine started.');

    // Start real-world sports feeder
    realSportsFeedService.start();

    // Step simulation every 2.5 seconds
    this.intervalTimer = setInterval(() => {
      this.tick();
    }, 2500);
  }

  public stop(): void {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
    realSportsFeedService.stop();
    this.isRunning = false;
    console.log('[LiveFeedManager] In-Play Ingestion Engine paused.');
  }

  public getAllLiveMatches(): LiveMatchTelemetry[] {
    const realMatches = realSportsFeedService.getAllRealTelemetry();
    const simulatedMatches = Array.from(this.liveMatches.values());
    return [...realMatches, ...simulatedMatches];
  }

  public getMatchTelemetry(marketId: string): LiveMatchTelemetry | undefined {
    return realSportsFeedService.getTelemetry(marketId) || this.liveMatches.get(marketId);
  }


  /**
   * Ingests external provider data (Webhook / REST polling)
   */
  public async submitExternalTelemetry(telemetry: LiveMatchTelemetry): Promise<void> {
    this.liveMatches.set(telemetry.marketId, telemetry);
    realTimeGateway.broadcastMatchTelemetry(telemetry.marketId, telemetry);
  }

  private async tick(): Promise<void> {
    try {
      const matchEntries = Array.from(this.liveMatches.entries());
      if (matchEntries.length === 0) return;

      // Pick an in-play match to advance
      const [marketId, currentTelemetry] = matchEntries[Math.floor(Math.random() * matchEntries.length)];
      const adapter = this.adapters.get(currentTelemetry.sport);
      if (!adapter) return;

      const { updatedTelemetry, shouldSuspendMarket, oddsShifts } = adapter.stepSimulation(currentTelemetry);
      this.liveMatches.set(marketId, updatedTelemetry);

      // 1. Broadcast live point-by-point/ball-by-ball telemetry
      realTimeGateway.broadcastMatchTelemetry(marketId, updatedTelemetry);

      // 2. Handle market suspension kill-switch if critical event occurred (Wicket, Red Card, VAR, Break point)
      if (shouldSuspendMarket) {
        realTimeGateway.broadcastMarketLock(marketId, true);
        await query(`UPDATE markets SET is_locked = true WHERE id = $1`, [marketId]).catch(() => {});

        // Auto-resume after 4 seconds
        setTimeout(async () => {
          realTimeGateway.broadcastMarketLock(marketId, false);
          await query(`UPDATE markets SET is_locked = false WHERE id = $1`, [marketId]).catch(() => {});
          const t = this.liveMatches.get(marketId);
          if (t) {
            t.isLocked = false;
            realTimeGateway.broadcastMatchTelemetry(marketId, t);
          }
        }, 4000);
      }

      // 3. Inject dynamic liquidity quotes based on updated game state
      const botUserId = '00000000-0000-0000-0000-000000000000';
      for (const [selIdStr, odds] of Object.entries(oddsShifts)) {
        const selId = parseInt(selIdStr, 10);
        const backPrice = odds.bestBack;
        const layPrice = odds.bestLay;

        // Seed 3 depths for Back & Lay
        const backDepths = [
          { price: backPrice, stake: 2500 + Math.floor(Math.random() * 5000) },
          { price: Math.max(1.01, parseFloat((backPrice - 0.02).toFixed(2))), stake: 5000 + Math.floor(Math.random() * 10000) },
          { price: Math.max(1.01, parseFloat((backPrice - 0.04).toFixed(2))), stake: 10000 + Math.floor(Math.random() * 20000) }
        ];

        const layDepths = [
          { price: layPrice, stake: 2500 + Math.floor(Math.random() * 5000) },
          { price: parseFloat((layPrice + 0.02).toFixed(2)), stake: 5000 + Math.floor(Math.random() * 10000) },
          { price: parseFloat((layPrice + 0.04).toFixed(2)), stake: 10000 + Math.floor(Math.random() * 20000) }
        ];

        for (const bq of backDepths) {
          await matchingEngineService.submitOrder({
            betId: `BOT_B_${marketId}_${selId}_${bq.price.toFixed(2)}`,
            userId: botUserId,
            marketId,
            selectionId: selId,
            type: 'BACK',
            price: bq.price,
            stake: bq.stake
          }).catch(() => {});
        }

        for (const lq of layDepths) {
          await matchingEngineService.submitOrder({
            betId: `BOT_L_${marketId}_${selId}_${lq.price.toFixed(2)}`,
            userId: botUserId,
            marketId,
            selectionId: selId,
            type: 'LAY',
            price: lq.price,
            stake: lq.stake
          }).catch(() => {});
        }
      }

      realTimeGateway.broadcastOrderBookUpdate(marketId);
    } catch (e) {
      // Ignored silently during simulation
    }
  }
}

export const liveFeedManager = new LiveFeedManager();
