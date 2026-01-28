import { useState } from "react";
import { Link } from "react-router-dom";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import AuthFormWrapper from "../../components/AuthForm/AuthFormWrapper";
import { authService } from "../../services/authService/authService";
import styles from "./ForgotPassword.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authService.forgotPassword(email);
      setIsSent(true);
    } catch (err: any) {
      setError(err.message || "Сталася помилка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFormWrapper>
      <h2 className={styles.title}>Відновлення пароля</h2>
      
      {!isSent ? (
        <form onSubmit={handleSubmit}>
          <p className={styles.instruction}>
            Enter your email address below and we'll send you instructions to reset your password.
          </p>
          
          <Input 
            label="Email" 
            value={email} 
            onChange={setEmail} 
            type="email"
          />

          {error && <p className={styles.error}>{error}</p>}

          <Button type="submit" disabled={loading} fullWidth>
            {loading ? "Надсилаємо..." : "Надіслати інструкції"}
          </Button>
        </form>
      ) : (
        <div className={styles.successContainer}>
          <p className={styles.successMessage}>
            Інструкції надіслано на <strong>{email}</strong>. Перевірте вашу пошту.
          </p>
          <Button variant="outline" fullWidth>
             <Link to="/login" className={styles.linkButton}>
                Повернутися до входу
             </Link>
          </Button>
        </div>
      )}

      <div className={styles.links}>
        <Link to="/login" className={styles.registerLink}>Згадали пароль? Увійти</Link>
      </div>
    </AuthFormWrapper>
  );
}