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
  revealed: false, // Estado inicial: no revelado
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
            players: data.users || [],
            revealed: data.revealed || false, // Asegurar que revealed sea boolean
            cardDeck: data.cardDeck,
          });
          // Actualizar el currentUser con la información del servidor
          const { currentUser } = get();
          if (currentUser && data.users) {
            const serverUser = data.users.find((user: User) => user.name === currentUser.name);
            if (serverUser) {
              set({ currentUser: serverUser });
            }
          }
          break;

        case 'room:updated':
          set({
            players: data.users,
            revealed: data.revealed || false, // Asegurar que revealed sea boolean
          });
          // Actualizar el currentUser con la información del servidor
          const { currentUser: currentUserUpdated } = get();
          if (currentUserUpdated && data.users) {
            const serverUser = data.users.find((user: User) => user.name === currentUserUpdated.name);
            if (serverUser) {
              set({ currentUser: serverUser });
            }
          }
          break;

        case 'room:revealed':
          set({ revealed: true });
          break;

        case 'room:reset':
          set({ revealed: false });
          // Resetear el voto del usuario actual
          const { currentUser: currentUserReset } = get();
          if (currentUserReset) {
            set({
              currentUser: { ...currentUserReset, vote: null }
            });
          }
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
    if (!socket) {
      console.log('Cannot create room: socket not available');
      return;
    }

    const message = {
      type: 'room:create',
      roomName,
      userName,
      cardDeck,
    };
    
    socket.send(JSON.stringify(message));

    // Fallback: Si no recibimos respuesta del servidor en 3 segundos, crear la sala localmente
    setTimeout(() => {
      const { roomId: currentRoomId } = get();
      if (!currentRoomId) {
        const roomId = Math.random().toString(36).substr(2, 9).toUpperCase();
        const currentUser = get().currentUser;
        
        if (currentUser) {
          set({
            roomId,
            players: [currentUser],
            revealed: false,
            cardDeck,
          });
        }
      }
    }, 3000);
  },

  joinRoom: (roomId, userName) => {
    const { socket } = get();
    if (!socket) {
      console.log('Cannot join room: socket not available');
      return;
    }

    const message = {
      type: 'room:join',
      roomId,
      userName,
    };
    
    socket.send(JSON.stringify(message));

    // Fallback: Si no recibimos respuesta del servidor en 3 segundos, crear la sala localmente
    setTimeout(() => {
      const { roomId: currentRoomId } = get();
      if (!currentRoomId) {
        const currentUser = get().currentUser;
        
        if (currentUser) {
          // Usar un mazo por defecto si no tenemos uno
          const defaultDeck = {
            id: 'fibonacci',
            name: 'Fibonacci',
            values: [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, '?'],
          };
          
          set({
            roomId,
            players: [currentUser],
            revealed: false,
            cardDeck: defaultDeck,
          });
        }
      }
    }, 3000);
  },

  vote: (value) => {
    const { socket, currentUser, players } = get();
    if (!currentUser) {
      console.log('Cannot vote: currentUser not available');
      return;
    }


    // Actualizar el voto localmente inmediatamente para mejor UX
    const updatedUser = { ...currentUser, vote: value };
    set({ currentUser: updatedUser });

    // Actualizar también en la lista de players
    const updatedPlayers = players.map(player => 
      player.id === currentUser.id ? updatedUser : player
    );
    set({ players: updatedPlayers });

    // Enviar al servidor si está disponible
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
    
    // Actualizar localmente
    set({ revealed: true });

    // Enviar al servidor si está disponible
    if (socket) {
      socket.send(
        JSON.stringify({
          type: 'room:reveal',
        }),
      );
    }
  },

  reset: () => {
    const { socket, currentUser, players } = get();
    
    // Actualizar localmente
    set({ revealed: false });
    
    // Resetear votos de todos los players
    const resetPlayers = players.map(player => ({ ...player, vote: null }));
    set({ players: resetPlayers });
    
    // Resetear voto del usuario actual
    if (currentUser) {
      set({ currentUser: { ...currentUser, vote: null } });
    }

    // Enviar al servidor si está disponible
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
}));
