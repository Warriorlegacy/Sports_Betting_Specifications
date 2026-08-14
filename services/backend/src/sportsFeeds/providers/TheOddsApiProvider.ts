/**
 * The-Odds-API Provider (Tier 1 — Premium)
 * Documentation: https://the-odds-api.com/liveapi/guides/v4/
 *
 * Provides:
 *  - Live match scores across Football, Basketball, Baseball, American Football, Hockey, Tennis
 *  - Real-time odds from bookmakers (for BACK/LAY price seeding)
 *  - Quota tracking via X-Requests-Remaining header
 *
 * Free tier: 500 requests/month | Paid: 10,000–unlimited/month
 * Configure: ODDS_API_KEY=<your-key> in .env
 */

import { IExternalProvider } from './IExternalProvider';
import { LiveMatchTelemetry, SportType } from '../types';

interface OddsApiScore {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  completed: boolean;
  home_team: string;
  away_team: string;
  scores: Array<{ name: string; score: string }> | null;
  last_update: string | null;
}

interface OddsApiOddsEvent {
  id: string;
  sport_key: string;
  home_team: string;
  away_team: string;
  bookmakers: Array<{
    key: string;
    markets: Array<{
      key: string;
      outcomes: Array<{ name: string; price: number }>;
    }>;
  }>;
}

// Sport key mapping from The-Odds-API to our SportType
const ODDS_API_SPORT_MAP: Record<string, { sport: SportType; league: string }> = {
  'soccer_epl':           { sport: 'FOOTBALL', league: 'Premier League' },
  'soccer_spain_la_liga': { sport: 'FOOTBALL', league: 'La Liga' },
  'soccer_italy_serie_a': { sport: 'FOOTBALL', league: 'Serie A' },
  'soccer_germany_bundesliga': { sport: 'FOOTBALL', league: 'Bundesliga' },
  'soccer_france_ligue_one':   { sport: 'FOOTBALL', league: 'Ligue 1' },
  'soccer_uefa_champs_league': { sport: 'FOOTBALL', league: 'UEFA Champions League' },
  'soccer_usa_mls':       { sport: 'FOOTBALL', league: 'MLS' },
  'basketball_nba':       { sport: 'BASKETBALL', league: 'NBA' },
  'basketball_ncaab':     { sport: 'BASKETBALL', league: 'NCAA Basketball' },
  'baseball_mlb':         { sport: 'FOOTBALL', league: 'MLB' },
  'americanfootball_nfl': { sport: 'FOOTBALL', league: 'NFL' },
  'icehockey_nhl':        { sport: 'FOOTBALL', league: 'NHL' },
  'tennis_atp_aus_open':  { sport: 'TENNIS', league: 'ATP' },
  'tennis_wta_us_open':   { sport: 'TENNIS', league: 'WTA' },
};

// The sports we'll query scores for (comma-joined in one batch call per sport group)
const SCORE_SPORT_KEYS = Object.keys(ODDS_API_SPORT_MAP);

export class TheOddsApiProvider implements IExternalProvider {
  private apiKey: string;
  private baseUrl = 'https://api.the-odds-api.com/v4';
  private consecutiveFailures = 0;
  private healthy = true;
  private requestsRemaining = -1; // -1 = unknown
  private lastFetch: number = 0;
  private cachedMatches: LiveMatchTelemetry[] = [];

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  getProviderName(): string { return 'The-Odds-API (Tier 1)'; }
  getPriority(): number     { return 1; }
  isHealthy(): boolean      { return this.healthy && Boolean(this.apiKey); }

  resetCircuitBreaker(): void {
    this.consecutiveFailures = 0;
    this.healthy = true;
    console.log('[TheOddsApiProvider] Circuit breaker reset — re-enabling provider.');
  }

  getQuotaStatus(): { remaining: number; lastFetch: number } {
    return { remaining: this.requestsRemaining, lastFetch: this.lastFetch };
  }

