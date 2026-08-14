/**
 * FailoverFeedOrchestrator
 * ========================
 * Manages a 4-tier priority chain of sports data providers with automatic
 * failover, circuit breaker pattern, and per-provider health monitoring.
 *
 * Priority Chain:
 *   Tier 1: The-Odds-API  (real odds + scores, premium)
 *   Tier 2: Sportmonks    (football specialist, premium)
 *   Tier 3: CricAPI       (cricket specialist, freemium)
 *   Tier 4: ESPN Free API (always available, no key)
 *   Tier 5: Simulator     (offline fallback, internal)
 *
 * Behavior:
 *   - Each provider runs independently (not in sequence for speed)
 *   - Results are merged: higher-priority provider data wins for the same match
 *   - Unhealthy providers are skipped; re-probed every PROBE_INTERVAL_MS
 *   - Provider health status is exposed via getHealthReport()
 */

import { IExternalProvider } from './providers/IExternalProvider';
import { TheOddsApiProvider } from './providers/TheOddsApiProvider';
import { SportmonksProvider } from './providers/SportmonksProvider';
import { CricApiProvider } from './providers/CricApiProvider';
import { LiveMatchTelemetry } from './types';
import { config } from '../config';

interface ProviderHealthRecord {
  name: string;
  priority: number;
  healthy: boolean;
  lastFetchAt: number | null;
  lastFetchCount: number;
  consecutiveFailures: number;
  nextProbeAt: number | null;
  keyConfigured: boolean;
}

// Re-probe an unhealthy provider after 5 minutes
const PROBE_INTERVAL_MS = 5 * 60 * 1000;

