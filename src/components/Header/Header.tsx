import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService/authService";
import styles from "./Header.module.css";

import searchIcon from "../../assets/icons/search.svg";
import cartIcon from "../../assets/icons/cart.svg";
import userIcon from "../../assets/icons/user.svg";
import closeIcon from "../../assets/icons/burger-close.svg";
import burgerIcon from "../../assets/icons/burger.svg";
import homeIcon from "../../assets/icons/home.svg";

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
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.leftSection}>
          {enableSideMenu ? (
            <button
              className={styles.burgerBtn}
              onClick={onToggleMenu}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              <img
                src={isMenuOpen ? closeIcon : burgerIcon}
                alt={isMenuOpen ? "Close menu" : "Open menu"}
                className={styles.burgerIcon}
              />
            </button>
          ) : (
            <button
              className={styles.burgerBtn + " " + styles.homeBtn}
              onClick={() => navigate("/")}
              aria-label={"Go to homepage"}
            >
              <img
                src={homeIcon}
                alt={"Go to homepage"}
                className={styles.burgerIcon}
              />
            </button>
          )}
          <div className={styles.logo} onClick={() => navigate("/")}>
            Bookstore
          </div>
        </div>

        <div className={styles.middleSection}>
          <div className={styles.searchWrapper}>
            <img
              src={searchIcon}
              alt="Search"
              className={styles.searchIcon}
              onClick={() => handleSearch(searchValue)}
            />
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
          <button
            className={styles.iconBtn}
            onClick={() => navigate("/cart")}
            title="Cart"
            aria-label="Shopping cart"
          >
            <img src={cartIcon} alt="Cart" className={styles.icon} />
          </button>

          <div className={styles.accountWrapper} ref={dropdownRef}>
            <button
              className={styles.iconBtn}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              title={authService.getUserEmail() || "Profile"}
              aria-label="User profile"
              aria-expanded={isDropdownOpen}
            >
              <img src={userIcon} alt="User" className={styles.icon} />
            </button>

            {isDropdownOpen && (
              <div className={styles.dropdown}>
                <div className={styles.dropdownEmail}>
                  {authService.getUserEmail()}
                </div>
                <hr className={styles.divider} />
                <button
                  className={styles.dropdownItem}
                  onClick={() => navigate("/profile")}
                >
                  My Profile
                </button>
                <button
                  className={`${styles.dropdownItem} ${styles.logoutText}`}
                  onClick={handleLogout}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
