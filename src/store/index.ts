import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Tipos
interface User {
  id: string;
  name: string;
  role: 'moderator' | 'participant';
  isOnline: boolean;
}

interface Vote {
  userId: string;
  value: string | null;
  votedAt: number;
}

interface Story {
  id: string;
  title: string;
  description: string;
  finalEstimate: string | null;
  createdAt: number;
}

interface Session {
  id: string;
  name: string;
  currentStoryId: string | null;
  stories: Story[];
  isVotingOpen: boolean;
  votingSystem: 'fibonacci' | 'tshirt' | 'custom';
  customValues?: string[];
  createdAt: number;
}

interface PlanningPokerState {
  // Session
  currentSession: Session | null;
  sessions: Session[];

  // Users
  currentUser: User | null;
  participants: User[];

  // Votes
  votes: Record<string, Vote>; // key: userId

  // UI State
  isConnected: boolean;
  connectionError: string | null;
  isLoading: boolean;

  // Actions - Session
  createSession: (name: string, votingSystem: Session['votingSystem']) => void;
  joinSession: (sessionId: string) => void;
  leaveSession: () => void;
  updateSession: (session: Partial<Session>) => void;

  // Actions - Stories
  addStory: (story: Omit<Story, 'id' | 'createdAt'>) => void;
  removeStory: (storyId: string) => void;
  updateStory: (storyId: string, updates: Partial<Story>) => void;
  setCurrentStory: (storyId: string) => void;

  // Actions - Voting
  openVoting: () => void;
  closeVoting: () => void;
  submitVote: (value: string) => void;
  clearVotes: () => void;
  revealVotes: () => void;

  // Actions - Users
  setCurrentUser: (user: User) => void;
  addParticipant: (user: User) => void;
  removeParticipant: (userId: string) => void;
  updateParticipant: (userId: string, updates: Partial<User>) => void;

  // Actions - Connection
  setConnectionStatus: (isConnected: boolean, error?: string) => void;
  setLoading: (isLoading: boolean) => void;

  // Reset
  resetSession: () => void;
}

