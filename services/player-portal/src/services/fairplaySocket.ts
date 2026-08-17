import { io, Socket } from 'socket.io-client';

class FairplaySocketClient {
  private socket: Socket | null = null;
  private currentEventId: string | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  connect() {
    if (this.socket && this.socket.connected) return;

    try {
      this.socket = io('https://zplay1.in', {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
        timeout: 10000
      });

      this.socket.on('connect', () => {
        console.log('[FairplaySocket] Connected to live exchange broadcast server');
        if (this.currentEventId) {
          this.subscribe(this.currentEventId);
        }
      });

      // Betfair Market Depth Broadcast
      this.socket.on('App\\Events\\MarketBroadcastData', (payload: any) => {
        this.emitToListeners('market', payload);
      });

      // Realtime In-Play Scorecard & Ball Status
      this.socket.on('App\\Events\\SportsBroadcastData', (payload: any) => {
        this.emitToListeners('sports', payload);
      });

      // Zero-Commission Bookmaker Odds
      this.socket.on('App\\Events\\BroadcastBookmaker', (payload: any) => {
        this.emitToListeners('bookmaker', payload);
      });

      // Cricket Fancy & Session Markets
      this.socket.on('App\\Events\\BroadcastFancy', (payload: any) => {
        this.emitToListeners('fancy', payload);
      });

      this.socket.on('disconnect', () => {
        console.log('[FairplaySocket] Disconnected from exchange broadcast');
      });
    } catch (err) {
      console.warn('[FairplaySocket] Failed to initiate socket connection:', err);
    }
  }

  subscribe(eventId: string) {
    this.currentEventId = eventId;
    if (this.socket && this.socket.connected) {
      this.socket.emit('sub', eventId);
      this.socket.emit('sub', `market_${eventId}`);
    }
  }

  unsubscribe(eventId: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('unsub', eventId);
      this.socket.emit('unsub', `market_${eventId}`);
    }
    if (this.currentEventId === eventId) {
      this.currentEventId = null;
    }
  }

  on(event: 'market' | 'sports' | 'bookmaker' | 'fancy', callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  private emitToListeners(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error('[FairplaySocket] Listener error:', e);
        }
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const fairplaySocket = new FairplaySocketClient();
