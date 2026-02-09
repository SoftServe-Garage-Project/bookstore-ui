import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService/authService";
import styles from "./Header.module.css";
import { useTheme } from '../../ThemeContext';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';

interface HeaderProps {
  enableSideMenu?: boolean;
  isMenuOpen?: boolean;
  onToggleMenu?: () => void;
}

export default function Header({
  enableSideMenu = false,
  isMenuOpen,
  onToggleMenu,
}: HeaderProps) {
  const mobileWhidgth = 768;

  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= mobileWhidgth);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= mobileWhidgth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (value: string) => {
    if (value.trim()) {
      navigate(`/?title=${encodeURIComponent(value.trim())}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);

    if (value === "") {
      navigate("/");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(searchValue);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate("/login");
  };

  const navigateAndCloseDropdown = (path: string) => {
    navigate(path);
    setIsDropdownOpen(false);
  };

  const renderHomeButton = () => {
    if (!enableSideMenu) {
      return (
        <button
          className={styles.burgerBtn + " " + styles.homeBtn}
          onClick={() => navigate("/")}
          aria-label="Go to homepage"
        >
          <svg className={styles.burgerIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m3 12 2-2m0 0 7-7 7 7M5 10v10a1 1 0 0 0 1 1h3m10-11 2 2m-2-2v10a1 1 0 0 1-1 1h-3m-6 0a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1m-6 0h6"/></svg>
        </button>
      );
    }
    return null;
  };

  const renderSideMenuButton = () => {
    if (enableSideMenu && onToggleMenu) {
      return (
        <button
          className={styles.burgerBtn}
          onClick={onToggleMenu}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? (
            <svg className={styles.burgerIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 18 6M6 6l12 12"/></svg>
          ) : (
            <svg className={styles.burgerIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          )}
        </button>
      );
    }
    return null;
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.leftSection}>
          {renderSideMenuButton()}
          {renderHomeButton()}
          <div className={styles.logo} onClick={() => navigate("/")}>
            Bookstore
          </div>
        </div>

        <div className={styles.middleSection}>
          <div className={styles.searchWrapper}>
            <svg className={styles.searchIcon} onClick={() => handleSearch(searchValue)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0"/>
            </svg>
            <input
              type="text"
              placeholder="Book title..."
              className={styles.input}
              value={searchValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              aria-label="Search books"
            />
          </div>
        </div>

        <div className={styles.userSection}>
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

          {!isMobile && (
            <>
              <button
                className={`${styles.iconBtn} ${styles.mobileHidden}`}
                onClick={() => navigate("/orders")}
                title="Purchase Orders"
                aria-label="Purchase Orders"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 17h4V5H2v12h3m15 0h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
              </button>

              <button
                className={`${styles.iconBtn} ${styles.mobileHidden}`}
                onClick={() => navigate("/transactions")}
                title="Transactions"
                aria-label="Transactions"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21.183 24" width="21" height="24" fill="currentColor"><path d="M15.769 11.96h3.016v-.584c-.172-.639-.447-1.072-.803-1.335s-.816-.375-1.358-.372l-12.371.003a.551.551 0 0 1 0-1.102l12.356.002c.778-.007 1.463.169 2.027.587q.076.056.148.118v-.331c0-.515-.213-.985-.554-1.327a1.85 1.85 0 0 0-1.326-.553h-.399l-.051-.003-.194.729h-1.336l.793-2.974a1.253 1.253 0 0 1-.885-1.533l-4.41-1.182a1.253 1.253 0 0 1-1.532.886L7.593 7.793H6.215L8.313 0l9.359 2.508-.922 3.455h.155c.818 0 1.563.337 2.104.877.542.539.878 1.287.878 2.105v3.046a1.606 1.606 0 0 1 1.296 1.579v3.625c0 .462-.19.884-.493 1.186a1.7 1.7 0 0 1-.803.448v2.187c0 .818-.336 1.565-.877 2.106l-.034.032a2.97 2.97 0 0 1-2.07.845H2.982a2.97 2.97 0 0 1-2.106-.876A2.97 2.97 0 0 1 0 21.018V8.945c0-.821.335-1.567.876-2.107s1.286-.876 2.107-.876h1.739l.007.001L6.114.82l1.321.354L5.62 7.793H4.237l.196-.727H2.982c-.516 0-.986.212-1.327.553a1.87 1.87 0 0 0-.553 1.327v12.072c0 .516.213.986.553 1.327.342.342.812.554 1.327.554h13.923c.503 0 .963-.201 1.3-.527l.026-.027c.342-.342.554-.812.554-1.326v-2.142h-3.016a3.37 3.37 0 0 1-2.391-.994l-.057-.064a3.38 3.38 0 0 1-.936-2.328v-.146c0-.928.381-1.773.994-2.388l.006-.006a3.37 3.37 0 0 1 2.385-.991m-4.486-4.361a1.511 1.511 0 1 0 .782-2.92 1.511 1.511 0 0 0-.782 2.92m5.695 6.886.003.003a1.32 1.32 0 0 1-.001 1.862l-.003.003a1.324 1.324 0 0 1-1.863-.001l-.003-.003a1.324 1.324 0 0 1 .001-1.863l.003-.003a1.32 1.32 0 0 1 1.862.001"/></svg>
              </button>
            </>
          )}

          <button
            className={styles.iconBtn}
            onClick={() => navigate("/cart")}
            title="Cart"
            aria-label="Shopping cart"
          >
            <svg width="24" height="24" viewBox="0 0 24 19.5" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M20.572 9H16.5V6H21zm-.643 4.5H16.5v-3h3.857zm-.429 3A1.5 1.5 0 0 1 18 18h-1.5v-3h3.214zM9 6h6v3H9zm0 4.5h6v3H9zM9 15h6v3H9zM7.5 9H3.214L3 6h4.5zm0 4.5H3.536l-.214-3H7.5zm0 4.5H5.25a1.5 1.5 0 0 1-1.5-1.5L3.643 15H7.5zM23.25 4.5h-4.894l1.519-3H22.5a.75.75 0 1 0 0-1.5h-3l-2.313 4.5H7.626L5.25 0h-3a.75.75 0 1 0 0 1.5h1.875l1.609 3H.75a.75.75 0 1 0 0 1.5h.75l.75 10.5a3 3 0 0 0 3 3H18a3 3 0 0 0 3-3L22.5 6h.75a.75.75 0 1 0 0-1.5"/></svg>
          </button>

          <div className={styles.accountWrapper} ref={dropdownRef}>
            <button
              className={styles.iconBtn}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              title={authService.getUserEmail() || "Profile"}
              aria-label="User profile"
              aria-expanded={isDropdownOpen}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.875" d="M15.997 6.998a3.998 3.998 0 1 1-7.995 0 3.998 3.998 0 0 1 7.995 0M12 14.003A7 7 0 0 0 5.002 21h13.995A7 7 0 0 0 12 14.003"/></svg>
            </button>

            {isDropdownOpen && (
              <div className={styles.dropdown}>
                {authService.getUserEmail() ? (
                  <>
                    <div className={styles.dropdownEmail}>
                      {authService.getUserEmail()}
                    </div>
                    <hr className={styles.divider} />

                    {isMobile && (
                      <>
                        <button
                          className={styles.dropdownItem}
                          onClick={() => navigateAndCloseDropdown("/orders")}
                        >
                          <span className={styles.dropdownIcon}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 17h4V5H2v12h3m15 0h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
                          </span>
                          Purchase Orders
                        </button>

                        <button
                          className={styles.dropdownItem}
                          onClick={() => navigateAndCloseDropdown("/transactions")}
                        >
                          <span className={styles.dropdownIcon}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21.183 24" width="20" height="20" fill="currentColor"><path d="M15.769 11.96h3.016v-.584c-.172-.639-.447-1.072-.803-1.335s-.816-.375-1.358-.372l-12.371.003a.551.551 0 0 1 0-1.102l12.356.002c.778-.007 1.463.169 2.027.587q.076.056.148.118v-.331c0-.515-.213-.985-.554-1.327a1.85 1.85 0 0 0-1.326-.553h-.399l-.051-.003-.194.729h-1.336l.793-2.974a1.253 1.253 0 0 1-.885-1.533l-4.41-1.182a1.253 1.253 0 0 1-1.532.886L7.593 7.793H6.215L8.313 0l9.359 2.508-.922 3.455h.155c.818 0 1.563.337 2.104.877.542.539.878 1.287.878 2.105v3.046a1.606 1.606 0 0 1 1.296 1.579v3.625c0 .462-.19.884-.493 1.186a1.7 1.7 0 0 1-.803.448v2.187c0 .818-.336 1.565-.877 2.106l-.034.032a2.97 2.97 0 0 1-2.07.845H2.982a2.97 2.97 0 0 1-2.106-.876A2.97 2.97 0 0 1 0 21.018V8.945c0-.821.335-1.567.876-2.107s1.286-.876 2.107-.876h1.739l.007.001L6.114.82l1.321.354L5.62 7.793H4.237l.196-.727H2.982c-.516 0-.986.212-1.327.553a1.87 1.87 0 0 0-.553 1.327v12.072c0 .516.213.986.553 1.327.342.342.812.554 1.327.554h13.923c.503 0 .963-.201 1.3-.527l.026-.027c.342-.342.554-.812.554-1.326v-2.142h-3.016a3.37 3.37 0 0 1-2.391-.994l-.057-.064a3.38 3.38 0 0 1-.936-2.328v-.146c0-.928.381-1.773.994-2.388l.006-.006a3.37 3.37 0 0 1 2.385-.991m-4.486-4.361a1.511 1.511 0 1 0 .782-2.92 1.511 1.511 0 0 0-.782 2.92m5.695 6.886.003.003a1.32 1.32 0 0 1-.001 1.862l-.003.003a1.324 1.324 0 0 1-1.863-.001l-.003-.003a1.324 1.324 0 0 1 .001-1.863l.003-.003a1.32 1.32 0 0 1 1.862.001"/></svg>
                          </span>
                          Transactions
                        </button>

                        <hr className={styles.divider} />
                      </>
                    )}

                    {/* Общие пункты меню */}
                    <button
                      className={styles.dropdownItem}
                      onClick={() => navigateAndCloseDropdown("/promocodes")}
                    >
                      Promocodes
                    </button>

                    <button
                      className={`${styles.dropdownItem} ${styles.logoutText}`}
                      onClick={handleLogout}
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    className={styles.dropdownItem}
                    onClick={() => navigate("/login")}
                  >
                    Login / Register
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}