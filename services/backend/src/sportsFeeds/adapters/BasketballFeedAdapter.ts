import { IFeedAdapter, OddsShiftResult } from '../interfaces/IFeedAdapter';
import { LiveMatchTelemetry, BasketballScoreDetails } from '../types';

export class BasketballFeedAdapter implements IFeedAdapter {
  public readonly sportName = 'Basketball';

  public getInitialTelemetry(marketId: string, eventName: string, homeTeam: string, awayTeam: string): LiveMatchTelemetry {
    const basketball: BasketballScoreDetails = {
      quarter: 3,
      quarterName: 'Q3',
      gameClock: '06:45',
      shotClock: 18,
      homeScore: 78,
      awayScore: 74,
      possession: 'HOME',
      teamFouls: { home: 3, away: 4 },
      timeoutsRemaining: { home: 4, away: 3 },
      lastEventDescription: `${homeTeam} transition basket by L. James (2 pts).`
    };

    return {
      marketId,
      eventName,
      sport: 'BASKETBALL',
      status: 'IN_PLAY',
      isLocked: false,
      inPlay: true,
      homeTeam,
      awayTeam,
      basketball,
      summaryScore: `Q3 06:45 • ${homeTeam} 78 - 74 ${awayTeam}`,
      updatedAt: Date.now()
    };
  }

  public stepSimulation(currentTelemetry: LiveMatchTelemetry): {
    updatedTelemetry: LiveMatchTelemetry;
    shouldSuspendMarket: boolean;
    oddsShifts: OddsShiftResult;
  } {
    const b = currentTelemetry.basketball ? { ...currentTelemetry.basketball } : this.getInitialTelemetry(
      currentTelemetry.marketId, currentTelemetry.eventName, currentTelemetry.homeTeam, currentTelemetry.awayTeam
    ).basketball!;

    // Decrement clock
    let [minStr, secStr] = b.gameClock.split(':');
    let minutes = parseInt(minStr, 10);
    let seconds = parseInt(secStr, 10);

    seconds -= 6;
    if (seconds < 0) {
      if (minutes > 0) {
        minutes -= 1;
        seconds = 54;
      } else {
        // Quarter ended
        if (b.quarter < 4) {
          b.quarter = (b.quarter + 1) as 1 | 2 | 3 | 4;
          b.quarterName = `Q${b.quarter}`;
          minutes = 12;
          seconds = 0;
        }
      }
    }
    b.gameClock = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // Possession & scoring event
    const roll = Math.random();
    let pts = 0;
    let shouldSuspend = false;

    if (roll < 0.35) {
      pts = 2;
    } else if (roll < 0.55) {
      pts = 3;
    } else if (roll < 0.65) {
      pts = 1;
    }

    if (pts > 0) {
      if (b.possession === 'HOME') {
        b.homeScore += pts;
        b.lastEventDescription = `${pts === 3 ? 'THREE-POINTER' : 'Field goal'} scored by ${currentTelemetry.homeTeam}!`;
        b.possession = 'AWAY';
      } else {
        b.awayScore += pts;
        b.lastEventDescription = `${pts === 3 ? 'THREE-POINTER' : 'Field goal'} scored by ${currentTelemetry.awayTeam}!`;
        b.possession = 'HOME';
      }
      b.shotClock = 24;
    } else {
      b.shotClock = Math.max(2, b.shotClock - 6);
      if (b.shotClock <= 2) {
        b.possession = b.possession === 'HOME' ? 'AWAY' : 'HOME';
        b.shotClock = 24;
        b.lastEventDescription = 'Defensive rebound / possession change.';
      }
    }

    // Moneyline Odds Calculation based on lead and quarter
    const margin = b.homeScore - b.awayScore;
    let homePrice = 1.85 - (margin * 0.04);
    homePrice = Math.max(1.05, Math.min(8.00, homePrice));
    const awayPrice = homePrice < 2.0 ? 1 / (1 - 1 / homePrice) : 1.35;

    const oddsShifts: OddsShiftResult = {
      1: {
        bestBack: parseFloat(homePrice.toFixed(2)),
        bestLay: parseFloat((homePrice + 0.02).toFixed(2))
      },
      2: {
        bestBack: parseFloat(awayPrice.toFixed(2)),
        bestLay: parseFloat((awayPrice + 0.03).toFixed(2))
      }
    };

    const updatedTelemetry: LiveMatchTelemetry = {
      ...currentTelemetry,
      isLocked: shouldSuspend,
      summaryScore: `${b.quarterName} ${b.gameClock} • ${currentTelemetry.homeTeam} ${b.homeScore} - ${b.awayScore} ${currentTelemetry.awayTeam}`,
      basketball: b,
      updatedAt: Date.now()
    };

    return {
      updatedTelemetry,
      shouldSuspendMarket: shouldSuspend,
      oddsShifts
    };
  }
}
