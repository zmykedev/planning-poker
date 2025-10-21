import { create } from 'zustand';
import type { User, CardDeck } from '@/types/session';

const WS_URL = 'ws://planning-poker-backend-production-98d3.up.railway.app';

interface WebSocketStore {
  // Estado
  socket: WebSocket | null;
  connected: boolean;
  currentUser: User | null;
  players: User[];
  roomId: string | null;
  revealed: boolean;
  cardDeck: CardDeck | null;

  // Acciones
  connect: () => void;
  disconnect: () => void;
  createRoom: (roomName: string, userName: string, cardDeck: CardDeck) => void;
  joinRoom: (roomId: string, userName: string) => void;
  vote: (value: number | string) => void;
  reveal: () => void;
  reset: () => void;
  setCurrentUser: (name: string, role: User['role']) => void;
}

export const useWebSocketStore = create<WebSocketStore>((set, get) => ({
  socket: null,
  connected: false,
  currentUser: null,
  players: [],
  roomId: null,
  revealed: false,
  cardDeck: null,

  connect: () => {
    const socket = new WebSocket(WS_URL);

    socket.onopen = () => {
      set({ socket, connected: true });
      console.log('WebSocket conectado');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'room:created':
        case 'room:joined':
          set({
            roomId: data.roomId,
            players: data.users,
            revealed: data.revealed,
            cardDeck: data.cardDeck,
          });
          break;

        case 'room:updated':
          set({
            players: data.users,
            revealed: data.revealed,
          });
          break;

        case 'room:revealed':
          set({ revealed: true });
          break;

        case 'room:reset':
          set({ revealed: false });
          break;

        case 'room:error':
          console.error('Error de sala:', data.message);
          break;
      }
    };

    socket.onclose = () => {
      set({ socket: null, connected: false });
      console.log('WebSocket desconectado');
      // Reintentar conexión después de 5 segundos
      setTimeout(() => get().connect(), 5000);
    };
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
    if (!socket) return;

    socket.send(
      JSON.stringify({
        type: 'room:create',
        roomName,
        userName,
        cardDeck,
      }),
    );
  },

  joinRoom: (roomId, userName) => {
    const { socket } = get();
    if (!socket) return;

    socket.send(
      JSON.stringify({
        type: 'room:join',
        roomId,
        userName,
      }),
    );
  },

  vote: (value) => {
    const { socket } = get();
    if (!socket) return;

    socket.send(
      JSON.stringify({
        type: 'user:vote',
        vote: value,
      }),
    );
  },

  reveal: () => {
    const { socket } = get();
    if (!socket) return;

    socket.send(
      JSON.stringify({
        type: 'room:reveal',
      }),
    );
  },

  reset: () => {
    const { socket } = get();
    if (!socket) return;

    socket.send(
      JSON.stringify({
        type: 'room:reset',
      }),
    );
  },

  setCurrentUser: (name, role) => {
    set({
      currentUser: {
        id: crypto.randomUUID(),
        name,
        role,
        vote: null,
        isReady: false,
      },
    });
  },
}));
