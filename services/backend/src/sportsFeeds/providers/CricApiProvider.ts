/**
 * CricAPI Provider (Tier 3 — Cricket Specialist)
 * Documentation: https://cricapi.com/api/
 *
 * Provides:
 *  - Live cricket match scores (all formats: T20, ODI, Test)
 *  - Ball-by-ball updates, batting/bowling figures
 *  - Current match status, scorecards
 *
 * Free tier: 100 calls/day | Basic: 500/day | Pro: 5000/day
 * Configure: CRICAPI_KEY=<your-key> in .env
 */

import { IExternalProvider } from './IExternalProvider';
import { LiveMatchTelemetry, CricketScoreDetails } from '../types';

interface CricApiMatch {
  id: string;
  name: string;
  matchType: 't20' | 'odi' | 'test' | 'international' | 'domestic';
  status: string;  // e.g. "India won by 6 wickets" | "Match in Progress"
  venue: string;
  date: string;
  dateTimeGMT: string;
  teams: string[];
  teamInfo?: Array<{ name: string; shortname: string; img: string }>;
  score?: Array<{
    r: number;   // runs
    w: number;   // wickets
    o: number;   // overs
    inning: string; // "India Inning 1"
  }>;
  ms: 'result' | 'live' | 'fixture'; // match state
}

export class CricApiProvider implements IExternalProvider {
  private apiKey: string;
  private baseUrl = 'https://api.cricapi.com/v1';
  private consecutiveFailures = 0;
  private healthy = true;
  private cachedMatches: LiveMatchTelemetry[] = [];
  private lastFetch: number = 0;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  setApiKey(newKey: string): void {
    this.apiKey = newKey;
    this.healthy = Boolean(newKey);
    this.consecutiveFailures = 0;
  }

  getProviderName(): string { return 'CricAPI (Tier 3)'; }
  getPriority(): number     { return 3; }
  isHealthy(): boolean      { return this.healthy && Boolean(this.apiKey); }

  resetCircuitBreaker(): void {
    this.consecutiveFailures = 0;
    this.healthy = true;
    console.log('[CricApiProvider] Circuit breaker reset.');
  }

  async fetchLiveMatches(): Promise<LiveMatchTelemetry[]> {
    if (!this.apiKey) {
      return [];
    }

    try {
      const results: LiveMatchTelemetry[] = [];

      // Endpoint 1: Current live matches
      const liveUrl = `${this.baseUrl}/currentMatches?apikey=${this.apiKey}&offset=0`;
      const liveRes = await fetch(liveUrl, {
        headers: { 'User-Agent': 'NexusSportsExchange/1.0' },
        signal: AbortSignal.timeout(8000)
      });

      if (!liveRes.ok) {
        if (liveRes.status === 401 || liveRes.status === 403) {
          console.error('[CricApiProvider] Invalid API key.');
          this.healthy = false;
          return this.cachedMatches;
        }
        throw new Error(`HTTP ${liveRes.status}`);
      }

      const liveData = await liveRes.json() as any;
      if (liveData.status !== 'success') {
        throw new Error(`CricAPI error: ${liveData.reason || 'Unknown'}`);
      }

      const matches: CricApiMatch[] = liveData.data || [];
      for (const m of matches) {
        const t = this.normalizeMatch(m);
        if (t) results.push(t);
      }

      // Endpoint 2: Upcoming cricket matches (today & tomorrow)
      try {
        const upcomingUrl = `${this.baseUrl}/matches?apikey=${this.apiKey}&offset=0`;
        const upcomingRes = await fetch(upcomingUrl, { signal: AbortSignal.timeout(8000) });
        if (upcomingRes.ok) {
          const upcomingData = await upcomingRes.json() as any;
          const upcoming: CricApiMatch[] = upcomingData.data || [];
          const todayStr = new Date().toISOString().split('T')[0];
          const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

          for (const m of upcoming) {
            if ((m.date === todayStr || m.date === tomorrowStr) && m.ms === 'fixture') {
              const t = this.normalizeMatch(m);
              if (t && !results.find(r => r.marketId === t.marketId)) {
                results.push(t);
              }
            }
          }
        }
      } catch {
        // Non-critical
      }

      this.consecutiveFailures = 0;
      this.healthy = true;
      this.lastFetch = Date.now();
      this.cachedMatches = results;

      console.log(`[CricApiProvider] ✅ Fetched ${results.length} cricket matches.`);
      return results;

    } catch (err: any) {
      this.consecutiveFailures++;
      if (this.consecutiveFailures >= 3) {
        this.healthy = false;
        console.error(`[CricApiProvider] 🔴 Circuit OPEN: ${err.message}`);
      } else {
        console.warn(`[CricApiProvider] ⚠️ Failure ${this.consecutiveFailures}/3: ${err.message}`);
      }
      return this.cachedMatches;
    }
  }

