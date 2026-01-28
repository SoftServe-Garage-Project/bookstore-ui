import { authService, RegisterData, LoginData } from "./authService";

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterAll(() => {
  (console.error as jest.Mock).mockRestore();
});

global.fetch = jest.fn();

describe("authService", () => {
  const mockApiBase = "/api";

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe("register()", () => {
    const regData: RegisterData = {
      username: "test",
      email: "test@test.com",
      password: "123",
    };

    it("true при успішній реєстрації", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, status: 200 });

      const result = await authService.register(regData);
      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        `${mockApiBase}/register`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(regData),
        }),
      );
    });

    it('"Email вже використовується" при статусі 409', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 409 });

      await expect(authService.register(regData)).rejects.toThrow(
        "Email вже використовується",
      );
    });

    it("error якщо res.ok === false", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 500 });

      await expect(authService.register(regData)).rejects.toThrow(
        "Помилка реєстрації",
      );
    });
  });

  describe("login()", () => {
    const loginData: LoginData = { email: "test@test.com", password: "123" };
    const mockAuthResponse = {
      email: "test@test.com",
      accessToken: "access-123",
      refreshToken: "refresh-456",
      roles: ["USER"],
    };

    it("зберігати токени та повертати дані", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAuthResponse,
      });

      const result = await authService.login(loginData);

      expect(result).toEqual(mockAuthResponse);
      expect(localStorage.getItem("accessToken")).toBe("access-123");
      expect(localStorage.getItem("email")).toBe("test@test.com");
    });

    it("error при невірних облікових даних", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 401 });

      await expect(authService.login(loginData)).rejects.toThrow(
        "Невірний логін або пароль",
      );
    });
  });

  describe("Token Management (LocalStorage)", () => {
    it("saveTokens має коректно записувати дані", () => {
      authService.saveTokens({
        email: "new@test.com",
        accessToken: "at",
        refreshToken: "rt",
        roles: [],
      });
      expect(localStorage.getItem("email")).toBe("new@test.com");
      expect(localStorage.getItem("accessToken")).toBe("at");
    });

    it("clearTokens має видаляти все", () => {
      localStorage.setItem("accessToken", "some-token");
      authService.clearTokens();
      expect(localStorage.getItem("accessToken")).toBeNull();
    });
  });

  describe("refreshTokens()", () => {
    it("повинен оновити токени та повернути новий accessToken", async () => {
      localStorage.setItem("refreshToken", "old-rt");
      const mockNewTokens = {
        accessToken: "new-at",
        refreshToken: "new-rt",
        email: "test@test.com",
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNewTokens,
      });

      const token = await authService.refreshTokens();
      expect(token).toBe("new-at");
      expect(localStorage.getItem("accessToken")).toBe("new-at");
    });

    it("має запобігати декільком одночасним запитам (refreshPromise)", async () => {
      localStorage.setItem("refreshToken", "old-rt");
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ accessToken: "new-at", refreshToken: "new-rt" }),
      });
      const [res1, res2] = await Promise.all([
        //twice call refreshTokens for test
        authService.refreshTokens(),
        authService.refreshTokens(),
      ]);
      expect(res1).toBe("new-at");
      expect(res2).toBe("new-at");
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it("має очищувати токени при 401 помилці рефрешу", async () => {
      localStorage.setItem("refreshToken", "bad-rt");
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 401 });

      await expect(authService.refreshTokens()).rejects.toThrow();
      expect(localStorage.getItem("refreshToken")).toBeNull();
    });

    it("має очищувати токени при 403 помилці рефрешу", async () => {
      localStorage.setItem("refreshToken", "bad-rt");
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 403 });

      await expect(authService.refreshTokens()).rejects.toThrow();
      expect(localStorage.getItem("refreshToken")).toBeNull();
    });

    it("має кидати помилку при відсутності refresh token", async () => {
      localStorage.removeItem("refreshToken");
      await expect(authService.refreshTokens()).rejects.toThrow(
        "No refresh token available",
      );
    });

    it("має обробляти помилку при неуспішному refresh (не 401/403)", async () => {
      localStorage.setItem("refreshToken", "valid-rt");
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 500 });

      await expect(authService.refreshTokens()).rejects.toThrow(
        "Refresh failed: 500",
      );
    });
  });

  describe("authorizedFetch()", () => {
    it("має додавати Authorization заголовок", async () => {
      localStorage.setItem("accessToken", "valid-token");
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

      await authService.authorizedFetch("/user/profile");

      expect(fetch).toHaveBeenCalledWith(
        "/user/profile",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer valid-token",
          }),
        }),
      );
    });

    it("має автоматично оновлювати токен при 401 та повторювати запит", async () => {
      localStorage.setItem("accessToken", "expired-token");
      localStorage.setItem("refreshToken", "valid-rt");

      (fetch as jest.Mock).mockResolvedValueOnce({ status: 401 });
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          accessToken: "new-token",
          refreshToken: "new-rt",
        }),
      });
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, status: 200 });

      const res = await authService.authorizedFetch("/data");

      expect(res.status).toBe(200);
      expect(fetch).toHaveBeenCalledTimes(3);
    });

    it("має передавати помилку refreshTokens у випадку невдачі", async () => {
      localStorage.setItem("accessToken", "expired-token");
      localStorage.setItem("refreshToken", "valid-rt");

      (fetch as jest.Mock).mockResolvedValueOnce({ status: 401 });
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({}),
      });

      await expect(authService.authorizedFetch("/data")).rejects.toThrow();
    });

    it("має передавати оригінальні options та headers у другому запиті", async () => {
      localStorage.setItem("accessToken", "expired-token");
      localStorage.setItem("refreshToken", "valid-rt");

      (fetch as jest.Mock).mockResolvedValueOnce({ status: 401 });
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          accessToken: "new-token",
          refreshToken: "new-rt",
        }),
      });
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, status: 200 });

      const customOptions = {
        method: "POST",
        headers: { "X-Custom": "value" },
        body: JSON.stringify({ data: "test" }),
      };

      await authService.authorizedFetch("/data", customOptions);

      expect(fetch).toHaveBeenNthCalledWith(
        3,
        "/data",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "X-Custom": "value",
            Authorization: "Bearer new-token",
          }),
          body: JSON.stringify({ data: "test" }),
        }),
      );
    });
  });

  describe("logout()", () => {
    it("має викликати API та завжди очищувати локальне сховище", async () => {
      localStorage.setItem("accessToken", "at");
      localStorage.setItem("refreshToken", "rt");
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

      await authService.logout();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/logout"),
        expect.any(Object),
      );
      expect(localStorage.getItem("accessToken")).toBeNull();
    });

    it("має очищувати токени навіть якщо API запит провалився", async () => {
      localStorage.setItem("accessToken", "at");
      localStorage.setItem("refreshToken", "rt");
      (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

      await authService.logout();

      expect(localStorage.getItem("accessToken")).toBeNull();
      expect(localStorage.getItem("refreshToken")).toBeNull();
    });
    
    it('не має викликати API якщо немає токенів', async () => {
      await authService.logout();
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe("getters", () => {
    it("getAccessToken має повертати токен з localStorage", () => {
      localStorage.setItem("accessToken", "test-token");
      expect(authService.getAccessToken()).toBe("test-token");
    });

    it("getRefreshToken має повертати refresh токен з localStorage", () => {
      localStorage.setItem("refreshToken", "test-refresh");
      expect(authService.getRefreshToken()).toBe("test-refresh");
    });

    it("getUserEmail має повертати email з localStorage", () => {
      localStorage.setItem("email", "test@test.com");
      expect(authService.getUserEmail()).toBe("test@test.com");
    });

    it("getters мають повертати null якщо значень немає", () => {
      expect(authService.getAccessToken()).toBeNull();
      expect(authService.getRefreshToken()).toBeNull();
      expect(authService.getUserEmail()).toBeNull();
    });
  });

  describe("forgotPassword()", () => {
    it("має повертати true при успішному запиті", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

      const result = await authService.forgotPassword("test@test.com");
      expect(result).toBe(true);
    });

    it("має кидати помилку при неуспішному запиті", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: false });

      await expect(authService.forgotPassword("test@test.com")).rejects.toThrow(
        "Something went wrong",
      );
    });
  });

  describe("resetPassword()", () => {
    it("має повертати true при успішному скиданні пароля", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const result = await authService.resetPassword("token", "newPassword");
      expect(result).toBe(true);
    });

    it("має кидати помилку з повідомленням з сервера", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "Token expired" }),
      });

      await expect(
        authService.resetPassword("token", "newPassword"),
      ).rejects.toThrow("Token expired");
    });

    it("має кидати загальну помилку якщо не вдалося розпарсити відповідь", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => {
          throw new Error("Parse error");
        },
      });

      await expect(
        authService.resetPassword("token", "newPassword"),
      ).rejects.toThrow("Error resetting password");
    });
  });
});
