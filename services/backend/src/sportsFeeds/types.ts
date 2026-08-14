export type SportType = 'CRICKET' | 'TENNIS' | 'BASKETBALL' | 'FOOTBALL' | 'HORSE_RACING';

export type MatchStatus = 'PRE_MATCH' | 'IN_PLAY' | 'PAUSED' | 'SUSPENDED' | 'SETTLED' | 'COMPLETED';

export interface CricketScoreDetails {
  currentInnings: 1 | 2;
  battingTeam: string;
  bowlingTeam: string;
  runs: number;
  wickets: number;
  overs: number; // e.g. 15.4
  target?: number;
  crr: number; // Current run rate
  rrr?: number; // Required run rate
  striker: { name: string; runs: number; balls: number; fours: number; sixes: number };
  nonStriker: { name: string; runs: number; balls: number };
  currentBowler: { name: string; overs: number; runs: number; wickets: number };
  recentBalls: string[]; // e.g. ["1", "4", "0", "W", "6", "1"]
  lastEventDescription: string;
}

export interface TennisScoreDetails {
  sets: { home: number; away: number }[]; // e.g. [{home: 6, away: 4}, {home: 3, away: 6}, {home: 4, away: 3}]
  currentSet: number;
  currentGameScore: { home: string; away: string }; // "0", "15", "30", "40", "Adv"
  servingPlayerId: 1 | 2;
  isTiebreak: boolean;
  breakPointAlert: boolean;
  aces: { home: number; away: number };
  doubleFaults: { home: number; away: number };
  lastEventDescription: string;
}

export interface BasketballScoreDetails {
  quarter: 1 | 2 | 3 | 4 | 5; // 5 = Overtime
  quarterName: string; // "Q1", "Q2", "Q3", "Q4", "OT"
  gameClock: string; // e.g. "04:18"
  shotClock: number; // e.g. 14
  homeScore: number;
  awayScore: number;
  possession: 'HOME' | 'AWAY';
  teamFouls: { home: number; away: number };
  timeoutsRemaining: { home: number; away: number };
  lastEventDescription: string;
}

export interface FootballScoreDetails {
  minute: number; // e.g. 74
  period: '1H' | 'HT' | '2H' | 'ET' | 'FT';
  homeGoals: number;
  awayGoals: number;
  yellowCards: { home: number; away: number };
  redCards: { home: number; away: number };
  corners: { home: number; away: number };
  penalties: { home: number; away: number };
  varCheckActive: boolean;
  possessionPercentage: { home: number; away: number };
  lastEventDescription: string;
}

export interface LiveMatchTelemetry {
  marketId: string;
  eventName: string;
  sport: SportType;
  status: MatchStatus;
  isLocked: boolean;
  inPlay: boolean;
  startTime?: string;
  venue?: string;
  homeTeam: string;
  awayTeam: string;
  cricket?: CricketScoreDetails;
  tennis?: TennisScoreDetails;
  basketball?: BasketballScoreDetails;
  football?: FootballScoreDetails;
  summaryScore: string; // Short display text, e.g. "148/3 (16.2 ov)" or "6-4, 4-3 (30-40)"
  updatedAt: number;
}
