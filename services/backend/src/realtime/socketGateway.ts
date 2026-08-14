import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { matchingEngineService } from './matchingEngineService';
import { query } from '../db/pool';

export class RealTimeGateway {
  private io: Server | null = null;

  public initialize(httpServer: HttpServer): void {
    this.io = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      },
      pingInterval: 10000,
      pingTimeout: 5000
    });

    this.io.on('connection', (socket: Socket) => {
      // 1. Client joins a market room
      socket.on('subscribe:market', async (data: { marketId: string }) => {
        if (!data || !data.marketId) return;
        const room = `market:${data.marketId}`;
        socket.join(room);

        // Immediately send current market ladder to the connecting client
        await this.sendMarketLadderToSocket(socket, data.marketId);
      });

      // 2. Client leaves a market room
      socket.on('unsubscribe:market', (data: { marketId: string }) => {
        if (!data || !data.marketId) return;
        socket.leave(`market:${data.marketId}`);
      });

      // 3. User subscribes to private balance and order notifications
      socket.on('subscribe:user', (data: { userId: string }) => {
        if (!data || !data.userId) return;
        socket.join(`user:${data.userId}`);
      });

      socket.on('disconnect', () => {
        // Socket cleanup
      });
    });
  }

  private async sendMarketLadderToSocket(socket: Socket, marketId: string): Promise<void> {
    try {
      const selectionsRes = await query(
        `SELECT selection_id FROM market_selections WHERE market_id = $1`,
        [marketId]
      );
      const selectionIds = selectionsRes.rows.map((r) => parseInt(r.selection_id, 10));
      const ladder = matchingEngineService.getMarketLadder(marketId, selectionIds);

      socket.emit('ladder:update', {
        marketId,
        ladder,
        timestamp: Date.now()
      });
    } catch (err) {
      console.error(`Error sending ladder for market ${marketId}:`, err);
    }
  }

  /**
   * Broadcasts orderbook ladder update to all clients watching a market (<50ms).
   */
  public async broadcastOrderBookUpdate(marketId: string): Promise<void> {
    if (!this.io) return;
    try {
      const selectionsRes = await query(
        `SELECT selection_id FROM market_selections WHERE market_id = $1`,
        [marketId]
      );
      const selectionIds = selectionsRes.rows.map((r) => parseInt(r.selection_id, 10));
      const ladder = matchingEngineService.getMarketLadder(marketId, selectionIds);

      this.io.to(`market:${marketId}`).emit('ladder:update', {
        marketId,
        ladder,
        timestamp: Date.now()
      });
    } catch (err) {
      console.error(`Error broadcasting orderbook for market ${marketId}:`, err);
    }
  }

  /**
   * Notifies a specific user about updated available credit and exposure locks.
   */
  public notifyUserBalance(userId: string, balanceData: { availableCredit: number; exposure: number }): void {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit('user:balance', {
      userId,
      ...balanceData,
      timestamp: Date.now()
    });
  }

  /**
   * Broadcasts emergency market lock / suspension kill-switch.
   */
  public broadcastMarketLock(marketId: string, isLocked: boolean): void {
    if (!this.io) return;
    this.io.to(`market:${marketId}`).emit('market:status', {
      marketId,
      isLocked,
      status: isLocked ? 'SUSPENDED' : 'OPEN',
      timestamp: Date.now()
    });
    this.io.emit('market:global_status', {
      marketId,
      isLocked,
      status: isLocked ? 'SUSPENDED' : 'OPEN'
    });
  }

  /**
   * Broadcasts market settlement results to all clients.
   */
  public broadcastMarketSettlement(marketId: string, winningSelectionId: number): void {
    if (!this.io) return;
    this.io.to(`market:${marketId}`).emit('market:settled', {
      marketId,
      winningSelectionId,
      timestamp: Date.now()
    });
    this.io.emit('market:global_settled', {
      marketId,
      winningSelectionId
    });
  }
}

export const realTimeGateway = new RealTimeGateway();
