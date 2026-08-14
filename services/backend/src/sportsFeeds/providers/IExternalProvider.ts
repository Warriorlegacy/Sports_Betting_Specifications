import { LiveMatchTelemetry } from '../types';

export interface IExternalProvider {
  /** Human-readable name for this provider */
  getProviderName(): string;

  /** Priority tier (lower = higher priority) */
  getPriority(): number;

  /** Check whether the provider is currently considered healthy */
  isHealthy(): boolean;

  /** Fetch all available live / upcoming matches right now */
  fetchLiveMatches(): Promise<LiveMatchTelemetry[]>;

  /** Called after 3 consecutive failures to reset state */
  resetCircuitBreaker(): void;
}
