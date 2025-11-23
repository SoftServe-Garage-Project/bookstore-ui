export type RegisterData = {
  username: string;
  email: string;
  password: string;
};

export const authService = {
  async register(data: RegisterData) {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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