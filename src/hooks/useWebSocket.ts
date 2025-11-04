import { useState, useEffect, useRef, useCallback } from 'react';
import type { Room, WebSocketMessage, CardDeck } from '../types';
import { websocketService } from '../services/websocketService';

export function useWebSocket() {
  const [room, setRoom] = useState<Room | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [currentUserEmoji, setCurrentUserEmoji] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  // Referencias para mantener los valores actuales en los callbacks
  const currentUserIdRef = useRef<string | null>(null);
  const currentUserNameRef = useRef<string | null>(null);
  const currentUserEmojiRef = useRef<string | null>(null);

  // Actualizar referencias cuando cambien los estados
  useEffect(() => {
    currentUserIdRef.current = currentUserId;
    currentUserNameRef.current = currentUserName;
    currentUserEmojiRef.current = currentUserEmoji;
  }, [currentUserId, currentUserName, currentUserEmoji]);

  // Handler de mensajes WebSocket (memoizado para evitar recreaciones)
  const handleMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'room:created': {
        setRoom(message.room);
        setCurrentUserId(message.ownerId);
        // Buscar el nombre del creador en la sala
        const creator = message.room.users.find((u) => u.id === message.ownerId);
        if (creator) {
          setCurrentUserName(creator.name);
          setCurrentUserEmoji(creator.emoji);
        }
        setError(null);
        break;
      }
      case 'room:joined': {
        setRoom(message.room);
        setCurrentUserId(message.userId);
        // Buscar el nombre del usuario en la sala
        const joinedUser = message.room.users.find((u) => u.id === message.userId);
        if (joinedUser) {
          setCurrentUserName(joinedUser.name);
          setCurrentUserEmoji(joinedUser.emoji);
        }
        setError(null);
        break;
      }
      case 'room:updated':
        setRoom(message.room);
        // Mantener la identificación del usuario actual usando refs
        if (currentUserNameRef.current && message.room.users) {
          const foundUser = message.room.users.find((u) => u.name === currentUserNameRef.current);
          if (foundUser && foundUser.id !== currentUserIdRef.current) {
            setCurrentUserId(foundUser.id);
          }
          if (foundUser && foundUser.emoji !== currentUserEmojiRef.current) {
            setCurrentUserEmoji(foundUser.emoji);
          }
        }
        break;
      case 'room:error':
        setError(message.message);
        break;
      case 'room:revealed':
      case 'room:reset':
        // La actualización vendrá con room:updated
        break;
    }
  }, []);

  useEffect(() => {
    websocketService
      .connect()
      .then(() => {
        setConnected(true);
      })
      .catch(() => {
        setError(
          'No se pudo conectar al servidor. Asegúrate de que el servidor esté ejecutándose.',
        );
        setConnected(false);
      });

    const unsubscribe = websocketService.subscribe(handleMessage);

    return () => {
      unsubscribe();
    };
  }, [handleMessage]);

  const createRoom = (
    roomName: string,
    userName: string,
    cardDeck: CardDeck,
    ownerEmoji: string,
  ) => {
    websocketService.createRoom(roomName, userName, cardDeck, ownerEmoji);
  };

  const joinRoom = (roomId: string, userName: string, emoji: string) => {
    websocketService.joinRoom(roomId, userName, emoji);
  };

  return {
    room,
    currentUserId,
    currentUserName,
    currentUserEmoji,
    error,
    connected,
    createRoom,
    joinRoom,
    vote: websocketService.vote.bind(websocketService),
    revealVotes: websocketService.revealVotes.bind(websocketService),
    resetVoting: websocketService.resetVoting.bind(websocketService),
    toggleSpectator: websocketService.toggleSpectator.bind(websocketService),
  };
}
