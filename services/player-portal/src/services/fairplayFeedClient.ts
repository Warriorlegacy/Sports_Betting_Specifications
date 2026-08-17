import { LiveMatch, BettingMarket, SportCategory } from '../types/sportsbook';

export interface MatkaMarket {
  id: number;
  title: string;
  category: string;
  openBids: string;
  closeBids: string;
  isSuspended: boolean;
  rates: {
    single?: number;
    jodi?: number;
    singlePatti?: number;
    doublePatti?: number;
    triplePatti?: number;
  };
  yesterdayResults: { open: string | null; close: string | null };
  todayResults: { open: string | null; close: string | null };
}

export async function fetchFairplayExchangeMatches(): Promise<LiveMatch[]> {
  try {
    const res = await fetch('https://central.zplay1.in/pb/api/v1/events/matches/all', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(8000)
    });

    if (!res.ok) return [];
    const json = await res.json();
    const list: any[] = json.data || [];

    const sportMap: Record<string, { category: SportCategory; flag: string }> = {
      cricket: { category: 'Cricket', flag: '🏏' },
      soccer: { category: 'Football', flag: '⚽' },
      tennis: { category: 'Tennis', flag: '🎾' },
      basketball: { category: 'Basketball', flag: '🏀' },
      baseball: { category: 'Baseball', flag: '⚾' },
      'table tennis': { category: 'Table Tennis', flag: '🏓' },
      'ice hockey': { category: 'Ice Hockey', flag: '🏒' },
      volleyball: { category: 'Football', flag: '🏐' }
    };

    const results: LiveMatch[] = [];

    for (const m of list) {
      try {
        const rawSport = (m.sport_name || '').toLowerCase();
        const mapping = sportMap[rawSport] || { category: 'Football', flag: '🌍' };

        const names = (m.event_name || '').split(/ v | vs /i);
        const homeName = names[0]?.trim() || m.runnerNames?.[0]?.RN || 'Home Team';
        const awayName = names[1]?.trim() || m.runnerNames?.[1]?.RN || 'Away Team';

        const inPlay = Boolean(m.inplay || m.isMatchLive);
        const isSettled = m.status === 'CLOSED' || m.status === 'SETTLED';

        const matchDate = m.event_date ? m.event_date.split('T')[0] : new Date().toISOString().split('T')[0];
        const startTime = m.event_date
          ? new Date(m.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '19:00';

        // Parse Betfair Back/Lay selections
        const selections = (m.runners || []).map((r: any, idx: number) => {
          const runnerObj = m.runnerNames?.find((n: any) => n.SID === r.sid);
          const name = runnerObj?.RN || (idx === 0 ? homeName : idx === 1 ? awayName : `Runner ${idx + 1}`);

          const bestBack = r.ex?.b?.[0];
          const bestLay = r.ex?.l?.[0];

          const price = bestBack?.p || 1.95;
          const backPrice = bestBack?.p;
          const layPrice = bestLay?.p || +(price + 0.04).toFixed(2);
          const backVolume = parseFloat(bestBack?.s || '5000');
          const layVolume = parseFloat(bestLay?.s || '5000');

          const depth = (r.ex?.b || []).map((b: any) => ({
            price: b.p,
            size: parseFloat(b.s || '1000')
          }));

          return {
            id: String(r.sid || idx + 1),
            name,
            price,
            backPrice,
            layPrice,
            backVolume,
            layVolume,
            depth: depth.length > 0 ? depth : undefined,
            tick: 'same' as const
          };
        });

        if (selections.length === 0) {
          selections.push(
            { id: '1', name: homeName, price: 1.95, tick: 'same' },
            { id: '2', name: awayName, price: 1.95, tick: 'same' }
          );
        }

        const markets: BettingMarket[] = [
          {
            id: `MKT_EXCH_${m.event_id || m.matchId}`,
            name: 'Match Odds (Exchange Back/Lay)',
            category: 'MAIN',
            selections
          }
        ];

        // Add complementary handicap & totals markets
        if (mapping.category === 'Football') {
          markets.push(
            {
              id: `MKT_TOT_${m.event_id}`,
              name: 'Total Goals (Over/Under 2.5)',
              category: 'TOTALS',
              selections: [
                { id: 'ov', name: 'Over 2.5 Goals', price: 1.85, tick: 'same' },
                { id: 'un', name: 'Under 2.5 Goals', price: 1.95, tick: 'same' }
              ]
            },
            {
              id: `MKT_BTTS_${m.event_id}`,
              name: 'Both Teams To Score',
              category: 'PROPS',
              selections: [
                { id: 'btts_y', name: 'Yes (BTTS)', price: 1.75, tick: 'same' },
                { id: 'btts_n', name: 'No (BTTS)', price: 2.05, tick: 'same' }
              ]
            }
          );
        } else if (mapping.category === 'Cricket') {
          markets.push({
            id: `MKT_TOT_RUNS_${m.event_id}`,
            name: 'Total Runs (Over/Under 172.5)',
            category: 'TOTALS',
            selections: [
              { id: 'ov', name: 'Over 172.5 Runs', price: 1.85, tick: 'same' },
              { id: 'un', name: 'Under 172.5 Runs', price: 1.95, tick: 'same' }
            ]
          });
        }

        results.push({
          id: `FP_${m.event_id || m.matchId}`,
          sport: mapping.category,
          league: m.league_name || 'Global Exchange Market',
          country: 'Global',
          flag: mapping.flag,
          matchDate,
          startTime,
          currentPeriod: inPlay ? 'Live In-Play' : 'Pre-Match',
          possessionTeam: 'HOME',
          attackPhase: 'BUILD_UP',
          ballPosition: { x: 50, y: 50 },
          possessionStats: { home: 50, away: 50 },
          shots: [],
          events: [],
          stats: [
            { label: 'Attacks', home: 45, away: 40, homePercent: 53, awayPercent: 47 }
          ],
          winProbabilityHistory: [
            { minute: 0, homeProb: 50, drawProb: 25, awayProb: 25 }
          ],
          momentumHistory: [],
          homeTeam: {
            name: homeName,
            shortName: homeName.substring(0, 3).toUpperCase(),
            color: '#3b82f6',
            score: inPlay ? 1 : '-'
          },
          awayTeam: {
            name: awayName,
            shortName: awayName.substring(0, 3).toUpperCase(),
            color: '#ef4444',
            score: inPlay ? 0 : '-'
          },
          clock: inPlay ? 'In-Play (Live Betfair Odds)' : 'Scheduled',
          inPlay,
          status: isSettled ? 'SETTLED' : inPlay ? 'LIVE' : 'UPCOMING',
          isLocked: Boolean(m.is_sus),
          markets
        });
      } catch {
        // Continue to next match
      }
    }

    return results;
  } catch (err) {
    console.warn('[FairplayClient] Failed to fetch live exchange matches:', err);
    return [];
  }
}

