import { renderHook, waitFor } from '@testing-library/react';
import { useGenres } from './useGenres';
import { fetchGenres } from '../../services/bookService/bookService';

jest.mock('../../services/bookService/bookService', () => ({
  fetchGenres: jest.fn(),
}));

describe('useGenres hook', () => {
  const mockGenres = [
    { name: 'Фантастика', description: 'Опис 1' },
    { name: 'Детектив', description: 'Опис 2' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('повинен ініціалізуватися з дефолтними значеннями', () => {
    (fetchGenres as jest.Mock).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useGenres());

    expect(result.current.genres).toEqual([]);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it('повинен успішно завантажити жанри', async () => {
    (fetchGenres as jest.Mock).mockResolvedValueOnce(mockGenres);

    const { result } = renderHook(() => useGenres());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.genres).toEqual(mockGenres);
    expect(result.current.error).toBe(null);
  });

  it('повинен обробити помилку при завантаженні', async () => {
    const errorMessage = 'Помилка сервера';
    (fetchGenres as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useGenres());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.genres).toEqual([]);
  });

  it('не повинен оновлювати стан, якщо компонент розмонтовано (isMounted check)', async () => {
    let resolveFetch: (value: any) => void = () => {};
    const promise = new Promise((resolve) => {
      resolveFetch = resolve;
    });
    
    (fetchGenres as jest.Mock).mockReturnValueOnce(promise);

    const { result, unmount } = renderHook(() => useGenres());

    unmount();
    resolveFetch(mockGenres);
    expect(result.current.genres).toEqual([]);
  });
});