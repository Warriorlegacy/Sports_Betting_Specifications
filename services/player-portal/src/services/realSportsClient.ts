import { LiveMatch, BettingMarket, SportCategory } from '../types/sportsbook';

interface RealSportFeed {
  sport: SportCategory;
  league: string;
  country: string;
  flag: string;
  url: string;
}

const REAL_FEEDS: RealSportFeed[] = [
  {
    sport: 'Football',
    league: 'Premier League',
    country: 'England',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard'
  },
  {
    sport: 'Football',
    league: 'La Liga',
    country: 'Spain',
    flag: '🇪🇸',
    url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard'
  },
  {
    sport: 'Football',
    league: 'Serie A',
    country: 'Italy',
    flag: '🇮🇹',
    url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/ita.1/scoreboard'
  },
  {
    sport: 'Football',
    league: 'UEFA Champions League',
    country: 'Europe',
    flag: '🇪🇺',
    url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard'
  },
  {
    sport: 'Football',
    league: 'Major League Soccer',
    country: 'USA',
    flag: '🇺🇸',
    url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/scoreboard'
  },
  {
    sport: 'Basketball',
    league: 'WNBA',
    country: 'USA',
    flag: '🇺🇸',
    url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/scoreboard'
  },
  {
    sport: 'Basketball',
    league: 'NBA',
    country: 'USA',
    flag: '🇺🇸',
    url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard'
  },
  {
    sport: 'Baseball',
    league: 'MLB',
    country: 'USA',
    flag: '🇺🇸',
    url: 'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard'
  },
  {
    sport: 'Tennis',
    league: 'ATP World Tour',
    country: 'Global',
    flag: '🌍',
    url: 'https://site.api.espn.com/apis/site/v2/sports/tennis/atp/scoreboard'
  },
  {
    sport: 'Cricket',
    league: 'International Cricket',
    country: 'Global',
    flag: '🌍',
    url: 'https://site.api.espn.com/apis/site/v2/sports/cricket/scoreboard'
  }
];

function calculateRealOdds(
  sport: SportCategory,
  homeScore: number,
  awayScore: number,
  inPlay: boolean,
  homeName: string,
  awayName: string
): BettingMarket[] {
  const diff = homeScore - awayScore;
  let homeOdds = 1.95;
  let awayOdds = 1.95;
  let drawOdds = 3.40;

  if (sport === 'Football') {
    if (diff > 0) {
      homeOdds = Math.max(1.08, +(1.60 - diff * 0.22).toFixed(2));
      awayOdds = Math.min(18.0, +(3.20 + diff * 2.10).toFixed(2));
      drawOdds = Math.min(12.0, +(3.50 + diff * 1.40).toFixed(2));
    } else if (diff < 0) {
      const d = Math.abs(diff);
      homeOdds = Math.min(18.0, +(3.20 + d * 2.10).toFixed(2));
      awayOdds = Math.max(1.08, +(1.60 - d * 0.22).toFixed(2));
      drawOdds = Math.min(12.0, +(3.50 + d * 1.40).toFixed(2));
    } else {
      homeOdds = 2.35;
      awayOdds = 2.85;
      drawOdds = 3.20;
    }

    return [
      {
        id: `MKT_MAIN_${homeName}_${awayName}`,
        name: 'Match Result (1X2)',
        category: 'MAIN',
        selections: [
          { id: '1', name: homeName, price: homeOdds, tick: 'same' },
          { id: '3', name: 'Draw', price: drawOdds, tick: 'same' },
          { id: '2', name: awayName, price: awayOdds, tick: 'same' }
        ]
      },
      {
        id: `MKT_TOT_${homeName}_${awayName}`,
        name: 'Total Goals (Over/Under 2.5)',
        category: 'TOTALS',
        selections: [
          { id: 'ov', name: 'Over 2.5 Goals', price: 1.82, tick: 'same' },
          { id: 'un', name: 'Under 2.5 Goals', price: 1.98, tick: 'same' }
        ]
      },
      {
        id: 'MKT_AH',
        name: 'Asian Handicap (-1.5 / +1.5)',
        category: 'HANDICAPS',
        selections: [
          { id: 'ah_h', name: `${homeName} (-1.5)`, price: 2.15, handicap: '-1.5', tick: 'same' },
          { id: 'ah_a', name: `${awayName} (+1.5)`, price: 1.72, handicap: '+1.5', tick: 'same' }
        ]
      }
    ];
  }

  if (sport === 'Basketball') {
    if (diff > 0) {
      homeOdds = Math.max(1.05, +(1.80 - diff * 0.04).toFixed(2));
      awayOdds = Math.min(12.0, +(1.95 + diff * 0.15).toFixed(2));
    } else if (diff < 0) {
      const d = Math.abs(diff);
      homeOdds = Math.min(12.0, +(1.95 + d * 0.15).toFixed(2));
      awayOdds = Math.max(1.05, +(1.80 - d * 0.04).toFixed(2));
    }

    return [
      {
        id: `MKT_MAIN_${homeName}_${awayName}`,
        name: 'Moneyline',
        category: 'MAIN',
        selections: [
          { id: '1', name: homeName, price: homeOdds, tick: 'same' },
          { id: '2', name: awayName, price: awayOdds, tick: 'same' }
        ]
      },
      {
        id: 'MKT_TOT',
        name: 'Total Game Points (O/U 224.5)',
        category: 'TOTALS',
        selections: [
          { id: 'ov', name: 'Over 224.5 Pts', price: 1.88, tick: 'same' },
          { id: 'un', name: 'Under 224.5 Pts', price: 1.94, tick: 'same' }
        ]
      }
    ];
  }

  // Baseball / Tennis / General
  if (diff > 0) {
    homeOdds = Math.max(1.10, +(1.75 - diff * 0.18).toFixed(2));
    awayOdds = Math.min(9.00, +(2.15 + diff * 0.65).toFixed(2));
  } else if (diff < 0) {
    const d = Math.abs(diff);
    homeOdds = Math.min(9.00, +(2.15 + d * 0.65).toFixed(2));
    awayOdds = Math.max(1.10, +(1.75 - d * 0.18).toFixed(2));
  }

  return [
    {
      id: `MKT_MAIN_${homeName}_${awayName}`,
      name: 'Match Winner / Moneyline',
      category: 'MAIN',
      selections: [
        { id: '1', name: homeName, price: homeOdds, tick: 'same' },
        { id: '2', name: awayName, price: awayOdds, tick: 'same' }
      ]
    },
    {
      id: 'MKT_TOT',
      name: 'Totals (Over/Under)',
      category: 'TOTALS',
      selections: [
        { id: 'ov', name: 'Over Line', price: 1.85, tick: 'same' },
        { id: 'un', name: 'Under Line', price: 1.95, tick: 'same' }
      ]
    }
  ];
}

