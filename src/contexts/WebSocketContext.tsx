import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { websocketService } from '../services/websocketService';
import type { CardDeck, Room, WebSocketMessage } from '../types';

interface WebSocketContextType {
  room: Room | null;
  currentUserId: string | null;
  error: string | null;
  connected: boolean;
  currentUserName: string | null;

  // Actions (exactamente como planning-functional)
  createRoom: (roomName: string, userName: string, cardDeck: CardDeck) => void;
  joinRoom: (roomId: string, userName: string) => void;
  vote: (value: number | string) => void;
  revealVotes: () => void;
  resetVoting: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  // Conectar al servidor WebSocket al montar el componente (exactamente como planning-functional)
  useEffect(() => {
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
      console.log('📨 Mensaje recibido en Context:', message);
      switch (message.type) {
        case 'room:created':
          console.log('🏠 Sala creada:', message.room);
          console.log('👤 Owner ID:', message.ownerId);
          setRoom(message.room);
          setCurrentUserId(message.ownerId);
          setError(null);
          break;
        case 'room:joined':
          setRoom(message.room);
          setCurrentUserId(message.ownerId);
          setError(null);
          break;
        case 'room:updated':
          console.log('🔄 Sala actualizada:', message.room);
          setRoom(message.room);
          break;
        case 'room:error':
        case 'error':
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

  // Buscar al usuario cuando se actualiza la sala
  useEffect(() => {
    if (room && currentUserName && currentUserId && room.ownerId === currentUserId) {
      // Si somos el owner pero tenemos un currentUserName, significa que alguien se unió
      // Buscar el último usuario agregado que no sea el owner
      const nonOwnerUsers = room.users.filter((u) => u.id !== room.ownerId);
      if (nonOwnerUsers.length > 0) {
        const lastUser = nonOwnerUsers[nonOwnerUsers.length - 1];
        console.log('🔍 Usuario se unió a la sala:', lastUser);
        // No cambiar el currentUserId del owner, solo loggear
      }
    } else if (room && currentUserName && !currentUserId) {
      // Si no tenemos currentUserId pero tenemos currentUserName, buscar nuestro usuario
      console.log('🔍 Buscando usuario en useEffect:', {
        currentUserName,
        users: room.users,
      });
      let user = room.users.find((u) => u.name === currentUserName);
      if (!user) {
        user = room.users.find((u) => u.name && u.name.includes(currentUserName));
      }
      if (!user && room.users.length > 0) {
        user = room.users[room.users.length - 1];
        console.log('🔍 Usando último usuario agregado:', user);
      }
      if (user) {
        console.log('✅ Usuario encontrado en useEffect:', user);
        setCurrentUserId(user.id);
      }
    }
  }, [room, currentUserName, currentUserId]);

  const createRoom = (roomName: string, userName: string, cardDeck: CardDeck) => {
    console.log('🏠 Creando sala con usuario:', userName);
    setCurrentUserName(userName);
    websocketService.createRoom(roomName, userName, cardDeck);
  };

  const joinRoom = (roomId: string, userName: string) => {
    console.log('🚪 Uniéndose a sala con usuario:', userName);
    setCurrentUserName(userName);
    websocketService.joinRoom(roomId, userName);
  };

  const value: WebSocketContextType = {
    room,
    currentUserId,
    error,
    connected,
    currentUserName,
    createRoom,
    joinRoom,
    vote: websocketService.vote.bind(websocketService),
    revealVotes: websocketService.revealVotes.bind(websocketService),
    resetVoting: websocketService.resetVoting.bind(websocketService),
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};
