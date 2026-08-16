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
import { failoverFeedOrchestrator } from './FailoverFeedOrchestrator';
import { config } from '../config';

export class LiveFeedManager {
  private adapters: Map<SportType, IFeedAdapter> = new Map();
  private liveMatches: Map<string, LiveMatchTelemetry> = new Map();
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

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    console.log('[LiveFeedManager] Real Multi-Sport Ingestion Engine started.');

    // Start real-world ESPN sports feeder (Tier 4)
    realSportsFeedService.start();

    // Start third-party provider failover orchestrator (Tiers 1-3)
    failoverFeedOrchestrator.start(config.feedPollIntervalMs);
    console.log('[LiveFeedManager] FailoverFeedOrchestrator (Tiers 1-3) started.');
  }

  public stop(): void {
    realSportsFeedService.stop();
    failoverFeedOrchestrator.stop();
    this.isRunning = false;
    console.log('[LiveFeedManager] Ingestion Engine paused.');
  }

  /**
   * Returns all live matches from real data sources only:
   *   Tier 1-3: Third-party providers (The-Odds-API, Sportmonks, CricAPI)
   *   Tier 4:   ESPN Free API (RealSportsFeedService)
   */
  public getAllLiveMatches(): LiveMatchTelemetry[] {
    const mergeMap = new Map<string, { priority: number; telemetry: LiveMatchTelemetry }>();

    // Tier 4: ESPN Free API matches
    for (const t of realSportsFeedService.getAllRealTelemetry()) {
      mergeMap.set(t.marketId, { priority: 4, telemetry: t });
    }

    // Tier 1-3: Third-party provider matches (override ESPN if same match)
    for (const t of failoverFeedOrchestrator.getCachedMatches()) {
      const existing = mergeMap.get(t.marketId);
      if (!existing || 1 < existing.priority) {
        mergeMap.set(t.marketId, { priority: 1, telemetry: t });
      }
    }

    return Array.from(mergeMap.values()).map(v => v.telemetry);
  }

  public getMatchTelemetry(marketId: string): LiveMatchTelemetry | undefined {
    return (
      failoverFeedOrchestrator.getCachedMatches().find(m => m.marketId === marketId) ||
      realSportsFeedService.getTelemetry(marketId) ||
      undefined
    );
  }

  /**
   * Ingests external provider data (Webhook / REST push)
   */
  public async submitExternalTelemetry(telemetry: LiveMatchTelemetry): Promise<void> {
    this.liveMatches.set(telemetry.marketId, telemetry);
    realTimeGateway.broadcastMatchTelemetry(telemetry.marketId, telemetry);
  }
}

export const liveFeedManager = new LiveFeedManager();