export const usePlanningPokerStore = create<PlanningPokerState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        currentSession: null,
        sessions: [],
        currentUser: null,
        participants: [],
        votes: {},
        isConnected: false,
        connectionError: null,
        isLoading: false,

        // Session Actions
        createSession: (name, votingSystem) => {
          const newSession: Session = {
            id: crypto.randomUUID(),
            name,
            currentStoryId: null,
            stories: [],
            isVotingOpen: false,
            votingSystem,
            customValues: votingSystem === 'custom' ? ['1', '2', '3', '5', '8'] : undefined,
            createdAt: Date.now(),
          };

          set((state) => ({
            currentSession: newSession,
            sessions: [...state.sessions, newSession],
          }));
        },

        joinSession: (sessionId) => {
          const session = get().sessions.find((s) => s.id === sessionId);
          if (session) {
            set({ currentSession: session });
          }
        },

        leaveSession: () => {
          set({
            currentSession: null,
            participants: [],
            votes: {},
          });
        },

        updateSession: (updates) => {
          set((state) => {
            if (!state.currentSession) return state;

            const updatedSession = { ...state.currentSession, ...updates };
            return {
              currentSession: updatedSession,
              sessions: state.sessions.map((s) =>
                s.id === updatedSession.id ? updatedSession : s,
              ),
            };
          });
        },

        // Story Actions
        addStory: (storyData) => {
          const newStory: Story = {
            ...storyData,
            id: crypto.randomUUID(),
            createdAt: Date.now(),
            finalEstimate: null,
          };

          set((state) => {
            if (!state.currentSession) return state;

            const updatedSession = {
              ...state.currentSession,
              stories: [...state.currentSession.stories, newStory],
            };

            return {
              currentSession: updatedSession,
              sessions: state.sessions.map((s) =>
                s.id === updatedSession.id ? updatedSession : s,
              ),
            };
          });
        },

        removeStory: (storyId) => {
          set((state) => {
            if (!state.currentSession) return state;

            const updatedSession = {
              ...state.currentSession,
              stories: state.currentSession.stories.filter((s) => s.id !== storyId),
              currentStoryId:
                state.currentSession.currentStoryId === storyId
                  ? null
                  : state.currentSession.currentStoryId,
            };

            return {
              currentSession: updatedSession,
              sessions: state.sessions.map((s) =>
                s.id === updatedSession.id ? updatedSession : s,
              ),
            };
          });
        },

        updateStory: (storyId, updates) => {
          set((state) => {
            if (!state.currentSession) return state;

            const updatedSession = {
              ...state.currentSession,
              stories: state.currentSession.stories.map((s) =>
                s.id === storyId ? { ...s, ...updates } : s,
              ),
            };

            return {
              currentSession: updatedSession,
              sessions: state.sessions.map((s) =>
                s.id === updatedSession.id ? updatedSession : s,
              ),
            };
          });
        },

        setCurrentStory: (storyId) => {
          set((state) => ({
            currentSession: state.currentSession
              ? { ...state.currentSession, currentStoryId: storyId }
              : null,
            votes: {}, // Limpiar votos al cambiar de historia
          }));
        },

        // Voting Actions
        openVoting: () => {
          set((state) => ({
            currentSession: state.currentSession
              ? { ...state.currentSession, isVotingOpen: true }
              : null,
            votes: {}, // Limpiar votos anteriores
          }));
        },

        closeVoting: () => {
          set((state) => ({
            currentSession: state.currentSession
              ? { ...state.currentSession, isVotingOpen: false }
              : null,
          }));
        },

        submitVote: (value) => {
          const { currentUser } = get();
          if (!currentUser) return;

          set((state) => ({
            votes: {
              ...state.votes,
              [currentUser.id]: {
                userId: currentUser.id,
                value,
                votedAt: Date.now(),
              },
            },
          }));
        },

        clearVotes: () => {
          set({ votes: {} });
        },

        revealVotes: () => {
          get().closeVoting();
        },

        // User Actions
        setCurrentUser: (user) => {
          set({ currentUser: user });
        },

        addParticipant: (user) => {
          set((state) => ({
            participants: [...state.participants.filter((p) => p.id !== user.id), user],
          }));
        },

        removeParticipant: (userId) => {
          set((state) => ({
            participants: state.participants.filter((p) => p.id !== userId),
            votes: Object.fromEntries(Object.entries(state.votes).filter(([id]) => id !== userId)),
          }));
        },

        updateParticipant: (userId, updates) => {
          set((state) => ({
            participants: state.participants.map((p) =>
              p.id === userId ? { ...p, ...updates } : p,
            ),
          }));
        },

        // Connection Actions
        setConnectionStatus: (isConnected, error) => {
          set({
            isConnected,
            connectionError: error || null,
          });
        },

        setLoading: (isLoading) => {
          set({ isLoading });
        },

        // Reset
        resetSession: () => {
          set({
            currentSession: null,
            participants: [],
            votes: {},
            isConnected: false,
            connectionError: null,
          });
        },
      }),
      {
        name: 'planning-poker-storage',
        partialize: (state) => ({
          currentUser: state.currentUser,
          sessions: state.sessions,
        }),
      },
    ),
  ),
);

// Selectores útiles
export const useCurrentStory = () =>
  usePlanningPokerStore((state) => {
    if (!state.currentSession?.currentStoryId) return null;
    return state.currentSession.stories.find((s) => s.id === state.currentSession?.currentStoryId);
  });

export const useVoteCount = () => usePlanningPokerStore((state) => Object.keys(state.votes).length);

export const useHasVoted = () =>
  usePlanningPokerStore((state) => {
    if (!state.currentUser) return false;
    return state.currentUser.id in state.votes;
  });

export const useIsModerator = () =>
  usePlanningPokerStore((state) => state.currentUser?.role === 'moderator');

export default usePlanningPokerStore;
