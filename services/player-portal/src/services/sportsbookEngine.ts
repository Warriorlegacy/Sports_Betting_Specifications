import { LiveMatch, SGPLeg, SGPTicket, CashOutBet } from '../types/sportsbook';

export class SportsbookEngine {
  /**
   * Calculates Same-Game Parlay (SGP) combined odds with correlation adjustments and parlay boost
   */
  public static calculateSGPTicket(matchId: string, eventName: string, legs: SGPLeg[]): SGPTicket | null {
    if (!legs || legs.length === 0) return null;

    if (legs.length === 1) {
      return {
        matchId,
        eventName,
        legs,
        combinedOdds: legs[0].price,
        rawMultiplier: legs[0].price,
        correlationDiscount: 1.0,
        boostPercentage: 0,
        finalBoostedOdds: legs[0].price
      };
    }

    // Calculate raw multiplied odds
    let rawMultiplier = 1;
    for (const leg of legs) {
      rawMultiplier *= leg.price;
    }

    // Same-game outcomes have inherent correlation (e.g. Team wins + High Goals + Star Player scores)
    // We apply an empirical copula correlation factor (0.92 ^ (n-1))
    const correlationFactor = Math.pow(0.92, legs.length - 1);
    const correlatedOdds = Math.max(1.05, 1 + (rawMultiplier - 1) * correlationFactor);

    // Apply Tiered SGP Bonus Boost
    let boostPercentage = 0;
    if (legs.length === 2) boostPercentage = 10;
    else if (legs.length === 3) boostPercentage = 20;
    else if (legs.length === 4) boostPercentage = 30;
    else if (legs.length >= 5) boostPercentage = 40;

    const boostedMultiplier = 1 + boostPercentage / 100;
    const finalBoostedOdds = Math.round((1 + (correlatedOdds - 1) * boostedMultiplier) * 100) / 100;

    return {
      matchId,
      eventName,
      legs,
      combinedOdds: Math.round(correlatedOdds * 100) / 100,
      rawMultiplier: Math.round(rawMultiplier * 100) / 100,
      correlationDiscount: Math.round((1 - correlationFactor) * 100),
      boostPercentage,
      finalBoostedOdds
    };
  }

  /**
   * Check if any legs in the SGP conflict with each other
   */
  public static validateSGPConflicts(legs: SGPLeg[]): string | null {
    const ids = legs.map((l) => l.selectionId);
    
    // Conflict rules
    if (ids.includes('sel_under_3_5') && ids.includes('sel_over_3_5')) {
      return 'Cannot combine Over and Under in the same line';
    }
    if (ids.includes('sel_under_3_5') && ids.includes('sel_over_4_5')) {
      return 'Cannot combine Under 3.5 Goals and Over 4.5 Goals';
    }
    if (ids.includes('sel_home') && ids.includes('sel_away')) {
      return 'Cannot select both teams to win';
    }
    if (ids.includes('sel_home') && ids.includes('sel_draw')) {
      return 'Cannot select Win and Draw simultaneously in SGP';
    }
    return null;
  }

  /**
   * Recalculates dynamic cashout offer value based on current live price
   */
  public static calculateCashOutOffer(
    bet: CashOutBet,
    currentLiveOdds: number,
    houseMargin: number = 0.05
  ): number {
    if (bet.status !== 'OPEN' && bet.status !== 'PARTIALLY_CASHED_OUT') {
      return 0;
    }
    if (currentLiveOdds <= 1.01) {
      return Math.round(bet.remainingStake * (bet.placedOdds - 1) * (1 - houseMargin) * 100) / 100;
    }

    // Standard cashout valuation formula:
    // Fair Valuation = Remaining Stake * (Placed Odds / Current Live Odds)
    // Offer = Fair Valuation * (1 - House Margin)
    const fairValue = bet.remainingStake * (bet.placedOdds / currentLiveOdds);
    const offer = Math.max(1, fairValue * (1 - houseMargin));

    return Math.round(offer * 100) / 100;
  }

