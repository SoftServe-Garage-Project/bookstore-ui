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

    const response = await res.json();
    sessionStorage.setItem(EMAIL, data.email);
    return response;
  },

  async getCurrentUser(): Promise<{ email: string } | null> {
    const email = sessionStorage.getItem(EMAIL);
    if (email) {
      return { email };
    }
    return null;
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
      sessionStorage.removeItem(EMAIL);
    }
  },
};

