import { useState, useEffect, useRef, useCallback } from 'react';
import type { Room, WebSocketMessage } from '../types';
import { websocketService } from '../services/websocketService';

export function useWebSocket() {
  const [room, setRoom] = useState<Room | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  // Referencias para mantener los valores actuales en los callbacks
  const currentUserIdRef = useRef<string | null>(null);
  const currentUserNameRef = useRef<string | null>(null);

  // Actualizar referencias cuando cambien los estados
  useEffect(() => {
    currentUserIdRef.current = currentUserId;
    currentUserNameRef.current = currentUserName;
  }, [currentUserId, currentUserName]);

  // Handler de mensajes WebSocket (memoizado para evitar recreaciones)
  const handleMessage = useCallback((message: WebSocketMessage) => {
    console.log('📨 Mensaje recibido en hook:', message);
    switch (message.type) {
      case 'room:created': {
        console.log('🏠 Sala creada:', message.room);
        console.log('👤 Owner ID:', message.ownerId);
        console.log('👥 Usuarios en la sala:', message.room.users);
        setRoom(message.room);
        setCurrentUserId(message.ownerId);
        // Buscar el nombre del creador en la sala
        const creator = message.room.users.find((u) => u.id === message.ownerId);
        if (creator) {
          console.log('👤 Creador encontrado:', creator);
          setCurrentUserName(creator.name);
        } else {
          console.log('❌ Creador no encontrado en la sala');
        }
        setError(null);
        break;
      }
      case 'room:joined': {
        console.log('🚪 Sala unida:', message.room);
        console.log('👤 User ID:', message.userId);
        setRoom(message.room);
        setCurrentUserId(message.userId);
        // Buscar el nombre del usuario en la sala
        const joinedUser = message.room.users.find((u) => u.id === message.userId);
        if (joinedUser) {
          setCurrentUserName(joinedUser.name);
        }
        setError(null);
        break;
      }
      case 'room:updated':
        console.log('🔄 Sala actualizada:', message.room);
        console.log('👥 Usuarios en sala actualizada:', message.room.users);
        setRoom(message.room);
        // Mantener la identificación del usuario actual usando refs
        if (currentUserNameRef.current && message.room.users) {
          const foundUser = message.room.users.find((u) => u.name === currentUserNameRef.current);
          if (foundUser && foundUser.id !== currentUserIdRef.current) {
            console.log('🔄 Actualizando currentUserId a:', foundUser.id);
            setCurrentUserId(foundUser.id);
          }
        }
        break;
      case 'room:error':
        console.log('❌ Error:', message.message);
        setError(message.message);
        break;
      case 'room:revealed':
      case 'room:reset':
        // La actualización vendrá con room:updated
        break;
    }
  }, []);

  // Conectar al WebSocket solo una vez al montar
  useEffect(() => {
    console.log('🔌 Iniciando conexión WebSocket...');

    // Conectar al servidor WebSocket
    websocketService
      .connect()
      .then(() => {
        setConnected(true);
        console.log('✅ Conectado al servidor WebSocket');
      })
      .catch((err) => {
        console.error('❌ Error conectando:', err);
        setError(
          'No se pudo conectar al servidor. Asegúrate de que el servidor esté ejecutándose.',
        );
        setConnected(false);
      });

    // Suscribirse a mensajes
    const unsubscribe = websocketService.subscribe(handleMessage);

    // Cleanup: solo desuscribirse, NO desconectar (mantener conexión activa)
    return () => {
      console.log('🔌 Desmontando hook, manteniendo conexión WebSocket activa...');
      unsubscribe();
      // NO llamamos a websocketService.disconnect() para mantener la conexión
    };
  }, [handleMessage]); // Solo depende de handleMessage que es estable

  return {
    room,
    currentUserId,
    currentUserName,
    error,
    connected,
    createRoom: websocketService.createRoom.bind(websocketService),
    joinRoom: websocketService.joinRoom.bind(websocketService),
    vote: websocketService.vote.bind(websocketService),
    revealVotes: websocketService.revealVotes.bind(websocketService),
    resetVoting: websocketService.resetVoting.bind(websocketService),
  };
}