  /**
   * Simulates a tick update across all live matches and open cash out bets
   */
  public static simulateTick(matches: LiveMatch[], cashOutBets: CashOutBet[]): {
    updatedMatches: LiveMatch[];
    updatedCashOutBets: CashOutBet[];
  } {
    // 1. Update live matches
    const updatedMatches: LiveMatch[] = matches.map((m) => {
      if (!m.inPlay || m.isLocked) return m;

      // Slight random ball movement
      const newBallX = Math.min(95, Math.max(5, m.ballPosition.x + (Math.random() - 0.48) * 8));
      const newBallY = Math.min(90, Math.max(10, m.ballPosition.y + (Math.random() - 0.5) * 10));

      // Attack Phase determination based on ball position
      let phase = m.attackPhase;
      if (newBallX > 80) phase = 'DANGEROUS_ATTACK';
      else if (newBallX > 60) phase = 'BUILD_UP';
      else if (newBallX < 30) phase = 'SAFE';

      // Fluctuate market odds slightly
      const updatedMarkets = m.markets.map((market) => {
        const updatedSelections = market.selections.map((sel) => {
          // 35% chance of price wiggle per selection per tick
          if (Math.random() < 0.35) {
            const delta = (Math.random() - 0.5) * 0.06;
            const newPrice = Math.max(1.02, Math.round((sel.price + delta) * 100) / 100);
            let tickDirection: 'up' | 'down' | 'same' = 'same';
            if (newPrice > sel.price) tickDirection = 'up';
            else if (newPrice < sel.price) tickDirection = 'down';

            return {
              ...sel,
              prevPrice: sel.price,
              price: newPrice,
              tick: tickDirection
            };
          }
          return { ...sel, tick: 'same' as const };
        });

        return {
          ...market,
          selections: updatedSelections
        };
      });

      // Win probability minor fluctuation
      const lastProb = m.winProbabilityHistory[m.winProbabilityHistory.length - 1];
      let newHomeProb = lastProb ? lastProb.homeProb : 50;
      let newDrawProb = lastProb ? lastProb.drawProb : 25;
      let newAwayProb = lastProb ? lastProb.awayProb : 25;

      if (phase === 'DANGEROUS_ATTACK' && m.possessionTeam === 'HOME') {
        newHomeProb = Math.min(96, newHomeProb + 0.3);
        newAwayProb = Math.max(2, newAwayProb - 0.2);
        if (newDrawProb > 2) newDrawProb -= 0.1;
      }

      return {
        ...m,
        ballPosition: { x: Math.round(newBallX), y: Math.round(newBallY) },
        attackPhase: phase,
        markets: updatedMarkets
      };
    });

    // 2. Update dynamic cash out bets
    const updatedCashOutBets: CashOutBet[] = cashOutBets.map((bet) => {
      if (bet.status !== 'OPEN' && bet.status !== 'PARTIALLY_CASHED_OUT') {
        return bet;
      }

      // Find current market odds if available
      const match = updatedMatches.find((m) => m.id === bet.matchId);
      let currentOdds = bet.currentOdds;

      if (match) {
        for (const market of match.markets) {
          const matchingSel = market.selections.find((s) => s.name === bet.selectionName);
          if (matchingSel) {
            currentOdds = matchingSel.price;
            break;
          }
        }
      } else {
        // Minor natural tick wiggle
        const delta = (Math.random() - 0.48) * 0.04;
        currentOdds = Math.max(1.02, Math.round((currentOdds + delta) * 100) / 100);
      }

      const newOffer = this.calculateCashOutOffer(bet, currentOdds);
      let tick: 'up' | 'down' | 'same' = 'same';
      if (newOffer > bet.cashOutOffer) tick = 'up';
      else if (newOffer < bet.cashOutOffer) tick = 'down';

      return {
        ...bet,
        prevOdds: bet.currentOdds,
        currentOdds,
        prevCashOutOffer: bet.cashOutOffer,
        cashOutOffer: newOffer,
        tick
      };
    });

    return {
      updatedMatches,
      updatedCashOutBets
    };
  }
}
