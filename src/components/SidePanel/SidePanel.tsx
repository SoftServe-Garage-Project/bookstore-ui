import { memo, useEffect, useRef, useState } from "react";
import Button from "../Button/Button";
import { useGenres } from "../../hooks/useGenres/useGenres";
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
  isOpen: boolean;
  onClose: () => void;
}

const SidePanel = ({
  selectedGenre,
  selectedSort = "price,asc",
  onGenreChange,
  onSortChange,
  isOpen,
  onClose,
}: SidePanelProps) => {
  const { genres, isLoading, error } = useGenres();

  const handleApplyFilter = () => {
    onClose();
  };

  const handleGenreSelect = (genreName?: string) => {
    onGenreChange(genreName);
    onClose();
  };

  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentSortLabel = SORT_OPTIONS.find(
    (opt) => opt.value === selectedSort
  )?.label;

  return (
    <>
      <div
        className={`${styles.overlay} ${isOpen ? styles.open : ""}`}
        onClick={() => onClose()}
      />

      <aside className={`${styles.sidePanel} ${isOpen ? styles.open : ""}`}>
        <nav className={styles.nav}>
          <div className={styles.section}>
            <h3 className={styles.heading}>Sort By</h3>
            <div className={styles.customSelectWrapper} ref={sortRef}>
              <div
                className={`${styles.customSelectTrigger} ${isSortOpen ? styles.active : ""}`}
                onClick={() => setIsSortOpen(!isSortOpen)}
              >
                <span>{currentSortLabel}</span>
                <div className={styles.arrow} />
              </div>

              {isSortOpen && (
                <div className={styles.customOptions}>
                  {SORT_OPTIONS.map((option) => (
                    <div
                      key={option.value}
                      className={`${styles.option} ${selectedSort === option.value ? styles.selected : ""}`}
                      onClick={() => {
                        onSortChange(option.value);
                        setIsSortOpen(false);
                      }}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.heading}>Genres</h3>
            <ul className={styles.genreList}>
              <li
                className={!selectedGenre ? styles.active : ""}
                onClick={() => handleGenreSelect(undefined)}
                title="All available genres"
              >
                All Books
              </li>

              {isLoading && (
                <li className={styles.loading}>Loading genres...</li>
              )}

              {!isLoading &&
                !error &&
                genres.map((genre) => (
                  <li
                    key={genre.name}
                    className={
                      selectedGenre === genre.name ? styles.active : ""
                    }
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
