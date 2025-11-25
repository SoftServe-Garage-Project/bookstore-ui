import { useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import AuthFormWrapper from "../components/AuthFormWrapper";
import { authService } from "../services/authService";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authService.login({ email, password });
      window.location.href = "/"; 
    } catch (err: any) {
      setError(err.message || "Помилка входу");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFormWrapper>
      <h2 className={styles.container}>Вхід</h2>
      
      <form onSubmit={handleLogin}>
        <Input label="Email" value={email} onChange={setEmail} type="email" />
        <Input label="Пароль" value={password} onChange={setPassword} type="password" />

        {error && <p className={styles.error}>{error}</p>}

        <Button disabled={loading}>
          {loading ? "Вхід..." : "Увійти"}
        </Button>
      </form>

      <div className={styles.links}>
        <a href="/register" className={styles.registerLink}>Немає акаунту? Реєстрація</a>
        <a href="/forgot-password" className={styles.forgotLink}>Забули пароль?</a>
      </div>
    </AuthFormWrapper>
  );
}