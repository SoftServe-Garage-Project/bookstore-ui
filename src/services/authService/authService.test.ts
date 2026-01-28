import { authService, RegisterData, LoginData } from './authService';

global.fetch = jest.fn();

describe('authService', () => {
  const mockApiBase = "/api";
  
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('register()', () => {
    const regData: RegisterData = { username: 'test', email: 'test@test.com', password: '123' };

    it('true при успішній реєстрації', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, status: 200 });

      const result = await authService.register(regData);
      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith(`${mockApiBase}/register`, expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(regData)
      }));
    });

    it('"Email вже використовується" при статусі 409', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 409 });

      await expect(authService.register(regData)).rejects.toThrow("Email вже використовується");
    });

    it('error якщо res.ok === false', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 500 });

      await expect(authService.register(regData)).rejects.toThrow("Помилка реєстрації");
    });
  });

  describe('login()', () => {
    const loginData: LoginData = { email: 'test@test.com', password: '123' };
    const mockAuthResponse = {
      email: 'test@test.com',
      accessToken: 'access-123',
      refreshToken: 'refresh-456',
      roles: ['USER']
    };

  it('зберігати токени та повертати дані', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAuthResponse
      });

      const result = await authService.login(loginData);

      expect(result).toEqual(mockAuthResponse);
      expect(localStorage.getItem('accessToken')).toBe('access-123');
      expect(localStorage.getItem('email')).toBe('test@test.com');
    });

    it('error при невірних облікових даних', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 401 });

      await expect(authService.login(loginData)).rejects.toThrow("Невірний логін або пароль");
    });
  });

  describe('Token Management (LocalStorage)', () => {
    it('saveTokens має коректно записувати дані', () => {
      authService.saveTokens({
        email: 'new@test.com',
        accessToken: 'at',
        refreshToken: 'rt',
        roles: []
      });
      expect(localStorage.getItem('email')).toBe('new@test.com');
      expect(localStorage.getItem('accessToken')).toBe('at');
    });

    it('clearTokens має видаляти все', () => {
      localStorage.setItem('accessToken', 'some-token');
      authService.clearTokens();
      expect(localStorage.getItem('accessToken')).toBeNull();
    });
  });

  describe('refreshTokens()', () => {
    it('повинен оновити токени та повернути новий accessToken', async () => {
      localStorage.setItem('refreshToken', 'old-rt');
      const mockNewTokens = { accessToken: 'new-at', refreshToken: 'new-rt', email: 'test@test.com' };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNewTokens
      });

      const token = await authService.refreshTokens();
      expect(token).toBe('new-at');
      expect(localStorage.getItem('accessToken')).toBe('new-at');
    });

    it('має запобігати декільком одночасним запитам (refreshPromise)', async () => {
      localStorage.setItem('refreshToken', 'old-rt');
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ accessToken: 'new-at', refreshToken: 'new-rt' })
      });
      const [res1, res2] = await Promise.all([ //twice call refreshTokens for test
        authService.refreshTokens(),
        authService.refreshTokens()
      ]);
      expect(res1).toBe('new-at');
      expect(res2).toBe('new-at');
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('має очищувати токени при 401 помилці рефрешу', async () => {
      localStorage.setItem('refreshToken', 'bad-rt');
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 401 });

      await expect(authService.refreshTokens()).rejects.toThrow();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });
  });

  describe('authorizedFetch()', () => {
    it('має додавати Authorization заголовок', async () => {
      localStorage.setItem('accessToken', 'valid-token');
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

      await authService.authorizedFetch('/user/profile');

      expect(fetch).toHaveBeenCalledWith('/user/profile', expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer valid-token'
        })
      }));
    });

    it('має автоматично оновлювати токен при 401 та повторювати запит', async () => {
      localStorage.setItem('accessToken', 'expired-token');
      localStorage.setItem('refreshToken', 'valid-rt');

      (fetch as jest.Mock).mockResolvedValueOnce({ status: 401 });
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ accessToken: 'new-token', refreshToken: 'new-rt' })
      });
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, status: 200 });

      const res = await authService.authorizedFetch('/data');

      expect(res.status).toBe(200);
      expect(fetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('logout()', () => {
    it('має викликати API та завжди очищувати локальне сховище', async () => {
      localStorage.setItem('accessToken', 'at');
      localStorage.setItem('refreshToken', 'rt');
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

      await authService.logout();

      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/logout'), expect.any(Object));
      expect(localStorage.getItem('accessToken')).toBeNull();
    });
  });
});