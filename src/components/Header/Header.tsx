import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import Button from "../Button/Button";
import styles from "./Header.module.css";

interface HeaderProps {
  enableSideMenu?: boolean;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
}

export default function Header({
  enableSideMenu = false,
  isMenuOpen,
  onToggleMenu,
}: HeaderProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authService.logout();
    navigate("/login");
  };

  const handleCart = async () => {
    navigate("/cart");
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.leftSection}>
          {enableSideMenu ? (
            <button
              className={styles.burgerBtn}
              onClick={onToggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? "✕" : "☰"}
            </button>
          ) : null}
          <div
            className={`${styles.logo} ${
              enableSideMenu ? styles.logoWithMargin : styles.logoWithoutMargin
            }`}
            onClick={() => navigate("/")}
            role="button"
            tabIndex={0}
          >
            Bookstore
          </div>
        </div>

        <div className={styles.userSection}>
          <span
            className={styles.userEmail}
            title={authService.getUserEmail() || "Guest"}
          >
            {authService.getUserEmail() || "Guest"}
          </span>

          <Button onClick={handleCart} variant="secondary">
            Cart
          </Button>

          <Button onClick={handleLogout} variant="secondary">
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
