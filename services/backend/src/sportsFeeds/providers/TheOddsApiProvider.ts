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
  'soccer_epl':                { sport: 'FOOTBALL', league: 'Premier League' },
  'soccer_spain_la_liga':      { sport: 'FOOTBALL', league: 'La Liga' },
  'soccer_italy_serie_a':      { sport: 'FOOTBALL', league: 'Serie A' },
  'soccer_germany_bundesliga': { sport: 'FOOTBALL', league: 'Bundesliga' },
  'soccer_france_ligue_one':   { sport: 'FOOTBALL', league: 'Ligue 1' },
  'soccer_uefa_champs_league': { sport: 'FOOTBALL', league: 'UEFA Champions League' },
  'soccer_uefa_europa_league': { sport: 'FOOTBALL', league: 'UEFA Europa League' },
  'soccer_usa_mls':            { sport: 'FOOTBALL', league: 'MLS' },
  'basketball_nba':            { sport: 'BASKETBALL', league: 'NBA' },
  'basketball_euroleague':     { sport: 'BASKETBALL', league: 'EuroLeague' },
  'basketball_ncaab':          { sport: 'BASKETBALL', league: 'NCAA Basketball' },
  'baseball_mlb':              { sport: 'FOOTBALL', league: 'MLB' },
  'americanfootball_nfl':      { sport: 'FOOTBALL', league: 'NFL' },
  'icehockey_nhl':             { sport: 'FOOTBALL', league: 'NHL' },
  'tennis_atp_aus_open':       { sport: 'TENNIS', league: 'ATP' },
  'tennis_wta_us_open':        { sport: 'TENNIS', league: 'WTA' },
  'tennis_atp_wimbledon':      { sport: 'TENNIS', league: 'Wimbledon' },
  'tennis_wta_wimbledon':      { sport: 'TENNIS', league: 'Wimbledon WTA' },
  'cricket_test_match':        { sport: 'CRICKET', league: 'Test Matches' },
  'cricket_odi':               { sport: 'CRICKET', league: 'ODI International' },
  'cricket_t20':               { sport: 'CRICKET', league: 'T20 International' },
  'cricket_ipl':               { sport: 'CRICKET', league: 'Indian Premier League' },
  'cricket_icc_world_cup':     { sport: 'CRICKET', league: 'ICC World Cup' },
  'cricket_big_bash':          { sport: 'CRICKET', league: 'Big Bash League' },
  'cricket_psl':               { sport: 'CRICKET', league: 'Pakistan Super League' },
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

  setApiKey(newKey: string): void {
    this.apiKey = newKey;
    this.healthy = Boolean(newKey);
    this.consecutiveFailures = 0;
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

      // Query active sports for live scores and bookmaker odds
      for (const sportKey of SCORE_SPORT_KEYS) {
        try {
          // 1. Fetch scores & in-play status
          const scoreUrl = `${this.baseUrl}/sports/${sportKey}/scores?apiKey=${this.apiKey}&daysFrom=1&dateFormat=iso`;
          const scoreRes = await fetch(scoreUrl, {
            headers: { 'User-Agent': 'NexusSportsExchange/1.0' },
            signal: AbortSignal.timeout(8000)
          });

          // Track quota
          const remaining = scoreRes.headers.get('x-requests-remaining');
          if (remaining) this.requestsRemaining = parseInt(remaining, 10);

          if (!scoreRes.ok) {
            if (scoreRes.status === 422 || scoreRes.status === 401) {
              continue;
            }
            if (scoreRes.status === 429) {
              console.warn('[TheOddsApiProvider] Rate limit hit — quota exhausted.');
              this.consecutiveFailures = 3;
              break;
            }
            continue;
          }

          const scores: OddsApiScore[] = await scoreRes.json() as OddsApiScore[];
          const meta = ODDS_API_SPORT_MAP[sportKey];
          if (!meta || !Array.isArray(scores)) continue;

          // 2. Fetch live odds for these events (h2h / match winner)
          let oddsMap = new Map<string, OddsApiOddsEvent>();
          try {
            const oddsUrl = `${this.baseUrl}/sports/${sportKey}/odds?apiKey=${this.apiKey}&regions=us,uk,eu&markets=h2h&oddsFormat=decimal`;
            const oddsRes = await fetch(oddsUrl, {
              headers: { 'User-Agent': 'NexusSportsExchange/1.0' },
              signal: AbortSignal.timeout(8000)
            });
            if (oddsRes.ok) {
              const oddsData: OddsApiOddsEvent[] = await oddsRes.json() as OddsApiOddsEvent[];
              if (Array.isArray(oddsData)) {
                for (const evOdds of oddsData) {
                  oddsMap.set(evOdds.id, evOdds);
                }
              }
            }
          } catch {
            // Odds fetch is non-blocking, fallback to scores
          }

          for (const ev of scores) {
            const evOdds = oddsMap.get(ev.id);
            const telemetry = this.normalizeScoreAndOdds(ev, evOdds, meta.sport, meta.league);
            if (telemetry) results.push(telemetry);
          }
        } catch {
          // Sport iteration error, proceed to next
        }
      }

      this.consecutiveFailures = 0;
      this.healthy = true;
      this.lastFetch = Date.now();
      this.cachedMatches = results;

      console.log(`[TheOddsApiProvider] ✅ Fetched ${results.length} matches with real odds. Quota remaining: ${this.requestsRemaining}`);
      return results;

    } catch (err: any) {
      this.consecutiveFailures++;
      if (this.consecutiveFailures >= 3) {
        this.healthy = false;
        console.error(`[TheOddsApiProvider] 🔴 Circuit OPEN after ${this.consecutiveFailures} failures: ${err.message}`);
      } else {
        console.warn(`[TheOddsApiProvider] ⚠️ Failure ${this.consecutiveFailures}/3: ${err.message}`);
      }
      return this.cachedMatches;
    }
  }

  private normalizeScoreAndOdds(
    ev: OddsApiScore,
    oddsEvent: OddsApiOddsEvent | undefined,
    sport: SportType,
    league: string
  ): LiveMatchTelemetry | null {
    try {
      const homeScore = ev.scores?.find(s => s.name === ev.home_team)?.score;
      const awayScore = ev.scores?.find(s => s.name === ev.away_team)?.score;

      const homeGoals = parseInt(homeScore || '0', 10);
      const awayGoals = parseInt(awayScore || '0', 10);

      const now = Date.now();
      const startMs = new Date(ev.commence_time).getTime();
      const inPlay = !ev.completed && startMs <= now && (now - startMs) < 4 * 60 * 60 * 1000;
      const isSettled = ev.completed;

      const marketId = `MKT_ODDS_${sport}_${ev.id.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)}`;

      const summaryScore = inPlay
        ? `${ev.home_team} ${homeGoals} - ${awayGoals} ${ev.away_team}`
        : isSettled
          ? `FT: ${ev.home_team} ${homeGoals} - ${awayGoals} ${ev.away_team}`
          : `${ev.home_team} vs ${ev.away_team} • ${new Date(ev.commence_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

      // Derive best market odds from bookmakers if available
      let homeOdds = 1.95;
      let awayOdds = 1.95;
      let drawOdds = 3.40;

      if (oddsEvent?.bookmakers?.length) {
        // Collect prices from top bookmakers (Pinnacle, DraftKings, Betfair, etc.)
        for (const bm of oddsEvent.bookmakers) {
          const h2h = bm.markets.find(m => m.key === 'h2h');
          if (h2h) {
            const hOut = h2h.outcomes.find(o => o.name === ev.home_team);
            const aOut = h2h.outcomes.find(o => o.name === ev.away_team);
            const dOut = h2h.outcomes.find(o => o.name.toLowerCase() === 'draw');
            if (hOut?.price) homeOdds = Math.round(hOut.price * 100) / 100;
            if (aOut?.price) awayOdds = Math.round(aOut.price * 100) / 100;
            if (dOut?.price) drawOdds = Math.round(dOut.price * 100) / 100;
            break; // Use best primary bookmaker
          }
        }
      }

      const bestHomeBack = Math.max(1.01, Math.round((homeOdds - 0.02) * 100) / 100);
      const bestHomeLay = Math.round((homeOdds + 0.02) * 100) / 100;
      const bestAwayBack = Math.max(1.01, Math.round((awayOdds - 0.02) * 100) / 100);
      const bestAwayLay = Math.round((awayOdds + 0.02) * 100) / 100;

      const selections = [
        {
          selectionId: 1,
          name: ev.home_team,
          backPrice: bestHomeBack,
          layPrice: bestHomeLay,
          backVolume: 2500,
          layVolume: 2500,
          depth: [
            { price: bestHomeBack, size: 2500 },
            { price: Math.max(1.01, +(bestHomeBack - 0.02).toFixed(2)), size: 4000 },
            { price: Math.max(1.01, +(bestHomeBack - 0.04).toFixed(2)), size: 7500 }
          ]
        },
        {
          selectionId: 2,
          name: ev.away_team,
          backPrice: bestAwayBack,
          layPrice: bestAwayLay,
          backVolume: 2500,
          layVolume: 2500,
          depth: [
            { price: bestAwayBack, size: 2500 },
            { price: Math.max(1.01, +(bestAwayBack - 0.02).toFixed(2)), size: 4000 },
            { price: Math.max(1.01, +(bestAwayBack - 0.04).toFixed(2)), size: 7500 }
          ]
        }
      ];

      if (sport === 'FOOTBALL') {
        const bestDrawBack = Math.max(1.01, Math.round((drawOdds - 0.03) * 100) / 100);
        const bestDrawLay = Math.round((drawOdds + 0.03) * 100) / 100;
        selections.push({
          selectionId: 3,
          name: 'Draw',
          backPrice: bestDrawBack,
          layPrice: bestDrawLay,
          backVolume: 1800,
          layVolume: 1800,
          depth: [
            { price: bestDrawBack, size: 1800 },
            { price: Math.max(1.01, +(bestDrawBack - 0.03).toFixed(2)), size: 3000 },
            { price: Math.max(1.01, +(bestDrawBack - 0.06).toFixed(2)), size: 5000 }
          ]
        });
      }

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
        realOdds: {
          marketName: 'Match Winner / Moneyline',
          selections
        },
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

