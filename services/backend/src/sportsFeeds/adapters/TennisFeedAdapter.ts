import { IFeedAdapter, OddsShiftResult } from '../interfaces/IFeedAdapter';
import { LiveMatchTelemetry, TennisScoreDetails } from '../types';

export class TennisFeedAdapter implements IFeedAdapter {
  public readonly sportName = 'Tennis';

  public getInitialTelemetry(marketId: string, eventName: string, homeTeam: string, awayTeam: string): LiveMatchTelemetry {
    const tennis: TennisScoreDetails = {
      sets: [
        { home: 6, away: 4 },
        { home: 4, away: 6 },
        { home: 4, away: 3 }
      ],
      currentSet: 3,
      currentGameScore: { home: '30', away: '40' },
      servingPlayerId: 1,
      isTiebreak: false,
      breakPointAlert: true,
      aces: { home: 12, away: 9 },
      doubleFaults: { home: 2, away: 4 },
      lastEventDescription: `Break point opportunity for ${awayTeam}!`
    };

    return {
      marketId,
      eventName,
      sport: 'TENNIS',
      status: 'IN_PLAY',
      isLocked: false,
      inPlay: true,
      homeTeam,
      awayTeam,
      tennis,
      summaryScore: `Set 3: ${tennis.sets[2].home}-${tennis.sets[2].away} (${tennis.currentGameScore.home}-${tennis.currentGameScore.away})`,
      updatedAt: Date.now()
    };
  }

  public stepSimulation(currentTelemetry: LiveMatchTelemetry): {
    updatedTelemetry: LiveMatchTelemetry;
    shouldSuspendMarket: boolean;
    oddsShifts: OddsShiftResult;
  } {
    const t = currentTelemetry.tennis ? { ...currentTelemetry.tennis } : this.getInitialTelemetry(
      currentTelemetry.marketId, currentTelemetry.eventName, currentTelemetry.homeTeam, currentTelemetry.awayTeam
    ).tennis!;

    const pointMap = ['0', '15', '30', '40', 'Adv'];
    const roll = Math.random();
    const homeWonPoint = roll > 0.48;
    let shouldSuspend = false;

    // Advance point in current game
    let homeIdx = pointMap.indexOf(t.currentGameScore.home);
    let awayIdx = pointMap.indexOf(t.currentGameScore.away);

    if (homeWonPoint) {
      if (homeIdx === 3 && awayIdx < 3) {
        // Home wins game!
        t.sets[t.currentSet - 1].home += 1;
        t.currentGameScore = { home: '0', away: '0' };
        t.servingPlayerId = t.servingPlayerId === 1 ? 2 : 1;
        t.lastEventDescription = `Game ${currentTelemetry.homeTeam}! Holds serve after sharp cross-court winner.`;
        shouldSuspend = true;
      } else if (homeIdx === 3 && awayIdx === 3) {
        t.currentGameScore.home = 'Adv';
        t.lastEventDescription = `Advantage ${currentTelemetry.homeTeam}!`;
      } else if (awayIdx === 4) {
        t.currentGameScore.away = '40';
        t.lastEventDescription = 'Deuce!';
      } else if (homeIdx === 4) {
        t.sets[t.currentSet - 1].home += 1;
        t.currentGameScore = { home: '0', away: '0' };
        t.servingPlayerId = t.servingPlayerId === 1 ? 2 : 1;
        t.lastEventDescription = `Game ${currentTelemetry.homeTeam}!`;
        shouldSuspend = true;
      } else {
        t.currentGameScore.home = pointMap[homeIdx + 1];
        t.lastEventDescription = `Point to ${currentTelemetry.homeTeam}. Ace out wide!`;
      }
    } else {
      if (awayIdx === 3 && homeIdx < 3) {
        // Away wins game (Break of serve if home was serving)
        t.sets[t.currentSet - 1].away += 1;
        t.currentGameScore = { home: '0', away: '0' };
        t.servingPlayerId = t.servingPlayerId === 1 ? 2 : 1;
        t.lastEventDescription = `BREAK! ${currentTelemetry.awayTeam} breaks serve with a forehand pass!`;
        shouldSuspend = true;
      } else if (homeIdx === 3 && awayIdx === 3) {
        t.currentGameScore.away = 'Adv';
        t.lastEventDescription = `Advantage ${currentTelemetry.awayTeam}! Break point!`;
      } else if (homeIdx === 4) {
        t.currentGameScore.home = '40';
        t.lastEventDescription = 'Deuce!';
      } else if (awayIdx === 4) {
        t.sets[t.currentSet - 1].away += 1;
        t.currentGameScore = { home: '0', away: '0' };
        t.servingPlayerId = t.servingPlayerId === 1 ? 2 : 1;
        t.lastEventDescription = `Game ${currentTelemetry.awayTeam}!`;
        shouldSuspend = true;
      } else {
        t.currentGameScore.away = pointMap[awayIdx + 1];
        t.lastEventDescription = `Point to ${currentTelemetry.awayTeam}. Backhand down the line.`;
      }
    }

    t.breakPointAlert = (t.servingPlayerId === 1 && t.currentGameScore.away === '40' && t.currentGameScore.home !== '40') ||
                         (t.servingPlayerId === 2 && t.currentGameScore.home === '40' && t.currentGameScore.away !== '40');

    // Odds calculations
    const setScoreHome = t.sets[t.currentSet - 1].home;
    const setScoreAway = t.sets[t.currentSet - 1].away;
    const gamesDelta = setScoreHome - setScoreAway;

    let homePrice = 1.90 - (gamesDelta * 0.12);
    homePrice = Math.max(1.10, Math.min(5.00, homePrice));
    const awayPrice = homePrice < 2.0 ? 1 / (1 - 1 / homePrice) : 1.45;

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
      summaryScore: `Set ${t.currentSet}: ${setScoreHome}-${setScoreAway} (${t.currentGameScore.home}-${t.currentGameScore.away})`,
      tennis: t,
      updatedAt: Date.now()
    };

    return {
      updatedTelemetry,
      shouldSuspendMarket: shouldSuspend,
      oddsShifts
    };
  }
}