export async function fetchRealWorldSports(): Promise<LiveMatch[]> {
  const allMatches: LiveMatch[] = [];

  for (const feed of REAL_FEEDS) {
    try {
      const res = await fetch(feed.url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(6000)
      });
      if (!res.ok) continue;

      const data = await res.json();
      const events: any[] = data.events || [];

      for (const ev of events) {
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
        const isSettled = state === 'post' || Boolean(ev.status?.type?.completed);
        const clockStr = ev.status?.displayClock || ev.status?.type?.shortDetail || ev.status?.type?.detail || 'Scheduled';

        const matchDate = ev.date ? ev.date.split('T')[0] : new Date().toISOString().split('T')[0];
        const startTime = ev.date
          ? new Date(ev.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '19:00';

        const markets = calculateRealOdds(feed.sport, homeScore, awayScore, inPlay, homeTeam, awayTeam);

        allMatches.push({
          id: `REAL_${feed.sport}_${ev.id}`,
          sport: feed.sport,
          league: feed.league,
          country: feed.country,
          flag: feed.flag,
          matchDate,
          startTime,
          currentPeriod: ev.status?.type?.shortDetail || (inPlay ? 'Live' : 'Pre-Match'),
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
            name: homeTeam,
            shortName: (homeComp.team?.abbreviation || homeTeam.substring(0, 3)).toUpperCase(),
            color: homeComp.team?.color ? `#${homeComp.team.color}` : '#3b82f6',
            score: inPlay || isSettled ? homeScore : '-'
          },
          awayTeam: {
            name: awayTeam,
            shortName: (awayComp.team?.abbreviation || awayTeam.substring(0, 3)).toUpperCase(),
            color: awayComp.team?.color ? `#${awayComp.team.color}` : '#ef4444',
            score: inPlay || isSettled ? awayScore : '-'
          },
          clock: clockStr,
          inPlay,
          status: isSettled ? 'SETTLED' : inPlay ? 'LIVE' : 'UPCOMING',
          isLocked: false,
          markets
        });
      }
    } catch {
      // Ignore individual feed errors
    }
  }

  return allMatches;
}
