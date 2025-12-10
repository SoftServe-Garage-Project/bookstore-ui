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
    console.log("Logging in with data:", data);
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Невірний логін або пароль");
    }

    const tokens: AuthResponse = await res.json();
    this.saveEmail(tokens.email);
    
    return tokens;
  },

  async refreshTokens() {
    const res = await fetch(`${API_BASE}/refresh`, { 
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      credentials: 'include',
    });

    if (!res.ok) {
      this.clearEmail();
      throw new Error("Failed to refresh");
    }

    const newTokens: AuthResponse = await res.json();
    this.saveEmail(newTokens.email);
    return newTokens.accessToken;
  },

  async logout() {
    try {
      await fetch(`${API_BASE}/logout`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        credentials: 'include',
      });
    } catch (error) {
      console.error("Logout request failed", error);
    } finally {
      this.clearEmail();
    }
  },

  saveTokens(tokens: AuthResponse) {
    localStorage.setItem(EMAIL, tokens.email);
  },

  clearTokens() {
    localStorage.removeItem(EMAIL);
  },

  saveEmail(email: string) {
    localStorage.setItem(EMAIL, email);
  },

  clearEmail() {
    localStorage.removeItem(EMAIL);
  },

  getAccessToken() {
    return null;
  },

  getRefreshToken() {
    return null;
  },

  getUserEmail() {
    return localStorage.getItem(EMAIL);
  }
};

