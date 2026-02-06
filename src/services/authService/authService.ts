const API_BASE = process.env.REACT_APP_API_BASE || "/api";

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export const authService = {
  async login(data: LoginData) {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email: data.email,
        password: data.password,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Login failed:", res.status, errorText);
      throw new Error("Невірний логін або пароль");
    }

    const userData = await res.json();
    this.saveUserInfo(userData);
    return userData;
  },

  async publicFetch(url: string, options: RequestInit = {}) {
    const config = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
      credentials: "include" as RequestCredentials,
    };

    const res = await fetch(url, config);

    if (!res.ok) {
      console.warn(`Public fetch failed: ${res.status} ${res.statusText}`);
    }

    return res;
  },

  async authorizedFetch(
    url: string,
    options: RequestInit = {},
    retried = false
  ) {
    const config = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
      credentials: "include" as RequestCredentials,
      redirect: "manual" as RequestRedirect,
    };

    let res = await fetch(url, config);

    if ((res.status === 401 || res.status === 0) && !retried) {
      try {
        console.log("DEBUG: Session expired, attempting refresh...");
        const refreshed = await this.refreshTokens();

        if (refreshed) {
          return await fetch(url, { ...config, redirect: "follow" });
        }
      } catch (error) {
        console.error("DEBUG: Refresh failed, clearing user info.");
        this.clearUserInfo();
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        throw error;
      }
    }

    return res;
  },

  async refreshTokens(): Promise<boolean> {
  const res = await fetch(`${API_BASE}/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({}), 
  });

  if (!res.ok) {
    throw new Error("Refresh failed");
  }

  const userData = await res.json();
  this.saveUserInfo(userData);
  return true;
},

  async logout() {
    try {
      await fetch(`${API_BASE}/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      this.clearUserInfo();
      window.location.href = "/login";
    }
  },

  saveUserInfo(data: any) {
    if (data.email) localStorage.setItem("email", data.email);
    let roles: string[] = [];
    if (Array.isArray(data.roles)) roles = data.roles;
    else if (data.role) roles = [data.role];

    if (roles.length > 0) {
      localStorage.setItem("userRoles", JSON.stringify(roles));
    }
  },

  clearUserInfo() {
    localStorage.removeItem("email");
    localStorage.removeItem("userRoles");
  },

  getUserEmail() {
    return localStorage.getItem("email");
  },
  getUserRoles() {
    const raw = localStorage.getItem("userRoles");
    return raw ? JSON.parse(raw) : [];
  },

  async forgotPassword(email: string) {
    const res = await fetch(`${API_BASE}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      throw new Error("Щось пішло не так при запиті на відновлення");
    }

    return true;
  },

  async resetPassword(token: string, newPassword: string) {
    const res = await fetch(`${API_BASE}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ token, newPassword }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Error resetting password");
    }

    return true;
  },

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
};
