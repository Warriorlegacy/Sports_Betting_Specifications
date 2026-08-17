import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { oddsFeedSimulator } from '../simulator/oddsFeedSimulator';

export class InactivityMonitor {
  private lastActivityTime: number = Date.now();
  private isSleeping: boolean = false;
  private checkInterval: NodeJS.Timeout | null = null;
  private connectedSocketsCount: number = 0;
  private readonly timeoutMs: number;

  constructor() {
    this.timeoutMs = config.inactivitySleepTimeoutMs || 60000; // 1 minute default
  }

  /**
   * Initializes the background inactivity checking cron loop.
   */
  public start(): void {
    if (this.checkInterval) return;

    console.log(`[InactivityMonitor] Auto-sleep monitor initialized with ${this.timeoutMs / 1000}s threshold.`);

    // Run every 15 seconds to check if idle limit exceeded
    this.checkInterval = setInterval(() => {
      this.checkInactivity();
    }, 15000);

    if (this.checkInterval.unref) {
      this.checkInterval.unref();
    }
  }

  /**
   * Stops the background monitor.
   */
  public stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Records an activity event (HTTP request, WebSocket connection/message, Bet placement, etc.)
   */
  public recordActivity(source: string = 'http'): void {
    this.lastActivityTime = Date.now();
    if (this.isSleeping) {
      this.wakeUp(source);
    }
  }

  /**
   * Updates current active WebSocket client count.
   */
  public setConnectedSockets(count: number): void {
    this.connectedSocketsCount = Math.max(0, count);
    if (this.connectedSocketsCount > 0) {
      this.recordActivity('websocket_connected');
    }
  }

  public getConnectedSockets(): number {
    return this.connectedSocketsCount;
  }

  public getStatus() {
    const idleSeconds = Math.floor((Date.now() - this.lastActivityTime) / 1000);
    const timeToSleepSeconds = Math.max(0, Math.floor((this.timeoutMs - (Date.now() - this.lastActivityTime)) / 1000));

    return {
      isSleeping: this.isSleeping,
      idleSeconds,
      timeToSleepSeconds,
      timeoutSeconds: this.timeoutMs / 1000,
      connectedSockets: this.connectedSocketsCount,
      lastActivity: new Date(this.lastActivityTime).toISOString(),
      renderAutoSleepConfigured: Boolean(config.renderApiKey && config.renderServiceId)
    };
  }

  /**
   * Wakes up the server from sleep mode and restarts liquidity simulator if enabled.
   */
  public wakeUp(reason: string = 'request'): void {
    if (!this.isSleeping) return;
    this.isSleeping = false;
    this.lastActivityTime = Date.now();
    console.log(`[InactivityMonitor] ☀️ Server WOKEN UP due to: ${reason}`);

    if (config.simulatorEnabled) {
      oddsFeedSimulator.start();
    }
  }

  /**
   * Puts background intensive workers to sleep during idle periods to preserve CPU,
   * while keeping the HTTP/WebSocket API server responsive 24/7.
   */
  public async putToSleep(): Promise<void> {
    if (this.isSleeping) return;
    this.isSleeping = true;

    console.log(`[InactivityMonitor] Idle period detected. Pausing background CPU simulator workers while keeping API online.`);

    // Pause background odds ticker / CPU simulator to save compute
    oddsFeedSimulator.stop();
  }

  /**
   * Periodic cron evaluation of idle duration.
   */
  private checkInactivity(): void {
    if (this.isSleeping) return;

    // If active WebSocket users exist, don't sleep
    if (this.connectedSocketsCount > 0) {
      this.lastActivityTime = Date.now();
      return;
    }

    const elapsed = Date.now() - this.lastActivityTime;
    if (elapsed >= this.timeoutMs) {
      this.putToSleep();
    }
  }

  /**
   * Express middleware to track all incoming HTTP requests.
   */
  public middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Ignore background health check pings from resetting the user activity timer if desired
      const isHealthCheck = req.path === '/api/health' || req.path === '/api/inactivity/status';
      if (!isHealthCheck) {
        this.recordActivity(`http:${req.method}:${req.path}`);
      }
      next();
    };
  }
}

export const inactivityMonitor = new InactivityMonitor();
