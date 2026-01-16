import { authService } from './authService';

export interface Author {
  firstName: string;
  lastName: string;
}

export interface Book {
  id: number;
  title: string;
  description: string;
  genre: string;
  ageGroup: string;
  publishedYear: number;
  languageCode: string;
  authors: Author[];
  price: number;
  stockQuantity: number;
  discountPercentage: number;
  pageCount: number;
  coverImageUrl: string | null;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export interface BookFilterParams {
  page: number;
  size: number;
  sort?: string;
  genreName?: string;
  ageGroupName?: string; 
  title?: string;
}

export interface Genre {
  name: string;
  description: string;
}

export interface AgeGroup {
  name: string;
  description: string;
  minAge: number;
  maxAge: number;
}

const API_URL = '/api/book';
const GENRES_API_URL = '/api/genres';

export const fetchBooks = async (params: BookFilterParams): Promise<PageResponse<Book>> => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });

  const response = await authService.authorizedFetch(`${API_URL}?${query.toString()}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch books: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

export const fetchGenres = async (): Promise<Genre[]> => {
  const response = await authService.authorizedFetch(GENRES_API_URL, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch genres: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.content || [];
};

export const fetchBookById = async (id: number): Promise<Book | null> => {
  try {
    //`${API_URL}/${id}`
    const response = await fetchBooks({ page: 0, size: 100 });
    const book = response.content.find((b) => b.id === id);
    return book || null;
  } catch (error) {
    console.error("Error fetching book by id:", error);
    return null;
  }
};