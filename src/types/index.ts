export type CardValue = string | number;

export interface User {
  id: string;
  name?: string; // Opcional porque el servidor no siempre lo envía
  isReady: boolean;
  vote: CardValue | null;
  isModerator?: boolean; // Opcional, se calculará basado en ownerId
  spectator?: boolean; // Campo que envía el servidor
}

export interface Room {
  id: string;
  name: string;
  users: User[];
  revealed: boolean;
  cardDeck?: CardDeck; // Opcional porque el servidor no lo envía
  createdAt: number;
  ownerId?: string; // Campo que envía el servidor
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
  | { type: 'room:joined'; room: Room; ownerId: string }
  | { type: 'room:updated'; room: Room }
  | { type: 'room:error'; message: string }
  | { type: 'user:voted'; userId: string; vote: CardValue }
  | { type: 'room:revealed' }
  | { type: 'room:reset' }
  | { type: 'error'; message: string };
