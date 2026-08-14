/**
 * Sportmonks Provider (Tier 2 — Premium Football)
 * Documentation: https://docs.sportmonks.com/football/
 *
 * Provides:
 *  - Live inplay football scores (goals, minute, cards, lineups)
 *  - 700+ leagues worldwide
 *  - Player stats & expected goals (xG)
 *
 * Plans: Developer (free, 200 req/h) | Pro ($49/mo) | Enterprise
 * Configure: SPORTMONKS_API_KEY=<your-key> in .env
 */

import { IExternalProvider } from './IExternalProvider';
import { LiveMatchTelemetry, SportType } from '../types';

interface SportmonksFixture {
  id: number;
  name: string;
  starting_at: string;
  status: {
    short_name: string; // '1H' | 'HT' | '2H' | 'ET' | 'FT' | 'NS' | 'LIVE'
    name: string;
    type: string;
  };
  minute: number | null;
  participants: Array<{
    id: number;
    name: string;
    meta: { location: 'home' | 'away' };
  }>;
  scores: Array<{
    score: { goals: number; participant: string };
    description: string;
  }>;
  league: { name: string; country: { name: string } };
  venue?: { name: string };
  statistics?: Array<{
    type: { name: string };
    participant: string;
    data: { value: number };
  }>;
}

export class SportmonksProvider implements IExternalProvider {
  private apiKey: string;
  private baseUrl = 'https://api.sportmonks.com/v3/football';
  private consecutiveFailures = 0;
  private healthy = true;
  private cachedMatches: LiveMatchTelemetry[] = [];
  private lastFetch: number = 0;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  getProviderName(): string { return 'Sportmonks (Tier 2)'; }
  getPriority(): number     { return 2; }
  isHealthy(): boolean      { return this.healthy && Boolean(this.apiKey); }

  resetCircuitBreaker(): void {
    this.consecutiveFailures = 0;
    this.healthy = true;
    console.log('[SportmonksProvider] Circuit breaker reset.');
  }

  async fetchLiveMatches(): Promise<LiveMatchTelemetry[]> {
    if (!this.apiKey) {
      return [];
    }

    try {
      // Fetch live inplay fixtures with participant scores and statistics
      const url = `${this.baseUrl}/livescores/inplay?api_token=${this.apiKey}&include=participants;scores;league;league.country;venue;statistics&per_page=50`;

      const res = await fetch(url, {
        headers: { 'User-Agent': 'NexusSportsExchange/1.0' },
        signal: AbortSignal.timeout(10000)
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => res.statusText);
        if (res.status === 401 || res.status === 403) {
          console.error('[SportmonksProvider] Invalid API key or plan restriction.');
          this.healthy = false;
          return this.cachedMatches;
        }
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }

      const data = await res.json() as any;
      const fixtures: SportmonksFixture[] = data.data || [];

      const results: LiveMatchTelemetry[] = fixtures
        .map(f => this.normalizeFixture(f))
        .filter((t): t is LiveMatchTelemetry => t !== null);

      // Also fetch today's scheduled fixtures (upcoming)
      try {
        const todayUrl = `${this.baseUrl}/fixtures/date/${new Date().toISOString().split('T')[0]}?api_token=${this.apiKey}&include=participants;scores;league&per_page=100`;
        const todayRes = await fetch(todayUrl, { signal: AbortSignal.timeout(8000) });
        if (todayRes.ok) {
          const todayData = await todayRes.json() as any;
          const upcomingFixtures: SportmonksFixture[] = todayData.data || [];
          for (const f of upcomingFixtures) {
            const t = this.normalizeFixture(f);
            if (t && !results.find(r => r.marketId === t.marketId)) {
              results.push(t);
            }
          }
        }
      } catch {
        // Upcoming fetch failure is non-critical
      }

      this.consecutiveFailures = 0;
      this.healthy = true;
      this.lastFetch = Date.now();
      this.cachedMatches = results;

      console.log(`[SportmonksProvider] ✅ Fetched ${results.length} football fixtures.`);
      return results;

    } catch (err: any) {
      this.consecutiveFailures++;
      if (this.consecutiveFailures >= 3) {
        this.healthy = false;
        console.error(`[SportmonksProvider] 🔴 Circuit OPEN: ${err.message}`);
      } else {
        console.warn(`[SportmonksProvider] ⚠️ Failure ${this.consecutiveFailures}/3: ${err.message}`);
      }
      return this.cachedMatches;
    }
  }

