import { LiveMatchTelemetry } from '../types';

export interface OddsShiftResult {
  [selectionId: number]: {
    bestBack: number;
    bestLay: number;
  };
}

export interface IFeedAdapter {
  readonly sportName: string;
  getInitialTelemetry(marketId: string, eventName: string, homeTeam: string, awayTeam: string): LiveMatchTelemetry;
  stepSimulation(currentTelemetry: LiveMatchTelemetry): {
    updatedTelemetry: LiveMatchTelemetry;
    shouldSuspendMarket: boolean;
    oddsShifts: OddsShiftResult;
  };
}
