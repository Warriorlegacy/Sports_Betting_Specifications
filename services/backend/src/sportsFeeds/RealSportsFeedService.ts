import { matchingEngineService } from '../realtime/matchingEngineService';
import { realTimeGateway } from '../realtime/socketGateway';
import { query } from '../db/pool';
import { LiveMatchTelemetry, SportType } from './types';

interface RealSportEndpoint {
  sport: SportType;
  categoryName: string;
  url: string;
  leagueName: string;
  country: string;
}

export class RealSportsFeedService {
  private syncInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private cachedTelemetry: Map<string, LiveMatchTelemetry> = new Map();

  private endpoints: RealSportEndpoint[] = [
    // ⚽ FOOTBALL / SOCCER
    {
      sport: 'FOOTBALL',
      categoryName: 'Football',
      url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard',
      leagueName: 'Premier League',
      country: 'England'
    },
    {
      sport: 'FOOTBALL',
      categoryName: 'Football',
      url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard',
      leagueName: 'La Liga',
      country: 'Spain'
    },
    {
      sport: 'FOOTBALL',
      categoryName: 'Football',
      url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/ita.1/scoreboard',
      leagueName: 'Serie A',
      country: 'Italy'
    },
    {
      sport: 'FOOTBALL',
      categoryName: 'Football',
      url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/ger.1/scoreboard',
      leagueName: 'Bundesliga',
      country: 'Germany'
    },
    {
      sport: 'FOOTBALL',
      categoryName: 'Football',
      url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/fra.1/scoreboard',
      leagueName: 'Ligue 1',
      country: 'France'
    },
    {
      sport: 'FOOTBALL',
      categoryName: 'Football',
      url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard',
      leagueName: 'UEFA Champions League',
      country: 'Europe'
    },
    {
      sport: 'FOOTBALL',
      categoryName: 'Football',
      url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/scoreboard',
      leagueName: 'Major League Soccer',
      country: 'USA'
    },
    // 🏀 BASKETBALL
    {
      sport: 'BASKETBALL',
      categoryName: 'Basketball',
      url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard',
      leagueName: 'NBA',
      country: 'USA'
    },
    {
      sport: 'BASKETBALL',
      categoryName: 'Basketball',
      url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/scoreboard',
      leagueName: 'WNBA',
      country: 'USA'
    },
    {
      sport: 'BASKETBALL',
      categoryName: 'Basketball',
      url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard',
      leagueName: 'NCAA Basketball',
      country: 'USA'
    },
    // ⚾ BASEBALL
    {
      sport: 'FOOTBALL', // Baseball mapped under general category
      categoryName: 'Baseball',
      url: 'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard',
      leagueName: 'MLB',
      country: 'USA'
    },
    // 🏈 AMERICAN FOOTBALL
    {
      sport: 'FOOTBALL',
      categoryName: 'American Football',
      url: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',
      leagueName: 'NFL',
      country: 'USA'
    },
    // 🏒 HOCKEY
    {
      sport: 'FOOTBALL',
      categoryName: 'Ice Hockey',
      url: 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard',
      leagueName: 'NHL',
      country: 'USA'
    },
    // 🎾 TENNIS
    {
      sport: 'TENNIS',
      categoryName: 'Tennis',
      url: 'https://site.api.espn.com/apis/site/v2/sports/tennis/atp/scoreboard',
      leagueName: 'ATP World Tour',
      country: 'Global'
    },
    {
      sport: 'TENNIS',
      categoryName: 'Tennis',
      url: 'https://site.api.espn.com/apis/site/v2/sports/tennis/wta/scoreboard',
      leagueName: 'WTA Tour',
      country: 'Global'
    }
  ];

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('[RealSportsFeedService] Initialized real-world global sports feeder.');

    // Fetch immediately on startup
    this.syncAllRealSports();

