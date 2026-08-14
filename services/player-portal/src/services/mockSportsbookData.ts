import { LiveMatch, CashOutBet } from '../types/sportsbook';

export const INITIAL_LIVE_MATCHES: LiveMatch[] = [
  {
    id: 'MKT_ARS_CHE_PL',
    sport: 'Football',
    league: 'Premier League • Matchweek 28',
    homeTeam: {
      name: 'Arsenal',
      shortName: 'ARS',
      color: '#ef4444',
      score: 2
    },
    awayTeam: {
      name: 'Chelsea',
      shortName: 'CHE',
      color: '#3b82f6',
      score: 1
    },
    inPlay: true,
    isLocked: false,
    status: 'LIVE',
    clock: "74:18",
    currentPeriod: '2nd Half',
    possessionTeam: 'HOME',
    attackPhase: 'DANGEROUS_ATTACK',
    ballPosition: { x: 78, y: 34 },
    possessionStats: { home: 59, away: 41 },
    shots: [
      { id: 's1', team: 'HOME', player: 'Bukayo Saka', minute: 18, x: 88, y: 46, outcome: 'GOAL', xG: 0.42, distance: '12m', shotType: 'Left Foot Curl' },
      { id: 's2', team: 'HOME', player: 'Kai Havertz', minute: 26, x: 84, y: 52, outcome: 'SAVED', xG: 0.28, distance: '15m', shotType: 'Header' },
      { id: 's3', team: 'AWAY', player: 'Cole Palmer', minute: 39, x: 82, y: 40, outcome: 'MISSED', xG: 0.15, distance: '19m', shotType: 'Right Foot Volley' },
      { id: 's4', team: 'AWAY', player: 'Nicolas Jackson', minute: 54, x: 91, y: 50, outcome: 'GOAL', xG: 0.65, distance: '8m', shotType: 'Tap-in' },
      { id: 's5', team: 'HOME', player: 'Gabriel Martinelli', minute: 61, x: 86, y: 38, outcome: 'BLOCKED', xG: 0.19, distance: '16m', shotType: 'Right Foot' },
      { id: 's6', team: 'HOME', player: 'Kai Havertz', minute: 67, x: 92, y: 48, outcome: 'GOAL', xG: 0.58, distance: '7m', shotType: 'Header' },
      { id: 's7', team: 'AWAY', player: 'Cole Palmer', minute: 71, x: 79, y: 60, outcome: 'SAVED', xG: 0.22, distance: '22m', shotType: 'Direct Free Kick' }
    ],
    winProbabilityHistory: [
      { minute: 0, homeProb: 48, drawProb: 28, awayProb: 24, event: 'Kickoff' },
      { minute: 18, homeProb: 72, drawProb: 19, awayProb: 9, event: '⚽ 1-0 Saka' },
      { minute: 35, homeProb: 68, drawProb: 22, awayProb: 10 },
      { minute: 45, homeProb: 65, drawProb: 24, awayProb: 11, event: 'Halftime' },
      { minute: 54, homeProb: 42, drawProb: 38, awayProb: 20, event: '⚽ 1-1 Jackson' },
      { minute: 67, homeProb: 78, drawProb: 15, awayProb: 7, event: '⚽ 2-1 Havertz' },
      { minute: 74, homeProb: 81, drawProb: 14, awayProb: 5, event: '74 min' }
    ],
    momentumHistory: [
      { minute: 5, momentum: 25 },
      { minute: 18, momentum: 85, event: 'Arsenal Goal', eventType: 'GOAL' },
      { minute: 30, momentum: 45 },
      { minute: 40, momentum: -15 },
      { minute: 45, momentum: 10 },
      { minute: 54, momentum: -75, event: 'Chelsea Goal', eventType: 'GOAL' },
      { minute: 60, momentum: 30 },
      { minute: 67, momentum: 90, event: 'Arsenal Goal', eventType: 'GOAL' },
      { minute: 74, momentum: 65 }
    ],
    stats: [
      { label: 'Expected Goals (xG)', home: 2.14, away: 1.18, homePercent: 64, awayPercent: 36 },
      { label: 'Total Shots', home: 14, away: 8, homePercent: 63, awayPercent: 37 },
      { label: 'Shots on Target', home: 6, away: 3, homePercent: 67, awayPercent: 33 },
      { label: 'Possession %', home: '59%', away: '41%', homePercent: 59, awayPercent: 41 },
      { label: 'Dangerous Attacks', home: 54, away: 32, homePercent: 62, awayPercent: 38 },
      { label: 'Corner Kicks', home: 7, away: 3, homePercent: 70, awayPercent: 30 },
      { label: 'Fouls Committed', home: 8, away: 12, homePercent: 40, awayPercent: 60 },
      { label: 'Yellow Cards', home: 1, away: 3, homePercent: 25, awayPercent: 75 },
      { label: 'Goalkeeper Saves', home: 2, away: 4, homePercent: 33, awayPercent: 67 }
    ],
    events: [
      { id: 'e1', minute: "18'", team: 'HOME', type: 'GOAL', player: 'Bukayo Saka', detail: 'Assist: Martin Ødegaard' },
      { id: 'e2', minute: "34'", team: 'AWAY', type: 'YELLOW_CARD', player: 'Moisés Caicedo', detail: 'Tactical foul' },
      { id: 'e3', minute: "54'", team: 'AWAY', type: 'GOAL', player: 'Nicolas Jackson', detail: 'Assist: Cole Palmer' },
      { id: 'e4', minute: "67'", team: 'HOME', type: 'GOAL', player: 'Kai Havertz', detail: 'Assist: Declan Rice' },
      { id: 'e5', minute: "71'", team: 'HOME', type: 'YELLOW_CARD', player: 'Gabriel Magalhães', detail: 'Argument' }
    ],
    markets: [
      {
        id: 'MKT_MAIN_1X2',
        name: 'Match Result (1X2)',
        category: 'MAIN',
        selections: [
          { id: 'sel_home', name: 'Arsenal', price: 1.25, tick: 'down' },
          { id: 'sel_draw', name: 'Draw', price: 6.20, tick: 'up' },
          { id: 'sel_away', name: 'Chelsea', price: 14.50, tick: 'up' }
        ]
      },
      {
        id: 'MKT_HANDICAP',
        name: 'Spread / Asian Handicap',
        category: 'HANDICAPS',
        selections: [
          { id: 'sel_hcap_home', name: 'Arsenal (-1.5)', price: 1.85, handicap: '-1.5', tick: 'same' },
          { id: 'sel_hcap_away', name: 'Chelsea (+1.5)', price: 1.95, handicap: '+1.5', tick: 'same' }
        ]
      },
      {
        id: 'MKT_TOTAL_GOALS',
        name: 'Total Goals (Over/Under)',
        category: 'TOTALS',
        selections: [
          { id: 'sel_over_3_5', name: 'Over 3.5 Goals', price: 1.78, tick: 'down' },
          { id: 'sel_under_3_5', name: 'Under 3.5 Goals', price: 2.05, tick: 'up' },
          { id: 'sel_over_4_5', name: 'Over 4.5 Goals', price: 3.40, tick: 'same' },
          { id: 'sel_under_4_5', name: 'Under 4.5 Goals', price: 1.32, tick: 'same' }
        ]
      },
      {
        id: 'MKT_NEXT_GOAL',
        name: 'Next Goal (Goal 4)',
        category: 'MAIN',
        selections: [
          { id: 'sel_ng_ars', name: 'Arsenal (Goal 4)', price: 2.10, tick: 'down' },
          { id: 'sel_ng_none', name: 'No 4th Goal', price: 2.25, tick: 'up' },
          { id: 'sel_ng_che', name: 'Chelsea (Goal 4)', price: 4.80, tick: 'same' }
        ]
      },
      {
        id: 'MKT_PROPS_ANYTIME',
        name: 'Player Props: Anytime Goalscorer',
        category: 'PROPS',
        selections: [
          { id: 'sel_prop_saka2', name: 'Bukayo Saka to score 2+', price: 3.20, tick: 'same' },
          { id: 'sel_prop_palmer', name: 'Cole Palmer to score', price: 4.50, tick: 'up' },
          { id: 'sel_prop_havertz2', name: 'Kai Havertz to score 2+', price: 3.80, tick: 'same' },
          { id: 'sel_prop_nkunku', name: 'Christopher Nkunku to score', price: 5.50, tick: 'same' }
        ]
      },
      {
        id: 'MKT_PROPS_SOT',
        name: 'Player Props: Shots on Target (SOT)',
        category: 'PROPS',
        selections: [
          { id: 'sel_prop_saka_sot', name: 'Bukayo Saka Over 1.5 SOT', price: 1.45, tick: 'down' },
          { id: 'sel_prop_palmer_sot', name: 'Cole Palmer Over 1.5 SOT', price: 1.85, tick: 'same' },
          { id: 'sel_prop_odegaard_sot', name: 'Martin Ødegaard Over 0.5 SOT', price: 1.62, tick: 'same' }
        ]
      },
      {
        id: 'MKT_CORNERS',
        name: 'Total Corners Match Line',
        category: 'CORNERS_CARDS',
        selections: [
          { id: 'sel_corn_over_11', name: 'Over 11.5 Corners', price: 1.80, tick: 'same' },
          { id: 'sel_corn_under_11', name: 'Under 11.5 Corners', price: 1.95, tick: 'same' }
        ]
      }
    ]
  },
  {
    id: 'MKT_LAL_GSW_NBA',
    sport: 'Basketball',
    league: 'NBA • Western Conference',
    homeTeam: {
      name: 'LA Lakers',
      shortName: 'LAL',
      color: '#fbbf24',
      score: 86,
      subScore: 'Q3 (24-21)'
    },
    awayTeam: {
      name: 'Golden State Warriors',
      shortName: 'GSW',
      color: '#2563eb',
      score: 82,
      subScore: 'Q3 (24-21)'
    },
    inPlay: true,
    isLocked: false,
    status: 'LIVE',
    clock: 'Q3 04:18',
    currentPeriod: '3rd Quarter',
    possessionTeam: 'AWAY',
    attackPhase: 'PENALTY_BOX',
    ballPosition: { x: 72, y: 50 },
    possessionStats: { home: 52, away: 48 },
    shots: [
      { id: 'nb1', team: 'HOME', player: 'LeBron James', minute: 4, x: 85, y: 50, outcome: 'GOAL', xG: 0.65, distance: '3m', shotType: 'Driving Dunk' },
      { id: 'nb2', team: 'AWAY', player: 'Stephen Curry', minute: 6, x: 70, y: 22, outcome: 'GOAL', xG: 0.44, distance: '8.2m', shotType: 'Deep 3-Pointer' },
      { id: 'nb3', team: 'HOME', player: 'Anthony Davis', minute: 9, x: 88, y: 48, outcome: 'GOAL', xG: 0.72, distance: '2m', shotType: 'Alley-Oop' },
      { id: 'nb4', team: 'AWAY', player: 'Klay Thompson', minute: 14, x: 72, y: 78, outcome: 'MISSED', xG: 0.38, distance: '7.8m', shotType: 'Corner 3' }
    ],
    winProbabilityHistory: [
      { minute: 0, homeProb: 52, drawProb: 0, awayProb: 48, event: 'Tipoff' },
      { minute: 12, homeProb: 58, drawProb: 0, awayProb: 42, event: 'End Q1' },
      { minute: 24, homeProb: 47, drawProb: 0, awayProb: 53, event: 'Halftime (52-54)' },
      { minute: 32, homeProb: 64, drawProb: 0, awayProb: 36, event: 'Lakers 10-2 Run' }
    ],
    momentumHistory: [
      { minute: 6, momentum: 40 },
      { minute: 12, momentum: 60, event: 'LAL Run', eventType: 'CHANCE' },
      { minute: 20, momentum: -50, event: 'GSW 3PT Barrage', eventType: 'GOAL' },
      { minute: 28, momentum: 70, event: 'AD Block & Slam', eventType: 'GOAL' }
    ],
    stats: [
      { label: 'Field Goal %', home: '49.2%', away: '44.8%', homePercent: 52, awayPercent: 48 },
      { label: '3-Point Field Goals', home: '9/22 (40%)', away: '14/33 (42%)', homePercent: 40, awayPercent: 60 },
      { label: 'Rebounds (Off/Def)', home: '38 (10/28)', away: '31 (6/25)', homePercent: 55, awayPercent: 45 },
      { label: 'Assists', home: 22, away: 24, homePercent: 48, awayPercent: 52 },
      { label: 'Points in the Paint', home: 46, away: 30, homePercent: 61, awayPercent: 39 },
      { label: 'Turnovers', home: 9, away: 13, homePercent: 41, awayPercent: 59 }
    ],
    events: [
      { id: 'e10', minute: "Q3 05:40", team: 'HOME', type: '3_POINTER', player: 'Austin Reaves', detail: 'Corner 3' },
      { id: 'e11', minute: "Q3 04:55", team: 'AWAY', type: '3_POINTER', player: 'Stephen Curry', detail: 'Step-back 3PT' },
      { id: 'e12', minute: "Q3 04:18", team: 'HOME', type: 'PENALTY', player: 'Anthony Davis', detail: 'And-1 Free Throw' }
    ],
    markets: [
      {
        id: 'MKT_NBA_ML',
        name: 'Moneyline (To Win)',
        category: 'MAIN',
        selections: [
          { id: 'nba_lal_win', name: 'LA Lakers', price: 1.52, tick: 'down' },
          { id: 'nba_gsw_win', name: 'Golden State Warriors', price: 2.65, tick: 'up' }
        ]
      },
      {
        id: 'MKT_NBA_SPREAD',
        name: 'Point Spread',
        category: 'HANDICAPS',
        selections: [
          { id: 'nba_lal_spread', name: 'LA Lakers (-4.5)', price: 1.91, handicap: '-4.5', tick: 'same' },
          { id: 'nba_gsw_spread', name: 'Golden State Warriors (+4.5)', price: 1.91, handicap: '+4.5', tick: 'same' }
        ]
      },
      {
        id: 'MKT_NBA_TOTAL',
        name: 'Total Game Points (O/U)',
        category: 'TOTALS',
        selections: [
          { id: 'nba_over_228', name: 'Over 228.5 Points', price: 1.88, tick: 'up' },
          { id: 'nba_under_228', name: 'Under 228.5 Points', price: 1.94, tick: 'down' }
        ]
      },
      {
        id: 'MKT_NBA_PROPS',
        name: 'Player Points Over/Under',
        category: 'PROPS',
        selections: [
          { id: 'nba_lebron_pts', name: 'LeBron James Over 26.5 Pts', price: 1.75, tick: 'same' },
          { id: 'nba_curry_pts', name: 'Stephen Curry Over 29.5 Pts', price: 1.85, tick: 'down' },
          { id: 'nba_ad_reb', name: 'Anthony Davis Over 12.5 Reb', price: 1.68, tick: 'down' }
        ]
      }
    ]
  },
  {
    id: 'MKT_IND_AUS_T20',
    sport: 'Cricket',
    league: 'ICC T20 World Super Cup',
    homeTeam: {
      name: 'India',
      shortName: 'IND',
      color: '#0284c7',
      score: '174/4',
      subScore: '(17.2/20 Ov)'
    },
    awayTeam: {
      name: 'Australia',
      shortName: 'AUS',
      color: '#eab308',
      score: '168/7',
      subScore: '(20.0 Ov)'
    },
    inPlay: true,
    isLocked: false,
    status: 'LIVE',
    clock: '17.2 Overs',
    currentPeriod: '2nd Innings',
    possessionTeam: 'HOME',
    attackPhase: 'DANGEROUS_ATTACK',
    ballPosition: { x: 50, y: 50 },
    possessionStats: { home: 55, away: 45 },
    shots: [
      { id: 'cr1', team: 'HOME', player: 'Virat Kohli', minute: 14, x: 50, y: 90, outcome: 'GOAL', xG: 0.9, distance: '85m', shotType: 'Six over Long-On' },
      { id: 'cr2', team: 'HOME', player: 'Hardik Pandya', minute: 17, x: 80, y: 75, outcome: 'GOAL', xG: 0.85, distance: '78m', shotType: 'Flat Six Deep Midwicket' }
    ],
    winProbabilityHistory: [
      { minute: 0, homeProb: 50, drawProb: 0, awayProb: 50, event: 'Toss' },
      { minute: 10, homeProb: 44, drawProb: 0, awayProb: 56, event: 'AUS 168/7' },
      { minute: 15, homeProb: 72, drawProb: 0, awayProb: 28, event: 'Kohli 50*' },
      { minute: 17, homeProb: 88, drawProb: 0, awayProb: 12, event: 'Need 12 from 16' }
    ],
    momentumHistory: [
      { minute: 5, momentum: -30 },
      { minute: 10, momentum: 10 },
      { minute: 15, momentum: 75, event: '20-Run Over', eventType: 'GOAL' },
      { minute: 17, momentum: 90 }
    ],
    stats: [
      { label: 'Current Run Rate', home: '10.03 RPO', away: '8.40 RPO', homePercent: 55, awayPercent: 45 },
      { label: 'Required Run Rate', home: '4.50 RPO', away: 'Target: 169', homePercent: 70, awayPercent: 30 },
      { label: 'Boundaries (4s / 6s)', home: '14 / 8', away: '12 / 6', homePercent: 58, awayPercent: 42 },
      { label: 'Dot Ball %', home: '28%', away: '39%', homePercent: 60, awayPercent: 40 }
    ],
    events: [
      { id: 'e20', minute: "16.4 Ov", team: 'HOME', type: 'BOUNDARY', player: 'Hardik Pandya', detail: 'FOUR through covers' },
      { id: 'e21', minute: "17.1 Ov", team: 'HOME', type: 'BOUNDARY', player: 'Virat Kohli', detail: 'SIX over extra cover (72m)' }
    ],
    markets: [
      {
        id: 'MKT_CRI_WIN',
        name: 'Match Winner',
        category: 'MAIN',
        selections: [
          { id: 'cri_ind_win', name: 'India', price: 1.14, tick: 'down' },
          { id: 'cri_aus_win', name: 'Australia', price: 6.80, tick: 'up' }
        ]
      },
      {
        id: 'MKT_CRI_RUNS',
        name: '18th Over Total Runs (Over/Under)',
        category: 'TOTALS',
        selections: [
          { id: 'cri_ov18_over', name: 'Over 8.5 Runs', price: 1.82, tick: 'same' },
          { id: 'cri_ov18_under', name: 'Under 8.5 Runs', price: 1.95, tick: 'same' }
        ]
      }
    ]
  },
  {
    id: 'MKT_ALC_SIN_WIM',
    sport: 'Tennis',
    league: 'Grand Slam Finals',
    homeTeam: {
      name: 'Carlos Alcaraz',
      shortName: 'ALC',
      color: '#10b981',
      score: '1',
      subScore: '6-4, 3-6, 4-3 (40-30*)'
    },
    awayTeam: {
      name: 'Jannik Sinner',
      shortName: 'SIN',
      color: '#f97316',
      score: '1',
      subScore: '6-4, 3-6, 3-4 (30-40)'
    },
    inPlay: true,
    isLocked: false,
    status: 'LIVE',
    clock: 'Set 3 (Game 8)',
    currentPeriod: 'Set 3',
    possessionTeam: 'HOME',
    attackPhase: 'PENALTY_BOX',
    ballPosition: { x: 50, y: 75 },
    possessionStats: { home: 51, away: 49 },
    shots: [],
    winProbabilityHistory: [
      { minute: 0, homeProb: 50, drawProb: 0, awayProb: 50, event: 'Match Start' },
      { minute: 45, homeProb: 68, drawProb: 0, awayProb: 32, event: 'Alcaraz 1st Set (6-4)' },
      { minute: 90, homeProb: 48, drawProb: 0, awayProb: 52, event: 'Sinner 2nd Set (6-3)' },
      { minute: 130, homeProb: 57, drawProb: 0, awayProb: 43, event: 'Break Point' }
    ],
    momentumHistory: [
      { minute: 30, momentum: 55 },
      { minute: 60, momentum: -60, event: 'Sinner Break', eventType: 'CHANCE' },
      { minute: 100, momentum: 40 }
    ],
    stats: [
      { label: 'Aces / Double Faults', home: '8 / 2', away: '11 / 3', homePercent: 45, awayPercent: 55 },
      { label: '1st Serve Win %', home: '78%', away: '76%', homePercent: 51, awayPercent: 49 },
      { label: 'Break Points Converted', home: '2/4 (50%)', away: '2/5 (40%)', homePercent: 55, awayPercent: 45 },
      { label: 'Total Winners', home: 34, away: 31, homePercent: 52, awayPercent: 48 }
    ],
    events: [
      { id: 't1', minute: 'Set 3 G7', team: 'HOME', type: 'BOUNDARY', player: 'Alcaraz', detail: 'Forehand down the line winner' }
    ],
    markets: [
      {
        id: 'MKT_TEN_WIN',
        name: 'Match Winner',
        category: 'MAIN',
        selections: [
          { id: 'ten_alc_win', name: 'Carlos Alcaraz', price: 1.76, tick: 'down' },
          { id: 'ten_sin_win', name: 'Jannik Sinner', price: 2.10, tick: 'up' }
        ]
      },
      {
        id: 'MKT_TEN_SET3',
        name: 'Set 3 Winner',
        category: 'PERIODS',
        selections: [
          { id: 'ten_alc_s3', name: 'Carlos Alcaraz (Set 3)', price: 1.55, tick: 'down' },
          { id: 'ten_sin_s3', name: 'Jannik Sinner (Set 3)', price: 2.45, tick: 'up' }
        ]
      }
    ]
  }
];

