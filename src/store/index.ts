import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import type { StateCreator } from 'zustand';

// Tipos para la sesión
type SessionTokens = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  issuedAt: number;
};

type SessionUser = {
  id: number;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
};

type SessionMeta = {
  location?: string;
  isActive: boolean;
};

type Session = {
  tokens: SessionTokens;
  user: SessionUser;
  meta: SessionMeta;
};

type State = {
  session: Session | null;
  isLoggedIn: boolean;
};

type Actions = {
  clear: () => void;
  setSession: (session: Session) => void;
  updateUser: (user: Partial<SessionUser>) => void;
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  getUser: () => SessionUser | null;
  logout: () => void;
};

const useStore = create<State & Actions>()(
  persist(
    ((set, get) => ({
      session: null,
      isLoggedIn: false,

      setSession: (session) => {
        set(() => ({
          session,
          isLoggedIn: true,
        }));
      },

      updateUser: (userUpdates) => {
        const currentSession = get().session;
        if (currentSession) {
          set(() => ({
            session: {
              ...currentSession,
              user: {
                ...currentSession.user,
                ...userUpdates,
              },
            },
          }));
        }
      },

      getAccessToken: () => {
        return get().session?.tokens.accessToken || null;
      },

      getRefreshToken: () => {
        return get().session?.tokens.refreshToken || null;
      },

      getUser: () => {
        return get().session?.user || null;
      },

      clear: () => {
        set(() => ({
          session: null,
          isLoggedIn: false,
        }));
      },

      logout: () => {
        set(() => ({
          session: null,
          isLoggedIn: false,
        }));
      },
    })) as StateCreator<State & Actions, [], [['zustand/persist', unknown]], State & Actions>,
    {
      name: 'cmpc-session',
      partialize: (state) => ({
        session: state.session,
        isLoggedIn: state.isLoggedIn,
      }),
      onRehydrateStorage: () => (state) => {
        const session = state?.session;
        if (session?.tokens.accessToken) {
          try {
            // Verificar que el token no haya expirado
            const decoded = jwtDecode(session.tokens.accessToken);
            const currentTime = Date.now() / 1000;

            if (decoded.exp && decoded.exp < currentTime) {
              // Token expirado, limpiar sesión
              state?.clear();
            }
          } catch {
            // Token inválido, limpiar sesión
            state?.clear();
          }
        }
      },
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export default useStore;
