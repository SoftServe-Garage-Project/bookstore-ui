import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import Button from "../components/Button";
import styles from "./HomePage.module.css";

export default function HomePage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const storedEmail = authService.getUserEmail();

    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    navigate("/login");
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Bookstore API Client</h1>
      
      <div className={styles.card}>
        {email ? (
          <div>
            <h2 className={styles.welcomeText}>Welcome back</h2>
            
            <div className={styles.infoBlock}>
              <span className={styles.label}>User Email</span>
              <span className={styles.value}>{email}</span>
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