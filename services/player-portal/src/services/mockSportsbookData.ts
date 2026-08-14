import { LiveMatch, CashOutBet } from '../types/sportsbook';

export const INITIAL_LIVE_MATCHES: LiveMatch[] = [
  // ==========================================
  // 1. FOOTBALL (SOCCER) - TODAY (2026-08-14)
  // ==========================================
  {
    id: 'MKT_ARS_CHE_PL',
    sport: 'Football',
    league: 'Premier League • Matchweek 28',
    country: 'England',
    flag: '🇬🇧',
    matchDate: '2026-08-14',
    startTime: '19:45 BST',
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
      { id: 's3', team: 'AWAY', player: 'Nicolas Jackson', minute: 54, x: 91, y: 50, outcome: 'GOAL', xG: 0.65, distance: '8m', shotType: 'Tap-in' },
      { id: 's4', team: 'HOME', player: 'Kai Havertz', minute: 67, x: 92, y: 48, outcome: 'GOAL', xG: 0.58, distance: '7m', shotType: 'Header' }
    ],
    winProbabilityHistory: [
      { minute: 0, homeProb: 48, drawProb: 28, awayProb: 24, event: 'Kickoff' },
      { minute: 18, homeProb: 72, drawProb: 19, awayProb: 9, event: '⚽ 1-0 Saka' },
      { minute: 54, homeProb: 42, drawProb: 38, awayProb: 20, event: '⚽ 1-1 Jackson' },
      { minute: 67, homeProb: 81, drawProb: 14, awayProb: 5, event: '⚽ 2-1 Havertz' }
    ],
    momentumHistory: [
      { minute: 18, momentum: 85, event: 'Arsenal Goal', eventType: 'GOAL' },
      { minute: 54, momentum: -75, event: 'Chelsea Goal', eventType: 'GOAL' },
      { minute: 67, momentum: 90, event: 'Arsenal Goal', eventType: 'GOAL' }
    ],
    stats: [
      { label: 'Expected Goals (xG)', home: 2.14, away: 1.18, homePercent: 64, awayPercent: 36 },
      { label: 'Total Shots', home: 14, away: 8, homePercent: 63, awayPercent: 37 },
      { label: 'Possession %', home: '59%', away: '41%', homePercent: 59, awayPercent: 41 },
      { label: 'Dangerous Attacks', home: 54, away: 32, homePercent: 62, awayPercent: 38 },
      { label: 'Corner Kicks', home: 7, away: 3, homePercent: 70, awayPercent: 30 }
    ],
    events: [
      { id: 'e1', minute: "18'", team: 'HOME', type: 'GOAL', player: 'Bukayo Saka', detail: 'Assist: Martin Ødegaard' },
      { id: 'e2', minute: "54'", team: 'AWAY', type: 'GOAL', player: 'Nicolas Jackson', detail: 'Assist: Cole Palmer' },
      { id: 'e3', minute: "67'", team: 'HOME', type: 'GOAL', player: 'Kai Havertz', detail: 'Assist: Declan Rice' }
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
        id: 'MKT_TOTAL_GOALS',
        name: 'Total Goals (Over/Under)',
        category: 'TOTALS',
        selections: [
          { id: 'sel_over_3_5', name: 'Over 3.5 Goals', price: 1.78, tick: 'down' },
          { id: 'sel_under_3_5', name: 'Under 3.5 Goals', price: 2.05, tick: 'up' }
        ]
      }
    ]
  },
  {
    id: 'MKT_RMA_OSA_LL',
    sport: 'Football',
    league: 'La Liga • Matchday 24',
    country: 'Spain',
    flag: '🇪🇸',
    matchDate: '2026-08-14',
    startTime: '21:00 CEST',
    homeTeam: {
      name: 'Real Madrid',
      shortName: 'RMA',
      color: '#ffffff',
      score: 0
    },
    awayTeam: {
      name: 'Osasuna',
      shortName: 'OSA',
      color: '#dc2626',
      score: 0
    },
    inPlay: false,
    isLocked: false,
    status: 'UPCOMING',
    clock: 'Tonight 21:00',
    currentPeriod: 'Pre-Match',
    possessionTeam: 'NEUTRAL',
    attackPhase: 'SAFE',
    ballPosition: { x: 50, y: 50 },
    possessionStats: { home: 50, away: 50 },
    shots: [],
    winProbabilityHistory: [
      { minute: 0, homeProb: 75, drawProb: 16, awayProb: 9, event: 'Pre-Match' }
    ],
    momentumHistory: [],
    stats: [
      { label: 'Recent Form', home: 'W-W-W-D-W', away: 'L-D-W-L-D' },
      { label: 'Head-to-Head (Last 5)', home: '4 Wins', away: '0 Wins' }
    ],
    events: [],
    markets: [
      {
        id: 'MKT_RMA_WIN',
        name: 'Match Result (1X2)',
        category: 'MAIN',
        selections: [
          { id: 'rma_win', name: 'Real Madrid', price: 1.30, tick: 'same' },
          { id: 'rma_draw', name: 'Draw', price: 5.50, tick: 'same' },
          { id: 'osa_win', name: 'Osasuna', price: 10.00, tick: 'same' }
        ]
      },
      {
        id: 'MKT_RMA_HCAP',
        name: 'Handicap (-1.5)',
        category: 'HANDICAPS',
        selections: [
          { id: 'rma_hcap_home', name: 'Real Madrid (-1.5)', price: 1.88, handicap: '-1.5', tick: 'same' },
          { id: 'rma_hcap_away', name: 'Osasuna (+1.5)', price: 1.95, handicap: '+1.5', tick: 'same' }
        ]
      }
    ]
  },
  {
    id: 'MKT_MCI_LIV_PL',
    sport: 'Football',
    league: 'Premier League • Super Clash',
    country: 'England',
    flag: '🇬🇧',
    matchDate: '2026-08-15',
    startTime: 'Tomorrow 17:30 BST',
    homeTeam: {
      name: 'Manchester City',
      shortName: 'MCI',
      color: '#38bdf8',
      score: 0
    },
    awayTeam: {
      name: 'Liverpool',
      shortName: 'LIV',
      color: '#dc2626',
      score: 0
    },
    inPlay: false,
    isLocked: false,
    status: 'UPCOMING',
    clock: 'Tomorrow 17:30',
    currentPeriod: 'Pre-Match',
    possessionTeam: 'NEUTRAL',
    attackPhase: 'SAFE',
    ballPosition: { x: 50, y: 50 },
    possessionStats: { home: 50, away: 50 },
    shots: [],
    winProbabilityHistory: [
      { minute: 0, homeProb: 48, drawProb: 26, awayProb: 26, event: 'Pre-Match' }
    ],
    momentumHistory: [],
    stats: [
      { label: 'League Position', home: '1st (62 Pts)', away: '2nd (60 Pts)' }
    ],
    events: [],
    markets: [
      {
        id: 'MKT_MCI_LIV_1X2',
        name: 'Match Result (1X2)',
        category: 'MAIN',
        selections: [
          { id: 'mci_win', name: 'Manchester City', price: 2.05, tick: 'same' },
          { id: 'mci_draw', name: 'Draw', price: 3.60, tick: 'same' },
          { id: 'liv_win', name: 'Liverpool', price: 3.45, tick: 'same' }
        ]
      }
    ]
  },
  {
    id: 'MKT_BAR_RMA_CLASICO',
    sport: 'Football',
    league: 'El Clásico • Supercopa Grand Final',
    country: 'Spain',
    flag: '🇪🇸',
    matchDate: '2026-08-17',
    startTime: 'Sun 20:00 CEST',
    homeTeam: {
      name: 'Barcelona',
      shortName: 'BAR',
      color: '#0284c7',
      score: 0
    },
    awayTeam: {
      name: 'Real Madrid',
      shortName: 'RMA',
      color: '#ffffff',
      score: 0
    },
    inPlay: false,
    isLocked: false,
    status: 'UPCOMING',
    clock: 'Sun Aug 17',
    currentPeriod: 'Pre-Match',
    possessionTeam: 'NEUTRAL',
    attackPhase: 'SAFE',
    ballPosition: { x: 50, y: 50 },
    possessionStats: { home: 50, away: 50 },
    shots: [],
    winProbabilityHistory: [
      { minute: 0, homeProb: 44, drawProb: 24, awayProb: 32 }
    ],
    momentumHistory: [],
    stats: [
      { label: 'Venue', home: 'Santiago Bernabéu', away: 'Neutral Host' }
    ],
    events: [],
    markets: [
      {
        id: 'MKT_CLASICO_WIN',
        name: 'To Lift The Trophy',
        category: 'MAIN',
        selections: [
          { id: 'bar_trophy', name: 'Barcelona', price: 1.95, tick: 'same' },
          { id: 'rma_trophy', name: 'Real Madrid', price: 1.85, tick: 'same' }
        ]
      }
    ]
  },

  // ==========================================
  // 2. CRICKET - TODAY (2026-08-14) & UPCOMING
  // ==========================================
  {
    id: 'MKT_IND_AUS_T20',
    sport: 'Cricket',
    league: 'ICC T20 Super Series • 2nd T20I',
    country: 'India',
    flag: '🇮🇳',
    matchDate: '2026-08-14',
    startTime: '19:00 IST',
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
      { minute: 15, homeProb: 72, drawProb: 0, awayProb: 28, event: 'Kohli 50*' },
      { minute: 17, homeProb: 88, drawProb: 0, awayProb: 12, event: 'Need 12 from 16' }
    ],
    momentumHistory: [
      { minute: 15, momentum: 75, event: '20-Run Over', eventType: 'GOAL' },
      { minute: 17, momentum: 90 }
    ],
    stats: [
      { label: 'Current Run Rate', home: '10.03 RPO', away: '8.40 RPO', homePercent: 55, awayPercent: 45 },
      { label: 'Required Run Rate', home: '4.50 RPO', away: 'Target: 169', homePercent: 70, awayPercent: 30 },
      { label: 'Boundaries (4s / 6s)', home: '14 / 8', away: '12 / 6', homePercent: 58, awayPercent: 42 }
    ],
    events: [
      { id: 'e20', minute: "16.4 Ov", team: 'HOME', type: 'BOUNDARY', player: 'Hardik Pandya', detail: 'FOUR through covers' },
      { id: 'e21', minute: "17.1 Ov", team: 'HOME', type: 'BOUNDARY', player: 'Virat Kohli', detail: 'SIX over extra cover (72m)' }
    ],
    markets: [
      {
        id: 'MKT_CRIC_WIN',
        name: 'Match Winner',
        category: 'MAIN',
        selections: [
          { id: 'cric_ind_win', name: 'India', price: 1.14, tick: 'down' },
          { id: 'cric_aus_win', name: 'Australia', price: 6.50, tick: 'up' }
        ]
      },
      {
        id: 'MKT_OVER_RUNS_18',
        name: 'Runs in 18th Over (O/U)',
        category: 'PROPS',
        selections: [
          { id: 'runs_ov18_over', name: 'Over 8.5 Runs', price: 1.85, tick: 'same' },
          { id: 'runs_ov18_under', name: 'Under 8.5 Runs', price: 1.95, tick: 'same' }
        ]
      }
    ]
  },
  {
    id: 'MKT_HUNDRED_OVAL_TRENT',
    sport: 'Cricket',
    league: 'The Hundred • Men’s Tournament',
    country: 'United Kingdom',
    flag: '🇬🇧',
    matchDate: '2026-08-14',
    startTime: 'Tonight 18:30 BST',
    homeTeam: {
      name: 'Oval Invincibles',
      shortName: 'OVI',
      color: '#064e3b',
      score: '0/0'
    },
    awayTeam: {
      name: 'Trent Rockets',
      shortName: 'TRN',
      color: '#eab308',
      score: '0/0'
    },
    inPlay: false,
    isLocked: false,
    status: 'UPCOMING',
    clock: 'Tonight 18:30',
    currentPeriod: 'Pre-Match',
    possessionTeam: 'NEUTRAL',
    attackPhase: 'SAFE',
    ballPosition: { x: 50, y: 50 },
    possessionStats: { home: 50, away: 50 },
    shots: [],
    winProbabilityHistory: [],
    momentumHistory: [],
    stats: [
      { label: 'Pitch Condition', home: 'Batting Friendly', away: 'Avg 1st Innings: 154' }
    ],
    events: [],
    markets: [
      {
        id: 'MKT_HUNDRED_WIN',
        name: 'Match Winner',
        category: 'MAIN',
        selections: [
          { id: 'ovi_win', name: 'Oval Invincibles', price: 1.78, tick: 'same' },
          { id: 'trn_win', name: 'Trent Rockets', price: 2.06, tick: 'same' }
        ]
      }
    ]
  },
  {
    id: 'MKT_ENG_SA_ODI',
    sport: 'Cricket',
    league: 'South Africa Tour of England • 3rd ODI',
    country: 'England',
    flag: '🇬🇧',
    matchDate: '2026-08-15',
    startTime: 'Tomorrow 11:00 BST',
    homeTeam: {
      name: 'England',
      shortName: 'ENG',
      color: '#1e3a8a',
      score: '0/0'
    },
    awayTeam: {
      name: 'South Africa',
      shortName: 'RSA',
      color: '#15803d',
      score: '0/0'
    },
    inPlay: false,
    isLocked: false,
    status: 'UPCOMING',
    clock: 'Tomorrow 11:00',
    currentPeriod: 'Pre-Match',
    possessionTeam: 'NEUTRAL',
    attackPhase: 'SAFE',
    ballPosition: { x: 50, y: 50 },
    possessionStats: { home: 50, away: 50 },
    shots: [],
    winProbabilityHistory: [],
    momentumHistory: [],
    stats: [
      { label: 'Series Status', home: 'Series Tied 1-1', away: 'Decider Match' }
    ],
    events: [],
    markets: [
      {
        id: 'MKT_ENG_SA_WIN',
        name: 'Match Winner',
        category: 'MAIN',
        selections: [
          { id: 'eng_win', name: 'England', price: 1.82, tick: 'same' },
          { id: 'rsa_win', name: 'South Africa', price: 2.02, tick: 'same' }
        ]
      }
    ]
  },

  // ==========================================
  // 3. BASKETBALL - TODAY & UPCOMING
  // ==========================================
  {
    id: 'MKT_LAL_GSW_NBA',
    sport: 'Basketball',
    league: 'NBA • Western Conference',
    country: 'USA',
    flag: '🇺🇸',
    matchDate: '2026-08-14',
    startTime: '19:30 PST',
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
      { id: 'nb2', team: 'AWAY', player: 'Stephen Curry', minute: 6, x: 70, y: 22, outcome: 'GOAL', xG: 0.44, distance: '8.2m', shotType: 'Deep 3-Pointer' }
    ],
    winProbabilityHistory: [
      { minute: 0, homeProb: 52, drawProb: 0, awayProb: 48, event: 'Tipoff' },
      { minute: 32, homeProb: 64, drawProb: 0, awayProb: 36, event: 'Lakers 10-2 Run' }
    ],
    momentumHistory: [
      { minute: 28, momentum: 70, event: 'AD Block & Slam', eventType: 'GOAL' }
    ],
    stats: [
      { label: 'Field Goal %', home: '49.2%', away: '44.8%', homePercent: 52, awayPercent: 48 },
      { label: '3-Point Field Goals', home: '9/22 (40%)', away: '14/33 (42%)', homePercent: 40, awayPercent: 60 },
      { label: 'Rebounds (Off/Def)', home: '38 (10/28)', away: '31 (6/25)', homePercent: 55, awayPercent: 45 }
    ],
    events: [
      { id: 'e10', minute: "Q3 05:40", team: 'HOME', type: '3_POINTER', player: 'Austin Reaves', detail: 'Corner 3' },
      { id: 'e11', minute: "Q3 04:55", team: 'AWAY', type: '3_POINTER', player: 'Stephen Curry', detail: 'Step-back 3PT' }
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
      }
    ]
  },
  {
    id: 'MKT_BOS_MIL_NBA',
    sport: 'Basketball',
    league: 'NBA • Eastern Conference',
    country: 'USA',
    flag: '🇺🇸',
    matchDate: '2026-08-15',
    startTime: 'Tomorrow 20:00 EST',
    homeTeam: {
      name: 'Boston Celtics',
      shortName: 'BOS',
      color: '#15803d',
      score: 0
    },
    awayTeam: {
      name: 'Milwaukee Bucks',
      shortName: 'MIL',
      color: '#064e3b',
      score: 0
    },
    inPlay: false,
    isLocked: false,
    status: 'UPCOMING',
    clock: 'Tomorrow 20:00',
    currentPeriod: 'Pre-Match',
    possessionTeam: 'NEUTRAL',
    attackPhase: 'SAFE',
    ballPosition: { x: 50, y: 50 },
    possessionStats: { home: 50, away: 50 },
    shots: [],
    winProbabilityHistory: [],
    momentumHistory: [],
    stats: [
      { label: 'Conference Rank', home: '1st (East)', away: '3rd (East)' }
    ],
    events: [],
    markets: [
      {
        id: 'MKT_BOS_MIL_ML',
        name: 'Moneyline',
        category: 'MAIN',
        selections: [
          { id: 'bos_win', name: 'Boston Celtics', price: 1.62, tick: 'same' },
          { id: 'mil_win', name: 'Milwaukee Bucks', price: 2.38, tick: 'same' }
        ]
      }
    ]
  },

  // ==========================================
  // 4. TENNIS - TODAY & UPCOMING
  // ==========================================
  {
    id: 'MKT_ALC_SIN_WIM',
    sport: 'Tennis',
    league: 'ATP Masters 1000 Cincinnati • Quarter-Final',
    country: 'Global',
    flag: '🎾',
    matchDate: '2026-08-14',
    startTime: '15:00 EST',
    homeTeam: {
      name: 'Carlos Alcaraz',
      shortName: 'ALC',
      color: '#ea580c',
      score: '1',
      subScore: '6-4, 3-6, 4-4 (0-15)'
    },
    awayTeam: {
      name: 'Jannik Sinner',
      shortName: 'SIN',
      color: '#0284c7',
      score: '1',
      subScore: '4-6, 6-3, 4-4 (0-15)'
    },
    inPlay: true,
    isLocked: false,
    status: 'LIVE',
    clock: 'Set 3 (4-4)',
    currentPeriod: '3rd Set',
    possessionTeam: 'HOME',
    attackPhase: 'DANGEROUS_ATTACK',
    ballPosition: { x: 50, y: 80 },
    possessionStats: { home: 50, away: 50 },
    shots: [],
    winProbabilityHistory: [
      { minute: 0, homeProb: 50, drawProb: 0, awayProb: 50, event: 'Match Start' },
      { minute: 45, homeProb: 68, drawProb: 0, awayProb: 32, event: 'Alcaraz 1st Set (6-4)' },
      { minute: 90, homeProb: 48, drawProb: 0, awayProb: 52, event: 'Sinner 2nd Set (6-3)' }
    ],
    momentumHistory: [
      { minute: 30, momentum: 55 },
      { minute: 60, momentum: -60, event: 'Sinner Break', eventType: 'CHANCE' }
    ],
    stats: [
      { label: 'Aces / Double Faults', home: '8 / 2', away: '11 / 3', homePercent: 45, awayPercent: 55 },
      { label: '1st Serve Win %', home: '78%', away: '76%', homePercent: 51, awayPercent: 49 },
      { label: 'Break Points Converted', home: '2/4 (50%)', away: '2/5 (40%)', homePercent: 55, awayPercent: 45 }
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
      }
    ]
  },
  {
    id: 'MKT_SAB_SWI_WTA',
    sport: 'Tennis',
    league: 'WTA 1000 Cincinnati • Semi-Final',
    country: 'Global',
    flag: '🎾',
    matchDate: '2026-08-15',
    startTime: 'Tomorrow 16:30 EST',
    homeTeam: {
      name: 'Aryna Sabalenka',
      shortName: 'SAB',
      color: '#c026d3',
      score: '0'
    },
    awayTeam: {
      name: 'Iga Swiatek',
      shortName: 'SWI',
      color: '#2563eb',
      score: '0'
    },
    inPlay: false,
    isLocked: false,
    status: 'UPCOMING',
    clock: 'Tomorrow 16:30',
    currentPeriod: 'Pre-Match',
    possessionTeam: 'NEUTRAL',
    attackPhase: 'SAFE',
    ballPosition: { x: 50, y: 50 },
    possessionStats: { home: 50, away: 50 },
    shots: [],
    winProbabilityHistory: [],
    momentumHistory: [],
    stats: [
      { label: 'World Ranking', home: 'World No. 2', away: 'World No. 1' }
    ],
    events: [],
    markets: [
      {
        id: 'MKT_WTA_WIN',
        name: 'Match Winner',
        category: 'MAIN',
        selections: [
          { id: 'wta_sab_win', name: 'Aryna Sabalenka', price: 2.15, tick: 'same' },
          { id: 'wta_swi_win', name: 'Iga Swiatek', price: 1.72, tick: 'same' }
        ]
      }
    ]
  },

  // ==========================================
  // 5. BASEBALL (MLB) - TODAY (2026-08-14)
  // ==========================================
  {
    id: 'MKT_NYY_BOS_MLB',
    sport: 'Baseball',
    league: 'MLB • American League Rivalry',
    country: 'USA',
    flag: '🇺🇸',
    matchDate: '2026-08-14',
    startTime: 'Tonight 19:05 EST',
    homeTeam: {
      name: 'New York Yankees',
      shortName: 'NYY',
      color: '#1e3a8a',
      score: '4',
      subScore: 'Top 7th'
    },
    awayTeam: {
      name: 'Boston Red Sox',
      shortName: 'BOS',
      color: '#dc2626',
      score: '2',
      subScore: 'Top 7th'
    },
    inPlay: true,
    isLocked: false,
    status: 'LIVE',
    clock: 'Top 7th • 2 Outs',
    currentPeriod: '7th Inning',
    possessionTeam: 'HOME',
    attackPhase: 'SAFE',
    ballPosition: { x: 50, y: 50 },
    possessionStats: { home: 60, away: 40 },
    shots: [],
    winProbabilityHistory: [
      { minute: 0, homeProb: 55, drawProb: 0, awayProb: 45 },
      { minute: 5, homeProb: 78, drawProb: 0, awayProb: 22, event: 'Judge 2-Run HR' }
    ],
    momentumHistory: [],
    stats: [
      { label: 'Hits / Errors', home: '7 / 0', away: '5 / 1', homePercent: 58, awayPercent: 42 }
    ],
    events: [
      { id: 'bb1', minute: '3rd Inn', team: 'HOME', type: 'BOUNDARY', player: 'Aaron Judge', detail: '2-Run Home Run (428 ft)' }
    ],
    markets: [
      {
        id: 'MKT_MLB_ML',
        name: 'Moneyline',
        category: 'MAIN',
        selections: [
          { id: 'nyy_ml_win', name: 'New York Yankees', price: 1.35, tick: 'down' },
          { id: 'bos_ml_win', name: 'Boston Red Sox', price: 3.30, tick: 'up' }
        ]
      }
    ]
  },

  // ==========================================
  // 6. AMERICAN FOOTBALL (NFL) - TODAY
  // ==========================================
  {
    id: 'MKT_KC_SF_NFL',
    sport: 'American Football',
    league: 'NFL • Championship Rematch',
    country: 'USA',
    flag: '🇺🇸',
    matchDate: '2026-08-14',
    startTime: 'Tonight 20:15 EST',
    homeTeam: {
      name: 'Kansas City Chiefs',
      shortName: 'KC',
      color: '#dc2626',
      score: '21'
    },
    awayTeam: {
      name: 'San Francisco 49ers',
      shortName: 'SF',
      color: '#b91c1c',
      score: '17'
    },
    inPlay: true,
    isLocked: false,
    status: 'LIVE',
    clock: 'Q3 08:45',
    currentPeriod: '3rd Quarter',
    possessionTeam: 'HOME',
    attackPhase: 'PENALTY_BOX',
    ballPosition: { x: 80, y: 50 },
    possessionStats: { home: 54, away: 46 },
    shots: [],
    winProbabilityHistory: [
      { minute: 0, homeProb: 52, drawProb: 0, awayProb: 48 },
      { minute: 20, homeProb: 65, drawProb: 0, awayProb: 35, event: 'Mahomes TD Pass' }
    ],
    momentumHistory: [],
    stats: [
      { label: 'Total Yards', home: '312 Yds', away: '268 Yds', homePercent: 54, awayPercent: 46 }
    ],
    events: [
      { id: 'nfl1', minute: 'Q2 02:14', team: 'HOME', type: 'GOAL', player: 'Travis Kelce', detail: '14-Yd Touchdown Reception' }
    ],
    markets: [
      {
        id: 'MKT_NFL_ML',
        name: 'Moneyline',
        category: 'MAIN',
        selections: [
          { id: 'kc_win', name: 'Kansas City Chiefs', price: 1.48, tick: 'down' },
          { id: 'sf_win', name: 'San Francisco 49ers', price: 2.75, tick: 'up' }
        ]
      }
    ]
  },

  // ==========================================
  // 7. ESPORTS - TODAY (2026-08-14)
  // ==========================================
  {
    id: 'MKT_T1_GEN_LCK',
    sport: 'Esports',
    league: 'League of Legends • LCK Grand Finals',
    country: 'South Korea',
    flag: '🇰🇷',
    matchDate: '2026-08-14',
    startTime: 'Tonight 17:00 KST',
    homeTeam: {
      name: 'T1',
      shortName: 'T1',
      color: '#e11d48',
      score: '2',
      subScore: 'Game 4 (2-1)'
    },
    awayTeam: {
      name: 'Gen.G',
      shortName: 'GEN',
      color: '#ca8a04',
      score: '1',
      subScore: 'Game 4 (2-1)'
    },
    inPlay: true,
    isLocked: false,
    status: 'LIVE',
    clock: 'Game 4 • 24:15',
    currentPeriod: 'Game 4',
    possessionTeam: 'HOME',
    attackPhase: 'DANGEROUS_ATTACK',
    ballPosition: { x: 70, y: 70 },
    possessionStats: { home: 65, away: 35 },
    shots: [],
    winProbabilityHistory: [
      { minute: 0, homeProb: 50, drawProb: 0, awayProb: 50 },
      { minute: 20, homeProb: 80, drawProb: 0, awayProb: 20, event: 'Baron Nashor Taken by T1' }
    ],
    momentumHistory: [],
    stats: [
      { label: 'Gold Lead', home: '+6.4k Gold', away: '-6.4k Gold', homePercent: 62, awayPercent: 38 },
      { label: 'Tower Kills', home: '7', away: '2', homePercent: 78, awayPercent: 22 }
    ],
    events: [
      { id: 'esp1', minute: '21:30', team: 'HOME', type: 'GOAL', player: 'Faker', detail: 'Triple Kill Azir Ult at Dragon Pit' }
    ],
    markets: [
      {
        id: 'MKT_ESP_WIN',
        name: 'Series Winner (Bo5)',
        category: 'MAIN',
        selections: [
          { id: 't1_win', name: 'T1', price: 1.22, tick: 'down' },
          { id: 'gen_win', name: 'Gen.G', price: 4.20, tick: 'up' }
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
