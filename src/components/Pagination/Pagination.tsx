import React from "react";
import Button from "../../components/Button/Button";
import styles from "./Pagination.module.css";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  loading = false,
}) => {
  if (totalPages <= 1) {
    return null;
  }

  const handlePrevious = () => {
    if (currentPage > 0 && !loading) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1 && !loading) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <nav className={styles.pagination}>
      <Button
        disabled={currentPage === 0 || loading}
        onClick={handlePrevious}
        variant="primary"
        className={styles.paginationButton}
      >
        Previous
      </Button>
      
      <span className={styles.pageIndicator}>
        {currentPage + 1} / {totalPages}
      </span>
      
      <Button
        disabled={currentPage + 1 >= totalPages || loading}
        onClick={handleNext}
        variant="primary"
        className={styles.paginationButton}
      >
        Next
      </Button>
    </nav>
  );
};

export default Pagination;