export class FailoverFeedOrchestrator {
  private providers: IExternalProvider[] = [];
  private healthRecords: Map<string, ProviderHealthRecord> = new Map();
  private mergedCache: Map<string, LiveMatchTelemetry> = new Map();
  private isRunning = false;
  private pollInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initProviders();
  }

  private initProviders(): void {
    const oddsApiKey   = config.theOddsApiKey;
    const sportmonksKey = config.sportmonksApiKey;
    const cricApiKey   = config.cricApiKey;

    const providerList: IExternalProvider[] = [
      new TheOddsApiProvider(oddsApiKey),
      new SportmonksProvider(sportmonksKey),
      new CricApiProvider(cricApiKey)
      // ESPN is handled by RealSportsFeedService (Tier 4)
      // Simulator adapters are handled by LiveFeedManager (Tier 5)
    ];

    this.providers = providerList;

    for (const p of this.providers) {
      this.healthRecords.set(p.getProviderName(), {
        name: p.getProviderName(),
        priority: p.getPriority(),
        healthy: p.isHealthy(),
        lastFetchAt: null,
        lastFetchCount: 0,
        consecutiveFailures: 0,
        nextProbeAt: null,
        keyConfigured: p.isHealthy()
      });
    }

    console.log('[FailoverOrchestrator] Initialized providers:');
    for (const [name, rec] of this.healthRecords) {
      console.log(`  [${rec.priority}] ${name} — key configured: ${rec.keyConfigured}`);
    }
  }

  /**
   * Start polling all providers on a configurable interval.
   * Default: every 30 seconds
   */
  public start(intervalMs: number = 30000): void {
    if (this.isRunning) return;
    this.isRunning = true;

    // Initial fetch
    this.fetchAll();

    this.pollInterval = setInterval(() => {
      this.fetchAll();
    }, intervalMs);

    console.log(`[FailoverOrchestrator] Started — polling every ${intervalMs / 1000}s`);
  }

  public stop(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.isRunning = false;
  }

  /**
   * Run all configured (healthy) providers in parallel,
   * merge results by market ID with priority-based conflict resolution.
   */
  public async fetchAll(): Promise<LiveMatchTelemetry[]> {
    const now = Date.now();

    // Re-probe providers that were unhealthy but are due for a probe
    for (const p of this.providers) {
      const rec = this.healthRecords.get(p.getProviderName())!;
      if (!rec.healthy && rec.nextProbeAt && now >= rec.nextProbeAt) {
        console.log(`[FailoverOrchestrator] Re-probing ${p.getProviderName()}...`);
        p.resetCircuitBreaker();
        rec.healthy = true;
        rec.nextProbeAt = null;
      }
    }

    // Fetch from all healthy providers in parallel
    const fetchTasks = this.providers
      .filter(p => p.isHealthy())
      .map(async (p) => {
        try {
          const matches = await p.fetchLiveMatches();
          const rec = this.healthRecords.get(p.getProviderName())!;

          if (matches.length >= 0) {
            rec.lastFetchAt = Date.now();
            rec.lastFetchCount = matches.length;
            rec.consecutiveFailures = 0;
            rec.healthy = true;
          }

          return { priority: p.getPriority(), matches };
        } catch (err: any) {
          const rec = this.healthRecords.get(p.getProviderName())!;
          rec.consecutiveFailures++;
          if (rec.consecutiveFailures >= 3) {
            rec.healthy = false;
            rec.nextProbeAt = Date.now() + PROBE_INTERVAL_MS;
            console.error(`[FailoverOrchestrator] ❌ ${p.getProviderName()} disabled (${rec.consecutiveFailures} failures). Next probe: ${new Date(rec.nextProbeAt).toISOString()}`);
          }
          return { priority: p.getPriority(), matches: [] };
        }
      });

    const results = await Promise.allSettled(fetchTasks);

    // Merge: lower priority number wins when same marketId exists
    const mergeMap = new Map<string, { priority: number; telemetry: LiveMatchTelemetry }>();

    for (const result of results) {
      if (result.status !== 'fulfilled') continue;
      const { priority, matches } = result.value;

      for (const match of matches) {
        const existing = mergeMap.get(match.marketId);
        if (!existing || priority < existing.priority) {
          mergeMap.set(match.marketId, { priority, telemetry: match });
        }
      }
    }

    // Update persistent cache
    for (const [id, { telemetry }] of mergeMap) {
      this.mergedCache.set(id, telemetry);
    }

    const allMatches = Array.from(this.mergedCache.values());
    console.log(`[FailoverOrchestrator] Total third-party matches cached: ${allMatches.length}`);
    return allMatches;
  }

  /**
   * Return currently cached matches (no network call)
   */
  public getCachedMatches(): LiveMatchTelemetry[] {
    return Array.from(this.mergedCache.values());
  }

  /**
   * Get detailed health report for all providers (used by admin API)
   */
  public getHealthReport(): {
    providers: ProviderHealthRecord[];
    totalCachedMatches: number;
    activeTier: string;
  } {
    const providers = Array.from(this.healthRecords.values()).sort(
      (a, b) => a.priority - b.priority
    );

    const activeTier = providers.find(p => p.healthy && p.keyConfigured)?.name
      || 'ESPN Free API (Tier 4) / Simulator (Tier 5)';

    return {
      providers,
      totalCachedMatches: this.mergedCache.size,
      activeTier
    };
  }

  /**
   * Force-test a specific provider by name (admin tool)
   */
  public async testProvider(providerName: string): Promise<{
    provider: string;
    matchCount: number;
    success: boolean;
    error?: string;
    sampleMatches: Partial<LiveMatchTelemetry>[];
  }> {
    const provider = this.providers.find(
      p => p.getProviderName().toLowerCase().includes(providerName.toLowerCase())
    );

    if (!provider) {
      return { provider: providerName, matchCount: 0, success: false, error: 'Provider not found', sampleMatches: [] };
    }

    try {
      const matches = await provider.fetchLiveMatches();
      return {
        provider: provider.getProviderName(),
        matchCount: matches.length,
        success: true,
        sampleMatches: matches.slice(0, 3).map((m: LiveMatchTelemetry) => ({
          marketId: m.marketId,
          eventName: m.eventName,
          sport: m.sport,
          status: m.status,
          summaryScore: m.summaryScore
        }))
      };
    } catch (err: any) {
      return {
        provider: provider.getProviderName(),
        matchCount: 0,
        success: false,
        error: err.message,
        sampleMatches: []
      };
    }
  }
}

export const failoverFeedOrchestrator = new FailoverFeedOrchestrator();
