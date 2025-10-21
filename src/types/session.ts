export interface CardDeck {
  id: string;
  name: string;
  values: (number | string)[];
}

export interface User {
  id: string;
  name: string;
  role: 'voter' | 'spectator';
  vote: number | string | null;
  isReady: boolean;
}

export interface SessionState {
  users: User[];
  currentUser: User | null;
  votesRevealed: boolean;
  cardDeck: CardDeck | null;
  addUser: (user: Omit<User, 'id' | 'vote'>) => void;
  setCurrentUser: (user: User) => void;
  removeUser: (userId: string) => void;
  setVote: (userId: string, vote: number | string) => void;
  revealVotes: () => void;
  resetVotes: () => void;
  logout: () => void;
}
