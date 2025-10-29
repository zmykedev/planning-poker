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
        console.log('🔌 Conectando a Socket.IO:', this.wsUrl);

        // Crear conexión Socket.IO
        this.socket = io(this.wsUrl, {
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 2000,
        });

        this.socket.on('connect', () => {
          console.log('✅ Conectado a Socket.IO');
          console.log('🔗 Socket ID:', this.socket?.id);
          resolve();
        });

        // Escuchar todos los eventos del servidor
        this.socket.onAny((eventName, data) => {
          console.log('📨 Evento recibido:', eventName, data);

          // Convertir a formato WebSocketMessage
          const message: WebSocketMessage = {
            type: eventName as WebSocketMessage['type'],
            ...data,
          };

          this.handlers.forEach((handler) => handler(message));
        });

        this.socket.on('disconnect', (reason) => {
          console.log('❌ Desconectado de Socket.IO:', reason);
        });

        this.socket.on('connect_error', (error) => {
          console.error('❌ Error de conexión Socket.IO:', error);
          reject(error);
        });

        this.socket.on('error', (error) => {
          console.error('❌ Error Socket.IO:', error);
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

  createRoom(roomName: string, userName: string, cardDeck: CardDeck): void {
    console.log('📤 Creando sala:', { roomName, userName, cardDeck });
    if (this.socket?.connected) {
      this.socket.emit('room:create', {
        roomName,
        ownerName: userName,
        cards: cardDeck.values,
      });
    } else {
      console.error('❌ Socket.IO no está conectado');
    }
  }

  joinRoom(roomId: string, userName: string): void {
    console.log('📤 Uniéndose a sala:', { roomId, userName });
    if (this.socket?.connected) {
      this.socket.emit('room:join', {
        roomId,
        userName,
      });
    } else {
      console.error('❌ Socket.IO no está conectado');
    }
  }

  vote(vote: CardValue): void {
    console.log('🗳️ Enviando voto:', { vote });
    if (this.socket?.connected) {
      this.socket.emit('user:vote', {
        vote,
      });
    } else {
      console.error('❌ Socket.IO no está conectado');
    }
  }

  revealVotes(): void {
    console.log('👁️ Revelando votos');
    if (this.socket?.connected) {
      this.socket.emit('room:reveal');
    } else {
      console.error('❌ Socket.IO no está conectado');
    }
  }

  resetVoting(): void {
    console.log('🔄 Reiniciando votación');
    if (this.socket?.connected) {
      this.socket.emit('room:reset');
    } else {
      console.error('❌ Socket.IO no está conectado');
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('👋 Desconectado de Socket.IO');
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

const getSocketIOURL = () => {
  // Usar el backend local
  return 'http://localhost:3001';
};

export const websocketService = new SocketIOService(getSocketIOURL());
