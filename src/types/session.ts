export interface User {
  id: string;
  name: string;
  role: 'voter' | 'spectator';
  vote: number | null;
}

export interface SessionState {
  users: User[];
  currentUser: User | null;
  votesRevealed: boolean;
  addUser: (user: Omit<User, 'id' | 'vote'>) => void;
  setCurrentUser: (user: User) => void;
  removeUser: (userId: string) => void;
  setVote: (userId: string, vote: number) => void;
  revealVotes: () => void;
  resetVotes: () => void;
  logout: () => void;
}

// Export book types
export * from './book';
