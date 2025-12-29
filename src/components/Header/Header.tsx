import Button from "../Button/Button";
import styles from "./Header.module.css";

interface HeaderProps {
  userEmail: string;
  onLogout: () => void;
}

export default function Header({ userEmail, onLogout }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>Bookstore</div>
      <div className={styles.userSection}>
        <span className={styles.userEmail}>{userEmail}</span>
        <Button onClick={onLogout} variant="secondary">Logout</Button>
      </div>
    </header>
  );
}