export async function fetchLiveMatkaMarkets(): Promise<MatkaMarket[]> {
  try {
    const res = await fetch('https://zplay1.in/api/v1/worli/public/matches', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(6000)
    });

    if (!res.ok) return [];
    const json = await res.json();
    const list: any[] = json.data || [];

    return list.map((m: any) => {
      let parsedRates: any = {};
      try {
        parsedRates = typeof m.match_type === 'string' ? JSON.parse(m.match_type) : m.match_type || {};
      } catch {}

      return {
        id: m.id,
        title: m.match_title || 'Matka Bazar',
        category: m.category_name || 'MATKA MARKET',
        openBids: m.open_bids || '10:00',
        closeBids: m.close_bids || '11:00',
        isSuspended: Boolean(m.suspend || m.open_suspend || m.close_suspend),
        rates: {
          single: parsedRates.single?.rate || 9,
          jodi: parsedRates.jodi?.rate || 90,
          singlePatti: parsedRates['single patti']?.rate || 140,
          doublePatti: parsedRates['double patti']?.rate || 280,
          triplePatti: parsedRates['triple patti']?.rate || 700
        },
        yesterdayResults: m.yesterdayResults || { open: null, close: null },
        todayResults: m.todayResults || { open: null, close: null }
      };
    });
  } catch (err) {
    console.warn('[FairplayClient] Failed to fetch Matka markets:', err);
    return [];
  }
}
