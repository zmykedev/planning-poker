// Servicio Socket.IO para conectarse al backend

import { io, Socket } from 'socket.io-client';
import type { CardValue, WebSocketMessage, CardDeck } from '../types';

type MessageHandler = (message: WebSocketMessage) => void;

class SocketIOService {
  private socket: Socket | null = null;
  private handlers: Set<MessageHandler> = new Set();
  private wsUrl: string;

  constructor(url: string) {
    this.wsUrl = url;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Crear conexión Socket.IO
        this.socket = io(this.wsUrl, {
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 2000,
        });

        this.socket.on('connect', () => {
          console.log('[socket] CONNECT', this.socket?.id);

          resolve();
        });

        // Escuchar todos los eventos del servidor
        this.socket.onAny((eventName, data) => {
          // Convertir a formato WebSocketMessage
          const message: WebSocketMessage = {
            type: eventName as WebSocketMessage['type'],
            ...data,
          };

          this.handlers.forEach((handler) => handler(message));
        });

        this.socket.on('disconnect', () => {
          // No-op
        });

        this.socket.on('connect_error', (error) => {
          console.error('[socket] CONNECT_ERROR', error);

          reject(error);
        });

        this.socket.on('error', () => {
          // No-op
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  subscribe(handler: MessageHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  createRoom(roomName: string, userName: string, cardDeck: CardDeck, ownerEmoji: string): void {
    if (this.socket?.connected) {
      this.socket.emit('room:create', {
        roomName,
        ownerName: userName,
        ownerEmoji,
        cards: cardDeck.values,
      });
    } else {
      // No-op or could throw
    }
  }

  joinRoom(roomId: string, userName: string, emoji: string): void {
    if (this.socket?.connected) {
      this.socket.emit('room:join', {
        roomId,
        userName,
        emoji,
      });
    } else {
      // No-op or could throw
    }
  }

  vote(vote: CardValue): void {
    if (this.socket?.connected) {
      this.socket.emit('user:vote', {
        vote,
      });
    } else {
      // No-op or could throw
    }
  }

  revealVotes(): void {
    if (this.socket?.connected) {
      this.socket.emit('room:reveal');
    } else {
      // No-op or could throw
    }
  }

  resetVoting(): void {
    if (this.socket?.connected) {
      this.socket.emit('room:reset');
    } else {
      // No-op or could throw
    }
  }

  toggleSpectator(spectator: boolean): void {
    if (this.socket?.connected) {
      this.socket.emit('user:spectate', {
        spectator,
      });
    } else {
      // No-op or could throw
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

const getSocketIOURL = () => {
  const envUrl = import.meta.env.VITE_SOCKET_URL;

  if (!envUrl) {
    return 'http://localhost:3001';
  }

  // Normaliza ws:// a http:// y wss:// a https:// para que Socket.IO detecte el protocolo adecuado
  return envUrl.replace(/^ws:\/\//i, 'http://').replace(/^wss:\/\//i, 'https://');
};

export const websocketService = new SocketIOService(getSocketIOURL());
