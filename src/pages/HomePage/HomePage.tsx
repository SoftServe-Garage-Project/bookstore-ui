import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Toolbar,
  useTheme,
  useMediaQuery,
} from "@mui/material";

import { authService } from "../../services/authService/authService";
import {
  fetchBooks,
  Book,
  PageResponse,
  BookFilterParams,
} from "../../services/bookService/bookService";

import Header from "../../components/Header/Header";
import SidePanel from "../../components/SidePanel/SidePanel";
import BookCard from "../../components/BookCard/BookCard";
import Pagination from "../../components/Pagination/Pagination";

export default function HomePage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [searchParams, setSearchParams] = useSearchParams();

  const [books, setBooks] = useState<Book[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(!isMobile);

  const filters: BookFilterParams = useMemo(() => {
    return {
      page: Number(searchParams.get("page")) || 0,
      size: Number(searchParams.get("size")) || 20,
      sort: searchParams.get("sort") || "price,asc",
      genreName: searchParams.get("genreName") || undefined,
      title: searchParams.get("title") || undefined,
    };
  }, [searchParams]);

  useEffect(() => {
    const loadBooks = async () => {
      if (!authService.getUserEmail()) {
        navigate("/login");
        return;
      }

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

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <Header
        enableSideMenu={true}
        onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
      />

      <Box sx={{ display: "flex", flexGrow: 1, position: "relative" }}>
        <SidePanel
          selectedGenre={filters.genreName}
          selectedSort={filters.sort}
          onGenreChange={(genre) =>
            updateQueryParams({ genreName: genre, page: 0 })
          }
          onSortChange={(sort) => updateQueryParams({ sort, page: 0 })}
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
        />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, md: 4 },
            transition: theme.transitions.create(["margin", "width"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            ml: !isMobile && isMenuOpen ? "280px" : 0,
            width: !isMobile && isMenuOpen ? `calc(100% - 280px)` : "100%",
          }}
        >
          <Toolbar />

          <Container maxWidth="xl">
            <Box
              sx={{
                mb: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="h4" component="h1" fontWeight={800}>
                Available Books
                {filters.genreName && (
                  <Typography
                    component="span"
                    variant="h5"
                    color="text.secondary"
                    sx={{ ml: 2 }}
                  >
                    / {filters.genreName}
                  </Typography>
                )}
              </Typography>

              {isLoading && <CircularProgress size={24} />}
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>
                {error}
              </Alert>
            )}

            {!isLoading && books.length === 0 && !error && (
              <Box sx={{ textAlign: "center", py: 10 }}>
                <Typography variant="h6" color="text.secondary">
                  No books found matching your criteria.
                </Typography>
              </Box>
            )}

            <Grid container spacing={3}>
              {books.map((book) => (
                <Grid
                  key={book.id}
                  size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2.4 }}
                >
                  <BookCard book={book} />
                </Grid>
              ))}
            </Grid>

            {totalPages > 1 && (
              <Box sx={{ mt: 6, display: "flex", justifyContent: "center" }}>
                <Pagination
                  currentPage={filters.page}
                  totalPages={totalPages}
                  onPageChange={(page) => updateQueryParams({ page })}
                />
              </Box>
            )}
          </Container>
        </Box>
      </Box>
    </Box>
  );
}
