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
    } catch (err: any) {
      setError(err.message || "Помилка входу");
    } finally {
      setLoading(false);
      navigate("/");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `/oauth2/authorization/google`;
  };

  return (
    <AuthFormWrapper>
      <div className={styles.headerContainer}>
        <h2 className={styles.title}>Вітаємо знову!</h2>
        <p className={styles.subtitle}>Увійдіть у свій акаунт</p>
      </div>

      <form onSubmit={handleLogin} className={styles.form}>
        <Input label="Email" value={email} onChange={setEmail} type="email" />
        <Input
          label="Пароль"
          value={password}
          onChange={setPassword}
          type="password"
        />

        {error && <p className={styles.error}>{error}</p>}

        <Button type="submit" disabled={loading}>
          {loading ? "Завантаження..." : "Увійти"}
        </Button>
      </form>

      <div className={styles.divider}>
        <span>або</span>
      </div>

      <button className={styles.googleButton} onClick={handleGoogleLogin} type="button">
        <img 
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
          alt="Google" 
          className={styles.googleIcon} 
        />
        Продовжити з Google
      </button>

      <div className={styles.footerLinks}>
        <Link to="/register" className={styles.registerLink}>
          Немає акаунту? <span>Зареєструватися</span>
        </Link>
        <Link to="/forgot-password" className={styles.forgotLink}>
          Забули пароль?
        </Link>
      </div>
    </AuthFormWrapper>
  );
}