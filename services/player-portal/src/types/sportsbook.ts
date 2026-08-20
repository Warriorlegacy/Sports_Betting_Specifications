export type SportCategory = 
  | 'All' 
  | 'Football' 
  | 'Cricket' 
  | 'Basketball' 
  | 'Tennis' 
  | 'American Football' 
  | 'Baseball' 
  | 'Ice Hockey' 
  | 'Table Tennis' 
  | 'Esports';

export type OddsFormat = 'DECIMAL' | 'AMERICAN' | 'FRACTIONAL';

export interface SelectionOdds {
  id: string;
  name: string;
  price: number;
  prevPrice?: number;
  tick?: 'up' | 'down' | 'same';
  handicap?: string;
  isSuspended?: boolean;
}

export interface BettingMarket {
  id: string;
  name: string;
  category: 'MAIN' | 'HANDICAPS' | 'TOTALS' | 'PROPS' | 'CORNERS_CARDS' | 'PERIODS' | 'SGP' | 'TOSS';
  isSuspended?: boolean;
  isLive?: boolean;
  hasCashOut?: boolean;
  selections: SelectionOdds[];
}

export interface ShotLocation {
  id: string;
  team: 'HOME' | 'AWAY';
  player: string;
  minute: number;
  x: number; // 0 to 100 on pitch width/court
  y: number; // 0 to 100 on pitch length/court
  outcome: 'GOAL' | 'SAVED' | 'MISSED' | 'BLOCKED';
  xG: number;
  distance: string;
  shotType: string;
}

export interface WinProbabilityPoint {
  minute: number;
  homeProb: number; // 0 - 100
  drawProb: number; // 0 - 100
  awayProb: number; // 0 - 100
  event?: string;
}

export interface MomentumPoint {
  minute: number;
  momentum: number; // -100 (Away dominant) to +100 (Home dominant)
  event?: string;
  eventType?: 'GOAL' | 'CARD' | 'CORNER' | 'CHANCE' | 'SUB';
}

export interface MatchStat {
  label: string;
  home: number | string;
  away: number | string;
  homePercent?: number; // for visual comparison bar
  awayPercent?: number;
}

export interface MatchEvent {
  id: string;
  minute: string;
  team: 'HOME' | 'AWAY';
  type: 'GOAL' | 'YELLOW_CARD' | 'RED_CARD' | 'SUB' | 'CORNER' | 'PENALTY' | '3_POINTER' | 'BOUNDARY';
  player: string;
  detail?: string;
}

export interface LiveMatch {
  id: string;
  sport: SportCategory;
  league: string;
  country?: string;
  flag?: string;
  matchDate: string; // Format 'YYYY-MM-DD', e.g. '2026-08-14'
  startTime: string; // e.g. '19:45 BST' or '20:00 IST'
  homeTeam: {
    name: string;
    shortName: string;
    logo?: string;
    color: string;
    score: number | string;
    subScore?: string; // e.g. quarters/sets/overs (18/25, 4-2)
  };
  awayTeam: {
    name: string;
    shortName: string;
    logo?: string;
    color: string;
    score: number | string;
    subScore?: string;
  };

  inPlay: boolean;
  isLocked: boolean;
  status: 'LIVE' | 'HALFTIME' | 'UPCOMING' | 'SETTLED' | 'SUSPENDED';
  clock: string;
  currentPeriod: string;
  possessionTeam: 'HOME' | 'AWAY' | 'NEUTRAL';
  attackPhase: 'SAFE' | 'BUILD_UP' | 'DANGEROUS_ATTACK' | 'PENALTY_BOX' | 'CORNER' | 'FREE_KICK';
  ballPosition: { x: number; y: number }; // 0 to 100
  possessionStats: { home: number; away: number }; // e.g. 58 vs 42
  shots: ShotLocation[];
  winProbabilityHistory: WinProbabilityPoint[];
  momentumHistory: MomentumPoint[];
  stats: MatchStat[];
  events: MatchEvent[];
  markets: BettingMarket[];
}

export interface SGPLeg {
  id: string;
  marketId: string;
  marketName: string;
  selectionId: string;
  selectionName: string;
  price: number;
  category: string;
  incompatibleWith?: string[]; // IDs of conflicting legs
}

export interface SGPTicket {
  matchId: string;
  eventName: string;
  legs: SGPLeg[];
  combinedOdds: number;
  rawMultiplier: number;
  correlationDiscount: number; // e.g. 0.92
  boostPercentage: number; // e.g. 20 for +20% boost
  finalBoostedOdds: number;
}

export interface CashOutBet {
  id: string;
  matchId: string;
  eventName: string;
  marketName: string;
  selectionName: string;
  type: 'BACK' | 'LAY' | 'SPORTSBOOK' | 'SGP';
  placedOdds: number;
  currentOdds: number;
  prevOdds?: number;
  stake: number;
  remainingStake: number;
  potentialReturn: number;
  cashOutOffer: number;
  prevCashOutOffer?: number;
  tick?: 'up' | 'down' | 'same';
  status: 'OPEN' | 'PARTIALLY_CASHED_OUT' | 'CASHED_OUT' | 'SETTLED_WON' | 'SETTLED_LOST';
  cashedOutAmount: number;
  autoCashOutThreshold?: number;
  sgpLegsSummary?: string[];
  placedAt: string;
}

export interface BetSlipItem {
  id: string;
  matchId: string;
  eventName: string;
  marketId: string;
  marketName: string;
  selectionId: string;
  selectionName: string;
  type: 'BACK' | 'LAY' | 'SPORTSBOOK' | 'SGP';
  price: number;
  stake: number;
  isSGP?: boolean;
  sgpTicket?: SGPTicket;
}
