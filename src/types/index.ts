export type CardValue = string | number;

export interface User {
  id: string;
  name: string;
  isReady: boolean;
  vote: CardValue | null;
  spectator: boolean;
}

export interface Room {
  id: string;
  name: string;
  users: User[];
  revealed: boolean;
  cards: CardValue[];
  createdAt: number;
  ownerId: string;
}

export interface CardDeck {
  id: string;
  name: string;
  values: CardValue[];
}

export const CARD_DECKS: CardDeck[] = [
  {
    id: 'fibonacci',
    name: 'Fibonacci',
    values: [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, '?'],
  },
  {
    id: 'modified-fibonacci',
    name: 'Fibonacci Modificado',
    values: [0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100, '?'],
  },
  {
    id: 'powers-of-2',
    name: 'Potencias de 2',
    values: [0, 1, 2, 4, 8, 16, 32, 64, '?'],
  },
  {
    id: 't-shirt',
    name: 'T-Shirt Sizes',
    values: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '?'],
  },
];

export type WebSocketMessage =
  | { type: 'room:created'; room: Room; ownerId: string }
  | { type: 'room:joined'; room: Room; userId: string }
  | { type: 'room:updated'; room: Room }
  | { type: 'room:error'; message: string }
  | { type: 'user:voted'; userId: string; vote: CardValue }
  | { type: 'room:revealed' }
  | { type: 'room:reset' };
