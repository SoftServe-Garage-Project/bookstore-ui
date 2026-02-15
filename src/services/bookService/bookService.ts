import { authService } from "../authService/authService";

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

const API_URL = "/api/book";
const GENRES_API_URL = "/api/genres";

export const fetchBooks = async (
  params: BookFilterParams
): Promise<PageResponse<Book>> => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, String(value));
    }
  });

  const response = await authService.authorizedFetch(
    `${API_URL}?${query.toString()}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch books: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
};

export const fetchGenres = async (): Promise<Genre[]> => {
  const response = await authService.authorizedFetch(GENRES_API_URL, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch genres: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.content || [];
};

export const fetchLanguages = async (): Promise<
  { code: string; name: string }[]
> => {
  const response = await authService.authorizedFetch("/api/languages");
  if (!response.ok) throw new Error("Failed to fetch languages");
  const data = await response.json();
  return data.content || [];
};

export const fetchAgeGroups = async (): Promise<AgeGroup[]> => {
  const response = await authService.authorizedFetch("/api/ageGroups");
  if (!response.ok) throw new Error("Failed to fetch age groups");
  const data = await response.json();
  return data.content || [];
};

export const fetchBookById = async (id: number): Promise<Book> => {
  const response = await authService.publicFetch(`${API_URL}/${id}`);
  
  if (!response.ok) {
    throw new Error(`Книга с ID ${id} не найдена`);
  }
  return response.json();
};

export const createBook = async (bookData: Omit<Book, "id">): Promise<Book> => {
  const response = await authService.authorizedFetch(API_URL, {
    method: "POST",
    body: JSON.stringify(bookData),
  });

  if (!response.ok) {
    throw new Error("Error while creating a book");
  }
  return response.json();
};

export const updateBook = async (
  id: number,
  bookData: Partial<Book>
): Promise<Book> => {
  const response = await authService.authorizedFetch(`${API_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(bookData),
  });

  if (!response.ok) {
    throw new Error("Error while updating a book");
  }
  return response.json();
};

export const deleteBook = async (id: number): Promise<void> => {
  const response = await authService.authorizedFetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Error while deleting a book");
  }
};

export const createGenre = async (data: Genre) => {
  return authService.authorizedFetch('/api/genres', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const deleteGenre = async (name: string) => {
  return authService.authorizedFetch(`/api/genres/${name}`, { method: 'DELETE' });
};

export const createLanguage = async (data: { code: string; name: string }) => {
  return authService.authorizedFetch('/api/languages', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const deleteLanguage = async (code: string) => {
  return authService.authorizedFetch(`/api/languages/${code}`, { method: 'DELETE' });
};

export const createAgeGroup = async (data: AgeGroup) => {
  return authService.authorizedFetch('/api/ageGroups', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const deleteAgeGroup = async (name: string) => {
  return authService.authorizedFetch(`/api/ageGroups/${name}`, { method: 'DELETE' });
};
