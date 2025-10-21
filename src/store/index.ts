/* eslint-disable @typescript-eslint/no-explicit-any */
import type { User } from '@/types/session';
import { create } from 'zustand';

export const usePokerStore = create((set: any) => ({
  players: [] as any[],
  votes: {} as Record<string, any>,
  revealed: false,
  currentUser: null as any,

  addPlayer: (name: any) =>
    set((state: any) => ({
      players: [...state.players, { id: Date.now(), name }],
    })),

  // Setea el usuario actual. Si es votante, lo agrega a la lista de players.
  setCurrentUser: (name: any, role: User['role']) =>
    set((state: any) => {
      const id = Date.now();
      const currentUser = { id, name, role };
      const players = role === 'voter' ? [...state.players, { id, name }] : state.players;
      return { currentUser, players };
    }),

  logout: () => set({ currentUser: null }),

  removePlayer: (id: any) =>
    set((state: any) => ({
      players: state.players.filter((p: any) => p.id !== id),
      votes: Object.fromEntries(
        Object.entries(state.votes).filter(([key]: any) => key !== id.toString()),
      ),
    })),

  vote: (playerId: any, value: any) =>
    set((state: any) => ({
      votes: { ...state.votes, [playerId]: value },
    })),

  revealVotes: () => set({ revealed: true }),

  reset: () => set({ votes: {}, revealed: false }),
}));

export default usePokerStore;
