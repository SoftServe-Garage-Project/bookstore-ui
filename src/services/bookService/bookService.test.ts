import * as bookService from './bookService';
import { authService } from '../authService/authService';

jest.mock('../authService/authService', () => ({
  authService: {
    authorizedFetch: jest.fn(),
  },
}));

describe('Book Service', () => {
  const mockBook = {
    id: 1,
    title: 'Clean Code',
    authors: [{ firstName: 'Robert', lastName: 'Martin' }],
    price: 500,
  };

  const mockPageResponse = {
    content: [mockBook],
    totalPages: 1,
    totalElements: 1,
    number: 0,
    size: 10,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchBooks()', () => {
    it('має правильно будувати query-параметри та повертати дані', async () => {
      (authService.authorizedFetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPageResponse,
      });

      const params = { page: 0, size: 10, genreName: 'IT', title: '' };
      const result = await bookService.fetchBooks(params);

      expect(authService.authorizedFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/book?page=0&size=10&genreName=IT'),
        { method: 'GET' }
      );
      expect(result).toEqual(mockPageResponse);
    });

    it('має викидати помилку, якщо сервер повернув не ok', async () => {
      (authService.authorizedFetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(bookService.fetchBooks({ page: 0, size: 10 }))
        .rejects.toThrow('Failed to fetch books: 404 Not Found');
    });
  });

  describe('fetchGenres()', () => {
    it('має повертати масив жанрів із поля content', async () => {
      const mockGenres = [{ name: 'Fantasy', description: '...' }];
      (authService.authorizedFetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: mockGenres }),
      });

      const result = await bookService.fetchGenres();

      expect(result).toEqual(mockGenres);
      expect(authService.authorizedFetch).toHaveBeenCalledWith('/api/genres', { method: 'GET' });
    });

    it('має повертати пустий масив, якщо content відсутній', async () => {
      (authService.authorizedFetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const result = await bookService.fetchGenres();
      expect(result).toEqual([]);
    });

    it('має викидати помилку при невдалому запиті', async () => {
      (authService.authorizedFetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Server Error',
      });

      await expect(bookService.fetchGenres()).rejects.toThrow('Failed to fetch genres');
    });
  });

  describe('fetchBookById()', () => {
    it('має знаходити книгу в списку за ID', async () => {
      (authService.authorizedFetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPageResponse,
      });

      const result = await bookService.fetchBookById(1);

      expect(result).toEqual(mockBook);
    });

    it('має повертати null, якщо книгу з таким ID не знайдено', async () => {
      (authService.authorizedFetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPageResponse,
      });

      const result = await bookService.fetchBookById(999);
      expect(result).toBeNull();
    });

    it('має повертати null та логувати помилку при виникненні виключення', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (authService.authorizedFetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await bookService.fetchBookById(1);

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});