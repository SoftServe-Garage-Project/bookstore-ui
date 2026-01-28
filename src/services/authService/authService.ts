export type RegisterData = {
  username: string;
  email: string;
  password: string;
};

export type LoginData = {
  email: string;
  password: string;
};

interface AuthResponse {
  email: string;
  accessToken: string;
  refreshToken: string;
  roles: string[];
}

const EMAIL = "email";
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

const API_BASE = process.env.REACT_APP_API_BASE || "/api";
let refreshPromise: Promise<string> | null = null;


export const authService = {
  async register(data: RegisterData) {
    const res = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (res.status === 409) {
      throw new Error("Email вже використовується");
    }

    if (!res.ok) {
      throw new Error("Помилка реєстрації");
    }

    return true;
  },

  async login(data: LoginData) {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include" as RequestCredentials,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Невірний логін або пароль");
    }

    const tokens: AuthResponse = await res.json();
    this.saveTokens(tokens);

    return tokens;
  },

  async refreshTokens(): Promise<string> {
    if (refreshPromise) {
      return refreshPromise;
    }
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${API_BASE}/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ refreshToken }),
        });

        if (res.status === 401 || res.status === 403) {
          this.clearTokens();
          throw new Error("Refresh token expired or invalid");
        }

        if (!res.ok) {
          throw new Error(`Refresh failed: ${res.status}`);
        }

        const data: AuthResponse = await res.json();
        this.saveTokens(data);
        return data.accessToken;
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  },

  async authorizedFetch(
    url: string,
    options: RequestInit = {},
    retried: boolean = false
  ) {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${this.getAccessToken()}`,
      ...options.headers,
    };

    let res = await fetch(url, {
      ...options,
      headers,
      credentials: "include" as RequestCredentials,
    });

    if (res.status === 401 && !retried) {
      try {
        const newAccessToken = await this.refreshTokens();

        const newHeaders = {
          ...headers,
          Authorization: `Bearer ${newAccessToken}`,
        };

        return await fetch(url, {
          ...options,
          headers: newHeaders,
          credentials: "include" as RequestCredentials,
        });
      } catch (error) {
        console.error("Token refresh failed", error);
        throw error;
      }
    }

    return res;
  },

  async logout() {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    try {
      if (accessToken && refreshToken) {
        await fetch(`${API_BASE}/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include" as RequestCredentials,
          body: JSON.stringify({ accessToken, refreshToken }),
        });
      }
    } catch (error) {
      console.error("Logout request failed", error);
    } finally {
      this.clearTokens();
    }
  },

  saveTokens(tokens: AuthResponse) {
    if (tokens.email) {
      localStorage.setItem(EMAIL, tokens.email);
    }
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  },

  clearTokens() {
    localStorage.removeItem(EMAIL);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  getUserEmail() {
    return localStorage.getItem(EMAIL);
  },

  async forgotPassword(email: string) {
    const res = await fetch(`${API_BASE}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      throw new Error("Something went wrong");
    }

    return true;
  },

  async resetPassword(token: string, newPassword: string) {
    const res = await fetch(`${API_BASE}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Error resetting password");
    }

    return true;
  }
};
