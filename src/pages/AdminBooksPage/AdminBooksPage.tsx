import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button as MuiButton,
  Grid,
  CircularProgress,
  Stack,
  ButtonGroup,
  SxProps,
  Theme,
} from "@mui/material";
import {
  Add as AddIcon,
  Category as CategoryIcon,
  Language as LanguageIcon,
  Face as FaceIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

import {
  fetchBooks,
  createBook,
  updateBook,
  deleteBook,
  Book,
  PageResponse,
  BookFilterParams,
} from "../../services/bookService/bookService";

import Header from "../../components/Header/Header";
import SidePanel from "../../components/SidePanel/SidePanel";
import BookCard from "../../components/BookCard/BookCard";
import Pagination from "../../components/Pagination/Pagination";
import {
  StatusModal,
  ModalType,
} from "../../components/StatusModal/StatusModal";
import BookEditorModal from "../../components/BookEditorModal/BookEditorModal";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import CatalogModal from "../../components/CatalogModal/CatalogModal";

const PageWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
  backgroundColor: theme.palette.background.default,
}));

const MainLayout = styled(Box)({
  display: "flex",
  flex: 1,
  position: "relative",
});

const ContentArea = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(2),
  width: "100%",
  color: theme.palette.text.primary,
  [theme.breakpoints.up("md")]: {
    padding: theme.spacing(4),
  },
}));

const CardActionArea = styled(Box)(({ theme }) => ({
  width: "100%",
  height: "100%",
  cursor: "pointer",
  transition: "transform 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)",
  },
}));

const styles: Record<string, SxProps<Theme>> = {
  headerStack: {
    mb: 4,
    flexDirection: { xs: "column", sm: "row" },
    alignItems: { xs: "stretch", sm: "center" },
    justifyContent: "space-between",
    gap: { xs: 2, sm: 3 },
  },
  actionGroup: {
    flexDirection: { xs: "column", sm: "column", md: "row" },
    alignItems: { xs: "stretch", sm: "stretch" },
    justifyContent: { xs: "flex-start", sm: "flex-end" },
    gap: { xs: 1.5, sm: 2 },
    width: { xs: "100%", sm: "auto" },
  },
  catalogButtons: {
    display: "flex",
    flexDirection: { xs: "row", sm: "row" },
    width: { xs: "100%", sm: "auto" },
    "& .MuiButton-root": {
      flex: { xs: 1, sm: "none" },
      py: { xs: 1.2, sm: 1, md: 1.2 },
      px: { xs: 1, sm: 2, md: 3 },
      fontSize: { xs: "0.9rem", sm: "0.9rem", md: "1rem" },
      whiteSpace: "nowrap",
      minWidth: { sm: "100px", md: "120px" },
      justifyContent: "center",
    },
  },
  addButton: {
    borderRadius: 2,
    py: { xs: 1.2, sm: 1, md: 1.2 },
    px: { xs: 2, sm: 3, md: 4 },
    fontSize: { xs: "0.9rem", sm: "0.95rem", md: "1rem" },
    whiteSpace: "nowrap",
    width: { xs: "100%", sm: "auto" },
    minWidth: { sm: "140px", md: "160px" },
    boxShadow: (theme) =>
      theme.palette.mode === "light" ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: (theme) =>
        theme.palette.mode === "light" ? "0 6px 16px rgba(0,0,0,0.2)" : "none",
    },
    transition: "all 0.2s ease-in-out",
  },
  loaderWrapper: {
    display: "flex",
    justifyContent: "center",
    py: 10,
  },
  paginationWrapper: {
    mt: 6,
    display: "flex",
    justifyContent: "center",
  },
};

