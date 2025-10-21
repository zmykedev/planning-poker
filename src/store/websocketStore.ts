import { create } from 'zustand';
import type { User, CardDeck } from '@/types/session';

// Función para navegar (se establecerá desde el componente)
let navigateFunction: ((path: string) => void) | null = null;

export const setNavigateFunction = (navigate: (path: string) => void) => {
  navigateFunction = navigate;
};

// Detectar automáticamente si usar ws o wss basado en el protocolo de la página
const getWebSocketURL = () => {
  const isSecure = window.location.protocol === 'https:';
  const protocol = isSecure ? 'wss:' : 'ws:';
  return `${protocol}//planning-poker-backend-production-98d3.up.railway.app`;
};

const WS_URL = getWebSocketURL();

// Obtener sala desde URL
const getInitialRoom = () => {
  if (typeof window !== 'undefined') {
    // Verificar si hay parámetro de sala en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const roomFromUrl = urlParams.get('room');

    if (roomFromUrl) {
      return roomFromUrl;
    }
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

          console.log('Data received:', data);

          switch (data.type) {
            case 'room:created':
            case 'room:joined': {
              console.log('Room response received:', data);

              // El backend devuelve la sala dentro de un objeto 'room'
              const roomData = data.room || data;
              const roomId = roomData.id;
              const users = roomData.users || [];
              const revealed = roomData.revealed || false;
              const cardDeck = roomData.cardDeck || get().cardDeck;

              console.log('Setting roomId from backend:', roomId);
              console.log('Room data:', roomData);

              set({
                roomId,
                players: users,
                revealed,
                cardDeck,
              });

              console.log('Room state updated with backend ID:', roomId);
              
              // Navegar automáticamente a main cuando se une exitosamente
              if (navigateFunction) {
                navigateFunction('/main');
              }
              break;
            }

            case 'room:updated': {
              // El backend puede devolver la sala dentro de un objeto 'room' o directamente
              const roomData = data.room || data;
              set({
                players: roomData.users || data.users,
                revealed: roomData.revealed || data.revealed || false,
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

    if (!socket) {
      console.log('Cannot create room: socket not available');
      return;
    }

    console.log('Sending room creation request to backend...');
    const message = {
      type: 'room:create',
      roomName,
      userName,
      cardDeck,
    };

    socket.send(JSON.stringify(message));
    console.log('Room creation message sent:', message);
  },

  joinRoom: (roomId, userName) => {
    const { socket } = get();

    if (!socket) {
      console.log('Cannot join room: socket not available');
      return;
    }

    console.log('Attempting to join room:', roomId);
    const message = {
      type: 'room:join',
      roomId,
      userName,
    };

    console.log('Sending join room request:', message);
    socket.send(JSON.stringify(message));
  },

  vote: (value) => {
    const { socket, currentUser } = get();
    if (!currentUser) {
      console.log('Cannot vote: currentUser not available');
      return;
    }

    if (!socket) {
      console.log('Cannot vote: socket not available');
      return;
    }

    console.log('Sending vote:', value);
    socket.send(
      JSON.stringify({
        type: 'user:vote',
        vote: value,
      }),
    );
  },

  reveal: () => {
    const { socket } = get();

    if (!socket) {
      console.log('Cannot reveal: socket not available');
      return;
    }

    console.log('Sending reveal request');
    socket.send(
      JSON.stringify({
        type: 'room:reveal',
      }),
    );
  },

  reset: () => {
    const { socket } = get();

    if (!socket) {
      console.log('Cannot reset: socket not available');
      return;
    }

    console.log('Sending reset request');
    socket.send(
      JSON.stringify({
        type: 'room:reset',
      }),
    );
  },

  setCurrentUser: (name, role) => {
    const newUser = {
      id: crypto.randomUUID(),
      name,
      role,
      isModerator: role === 'voter', // Convertir role a isModerator para compatibilidad
      vote: null,
      isReady: false,
    };
    set({ currentUser: newUser });
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
