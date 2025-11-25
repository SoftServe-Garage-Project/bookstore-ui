import { useEffect, useState } from "react";
import { authService } from "../services/authService";
import Button from "../components/Button";
import styles from "./HomePage.module.css";

export default function HomePage() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = authService.getAccessToken();
    const storedEmail = authService.getUserEmail();

    if (storedToken) {
      setToken(storedToken);
      setEmail(storedEmail);
    }
  }, []);

  const handleLogout = async () => {
    await authService.logout();
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Bookstore API Client</h1>
      
      <div className={styles.card}>
        {token ? (
          <div>
            <h2 className={styles.welcomeText}>Welcome back</h2>
            
            <div className={styles.infoBlock}>
              <span className={styles.label}>User Email</span>
              <span className={styles.value}>{email}</span>
            </div>
            
            <div className={styles.infoBlock}>
              <span className={styles.label}>Access Token</span>
              <span className={styles.value}>{token}</span>
            </div>

            <div onClick={handleLogout} className={styles.logoutWrapper}>
                <Button>Logout</Button>
            </div>
          </div>
        ) : (
          <div>
            <p className={styles.welcomeText}>Authentication required</p>
            <div className={styles.actions}>
              <a href="/login" className={styles.linkWrapper}>
                <Button>Login</Button>
              </a>
              <a href="/register" className={styles.linkWrapper}>
                <Button>Register</Button>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}