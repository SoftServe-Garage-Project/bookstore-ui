import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import AuthFormWrapper from "../../components/AuthForm/AuthFormWrapper";
import { authService } from "../../services/authService/authService";
import styles from "./ResetPassword.module.css";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== passwordConfirm) {
      setError("Passwords do not match");
      return;
    }
    if (!token) {
      setError("Токен відсутній. Перейдіть за посиланням з листа ще раз.");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "Помилка при скиданні пароля");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFormWrapper>
      <h2 className={styles.container}>Новий пароль</h2>
      
      {!isSuccess ? (
        <form onSubmit={handleReset}>
          <p className={styles.infoText}>
            Введіть новий пароль для вашого акаунту.
          </p>
          
          <Input 
            label="Новий пароль" 
            value={password} 
            onChange={setPassword} 
            type="password"
          />
          <Input 
            label="Підтвердіть пароль" 
            value={passwordConfirm} 
            onChange={setPasswordConfirm} 
            type="password"
          />

          {error && <p className={styles.error}>{error}</p>}

          <Button type="submit" disabled={loading} fullWidth>
            {loading ? "Оновлення..." : "Змінити пароль"}
          </Button>
        </form>
      ) : (
        <div className={styles.successContainer}>
          <p className={styles.successMessage}>
            Ваш пароль успішно змінено! <br />
            Тепер ви можете увійти в систему.
          </p>
          
          <Link to="/login" style={{ width: '100%' }}>
            <Button variant="primary" fullWidth>
              Перейти до входу
            </Button>
          </Link>
        </div>
      )}
    </AuthFormWrapper>
  );
}