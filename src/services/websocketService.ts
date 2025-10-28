// Servicio WebSocket real para conectarse al backend

import type { CardValue, WebSocketMessage, CardDeck } from '../types';

type MessageHandler = (message: WebSocketMessage) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private handlers: Set<MessageHandler> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private wsUrl: string;

  constructor(url: string) {
    this.wsUrl = url;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.wsUrl);

        this.ws.onopen = () => {
          console.log('✅ Conectado al servidor WebSocket');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          console.log('📨 Mensaje recibido del servidor:', event.data);
          try {
            const message = JSON.parse(event.data) as WebSocketMessage;
            console.log('📨 Mensaje parseado:', message);
            this.handlers.forEach((handler) => handler(message));
          } catch (error) {
            console.error('Error parseando mensaje:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('❌ Desconectado del servidor WebSocket');
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('❌ Error WebSocket:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `🔄 Intentando reconectar (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`,
      );

      setTimeout(() => {
        this.connect().catch((err) => {
          console.error('Error al reconectar:', err);
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('❌ No se pudo reconectar al servidor');
      this.handlers.forEach((handler) =>
        handler({
          type: 'room:error',
          message: 'No se pudo conectar al servidor. Por favor, recarga la página.',
        }),
      );
    }
  }

  subscribe(handler: MessageHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  private send(message: Record<string, unknown>): void {
    console.log('📤 Intentando enviar:', message);
    console.log('🔌 WebSocket estado:', this.ws?.readyState);
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('✅ Enviando mensaje al servidor');
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('❌ WebSocket no está conectado');
      this.handlers.forEach((handler) =>
        handler({
          type: 'room:error',
          message: 'No hay conexión con el servidor',
        }),
      );
    }
  }

  createRoom(roomName: string, userName: string, cardDeck: CardDeck): void {
    console.log('📤 Enviando createRoom:', { roomName, userName, cardDeck });
    this.send({
      type: 'room:create',
      roomName,
      userName,
      cardDeck,
    });
  }

  joinRoom(roomId: string, userName: string): void {
    this.send({
      type: 'room:join',
      roomId,
      userName,
    });
  }

  vote(vote: CardValue): void {
    console.log('🗳️ Enviando voto al servidor:', vote);
    this.send({
      type: 'user:vote',
      vote,
    });
  }

  revealVotes(): void {
    this.send({
      type: 'room:reveal',
    });
  }

  resetVoting(): void {
    this.send({
      type: 'room:reset',
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

const getWebSocketURL = () => {
  const isSecure = window.location.protocol === 'https:';
  const protocol = isSecure ? 'wss:' : 'ws:';
  return `${protocol}//planning-poker-backend-production-98d3.up.railway.app`;
};

export const websocketService = new WebSocketService(getWebSocketURL());
