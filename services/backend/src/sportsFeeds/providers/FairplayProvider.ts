import { IExternalProvider } from './IExternalProvider';
import { LiveMatchTelemetry, SportType, RealRunnerOdds } from '../types';

export class FairplayProvider implements IExternalProvider {
  private baseUrl = 'https://central.zplay1.in/pb/api/v1';
  private consecutiveFailures = 0;
  private healthy = true;
  private lastFetch: number = 0;
  private cachedMatches: LiveMatchTelemetry[] = [];

  getProviderName(): string { return 'Fairplay / ZPlay Exchange (Tier 0)'; }
  getPriority(): number     { return 0; } // Highest priority
  isHealthy(): boolean      { return this.healthy; }

  resetCircuitBreaker(): void {
    this.consecutiveFailures = 0;
    this.healthy = true;
  }

  getQuotaStatus(): { remaining: number; lastFetch: number } {
    return { remaining: 999999, lastFetch: this.lastFetch }; // Unlimited free endpoint
  }

  async fetchLiveMatches(): Promise<LiveMatchTelemetry[]> {
    try {
      const res = await fetch(`${this.baseUrl}/events/matches/all`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        signal: AbortSignal.timeout(10000)
      });

      if (!res.ok) {
        this.consecutiveFailures++;
        if (this.consecutiveFailures >= 5) this.healthy = false;
        return this.cachedMatches;
      }

      const json: any = await res.json();
      const events: any[] = json.data || [];
      const results: LiveMatchTelemetry[] = [];

      const sportMap: Record<string, SportType> = {
        cricket: 'CRICKET',
        soccer: 'FOOTBALL',
        tennis: 'TENNIS',
        basketball: 'BASKETBALL',
        'table tennis': 'TENNIS',
        baseball: 'FOOTBALL',
        'ice hockey': 'FOOTBALL',
        volleyball: 'FOOTBALL'
      };

      for (const ev of events) {
        try {
          const rawSport = (ev.sport_name || '').toLowerCase();
          const sport: SportType = sportMap[rawSport] || 'FOOTBALL';

          const names = (ev.event_name || '').split(/ v | vs /i);
          const homeTeam = names[0]?.trim() || ev.runnerNames?.[0]?.RN || 'Home Team';
          const awayTeam = names[1]?.trim() || ev.runnerNames?.[1]?.RN || 'Away Team';

          const inPlay = Boolean(ev.inplay || ev.isMatchLive);
          const isSettled = ev.status === 'CLOSED' || ev.status === 'SETTLED';

          // Parse Betfair-style Back / Lay runners
          const selections: RealRunnerOdds[] = [];
          if (Array.isArray(ev.runners)) {
            ev.runners.forEach((r: any, idx: number) => {
              const runnerNameObj = ev.runnerNames?.find((n: any) => n.SID === r.sid);
              const name = runnerNameObj?.RN || (idx === 0 ? homeTeam : idx === 1 ? awayTeam : `Selection ${idx + 1}`);

              const bestBack = r.ex?.b?.[0];
              const bestLay = r.ex?.l?.[0];

              const backPrice = bestBack?.p || 1.95;
              const layPrice = bestLay?.p || +(backPrice + 0.04).toFixed(2);
              const backVolume = parseFloat(bestBack?.s || '5000');
              const layVolume = parseFloat(bestLay?.s || '5000');

              const depth = (r.ex?.b || []).map((b: any) => ({
                price: b.p,
                size: parseFloat(b.s || '1000')
              }));

              selections.push({
                selectionId: r.sid || (idx + 1),
                name,
                backPrice,
                layPrice,
                backVolume,
                layVolume,
                depth: depth.length > 0 ? depth : undefined
              });
            });
          }

          if (selections.length === 0) {
            selections.push(
              { selectionId: 1, name: homeTeam, backPrice: 1.95, layPrice: 1.99, backVolume: 5000, layVolume: 5000 },
              { selectionId: 2, name: awayTeam, backPrice: 1.95, layPrice: 1.99, backVolume: 5000, layVolume: 5000 }
            );
          }

          const telemetry: LiveMatchTelemetry = {
            marketId: ev.market_id || `ZPLAY_${ev.event_id || ev.matchId}`,
            eventName: ev.event_name || `${homeTeam} vs ${awayTeam}`,
            sport,
            status: isSettled ? 'SETTLED' : inPlay ? 'IN_PLAY' : 'PRE_MATCH',
            isLocked: Boolean(ev.is_sus),
            inPlay,
            startTime: ev.event_date || new Date().toISOString(),
            venue: ev.league_name || 'World Tournament',
            homeTeam,
            awayTeam,
            summaryScore: inPlay ? 'Live In-Play' : 'Pre-Match',
            realOdds: {
              marketName: 'Match Odds (Exchange)',
              selections
            },
            updatedAt: Date.now()
          };

          results.push(telemetry);
        } catch {
          // Skip malformed match item
        }
      }

      this.consecutiveFailures = 0;
      this.healthy = true;
      this.lastFetch = Date.now();
      this.cachedMatches = results;
      return results;
    } catch {
      this.consecutiveFailures++;
      if (this.consecutiveFailures >= 5) this.healthy = false;
      return this.cachedMatches;
    }
  }
}
