import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import AuthFormWrapper from "../../components/AuthForm/AuthFormWrapper";
import { authService } from "../../services/authService/authService";
import { validateRegistration } from '../../utils/validation';
import styles from "./RegisterPage.module.css";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateRegistration({ name, email, password, passwordConfirm }); 
    
    if (validationError) {
        setError(validationError);
        return;
    }

    setLoading(true);

    try {
      await authService.register({
        username: name,
        email: email,
        password: password,
      });
      setSuccess("Реєстрація успішна! Перенаправлення...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Помилка при створенні акаунту");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    window.location.href = `/oauth2/authorization/google`;
  };

  return (
    <AuthFormWrapper>
      <div className={styles.headerContainer}>
        <h2 className={styles.title}>Створити акаунт</h2>
        <p className={styles.subtitle}>Приєднуйтесь до нашої спільноти</p>
      </div>
      
      <form onSubmit={handleRegister} className={styles.form}>
        <Input label="Ім'я" value={name} onChange={setName} />
        <Input label="Email" value={email} onChange={setEmail} type="email" />
        <Input
          label="Пароль"
          value={password}
          onChange={setPassword}
          type="password"
        />
        <Input
          label="Підтвердження пароля"
          value={passwordConfirm}
          onChange={setPasswordConfirm}
          type="password"
        />

        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}

        <Button type="submit" disabled={loading}>
          {loading ? "Створення..." : "Зареєструватися"}
        </Button>
      </form>

      <div className={styles.divider}>
        <span>або за допомогою</span>
      </div>

      <button className={styles.googleButton} onClick={handleGoogleRegister} type="button">
        <img 
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
          alt="Google" 
          className={styles.googleIcon} 
        />
        Реєстрація через Google
      </button>

      <div className={styles.footerLinks}>
        <Link to="/login" className={styles.loginLink}>
          Вже є акаунт? <span>Увійти</span>
        </Link>
      </div>
    </AuthFormWrapper>
  );
}