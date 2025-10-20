export interface Book {
  id: string;
  title: string;
  author: string;
  publisher: string;
  price: number;
  availability: boolean;
  genre: string;
  imageUrl?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookFormData {
  title: string;
  author: string;
  publisher: string;
  price: number;
  availability: boolean;
  genre: string;
  image?: File;
  imageUrl?: string;
  description?: string;
}

export interface BookFilters {
  genre?: string;
  publisher?: string;
  author?: string;
  availability?: boolean;
  search?: string;
}

export interface BookSort {
  field: keyof Book;
  direction: 'asc' | 'desc';
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface BookListResponse {
  books: Book[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Genre {
  id: string;
  name: string;
}

export interface Publisher {
  id: string;
  name: string;
}
