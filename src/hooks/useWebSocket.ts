import { useState, useEffect } from 'react';
import type { Room, WebSocketMessage } from '../types';
import { websocketService } from '../services/websocketService';

export function useWebSocket() {
  const [room, setRoom] = useState<Room | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Conectar al servidor WebSocket al montar el componente
    websocketService
      .connect()
      .then(() => {
        setConnected(true);
        console.log('Conectado al servidor');
      })
      .catch((err) => {
        console.error('Error conectando:', err);
        setError(
          'No se pudo conectar al servidor. Asegúrate de que el servidor esté ejecutándose.',
        );
        setConnected(false);
      });

    const unsubscribe = websocketService.subscribe((message: WebSocketMessage) => {
      switch (message.type) {
        case 'room:created':
          setRoom(message.room);
          setCurrentUserId(message.userId);
          setError(null);
          break;
        case 'room:joined':
          setRoom(message.room);
          setCurrentUserId(message.userId);
          setError(null);
          break;
        case 'room:updated':
          setRoom(message.room);
          break;
        case 'room:error':
          setError(message.message);
          break;
        case 'room:revealed':
        case 'room:reset':
          // La actualización vendrá con room:updated
          break;
      }
    });

    return () => {
      unsubscribe();
      websocketService.disconnect();
    };
  }, []);

  return {
    room,
    currentUserId,
    error,
    connected,
    createRoom: websocketService.createRoom.bind(websocketService),
    joinRoom: websocketService.joinRoom.bind(websocketService),
    vote: websocketService.vote.bind(websocketService),
    revealVotes: websocketService.revealVotes.bind(websocketService),
    resetVoting: websocketService.resetVoting.bind(websocketService),
  };
}
