import { io, Socket } from 'socket.io-client';

class PlayerSocketService {
  private socket: Socket | null = null;

  public connect(): Socket {
    if (!this.socket) {
      const DEFAULT_BACKEND_URL = 'https://sports-exchange-backend-j1aj.onrender.com';
      let socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL;
      if (!socketUrl && typeof window !== 'undefined') {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          socketUrl = 'http://localhost:5000';
        } else {
          socketUrl = DEFAULT_BACKEND_URL;
        }
      }
      this.socket = io(socketUrl || DEFAULT_BACKEND_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
        timeout: 6000
      });

      this.socket.on('connect', () => {
        console.log('Player Portal WebSocket connected:', this.socket?.id);
      });
      this.socket.on('connect_error', (err) => {
        console.warn('Player Portal WebSocket connection error:', err.message);
      });
    }
    return this.socket;
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const playerSocket = new PlayerSocketService();
