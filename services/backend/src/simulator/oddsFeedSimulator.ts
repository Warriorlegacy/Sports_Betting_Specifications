import { liveFeedManager } from '../sportsFeeds/LiveFeedManager';

export class OddsFeedSimulator {
  public start(): void {
    liveFeedManager.start();
  }

  public stop(): void {
    liveFeedManager.stop();
  }
}

export const oddsFeedSimulator = new OddsFeedSimulator();
