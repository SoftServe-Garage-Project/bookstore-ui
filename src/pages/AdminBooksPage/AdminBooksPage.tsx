import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { authService } from "../../services/authService/authService";
import { 
  fetchBooks, createBook, updateBook, deleteBook, 
  Book, PageResponse, BookFilterParams 
} from "../../services/bookService/bookService";

import Header from "../../components/Header/Header";
import SidePanel from "../../components/SidePanel/SidePanel";
import BookCard from "../../components/BookCard/BookCard";
import Pagination from "../../components/Pagination/Pagination";
import Button from "../../components/Button/Button";
import { StatusModal, ModalType } from "../../components/StatusModal/StatusModal";

import BookEditorModal from "../../components/BookEditorModal/BookEditorModal";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";

import styles from "./AdminBookPage.module.css";
import CatalogModal from "../../components/CatalogModal/CatalogModal";

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
  const [catalogType, setCatalogType] = useState<"genres" | "languages" | "ageGroups">("genres");

  const openCatalog = (type: "genres" | "languages" | "ageGroups") => {
    setCatalogType(type);
    setIsCatalogOpen(true);
  };
  
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    type: ModalType;
    title: string;
    message: string;
  }>({ isOpen: false, type: "success", title: "", message: "" });

  const filters: BookFilterParams = useMemo(() => ({
    page: Number(searchParams.get("page")) || 0,
    size: Number(searchParams.get("size")) || 12,
    sort: searchParams.get("sort") || "price,asc",
    genreName: searchParams.get("genreName") || undefined,
    title: searchParams.get("title") || undefined,
  }), [searchParams]);

  const loadBooks = async () => {
    if (!authService.getUserEmail) return;
    setIsLoading(true);
    try {
      const data: PageResponse<Book> = await fetchBooks(filters);
      setBooks(data.content);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, [filters]);

  const updateQueryParams = (newParams: Partial<BookFilterParams>) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") nextParams.delete(key);
      else nextParams.set(key, String(value));
    });
    setSearchParams(nextParams);
  };

  const handleCreateClick = () => {
    setSelectedBook(null);
    setIsEditorOpen(true);
  };

  const handleEditClick = (book: Book) => {
    setSelectedBook(book);
    setIsEditorOpen(true);
  };

  const handleSaveBook = async (bookData: Partial<Book>) => {
    try {
      if (selectedBook) {
        await updateBook(selectedBook.id, bookData);
        showStatus("success", "Success", "Book updated successfully!");
      } else {
        const { id, ...newBook } = bookData as Book;
        await createBook(newBook);
        showStatus("success", "Success", "Book created successfully!");
      }
      setIsEditorOpen(false);
      loadBooks();
    } catch (err: any) {
      showStatus("error", "Error", err.message || "Something went wrong");
    }
  };

  const handleDeleteRequest = (id: number) => {
    setIsEditorOpen(false); 
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await deleteBook(confirmDeleteId);
      showStatus("success", "Deleted", "Book has been removed.");
      loadBooks();
    } catch (err: any) {
      showStatus("error", "Error", "Failed to delete book.");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const showStatus = (type: ModalType, title: string, message: string) => {
    setStatusModal({ isOpen: true, type, title, message });
  };

  return (
    <div className={styles.layout}>
      <StatusModal 
        {...statusModal} 
        onClose={() => setStatusModal(prev => ({ ...prev, isOpen: false }))} 
      />

      <BookEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        book={selectedBook}
        onSave={handleSaveBook}
        onDelete={selectedBook ? handleDeleteRequest : undefined}
      />

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Book?"
        message="Are you sure you want to delete this book? This action cannot be undone."
      />

      <Header isMenuOpen={isMenuOpen} onToggleMenu={() => setIsMenuOpen(!isMenuOpen)} enableSideMenu={true} />

      <CatalogModal 
        isOpen={isCatalogOpen} 
        onClose={() => setIsCatalogOpen(false)} 
        initialType={catalogType} 
      />

      <div className={styles.mainContainer}>
        <SidePanel 
          selectedGenre={filters.genreName} selectedSort={filters.sort}
          onGenreChange={(g) => updateQueryParams({ genreName: g, page: 0 })}
          onTitleSearch={(t) => updateQueryParams({ title: t, page: 0 })}
          onSortChange={(s) => updateQueryParams({ sort: s, page: 0 })}
          isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)}
        />

        <main className={styles.content}>
          <div className={styles.contentHeader} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h2>Manage Books</h2>
            <div className={styles.adminActions} >
                <h2>Management</h2>
                <div className={styles.adminActions}>
                  <Button onClick={() => openCatalog("genres")} className={styles.subBtn}>Genres</Button>
                  <Button onClick={() => openCatalog("languages")} className={styles.subBtn}>Langs</Button>
                  <Button onClick={() => openCatalog("ageGroups")} className={styles.subBtn}>Ages</Button>
                  <Button onClick={handleCreateClick}>+ Add Book</Button>
                </div>
            </div>
          </div>

          {isLoading && <span className={styles.loader}>Loading...</span>}

          <div className={styles.booksGrid}>
            {books.map((book) => (
              <div 
                key={book.id} 
                onClickCapture={(e) => {
                  e.preventDefault(); 
                  e.stopPropagation();
                  handleEditClick(book);
                }}
                style={{ cursor: "pointer" }}
              >
                <BookCard book={book} />
              </div>
            ))}
          </div>
          
          {totalPages > 1 && (
            <Pagination 
              currentPage={filters.page} totalPages={totalPages}
              onPageChange={(p) => updateQueryParams({ page: p })}
            />
          )}
        </main>
      </div>
    </div>
  );
}