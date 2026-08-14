import { IFeedAdapter, OddsShiftResult } from '../interfaces/IFeedAdapter';
import { LiveMatchTelemetry, CricketScoreDetails } from '../types';

export class CricketFeedAdapter implements IFeedAdapter {
  public readonly sportName = 'Cricket';

  public getInitialTelemetry(marketId: string, eventName: string, homeTeam: string, awayTeam: string): LiveMatchTelemetry {
    const cricket: CricketScoreDetails = {
      currentInnings: 2,
      battingTeam: homeTeam,
      bowlingTeam: awayTeam,
      runs: 142,
      wickets: 3,
      overs: 15.2,
      target: 178,
      crr: 9.26,
      rrr: 7.71,
      striker: { name: 'V. Kohli', runs: 58, balls: 36, fours: 5, sixes: 2 },
      nonStriker: { name: 'H. Pandya', runs: 24, balls: 14 },
      currentBowler: { name: 'P. Cummins', overs: 3.2, runs: 28, wickets: 1 },
      recentBalls: ['1', '4', '1', '2', '0', '4'],
      lastEventDescription: 'Four! Driven through extra cover by V. Kohli.'
    };

    return {
      marketId,
      eventName,
      sport: 'CRICKET',
      status: 'IN_PLAY',
      isLocked: false,
      inPlay: true,
      homeTeam,
      awayTeam,
      cricket,
      summaryScore: `${homeTeam} 142/3 (15.2 ov) • Need 36 in 28b`,
      updatedAt: Date.now()
    };
  }

  public stepSimulation(currentTelemetry: LiveMatchTelemetry): {
    updatedTelemetry: LiveMatchTelemetry;
    shouldSuspendMarket: boolean;
    oddsShifts: OddsShiftResult;
  } {
    const c = currentTelemetry.cricket ? { ...currentTelemetry.cricket } : this.getInitialTelemetry(
      currentTelemetry.marketId, currentTelemetry.eventName, currentTelemetry.homeTeam, currentTelemetry.awayTeam
    ).cricket!;

    // Possible ball outcomes: 0, 1, 2, 4, 6, Wicket, Wide, No-ball
    const roll = Math.random();
    let outcome = '1';
    let runsAdded = 1;
    let isWicket = false;
    let isBoundary = false;

    if (roll < 0.32) {
      outcome = '1'; runsAdded = 1;
    } else if (roll < 0.52) {
      outcome = '0'; runsAdded = 0;
    } else if (roll < 0.68) {
      outcome = '2'; runsAdded = 2;
    } else if (roll < 0.82) {
      outcome = '4'; runsAdded = 4; isBoundary = true;
    } else if (roll < 0.90) {
      outcome = '6'; runsAdded = 6; isBoundary = true;
    } else {
      outcome = 'W'; runsAdded = 0; isWicket = true;
    }

    // Update overs
    let currentBalls = Math.round((c.overs - Math.floor(c.overs)) * 10);
    currentBalls += 1;
    let currentOversInt = Math.floor(c.overs);
    if (currentBalls >= 6) {
      currentOversInt += 1;
      currentBalls = 0;
    }
    const newOvers = parseFloat(`${currentOversInt}.${currentBalls}`);

    // Update runs, wickets, recent balls
    c.runs += runsAdded;
    if (isWicket && c.wickets < 10) {
      c.wickets += 1;
      c.striker = { name: 'R. Jadeja', runs: 0, balls: 0, fours: 0, sixes: 0 };
      c.lastEventDescription = `OUT! Caught at deep midwicket! Big wicket for ${c.bowlingTeam}.`;
    } else {
      c.striker.runs += runsAdded;
      c.striker.balls += 1;
      if (runsAdded === 4) c.striker.fours += 1;
      if (runsAdded === 6) c.striker.sixes += 1;
      c.lastEventDescription = isBoundary 
        ? `${runsAdded === 6 ? 'SIX' : 'FOUR'}! Smashed over the ropes by ${c.striker.name}!` 
        : `${runsAdded} run(s) worked into the gap.`;
    }

    c.overs = newOvers;
    c.recentBalls = [...c.recentBalls.slice(1), outcome];

    const totalBallsBowled = currentOversInt * 6 + currentBalls;
    c.crr = totalBallsBowled > 0 ? parseFloat(((c.runs / totalBallsBowled) * 6).toFixed(2)) : 0;
    const remainingBalls = Math.max(1, 120 - totalBallsBowled);
    const runsNeeded = Math.max(0, (c.target || 180) - c.runs);
    c.rrr = parseFloat(((runsNeeded / remainingBalls) * 6).toFixed(2));

    // Dynamic price shifts:
    // If runs added -> Home odds drop (favorite strengthens)
    // If wicket -> Away odds drop (underdog gains)
    let homePrice = 1.65;
    let awayPrice = 2.45;

    if (runsNeeded <= 15) {
      homePrice = 1.12; awayPrice = 7.50;
    } else if (c.wickets >= 7) {
      homePrice = 3.20; awayPrice = 1.38;
    } else if (isWicket) {
      homePrice = Math.min(3.50, homePrice + 0.35);
      awayPrice = Math.max(1.30, awayPrice - 0.35);
    } else if (isBoundary) {
      homePrice = Math.max(1.20, homePrice - 0.15);
      awayPrice = Math.min(6.00, awayPrice + 0.15);
    }

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
      isLocked: isWicket, // Auto-suspend market temporarily if wicket falls
      summaryScore: `${c.battingTeam} ${c.runs}/${c.wickets} (${c.overs} ov) • Need ${runsNeeded} in ${remainingBalls}b`,
      cricket: c,
      updatedAt: Date.now()
    };

    return {
      updatedTelemetry,
      shouldSuspendMarket: isWicket,
      oddsShifts
    };
  }
}