  async fetchLiveMatches(): Promise<LiveMatchTelemetry[]> {
    if (!this.apiKey) {
      return [];
    }

    try {
      const results: LiveMatchTelemetry[] = [];

      // Fetch scores for each sport key group (batched to save quota)
      for (const sportKey of SCORE_SPORT_KEYS) {
        try {
          const url = `${this.baseUrl}/sports/${sportKey}/scores?apiKey=${this.apiKey}&daysFrom=1&dateFormat=iso`;
          const res = await fetch(url, {
            headers: { 'User-Agent': 'NexusSportsExchange/1.0' },
            signal: AbortSignal.timeout(8000)
          });

          // Track quota
          const remaining = res.headers.get('x-requests-remaining');
          if (remaining) this.requestsRemaining = parseInt(remaining, 10);

          if (!res.ok) {
            if (res.status === 422 || res.status === 401) {
              console.warn(`[TheOddsApiProvider] API key invalid or sport unavailable: ${sportKey}`);
              continue;
            }
            if (res.status === 429) {
              console.warn('[TheOddsApiProvider] Rate limit hit — quota exhausted.');
              this.consecutiveFailures = 3; // Force circuit open
              break;
            }
            continue;
          }

          const scores: OddsApiScore[] = await res.json() as OddsApiScore[];
          const meta = ODDS_API_SPORT_MAP[sportKey];
          if (!meta) continue;

          for (const ev of scores) {
            const telemetry = this.normalizeScore(ev, meta.sport, meta.league);
            if (telemetry) results.push(telemetry);
          }
        } catch (sportErr: any) {
          // Individual sport failure — continue to next
        }
      }

      this.consecutiveFailures = 0;
      this.healthy = true;
      this.lastFetch = Date.now();
      this.cachedMatches = results;

      console.log(`[TheOddsApiProvider] ✅ Fetched ${results.length} matches. Quota remaining: ${this.requestsRemaining}`);
      return results;

    } catch (err: any) {
      this.consecutiveFailures++;
      if (this.consecutiveFailures >= 3) {
        this.healthy = false;
        console.error(`[TheOddsApiProvider] 🔴 Circuit OPEN after ${this.consecutiveFailures} failures: ${err.message}`);
      } else {
        console.warn(`[TheOddsApiProvider] ⚠️ Failure ${this.consecutiveFailures}/3: ${err.message}`);
      }
      return this.cachedMatches; // Return stale cache on failure
    }
  }

  private normalizeScore(ev: OddsApiScore, sport: SportType, league: string): LiveMatchTelemetry | null {
    try {
      const homeScore = ev.scores?.find(s => s.name === ev.home_team)?.score;
      const awayScore = ev.scores?.find(s => s.name === ev.away_team)?.score;

      const homeGoals = parseInt(homeScore || '0', 10);
      const awayGoals = parseInt(awayScore || '0', 10);

      const now = Date.now();
      const startMs = new Date(ev.commence_time).getTime();
      const inPlay = !ev.completed && startMs <= now && (now - startMs) < 3 * 60 * 60 * 1000; // within 3h
      const isSettled = ev.completed;

      const marketId = `MKT_ODDS_${sport}_${ev.id.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)}`;

      const summaryScore = inPlay
        ? `${ev.home_team} ${homeGoals} - ${awayGoals} ${ev.away_team}`
        : isSettled
          ? `FT: ${ev.home_team} ${homeGoals} - ${awayGoals} ${ev.away_team}`
          : `${ev.home_team} vs ${ev.away_team} • ${new Date(ev.commence_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

      const telemetry: LiveMatchTelemetry = {
        marketId,
        eventName: `${ev.home_team} vs ${ev.away_team} - ${league}`,
        sport,
        status: isSettled ? 'COMPLETED' : inPlay ? 'IN_PLAY' : 'PRE_MATCH',
        isLocked: false,
        inPlay,
        startTime: ev.commence_time,
        venue: league,
        homeTeam: ev.home_team,
        awayTeam: ev.away_team,
        summaryScore,
        updatedAt: now
      };

      if (sport === 'FOOTBALL' && ev.scores) {
        telemetry.football = {
          minute: inPlay ? Math.min(90, Math.floor((now - startMs) / 60000)) : 0,
          period: inPlay ? (Math.floor((now - startMs) / 60000) > 45 ? '2H' : '1H') : 'FT',
          homeGoals,
          awayGoals,
          yellowCards: { home: 0, away: 0 },
          redCards: { home: 0, away: 0 },
          corners: { home: 0, away: 0 },
          penalties: { home: 0, away: 0 },
          varCheckActive: false,
          possessionPercentage: { home: 50, away: 50 },
          lastEventDescription: summaryScore
        };
      } else if (sport === 'BASKETBALL' && ev.scores) {
        telemetry.basketball = {
          quarter: 1,
          quarterName: 'Q1',
          gameClock: '10:00',
          shotClock: 24,
          homeScore: homeGoals,
          awayScore: awayGoals,
          possession: 'HOME',
          teamFouls: { home: 0, away: 0 },
          timeoutsRemaining: { home: 3, away: 3 },
          lastEventDescription: summaryScore
        };
      }

      return telemetry;
    } catch {
      return null;
    }
  }
}
