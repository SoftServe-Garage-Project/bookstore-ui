import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import AuthFormWrapper from "../../components/AuthForm/AuthFormWrapper";
import { authService } from "../../services/authService";
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFormWrapper>
      <h2 className={styles.title}>Реєстрація</h2>
      
      <form onSubmit={handleRegister}>
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

        <Button disabled={loading}>
          {loading ? "Завантаження..." : "Зареєструватися"}
        </Button>
      </form>

      <div className={styles.linkContainer}>
        <a href="/login" className={styles.link}>Вже є акаунт? Увійти</a>
      </div>
    </AuthFormWrapper>
  );
}