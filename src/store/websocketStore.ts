import { create } from 'zustand';
import type { User, CardDeck } from '@/types/session';

// Detectar automáticamente si usar ws o wss basado en el protocolo de la página
const getWebSocketURL = () => {
  const isSecure = window.location.protocol === 'https:';
  const protocol = isSecure ? 'wss:' : 'ws:';
  return `${protocol}//planning-poker-backend-production-98d3.up.railway.app`;
};

const WS_URL = getWebSocketURL();

// Obtener sala desde URL o localStorage
const getInitialRoom = () => {
  if (typeof window !== 'undefined') {
    // Primero verificar si hay parámetro de sala en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const roomFromUrl = urlParams.get('room');

    if (roomFromUrl) {
      // Guardar en localStorage para futuras sesiones
      localStorage.setItem('planning-poker-room', roomFromUrl);
      return roomFromUrl;
    }

    // Si no hay en URL, usar localStorage
    return localStorage.getItem('planning-poker-room') || null;
  }
  return null;
};

interface WebSocketStore {
  // Estado básico
  socket: WebSocket | null;
  connected: boolean;
  currentUser: User | null;
  players: User[];
  roomId: string | null;
  revealed: boolean;
  cardDeck: CardDeck | null;

  // Acciones básicas
  connect: () => void;
  disconnect: () => void;
  createRoom: (roomName: string, userName: string, cardDeck: CardDeck) => void;
  joinRoom: (roomId: string, userName: string) => void;
  vote: (value: number | string) => void;
  reveal: () => void;
  reset: () => void;
  setCurrentUser: (name: string, role: User['role']) => void;
  setPersistentRoom: (roomId: string) => void;
  clearPersistentRoom: () => void;
  getRoomLink: () => string;
}

export const useWebSocketStore = create<WebSocketStore>((set, get) => ({
  socket: null,
  connected: false,
  currentUser: null,
  players: [],
  roomId: getInitialRoom(), // Cargar sala desde URL o localStorage
  revealed: false,
  cardDeck: null,

  connect: () => {
    try {
      console.log('Conectando a WebSocket:', WS_URL);
      const socket = new WebSocket(WS_URL);

      socket.onopen = () => {
        set({ socket, connected: true });
        console.log('WebSocket conectado');
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case 'room:created':
            case 'room:joined': {
              console.log('Room response received:', data);
              set({
                roomId: data.roomId,
                players: data.users || [],
                revealed: data.revealed || false,
                cardDeck: data.cardDeck || get().cardDeck, // Mantener cardDeck si no viene del servidor
              });
              // Guardar sala en localStorage
              if (data.roomId) {
                localStorage.setItem('planning-poker-room', data.roomId);
              }
              break;
            }

            case 'room:updated': {
              set({
                players: data.users,
                revealed: data.revealed || false,
              });
              break;
            }

            case 'room:revealed':
              set({ revealed: true });
              break;

            case 'room:reset': {
              set({ revealed: false });
              const { currentUser } = get();
              if (currentUser) {
                set({ currentUser: { ...currentUser, vote: null } });
              }
              break;
            }

            case 'room:error':
              console.error('Error de sala:', data.message);
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        set({ connected: false });
      };

      socket.onclose = () => {
        set({ socket: null, connected: false });
        console.log('WebSocket desconectado');
        // Reintentar conexión después de 5 segundos
        setTimeout(() => get().connect(), 5000);
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      set({ connected: false });
      setTimeout(() => get().connect(), 5000);
    }
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.close();
      set({ socket: null, connected: false });
    }
  },

  createRoom: (roomName, userName, cardDeck) => {
    const { socket } = get();

    // Inicializar el cardDeck localmente para mostrar las cartas inmediatamente
    set({
      cardDeck,
      revealed: false,
    });

    if (!socket) {
      console.log('Cannot create room: socket not available');
      // Fallback: crear sala localmente
      const fallbackRoomId = Math.random().toString(36).substr(2, 9).toUpperCase();
      set({
        roomId: fallbackRoomId,
        players: [
          {
            id: Math.random().toString(36).substr(2, 9),
            name: userName,
            vote: null,
            role: 'voter',
            isReady: true,
          },
        ],
      });
      localStorage.setItem('planning-poker-room', fallbackRoomId);
      return;
    }

    const message = {
      type: 'room:create',
      roomName,
      userName,
      cardDeck,
    };

    socket.send(JSON.stringify(message));

    // Fallback: si no hay respuesta del servidor en 3 segundos, crear sala localmente
    setTimeout(() => {
      const { roomId } = get();
      if (!roomId) {
        console.log('No server response, creating room locally');
        const fallbackRoomId = Math.random().toString(36).substr(2, 9).toUpperCase();
        set({
          roomId: fallbackRoomId,
          players: [
            {
              id: Math.random().toString(36).substr(2, 9),
              name: userName,
              vote: null,
              role: 'voter',
              isReady: true,
            },
          ],
        });
        localStorage.setItem('planning-poker-room', fallbackRoomId);
      }
    }, 3000);
  },

  joinRoom: (roomId, userName) => {
    const { socket } = get();

    // Establecer la sala inmediatamente en el estado local
    set({ roomId });
    localStorage.setItem('planning-poker-room', roomId);

    if (!socket) {
      console.log('Cannot join room: socket not available, but room ID set locally');
      return;
    }

    const message = {
      type: 'room:join',
      roomId,
      userName,
    };

    socket.send(JSON.stringify(message));
  },

  vote: (value) => {
    const { socket, currentUser } = get();
    if (!currentUser) {
      console.log('Cannot vote: currentUser not available');
      return;
    }

    // Actualizar voto localmente
    const updatedUser = { ...currentUser, vote: value };
    set({ currentUser: updatedUser });

    // Enviar al servidor
    if (socket) {
      socket.send(
        JSON.stringify({
          type: 'user:vote',
          vote: value,
        }),
      );
    }
  },

  reveal: () => {
    const { socket } = get();
    set({ revealed: true });

    if (socket) {
      socket.send(
        JSON.stringify({
          type: 'room:reveal',
        }),
      );
    }
  },

  reset: () => {
    const { socket, currentUser } = get();
    set({ revealed: false });

    if (currentUser) {
      set({ currentUser: { ...currentUser, vote: null } });
    }

    if (socket) {
      socket.send(
        JSON.stringify({
          type: 'room:reset',
        }),
      );
    }
  },

  setCurrentUser: (name, role) => {
    const newUser = {
      id: crypto.randomUUID(),
      name,
      role,
      vote: null,
      isReady: false,
    };
    set({ currentUser: newUser });
  },

  setPersistentRoom: (roomId) => {
    set({ roomId });
    localStorage.setItem('planning-poker-room', roomId);
  },

  clearPersistentRoom: () => {
    set({ roomId: null });
    localStorage.removeItem('planning-poker-room');
  },

  getRoomLink: () => {
    const { roomId } = get();
    if (!roomId) return '';

    const baseUrl = window.location.origin + window.location.pathname;
    // Asegurar que el link apunte a la página de registro
    const registerUrl = baseUrl.replace('/main', '/register');
    return `${registerUrl}?room=${roomId}`;
  },
}));