export default function AdminBooksPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [books, setBooks] = useState<Book[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [catalogType, setCatalogType] = useState<
    "genres" | "languages" | "ageGroups"
  >("genres");

  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    type: ModalType;
    title: string;
    message: string;
  }>({ isOpen: false, type: "success", title: "", message: "" });

  const filters: BookFilterParams = useMemo(
    () => ({
      page: Number(searchParams.get("page")) || 0,
      size: Number(searchParams.get("size")) || 20,
      sort: searchParams.get("sort") || "price,asc",
      genreName: searchParams.get("genreName") || undefined,
      title: searchParams.get("title") || undefined,
    }),
    [searchParams]
  );

  const loadBooks = useCallback(async () => {
    setIsLoading(true);
    try {
      const data: PageResponse<Book> = await fetchBooks(filters);
      setBooks(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const updateQueryParams = (newParams: Partial<BookFilterParams>) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (!value && value !== 0) nextParams.delete(key);
      else nextParams.set(key, String(value));
    });
    setSearchParams(nextParams);
  };

  const handleEditClick = (book: Book) => {
    setSelectedBook(book);
    setIsEditorOpen(true);
  };

  const handleSaveBook = async (bookData: Partial<Book>) => {
    try {
      if (selectedBook) {
        await updateBook(selectedBook.id, bookData);
        showStatus("success", "Updated", "Book updated successfully!");
      } else {
        const { id, ...newBook } = bookData as Book;
        await createBook(newBook);
        showStatus("success", "Created", "Book added to library!");
      }
      setIsEditorOpen(false);
      loadBooks();
    } catch (err: any) {
      showStatus("error", "Error", err.message || "Operation failed");
    }
  };

  const showStatus = (type: ModalType, title: string, message: string) => {
    setStatusModal({ isOpen: true, type, title, message });
  };

  const openCatalog = (type: typeof catalogType) => {
    setCatalogType(type);
    setIsCatalogOpen(true);
  };

  return (
    <PageWrapper>
      <StatusModal
        {...statusModal}
        onClose={() => setStatusModal((prev) => ({ ...prev, isOpen: false }))}
      />

      <BookEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        book={selectedBook}
        onSave={handleSaveBook}
        onDelete={(id) => {
          setIsEditorOpen(false);
          setConfirmDeleteId(id);
        }}
      />

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={async () => {
          try {
            if (confirmDeleteId) await deleteBook(confirmDeleteId);
            showStatus("success", "Deleted", "Book removed.");
            loadBooks();
          } catch {
            showStatus("error", "Error", "Delete failed.");
          }
          setConfirmDeleteId(null);
        }}
        title="Delete Book?"
        message="This action is permanent."
      />

      <CatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        initialType={catalogType}
      />

      <Header
        isMenuOpen={isMenuOpen}
        onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
        enableSideMenu={true}
      />

      <MainLayout>
        <SidePanel
          selectedGenre={filters.genreName}
          selectedSort={filters.sort}
          onGenreChange={(g) => updateQueryParams({ genreName: g, page: 0 })}
          onSortChange={(s) => updateQueryParams({ sort: s, page: 0 })}
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
        />

        <ContentArea as="main">
          <Container maxWidth="xl">
            <Stack sx={styles.headerStack}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "1.75rem", sm: "2rem", md: "2.25rem" },
                  textAlign: { xs: "center", sm: "center" },
                }}
              >
                Manage Library
              </Typography>

              <Stack sx={styles.actionGroup}>
                <ButtonGroup variant="outlined" sx={styles.catalogButtons}>
                  <MuiButton
                    startIcon={<CategoryIcon />}
                    onClick={() => openCatalog("genres")}
                  >
                    <Box
                      component="span"
                      sx={{ display: { xs: "inline", sm: "inline" } }}
                    >
                      Genres
                    </Box>
                  </MuiButton>
                  <MuiButton
                    startIcon={<LanguageIcon />}
                    onClick={() => openCatalog("languages")}
                  >
                    <Box
                      component="span"
                      sx={{ display: { xs: "inline", sm: "inline" } }}
                    >
                      Languages
                    </Box>
                  </MuiButton>
                  <MuiButton
                    startIcon={<FaceIcon />}
                    onClick={() => openCatalog("ageGroups")}
                  >
                    <Box
                      component="span"
                      sx={{ display: { xs: "inline", sm: "inline" } }}
                    >
                      Age Groups
                    </Box>
                  </MuiButton>
                </ButtonGroup>

                <MuiButton
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setSelectedBook(null);
                    setIsEditorOpen(true);
                  }}
                  sx={styles.addButton}
                >
                  Add Book
                </MuiButton>
              </Stack>
            </Stack>

            {isLoading ? (
              <Box sx={styles.loaderWrapper}>
                <CircularProgress color="primary" />
              </Box>
            ) : (
              <Grid container spacing={3}>
                {books.map((book) => (
                  <Grid
                    key={book.id}
                    size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2.4 }}
                    sx={{ display: "flex" }}
                  >
                    <CardActionArea onClick={() => handleEditClick(book)}>
                      <BookCard book={book} disableLink={true} />
                    </CardActionArea>
                  </Grid>
                ))}
              </Grid>
            )}

            {totalPages > 1 && (
              <Box sx={styles.paginationWrapper}>
                <Pagination
                  currentPage={filters.page}
                  totalPages={totalPages}
                  onPageChange={(p) => updateQueryParams({ page: p })}
                />
              </Box>
            )}
          </Container>
        </ContentArea>
      </MainLayout>
    </PageWrapper>
  );
}