  private normalizeFixture(f: SportmonksFixture): LiveMatchTelemetry | null {
    try {
      const home = f.participants?.find(p => p.meta?.location === 'home');
      const away = f.participants?.find(p => p.meta?.location === 'away');
      if (!home || !away) return null;

      const homeTeam = home.name;
      const awayTeam = away.name;

      // Extract final score from scores array
      const getCurrentScore = (participantName: string): number => {
        const scoreEntry = f.scores?.find(s =>
          s.description === 'CURRENT' && s.score.participant === participantName
        );
        return scoreEntry?.score.goals ?? 0;
      };

      const homeGoals = getCurrentScore(homeTeam);
      const awayGoals = getCurrentScore(awayTeam);

      const statusShort = f.status?.short_name || 'NS';
      const inPlay = ['1H', '2H', 'HT', 'ET', 'LIVE', 'INT'].includes(statusShort);
      const isSettled = ['FT', 'AET', 'PEN', 'WO', 'CANC', 'ABD'].includes(statusShort);

      const periodMap: Record<string, '1H' | 'HT' | '2H' | 'ET' | 'FT'> = {
        '1H': '1H', 'HT': 'HT', '2H': '2H', 'ET': 'ET', 'FT': 'FT',
        'LIVE': '1H', 'INT': 'HT'
      };

      const league = f.league?.name || 'Football';
      const country = f.league?.country?.name || 'Global';
      const minute = f.minute || 0;

      const marketId = `MKT_SPM_${f.id}`;

      // Extract statistics
      const getStat = (typeName: string, participant: string): number => {
        const stat = f.statistics?.find(s =>
          s.type?.name?.toLowerCase().includes(typeName.toLowerCase()) &&
          s.participant === participant
        );
        return stat?.data?.value ?? 0;
      };

      const homePossession = getStat('ball possession', homeTeam) || 50;
      const awayPossession = 100 - homePossession;
      const homeYellow = getStat('yellowcard', homeTeam);
      const awayYellow = getStat('yellowcard', awayTeam);
      const homeRed = getStat('redcard', homeTeam);
      const awayRed = getStat('redcard', awayTeam);
      const homeCorners = getStat('corner', homeTeam);
      const awayCorners = getStat('corner', awayTeam);

      const summaryScore = inPlay
        ? `${minute}' • ${homeTeam} ${homeGoals} - ${awayGoals} ${awayTeam}`
        : isSettled
          ? `FT: ${homeTeam} ${homeGoals} - ${awayGoals} ${awayTeam}`
          : `${homeTeam} vs ${awayTeam} • ${new Date(f.starting_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

      const telemetry: LiveMatchTelemetry = {
        marketId,
        eventName: `${homeTeam} vs ${awayTeam} - ${league}`,
        sport: 'FOOTBALL',
        status: isSettled ? 'COMPLETED' : inPlay ? 'IN_PLAY' : 'PRE_MATCH',
        isLocked: false,
        inPlay,
        startTime: f.starting_at,
        venue: f.venue?.name || league,
        homeTeam,
        awayTeam,
        summaryScore,
        updatedAt: Date.now(),
        football: {
          minute,
          period: periodMap[statusShort] || '1H',
          homeGoals,
          awayGoals,
          yellowCards: { home: homeYellow, away: awayYellow },
          redCards: { home: homeRed, away: awayRed },
          corners: { home: homeCorners, away: awayCorners },
          penalties: { home: 0, away: 0 },
          varCheckActive: false,
          possessionPercentage: { home: homePossession, away: awayPossession },
          lastEventDescription: summaryScore
        }
      };

      return telemetry;
    } catch {
      return null;
    }
  }
}
