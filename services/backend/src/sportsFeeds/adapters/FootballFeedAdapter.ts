import { IFeedAdapter, OddsShiftResult } from '../interfaces/IFeedAdapter';
import { LiveMatchTelemetry, FootballScoreDetails } from '../types';

export class FootballFeedAdapter implements IFeedAdapter {
  public readonly sportName = 'Football';

  public getInitialTelemetry(marketId: string, eventName: string, homeTeam: string, awayTeam: string): LiveMatchTelemetry {
    const football: FootballScoreDetails = {
      minute: 68,
      period: '2H',
      homeGoals: 1,
      awayGoals: 0,
      yellowCards: { home: 1, away: 2 },
      redCards: { home: 0, away: 0 },
      corners: { home: 5, away: 3 },
      penalties: { home: 0, away: 0 },
      varCheckActive: false,
      possessionPercentage: { home: 54, away: 46 },
      lastEventDescription: `Dangerous attack inside the box by ${homeTeam}.`
    };

    return {
      marketId,
      eventName,
      sport: 'FOOTBALL',
      status: 'IN_PLAY',
      isLocked: false,
      inPlay: true,
      homeTeam,
      awayTeam,
      football,
      summaryScore: `${football.minute}' • ${homeTeam} ${football.homeGoals} - ${football.awayGoals} ${awayTeam}`,
      updatedAt: Date.now()
    };
  }

  public stepSimulation(currentTelemetry: LiveMatchTelemetry): {
    updatedTelemetry: LiveMatchTelemetry;
    shouldSuspendMarket: boolean;
    oddsShifts: OddsShiftResult;
  } {
    const f = currentTelemetry.football ? { ...currentTelemetry.football } : this.getInitialTelemetry(
      currentTelemetry.marketId, currentTelemetry.eventName, currentTelemetry.homeTeam, currentTelemetry.awayTeam
    ).football!;

    // Advance clock
    f.minute = Math.min(95, f.minute + 1);

    const roll = Math.random();
    let shouldSuspend = false;

    if (roll < 0.04) {
      // GOAL!
      const homeScores = Math.random() > 0.45;
      if (homeScores) {
        f.homeGoals += 1;
        f.lastEventDescription = `GOAL! ${currentTelemetry.homeTeam} scores with a header!`;
      } else {
        f.awayGoals += 1;
        f.lastEventDescription = `GOAL! ${currentTelemetry.awayTeam} equalizes on the counter!`;
      }
      shouldSuspend = true; // Suspend on goal
    } else if (roll < 0.08) {
      // Corner kick
      if (Math.random() > 0.5) f.corners.home += 1;
      else f.corners.away += 1;
      f.lastEventDescription = `Corner kick awarded.`;
    } else if (roll < 0.11) {
      // Yellow Card
      if (Math.random() > 0.5) f.yellowCards.home += 1;
      else f.yellowCards.away += 1;
      f.lastEventDescription = `Yellow card shown for a reckless challenge.`;
    } else if (roll < 0.13) {
      // VAR Review
      f.varCheckActive = true;
      f.lastEventDescription = `VAR Check in progress for potential penalty...`;
      shouldSuspend = true;
    } else {
      f.varCheckActive = false;
      f.lastEventDescription = `Passing play in midfield (${f.possessionPercentage.home}% possession).`;
    }

    // Match Odds calculations (1X2)
    const goalDiff = f.homeGoals - f.awayGoals;
    let homePrice = 1.60;
    let awayPrice = 4.80;
    let drawPrice = 3.60;

    if (goalDiff > 0) {
      homePrice = Math.max(1.15, 1.45 - ((90 - f.minute) * 0.01));
      drawPrice = Math.min(8.0, 3.80 + ((f.minute - 60) * 0.15));
      awayPrice = Math.min(15.0, 6.00 + ((f.minute - 60) * 0.25));
    } else if (goalDiff < 0) {
      awayPrice = Math.max(1.15, 1.45 - ((90 - f.minute) * 0.01));
      drawPrice = Math.min(8.0, 3.80 + ((f.minute - 60) * 0.15));
      homePrice = Math.min(15.0, 6.00 + ((f.minute - 60) * 0.25));
    } else {
      drawPrice = Math.max(1.40, 2.80 - ((f.minute - 60) * 0.04));
      homePrice = 3.20;
      awayPrice = 3.40;
    }

    const oddsShifts: OddsShiftResult = {
      1: { bestBack: parseFloat(homePrice.toFixed(2)), bestLay: parseFloat((homePrice + 0.02).toFixed(2)) },
      2: { bestBack: parseFloat(awayPrice.toFixed(2)), bestLay: parseFloat((awayPrice + 0.04).toFixed(2)) },
      3: { bestBack: parseFloat(drawPrice.toFixed(2)), bestLay: parseFloat((drawPrice + 0.03).toFixed(2)) }
    };

    const updatedTelemetry: LiveMatchTelemetry = {
      ...currentTelemetry,
      isLocked: shouldSuspend,
      summaryScore: `${f.minute}' • ${currentTelemetry.homeTeam} ${f.homeGoals} - ${f.awayGoals} ${currentTelemetry.awayTeam}`,
      football: f,
      updatedAt: Date.now()
    };

    return {
      updatedTelemetry,
      shouldSuspendMarket: shouldSuspend,
      oddsShifts
    };
  }
}