  private normalizeMatch(m: CricApiMatch): LiveMatchTelemetry | null {
    try {
      const teams = m.teams || [];
      if (teams.length < 2) return null;

      const homeTeam = teams[0];
      const awayTeam = teams[1];
      const inPlay = m.ms === 'live';
      const isSettled = m.ms === 'result';

      // Parse score for first batting team (current innings)
      const score1 = m.score?.[0];
      const score2 = m.score?.[1];

      // Determine batting/bowling team from inning name
      const currentInningsTeam = score1?.inning?.split(' ')?.[0] || homeTeam;
      const isHomeBatting = currentInningsTeam === homeTeam || score1?.inning?.toLowerCase().includes(homeTeam.toLowerCase());

      const runs = score1?.r ?? 0;
      const wickets = Math.min(score1?.w ?? 0, 10);
      const overs = parseFloat((score1?.o ?? 0).toFixed(1));

      // Target calculation for 2nd innings
      const target = score2 ? score2.r + 1 : undefined;
      const ballsLeft = target ? Math.round((20 - overs) * 6) : undefined;
      const rrr = (target && ballsLeft && ballsLeft > 0)
        ? parseFloat(((target - runs) / (ballsLeft / 6)).toFixed(2))
        : undefined;
      const crr = overs > 0 ? parseFloat((runs / overs).toFixed(2)) : 0;

      const matchFormat = m.matchType?.toUpperCase() || 'T20';
      const marketId = `MKT_CRIC_${m.id.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)}`;

      const summaryScore = inPlay
        ? `${currentInningsTeam} ${runs}/${wickets} (${overs} ov)${target ? ` • Need ${target - runs} in ${ballsLeft}b` : ''}`
        : isSettled
          ? m.status
          : `${homeTeam} vs ${awayTeam} • ${matchFormat} • ${new Date(m.dateTimeGMT).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

      const cricket: CricketScoreDetails = {
        currentInnings: score2 ? 2 : 1,
        battingTeam: currentInningsTeam,
        bowlingTeam: currentInningsTeam === homeTeam ? awayTeam : homeTeam,
        runs,
        wickets,
        overs,
        target,
        crr,
        rrr,
        striker: { name: 'Batsman 1', runs: 0, balls: 0, fours: 0, sixes: 0 },
        nonStriker: { name: 'Batsman 2', runs: 0, balls: 0 },
        currentBowler: { name: 'Bowler 1', overs: parseFloat((overs % 1).toFixed(1)), runs: 0, wickets: 0 },
        recentBalls: [],
        lastEventDescription: summaryScore
      };

      // Compute dynamic cricket odds
      let homeMid = 1.95;
      let awayMid = 1.95;

      if (inPlay) {
        // Dynamic in-play odds based on batting team and run rate
        if (isHomeBatting) {
          const projectedDiff = (crr - 7.5) * 0.1;
          homeMid = Math.max(1.15, Math.min(6.5, parseFloat((1.90 - projectedDiff).toFixed(2))));
          awayMid = Math.max(1.15, Math.min(6.5, parseFloat((2.00 + projectedDiff).toFixed(2))));
        } else {
          const projectedDiff = (crr - 7.5) * 0.1;
          awayMid = Math.max(1.15, Math.min(6.5, parseFloat((1.90 - projectedDiff).toFixed(2))));
          homeMid = Math.max(1.15, Math.min(6.5, parseFloat((2.00 + projectedDiff).toFixed(2))));
        }
      }

      const bestHomeBack = Math.max(1.01, parseFloat((homeMid - 0.02).toFixed(2)));
      const bestHomeLay = parseFloat((homeMid + 0.02).toFixed(2));
      const bestAwayBack = Math.max(1.01, parseFloat((awayMid - 0.02).toFixed(2)));
      const bestAwayLay = parseFloat((awayMid + 0.02).toFixed(2));

      const selections = [
        {
          selectionId: 1,
          name: homeTeam,
          backPrice: bestHomeBack,
          layPrice: bestHomeLay,
          backVolume: 5000,
          layVolume: 5000,
          depth: [
            { price: bestHomeBack, size: 5000 },
            { price: Math.max(1.01, +(bestHomeBack - 0.02).toFixed(2)), size: 8500 },
            { price: Math.max(1.01, +(bestHomeBack - 0.04).toFixed(2)), size: 15000 }
          ]
        },
        {
          selectionId: 2,
          name: awayTeam,
          backPrice: bestAwayBack,
          layPrice: bestAwayLay,
          backVolume: 5000,
          layVolume: 5000,
          depth: [
            { price: bestAwayBack, size: 5000 },
            { price: Math.max(1.01, +(bestAwayBack - 0.02).toFixed(2)), size: 8500 },
            { price: Math.max(1.01, +(bestAwayBack - 0.04).toFixed(2)), size: 15000 }
          ]
        }
      ];

      const telemetry: LiveMatchTelemetry = {
        marketId,
        eventName: m.name || `${homeTeam} vs ${awayTeam}`,
        sport: 'CRICKET',
        status: isSettled ? 'COMPLETED' : inPlay ? 'IN_PLAY' : 'PRE_MATCH',
        isLocked: false,
        inPlay,
        startTime: m.dateTimeGMT,
        venue: m.venue || 'Cricket Ground',
        homeTeam,
        awayTeam,
        summaryScore,
        realOdds: {
          marketName: 'Match Winner / Moneyline',
          selections
        },
        updatedAt: Date.now(),
        cricket
      };

      return telemetry;
    } catch {
      return null;
    }
  }
}

