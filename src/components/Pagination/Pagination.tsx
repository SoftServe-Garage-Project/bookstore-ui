import styles from "./Pagination.module.css";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={styles.pagination}>
      <button 
        disabled={currentPage === 0} 
        onClick={() => onPageChange(currentPage - 1)}
        className={styles.pageBtn}
      >
        &lt; Prev
      </button>
      <span className={styles.pageInfo}>
        Page {currentPage + 1} of {totalPages}
      </span>
      <button 
        disabled={currentPage >= totalPages - 1} 
        onClick={() => onPageChange(currentPage + 1)}
        className={styles.pageBtn}
      >
        Next &gt;
      </button>
    </div>
  );
}