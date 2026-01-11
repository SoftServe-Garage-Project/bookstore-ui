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

export const authService = {
  async register(data: RegisterData) {
    const res = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      credentials: 'include',
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
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      credentials: 'include' as RequestCredentials,
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
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      this.clearTokens();
      throw new Error("No refresh token available");
    }

    try {
      const res = await fetch(`${API_BASE}/refresh`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${refreshToken}` 
        },
        credentials: 'include' as RequestCredentials,
      });

      if (!res.ok) {
        throw new Error("Refresh failed");
      }

      const data: AuthResponse = await res.json();
      this.saveTokens(data); 

      return data.accessToken;
    } catch (error) {
      this.clearTokens();
      console.error("Token refresh critical error:", error);
      throw error;
    }
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
            "Accept": "application/json"
          },
          credentials: 'include' as RequestCredentials,
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
    localStorage.setItem(EMAIL, tokens.email);
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

};

