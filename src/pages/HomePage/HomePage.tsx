import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "../../services/authService/authService";
import { fetchBooks, Book, PageResponse, BookFilterParams } from "../../services/bookService/bookService";

import Header from "../../components/Header/Header";
import SidePanel from "../../components/SidePanel/SidePanel";
import BookCard from "../../components/BookCard/BookCard";
import Pagination from "../../components/Pagination/Pagination";

import styles from "./HomePage.module.css";

export default function HomePage() {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const [books, setBooks] = useState<Book[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const filters: BookFilterParams = useMemo(() => {
    return {
      page: Number(searchParams.get("page")) || 0,
      size: Number(searchParams.get("size")) || 12,
      sort: searchParams.get("sort") || "price,asc",
      genreName: searchParams.get("genreName") || undefined,
      title: searchParams.get("title") || undefined,
    };
  }, [searchParams]);

  useEffect(() => {
    const loadBooks = async () => {
      if (!authService.getUserEmail()) return;

      setIsLoading(true);
      setError(null);

      try {
        const data: PageResponse<Book> = await fetchBooks(filters);

        setBooks(data.content);
        setTotalPages(data.totalPages);
      } catch (err: any) {
        console.error("Error:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadBooks();
  }, [filters, navigate]);

  const updateQueryParams = (newParams: Partial<BookFilterParams>) => {
    const nextParams = new URLSearchParams(searchParams);

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        nextParams.delete(key);
      } else {
        nextParams.set(key, String(value));
      }
    });

    setSearchParams(nextParams);
  };

  const handleGenreChange = (genre: string | undefined) => {
    updateQueryParams({
      genreName: genre,
      page: 0,
    });
  };

  const handleTitleSearch = (title: string) => {
    updateQueryParams({
      title: title,
      page: 0,
    });
  };

  const handlePageChange = (pageNumber: number) => {
    updateQueryParams({
      page: pageNumber,
    });
  };

  const handleSortChange = (sortValue: string) => {
    updateQueryParams({
      sort: sortValue,
      page: 0,
    });
  };

  return (
    <div className={styles.layout}>
      <Header
        enableSideMenu={true}
        isMenuOpen={isMenuOpen}
        onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
      />

      <div className={styles.mainContainer}>
        <SidePanel
          selectedGenre={filters.genreName}
          selectedSort={filters.sort}
          onGenreChange={handleGenreChange}
          onTitleSearch={handleTitleSearch}
          onSortChange={handleSortChange}
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
        />

        <main className={styles.content}>
          <div className={styles.contentHeader}>
            <h2>Available Books</h2>
            {isLoading && <span className={styles.loader}>Loading...</span>}
          </div>

          {error && <div className={styles.errorAlert}>{error}</div>}

          {!isLoading && books.length === 0 && !error && (
            <p className={styles.emptyState}>
              No books found matching your criteria.
            </p>
          )}

          <div className={styles.booksGrid}>
            {books.map((book) => {
              return <BookCard key={book.id} book={book} />;
            })}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={filters.page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </main>
      </div>
    </div>
  );
}
