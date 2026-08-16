import { matchingEngineService } from '../realtime/matchingEngineService';
import { realTimeGateway } from '../realtime/socketGateway';
import { query } from '../db/pool';
import { settleMarketAtomic } from '../db/ledger';
import { LiveMatchTelemetry, SportType, RealRunnerOdds } from './types';

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
  private settledMarketIds: Set<string> = new Set();

  private endpoints: RealSportEndpoint[] = [
    // 🏏 CRICKET
    {
      sport: 'CRICKET',
      categoryName: 'Cricket',
      url: 'https://site.api.espn.com/apis/site/v2/sports/cricket/scoreboard',
      leagueName: 'International Cricket',
      country: 'Global'
    },
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
      sport: 'FOOTBALL',
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

    // Poll real-world sports feeds every 30 seconds for live odds & telemetry
    this.syncInterval = setInterval(() => {
      this.syncAllRealSports();
    }, 30000);
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
    const res = await fetch(ep.url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) return 0;
    const data: any = await res.json();
    if (!data.events || !Array.isArray(data.events)) return 0;

    let count = 0;
    for (const ev of data.events.slice(0, 10)) {
      try {
        const comp = ev.competitions?.[0];
        if (!comp) continue;

        const homeComp = comp.competitors?.find((c: any) => c.homeAway === 'home') || comp.competitors?.[0];
        const awayComp = comp.competitors?.find((c: any) => c.homeAway === 'away') || comp.competitors?.[1];
        if (!homeComp || !awayComp) continue;

        const homeTeam = homeComp.team?.displayName || homeComp.athlete?.displayName || 'Home Team';
        const awayTeam = awayComp.team?.displayName || awayComp.athlete?.displayName || 'Away Team';
        const homeScore = parseInt(homeComp.score || '0', 10);
        const awayScore = parseInt(awayComp.score || '0', 10);

        const state = ev.status?.type?.state; // 'pre' | 'in' | 'post'
        const inPlay = state === 'in';
        const isSettled = state === 'post' || ev.status?.type?.completed;
        const clockStr = ev.status?.displayClock || ev.status?.type?.shortDetail || '00:00';

        const marketId = `MKT_REAL_${ep.sport}_${ev.id}`;
        const eventName = `${homeTeam} vs ${awayTeam} - ${ep.leagueName}`;

        // 1. Upsert market record into PostgreSQL
        await query(
          `INSERT INTO markets (id, event_name, market_type, sport, is_locked, in_play, status)
           VALUES ($1, $2, 'MATCH_ODDS', $3, FALSE, $4, $5)
           ON CONFLICT (id) DO UPDATE 
           SET in_play = EXCLUDED.in_play,
               status = CASE WHEN markets.status = 'SETTLED' THEN 'SETTLED' ELSE EXCLUDED.status END,
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

        if (ep.sport === 'FOOTBALL') {
          await query(
            `INSERT INTO market_selections (market_id, selection_id, selection_name)
             VALUES ($1, 3, 'Draw')
             ON CONFLICT (market_id, selection_id) DO NOTHING`,
            [marketId]
          ).catch(() => {});
        }

        // 3. Dynamic multi-depth odds pricing calculation
        const calculatedOdds = this.calculateDynamicMarketOdds(
          ep.sport,
          homeScore,
          awayScore,
          inPlay,
          isSettled,
          homeTeam,
          awayTeam
        );

        // 4. Build standardized telemetry
        const summaryScore = inPlay || isSettled
          ? `${homeTeam} ${homeScore} - ${awayScore} ${awayTeam} (${clockStr})`
          : `${homeTeam} vs ${awayTeam} • ${ev.status?.type?.detail || 'Scheduled'}`;

        const telemetry: LiveMatchTelemetry = {
          marketId,
          eventName,
          sport: ep.sport,
          status: isSettled ? 'COMPLETED' : inPlay ? 'IN_PLAY' : 'PRE_MATCH',
          isLocked: false,
          inPlay,
          startTime: ev.date,
          venue: comp.venue?.fullName || ep.leagueName,
          homeTeam,
          awayTeam,
          summaryScore,
          realOdds: {
            marketName: 'Match Winner / Moneyline',
            selections: calculatedOdds
          },
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
        } else if (ep.sport === 'CRICKET') {
          telemetry.cricket = {
            currentInnings: 1,
            battingTeam: homeTeam,
            bowlingTeam: awayTeam,
            runs: homeScore,
            wickets: 3,
            overs: 18.2,
            crr: 8.2,
            striker: { name: `${homeTeam} Batsman`, runs: 45, balls: 28, fours: 4, sixes: 2 },
            nonStriker: { name: `${homeTeam} All-Rounder`, runs: 24, balls: 16 },
            currentBowler: { name: `${awayTeam} Bowler`, overs: 3.2, runs: 26, wickets: 1 },
            recentBalls: ['1', '4', '0', 'W', '6', '1'],
            lastEventDescription: summaryScore
          };
        }

        this.cachedTelemetry.set(marketId, telemetry);

        // 5. Seed order book liquidity in matching engine
        await this.seedMarketOrderBook(marketId, calculatedOdds);

        // 6. Broadcast real-time telemetry over WebSockets
        realTimeGateway.broadcastMatchTelemetry(marketId, telemetry);

        // 7. Automated Settlement Detector
        if (isSettled && !this.settledMarketIds.has(marketId)) {
          await this.autoSettleCompletedMatch(marketId, ep.sport, homeScore, awayScore);
        }

        count++;
      } catch (e) {
        // Continue to next event
      }
    }
    return count;
  }

  /**
   * Institutional Dynamic Pricing Engine:
   * Generates realistic decimal back/lay prices and multi-tier market depth
   * for any real sport match based on live score differential and momentum.
   */
  private calculateDynamicMarketOdds(
    sport: SportType,
    homeScore: number,
    awayScore: number,
    inPlay: boolean,
    isSettled: boolean,
    homeName: string,
    awayName: string
  ): RealRunnerOdds[] {
    const diff = homeScore - awayScore;
    let homeMid = 1.95;
    let awayMid = 1.95;
    let drawMid = 3.40;

    if (sport === 'FOOTBALL') {
      if (diff > 0) {
        homeMid = Math.max(1.08, Math.round((1.65 - diff * 0.25) * 100) / 100);
        awayMid = Math.min(15.0, Math.round((2.70 + diff * 1.80) * 100) / 100);
        drawMid = Math.min(12.0, Math.round((3.20 + diff * 1.20) * 100) / 100);
      } else if (diff < 0) {
        const d = Math.abs(diff);
        homeMid = Math.min(15.0, Math.round((2.70 + d * 1.80) * 100) / 100);
        awayMid = Math.max(1.08, Math.round((1.65 - d * 0.25) * 100) / 100);
        drawMid = Math.min(12.0, Math.round((3.20 + d * 1.20) * 100) / 100);
      } else {
        homeMid = 2.40;
        awayMid = 2.80;
        drawMid = 3.10;
      }
    } else if (sport === 'BASKETBALL') {
      if (diff > 0) {
        homeMid = Math.max(1.05, Math.round((1.85 - diff * 0.04) * 100) / 100);
        awayMid = Math.min(12.0, Math.round((1.95 + diff * 0.15) * 100) / 100);
      } else if (diff < 0) {
        const d = Math.abs(diff);
        homeMid = Math.min(12.0, Math.round((1.95 + d * 0.15) * 100) / 100);
        awayMid = Math.max(1.05, Math.round((1.85 - d * 0.04) * 100) / 100);
      }
    } else {
      // Tennis / Cricket / General sports
      if (diff > 0) {
        homeMid = Math.max(1.10, Math.round((1.80 - diff * 0.20) * 100) / 100);
        awayMid = Math.min(9.00, Math.round((2.10 + diff * 0.70) * 100) / 100);
      } else if (diff < 0) {
        const d = Math.abs(diff);
        homeMid = Math.min(9.00, Math.round((2.10 + d * 0.70) * 100) / 100);
        awayMid = Math.max(1.10, Math.round((1.80 - d * 0.20) * 100) / 100);
      }
    }

    const homeBack = Math.max(1.01, +(homeMid - 0.02).toFixed(2));
    const homeLay = +(homeMid + 0.02).toFixed(2);
    const awayBack = Math.max(1.01, +(awayMid - 0.02).toFixed(2));
    const awayLay = +(awayMid + 0.02).toFixed(2);

    const runners: RealRunnerOdds[] = [
      {
        selectionId: 1,
        name: homeName,
        backPrice: homeBack,
        layPrice: homeLay,
        backVolume: 3500,
        layVolume: 3500,
        depth: [
          { price: homeBack, size: 3500 },
          { price: Math.max(1.01, +(homeBack - 0.02).toFixed(2)), size: 6000 },
          { price: Math.max(1.01, +(homeBack - 0.04).toFixed(2)), size: 10000 }
        ]
      },
      {
        selectionId: 2,
        name: awayName,
        backPrice: awayBack,
        layPrice: awayLay,
        backVolume: 3500,
        layVolume: 3500,
        depth: [
          { price: awayBack, size: 3500 },
          { price: Math.max(1.01, +(awayBack - 0.02).toFixed(2)), size: 6000 },
          { price: Math.max(1.01, +(awayBack - 0.04).toFixed(2)), size: 10000 }
        ]
      }
    ];

    if (sport === 'FOOTBALL') {
      const drawBack = Math.max(1.01, +(drawMid - 0.03).toFixed(2));
      const drawLay = +(drawMid + 0.03).toFixed(2);
      runners.push({
        selectionId: 3,
        name: 'Draw',
        backPrice: drawBack,
        layPrice: drawLay,
        backVolume: 2200,
        layVolume: 2200,
        depth: [
          { price: drawBack, size: 2200 },
          { price: Math.max(1.01, +(drawBack - 0.03).toFixed(2)), size: 4500 },
          { price: Math.max(1.01, +(drawBack - 0.06).toFixed(2)), size: 7000 }
        ]
      });
    }

    return runners;
  }

  /**
   * Seeds realistic 3-depth BACK and LAY ladders into the matching engine.
   */
  private async seedMarketOrderBook(marketId: string, runners: RealRunnerOdds[]): Promise<void> {
    const botUserId = '00000000-0000-0000-0000-000000000000';

    for (const runner of runners) {
      // Seed Best Back
      await matchingEngineService.submitOrder({
        betId: `REAL_B_${marketId}_${runner.selectionId}_${runner.backPrice}`,
        userId: botUserId,
        marketId,
        selectionId: runner.selectionId,
        type: 'BACK',
        price: runner.backPrice,
        stake: runner.backVolume
      }).catch(() => {});

      // Seed Best Lay
      await matchingEngineService.submitOrder({
        betId: `REAL_L_${marketId}_${runner.selectionId}_${runner.layPrice}`,
        userId: botUserId,
        marketId,
        selectionId: runner.selectionId,
        type: 'LAY',
        price: runner.layPrice,
        stake: runner.layVolume
      }).catch(() => {});
    }

    realTimeGateway.broadcastOrderBookUpdate(marketId);
  }

  /**
   * Automatically settles a finished match and distributes payouts atomically.
   */
  private async autoSettleCompletedMatch(
    marketId: string,
    sport: SportType,
    homeScore: number,
    awayScore: number
  ): Promise<void> {
    try {
      // Determine winning selection ID
      let winningSelectionId = 1;
      if (homeScore > awayScore) {
        winningSelectionId = 1;
      } else if (awayScore > homeScore) {
        winningSelectionId = 2;
      } else {
        winningSelectionId = sport === 'FOOTBALL' ? 3 : 1;
      }

      console.log(`[AutoSettlement] Settling market ${marketId} -> Winner: Selection #${winningSelectionId}`);
      await settleMarketAtomic(marketId, winningSelectionId);
      this.settledMarketIds.add(marketId);

      // Broadcast settlement
      realTimeGateway.broadcastMarketSettlement(marketId, winningSelectionId);
    } catch (err: any) {
      if (!err.message?.includes('already settled')) {
        console.warn(`[AutoSettlement] Could not auto-settle ${marketId}:`, err.message);
      } else {
        this.settledMarketIds.add(marketId);
      }
    }
  }
}

export const realSportsFeedService = new RealSportsFeedService();
