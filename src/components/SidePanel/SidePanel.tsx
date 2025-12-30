import React, { useState, memo } from "react";
import Button from "../Button/Button";
import { useGenres } from "../../hooks/useGenres";
import styles from "./SidePanel.module.css";

const SORT_OPTIONS = [
  { label: "Price: Low to High", value: "price,asc" },
  { label: "Price: High to Low", value: "price,desc" },
  { label: "Newest First", value: "publishedYear,desc" },
  { label: "Name: A-Z", value: "title,asc" },
] as const;

interface SidePanelProps {
  selectedGenre?: string;
  selectedSort?: string;
  onGenreChange: (genre: string | undefined) => void;
  onTitleSearch: (title: string) => void;
  onSortChange: (sort: string) => void;
}

const SidePanel = ({ 
  selectedGenre, 
  selectedSort = "price,asc",
  onGenreChange, 
  onTitleSearch,
  onSortChange
}: SidePanelProps) => {
  
  const [searchValue, setSearchValue] = useState("");
  const { genres, isLoading, error } = useGenres();
  const [isOpen, setIsOpen] = useState(false);

  const handleApplyFilter = () => {
    onTitleSearch(searchValue);
    setIsOpen(false);
  };

  const handleGenreSelect = (genreName?: string) => {
    onGenreChange(genreName);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApplyFilter();
    }
  };

  return (
    <>
      <button 
        className={styles.burgerBtn} 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? "✕" : "☰"}
      </button>

      <div 
        className={`${styles.overlay} ${isOpen ? styles.open : ""}`} 
        onClick={() => setIsOpen(false)}
      />

      <aside className={`${styles.sidePanel} ${isOpen ? styles.open : ""}`}>
        <nav className={styles.nav}>
          
          <div className={styles.section}>
            <h3 className={styles.heading}>Search</h3>
            <div className={styles.inputWrapper}>
              <input 
                type="text" 
                placeholder="Book title..." 
                className={styles.input}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.heading}>Sort By</h3>
            <select 
              className={styles.select}
              value={selectedSort} 
              onChange={(e) => onSortChange(e.target.value)}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.section}>
            <h3 className={styles.heading}>Genres</h3>
            <ul className={styles.genreList}>
              <li 
                className={!selectedGenre ? styles.active : ""} 
                onClick={() => handleGenreSelect(undefined)}
              >
                All Books
              </li>

              {isLoading && <li className={styles.loading}>Loading genres...</li>}
              
              {!isLoading && !error && genres.map((genre) => (
                <li 
                  key={genre.name}
                  className={selectedGenre === genre.name ? styles.active : ""}
                  onClick={() => handleGenreSelect(genre.name)}
                  title={genre.description}
                >
                  {genre.name}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.actions}>
            <Button onClick={handleApplyFilter} fullWidth>
              Find
            </Button>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default memo(SidePanel);