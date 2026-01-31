import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import AuthFormWrapper from "../../components/AuthForm/AuthFormWrapper";
import { authService } from "../../services/authService/authService";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const navigate = useNavigate();
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
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Помилка входу");
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleLogin = () => {
    window.location.href = `https://localhost:8084/oauth2/authorization/google`;
  };

  return (
    <AuthFormWrapper>
      <h2 className={styles.container}>Вхід</h2>

      <form onSubmit={handleLogin}>
        <Input label="Email" value={email} onChange={setEmail} type="email" />
        <Input
          label="Пароль"
          value={password}
          onChange={setPassword}
          type="password"
        />

        {error && <p className={styles.error}>{error}</p>}

        <Button type="submit" disabled={loading}>
          {loading ? "Вхід..." : "Увійти"}
        </Button>
        
        <button onClick={handleGoogleLogin}>Войти через Google</button>
        
      </form>

      <div className={styles.links}>
        <Link to="/register" className={styles.registerLink}>
          Немає акаунту? Реєстрація
        </Link>
        <Link to="/forgot-password" className={styles.forgotLink}>
          Забули пароль?
        </Link>
      </div>
    </AuthFormWrapper>
  );
}