    // Poll real-world sports feeds every 45 seconds
    this.syncInterval = setInterval(() => {
      this.syncAllRealSports();
    }, 45000);
  }

  public stop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.isRunning = false;
  }

  public getAllRealTelemetry(): LiveMatchTelemetry[] {
    return Array.from(this.cachedTelemetry.values());
  }

  public getTelemetry(marketId: string): LiveMatchTelemetry | null {
    return this.cachedTelemetry.get(marketId) || null;
  }

  /**
   * Fetches live scoreboards across all configured global sports endpoints.
   */
  public async syncAllRealSports(): Promise<number> {
    let syncedCount = 0;
    for (const ep of this.endpoints) {
      try {
        const count = await this.fetchAndIngestEndpoint(ep);
        syncedCount += count;
      } catch (err: any) {
        console.warn(`[RealSportsFeedService] Could not sync ${ep.leagueName}:`, err.message);
      }
    }
    return syncedCount;
  }

  private async fetchAndIngestEndpoint(ep: RealSportEndpoint): Promise<number> {
    const res = await fetch(ep.url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
    if (!res.ok) return 0;
    const data: any = await res.json();
    if (!data.events || !Array.isArray(data.events)) return 0;

    let count = 0;
    for (const ev of data.events.slice(0, 8)) {
      try {
        const comp = ev.competitions?.[0];
        if (!comp) continue;

        const homeComp = comp.competitors?.find((c: any) => c.homeAway === 'home');
        const awayComp = comp.competitors?.find((c: any) => c.homeAway === 'away');
        if (!homeComp || !awayComp) continue;

        const homeTeam = homeComp.team?.displayName || 'Home Team';
        const awayTeam = awayComp.team?.displayName || 'Away Team';
        const homeScore = parseInt(homeComp.score || '0', 10);
        const awayScore = parseInt(awayComp.score || '0', 10);

        const state = ev.status?.type?.state; // 'pre' | 'in' | 'post'
        const inPlay = state === 'in';
        const isSettled = state === 'post';
        const clockStr = ev.status?.displayClock || ev.status?.type?.shortDetail || '00:00';

        const marketId = `MKT_REAL_${ep.sport}_${ev.id}`;
        const eventName = `${homeTeam} vs ${awayTeam} - ${ep.leagueName}`;

        // 1. Upsert market record into PostgreSQL
        await query(
          `INSERT INTO markets (id, event_name, market_type, sport, is_locked, in_play, status)
           VALUES ($1, $2, 'MATCH_ODDS', $3, FALSE, $4, $5)
           ON CONFLICT (id) DO UPDATE 
           SET in_play = EXCLUDED.in_play,
               status = EXCLUDED.status,
               updated_at = NOW()`,
          [marketId, eventName, ep.categoryName, inPlay, isSettled ? 'SETTLED' : 'OPEN']
        ).catch(() => {});

        // 2. Upsert selections
        await query(
          `INSERT INTO market_selections (market_id, selection_id, selection_name)
           VALUES ($1, 1, $2), ($1, 2, $3)
           ON CONFLICT (market_id, selection_id) DO NOTHING`,
          [marketId, homeTeam, awayTeam]
        ).catch(() => {});

        // 3. Build standardized telemetry
        const summaryScore = inPlay || isSettled
          ? `${homeTeam} ${homeScore} - ${awayScore} ${awayTeam} (${clockStr})`
          : `${homeTeam} vs ${awayTeam} • ${ev.status?.type?.detail || 'Scheduled'}`;

        const telemetry: LiveMatchTelemetry = {
          marketId,
          eventName,
          sport: ep.sport,
          status: inPlay ? 'IN_PLAY' : isSettled ? 'COMPLETED' : 'PRE_MATCH',
          isLocked: false,
          inPlay,
          startTime: ev.date,
          venue: comp.venue?.fullName || 'Stadium',
          homeTeam,
          awayTeam,
          summaryScore,
          updatedAt: Date.now()
        };


        if (ep.sport === 'FOOTBALL') {
          telemetry.football = {
            minute: parseInt(ev.status?.displayClock?.replace(/[^0-9]/g, '') || '0', 10),
            period: (ev.status?.period === 1 ? '1H' : ev.status?.period === 2 ? '2H' : '1H'),
            homeGoals: homeScore,
            awayGoals: awayScore,
            yellowCards: { home: 0, away: 0 },
            redCards: { home: 0, away: 0 },
            corners: { home: 0, away: 0 },
            penalties: { home: 0, away: 0 },
            varCheckActive: false,
            possessionPercentage: { home: 50, away: 50 },
            lastEventDescription: summaryScore
          };
        } else if (ep.sport === 'BASKETBALL') {
          telemetry.basketball = {
            quarter: (ev.status?.period || 1) as 1 | 2 | 3 | 4 | 5,
            quarterName: `Q${ev.status?.period || 1}`,
            gameClock: clockStr,
            shotClock: 24,
            homeScore,
            awayScore,
            possession: 'HOME',
            teamFouls: { home: 0, away: 0 },
            timeoutsRemaining: { home: 3, away: 3 },
            lastEventDescription: summaryScore
          };
        }


        this.cachedTelemetry.set(marketId, telemetry);

        // 4. Seed liquidity in matching engine if not already present
        await this.seedMarketOdds(marketId, homeScore, awayScore, inPlay);

        // 5. Broadcast real-time telemetry over WebSockets
        realTimeGateway.broadcastMatchTelemetry(marketId, telemetry);
        count++;
      } catch (e) {
        // Continue to next event
      }
    }
    return count;
  }

  private async seedMarketOdds(marketId: string, homeScore: number, awayScore: number, inPlay: boolean): Promise<void> {
    const botUserId = '00000000-0000-0000-0000-000000000000';
    
    // Dynamic price calculation based on real live score difference
    const diff = homeScore - awayScore;
    let homePrice = 2.0;
    let awayPrice = 2.0;

    if (diff > 0) {
      homePrice = Math.max(1.15, Math.round((1.85 - diff * 0.18) * 100) / 100);
      awayPrice = Math.min(8.50, Math.round((2.20 + diff * 0.65) * 100) / 100);
    } else if (diff < 0) {
      const d = Math.abs(diff);
      homePrice = Math.min(8.50, Math.round((2.20 + d * 0.65) * 100) / 100);
      awayPrice = Math.max(1.15, Math.round((1.85 - d * 0.18) * 100) / 100);
    }

    const selections = [
      { selId: 1, midPrice: homePrice },
      { selId: 2, midPrice: awayPrice }
    ];

    for (const sel of selections) {
      const bestBack = Math.max(1.02, Math.round((sel.midPrice - 0.01) * 100) / 100);
      const bestLay = Math.round((sel.midPrice + 0.01) * 100) / 100;

      await matchingEngineService.submitOrder({
        betId: `REAL_B_${marketId}_${sel.selId}_${bestBack}`,
        userId: botUserId,
        marketId,
        selectionId: sel.selId,
        type: 'BACK',
        price: bestBack,
        stake: 1500
      }).catch(() => {});

      await matchingEngineService.submitOrder({
        betId: `REAL_L_${marketId}_${sel.selId}_${bestLay}`,
        userId: botUserId,
        marketId,
        selectionId: sel.selId,
        type: 'LAY',
        price: bestLay,
        stake: 1500
      }).catch(() => {});
    }

    realTimeGateway.broadcastOrderBookUpdate(marketId);
  }
}

export const realSportsFeedService = new RealSportsFeedService();
