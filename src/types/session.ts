export interface User {
  id: number;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  tokenType: 'JWT';
  expiresIn: number;
  issuedAt: number;
}

export interface SessionMeta {
  location?: string;
  isActive: boolean;
}

export interface Session {
  tokens: Tokens;
  user: User;
  meta: SessionMeta;
}

// Export book types
export * from './book';
