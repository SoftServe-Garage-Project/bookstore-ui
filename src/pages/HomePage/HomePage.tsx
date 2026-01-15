import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom"; // Добавили useSearchParams
import { authService } from "../../services/authService";
import { fetchBooks, Book, PageResponse, BookFilterParams } from "../../services/bookService";

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

  const filters: BookFilterParams = useMemo(() => {
    return {
      page: Number(searchParams.get("page")) || 0,
      size: Number(searchParams.get("size")) || 10,
      sort: searchParams.get("sort") || "price,asc",
      genreName: searchParams.get("genreName") || undefined,
      title: searchParams.get("title") || undefined,
    };
  }, [searchParams]);

  useEffect(() => {
    if (!authService.getAccessToken()) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const loadBooks = async () => {
      if (!authService.getAccessToken()) return;

      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Fetching with URL params:", filters);
        const data: PageResponse<Book> = await fetchBooks(filters);
        
        setBooks(data.content);
        setTotalPages(data.totalPages);
        
      } catch (err: any) {
        console.error("Error:", err);
        setError(err.message);
        if (err.message && err.message.includes("401")) {
             navigate("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadBooks();
  }, [filters, navigate]);

  const handleLogout = async () => {
    await authService.logout();
    navigate("/login");
  };

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
      page: 0
    });
  };

  const handleTitleSearch = (title: string) => {
    updateQueryParams({ 
      title: title, 
      page: 0 
    });
  };

  const handlePageChange = (pageNumber: number) => {
    updateQueryParams({ 
      page: pageNumber 
    });
  };

  const handleSortChange = (sortValue: string) => {
    updateQueryParams({ 
      sort: sortValue,
      page: 0
    });
  };



  
  return (
    <div className={styles.layout}>
      <Header 
        userEmail={authService.getUserEmail() || 'Guest'} 
        onLogout={handleLogout} 
      />

      <div className={styles.mainContainer}>
        <SidePanel 
          selectedGenre={filters.genreName}
          selectedSort={filters.sort}
          onGenreChange={handleGenreChange}
          onTitleSearch={handleTitleSearch}
          onSortChange={handleSortChange}
        />

        <main className={styles.content}>
          <div className={styles.contentHeader}>
            <h2>Available Books</h2>
            {isLoading && <span className={styles.loader}>Loading...</span>}
          </div>

          {error && <div className={styles.errorAlert}>{error}</div>}

          {!isLoading && books.length === 0 && !error && (
            <p className={styles.emptyState}>No books found matching your criteria.</p>
          )}
          
          <div className={styles.booksGrid}>
            {books.map((book, index) => {
              const uniqueKey = book.title + index; // Лучше использовать ID
              return <BookCard key={uniqueKey} book={book} />;
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