export const INITIAL_CASHOUT_BETS: CashOutBet[] = [
  {
    id: 'BET_CO_1',
    matchId: 'MKT_ARS_CHE_PL',
    eventName: 'Arsenal vs Chelsea',
    marketName: 'Match Result (1X2)',
    selectionName: 'Arsenal to Win',
    type: 'SPORTSBOOK',
    placedOdds: 2.10,
    currentOdds: 1.25,
    stake: 1000,
    remainingStake: 1000,
    potentialReturn: 2100,
    cashOutOffer: 1612.80,
    prevCashOutOffer: 1580.00,
    tick: 'up',
    status: 'OPEN',
    cashedOutAmount: 0,
    placedAt: '74 mins ago'
  },
  {
    id: 'BET_CO_2',
    matchId: 'MKT_ARS_CHE_PL',
    eventName: 'Arsenal vs Chelsea',
    marketName: 'Same-Game Parlay (3 Legs)',
    selectionName: 'Arsenal Win + Over 2.5 Goals + Saka 1+ SOT',
    type: 'SGP',
    placedOdds: 3.80,
    currentOdds: 1.45,
    stake: 500,
    remainingStake: 500,
    potentialReturn: 1900,
    cashOutOffer: 1250.00,
    prevCashOutOffer: 1190.00,
    tick: 'up',
    status: 'OPEN',
    cashedOutAmount: 0,
    sgpLegsSummary: [
      '✓ Arsenal to Win (Leading 2-1)',
      '✓ Over 2.5 Goals (3 goals scored)',
      '✓ Saka Over 0.5 SOT (1 Goal, 2 SOT)'
    ],
    placedAt: 'Kickoff'
  },
  {
    id: 'BET_CO_3',
    matchId: 'MKT_LAL_GSW_NBA',
    eventName: 'LA Lakers vs Golden State Warriors',
    marketName: 'Moneyline',
    selectionName: 'Golden State Warriors',
    type: 'SPORTSBOOK',
    placedOdds: 2.15,
    currentOdds: 2.65,
    stake: 800,
    remainingStake: 800,
    potentialReturn: 1720,
    cashOutOffer: 615.00,
    prevCashOutOffer: 650.00,
    tick: 'down',
    status: 'OPEN',
    cashedOutAmount: 0,
    placedAt: 'Q1'
  }
];
