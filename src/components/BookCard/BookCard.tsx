import { Link } from "react-router-dom";
import { Book } from "../../services/bookService";
import styles from "./BookCard.module.css";

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  const discountPrice = book.discountPercentage > 0 
    ? (book.price * (1 + book.discountPercentage / 100)).toFixed(2) 
    : null;

  return (
    <Link to={`/book/${book.id}`} className={styles.cardLink}>
      <div className={styles.bookCard}>
        <div className={styles.cardImage}>
          {book.coverImageUrl ? (
            <img src={book.coverImageUrl} alt={book.title} />
          ) : (
            <div className={styles.placeholderImg}>No Cover</div>
          )}
        </div>
        
        <div className={styles.cardBody}>
          <div className={styles.cardHeader}>
            <span className={styles.genreBadge}>{book.genre}</span>
            <span className={styles.ageBadge}>{book.ageGroup}</span>
          </div>
          
          <h3 className={styles.bookTitle}>{book.title}</h3>
          <p className={styles.bookAuthor}>
            by {book.authors.map(a => `${a.firstName} ${a.lastName}`).join(", ")}
          </p>
          
          <p className={styles.description}>{book.description}</p>
          
          <div className={styles.bookFooter}>
            <div className={styles.priceBlock}>
              {discountPrice && (
                <span className={styles.oldPrice}>${discountPrice}</span>
              )}
              <span className={styles.price}>${book.price.toFixed(2)}</span>
            </div>
            <span className={styles.stock}>
              {book.stockQuantity > 0 ? `${book.stockQuantity} in stock` : 'Out of stock'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}