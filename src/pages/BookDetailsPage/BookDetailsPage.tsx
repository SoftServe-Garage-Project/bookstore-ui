import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Book, fetchBookById } from '../../services/bookService/bookService';
import Button from '../../components/Button/Button';
import styles from './BookDetails.module.css';
import Header from '../../components/Header/Header';
import { cartService } from '../../services/cartService/cartService';
import AddToCartModal from '../../components/AddToCartModal/AddToCartModal';

const BookDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      setLoading(true);
      const bookData = await fetchBookById(Number(id));
      
      if (bookData) {
        setBook(bookData);
      }
      setLoading(false);
    };

    loadData();
  }, [id]);

  if (loading) return <div className={styles.loader}>Loading...</div>;
  if (!book) return <div className={styles.error}>Book not found</div>;

  const handleAddToCart = async () => {
  try {
    await cartService.addToCart({ bookId: book.id, quantity: quantity });
    setIsModalOpen(true);
  } catch (error) {
    console.error('Failed to add to cart:', error);
    alert('Error adding to cart. Please try again.');
  }
  };

  return (
    <div className={styles.pageWrapper}>
      <Header 
              isMenuOpen={isMenuOpen}
              onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
            />
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)} 
        className={styles.backBtn}
      >
        ← Back to Catalog
      </Button>
      
      <div className={styles.mainGrid}>
        <div className={styles.imageSection}>
          {book.coverImageUrl ? (
            <img src={book.coverImageUrl} alt={book.title} />
          ) : (
            <div className={styles.placeholder}>No Cover</div>
          )}
        </div>

        <div className={styles.infoSection}>
          <div className={styles.badgeRow}>
            <span className={styles.genreBadge}>{book.genre}</span>
            <span className={styles.ageBadge}>{book.ageGroup}</span>
          </div>

          <h1 className={styles.title}>{book.title}</h1>
          
          <p className={styles.author}>
            by {book.authors.map(a => `${a.firstName} ${a.lastName}`).join(', ')}
          </p>
          
          <div className={styles.priceContainer}>
             <span className={styles.currentPrice}>${book.price.toFixed(2)}</span>
             {book.discountPercentage > 0 && (
               <span className={styles.discountBadge}>-{book.discountPercentage}%</span>
             )}
          </div>

          <div className={styles.detailsList}>
            <p><strong>Year:</strong> {book.publishedYear}</p>
            <p><strong>Pages:</strong> {book.pageCount}</p>
            <p><strong>Language:</strong> {book.languageCode}</p>
            <p>{book.stockQuantity > 0 ? (
                <span className={styles.inStockBadge}>
                <strong>In stock:</strong> {book.stockQuantity}
                </span>
            ) : (
                <span className={styles.outOfStockBadge}>
                OUT OF STOCK
                </span>
            )}</p>
          </div>

          <p className={styles.description}>{book.description}</p>

          <div className={styles.buyCard}>
            <div className={styles.qtyRow}>
              <label htmlFor="quantity">Quantity:</label>
              <input 
                id="quantity"
                type="number" 
                min="1" 
                max={book.stockQuantity} 
                value={quantity} 
                onChange={(e) => setQuantity(Number(e.target.value))}
                className={styles.qtyInput}
              />

              <Button variant="outline" fullWidth onClick={handleAddToCart} disabled={book.stockQuantity === 0}>
                Add to Cart
              </Button>

              <AddToCartModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                bookTitle={book.title}
                bookImage={book.coverImageUrl}
                quantity={quantity}
              />

            </div>
          </div>
        </div>
      </div>

      <section className={styles.reviewsSection}>
        <div className={styles.sectionHeader}>
          <h2>Customer Reviews</h2>
          <Button variant="secondary">Write a Review</Button>
        </div>
        <div className={styles.reviewsPlaceholder}>
          No reviews yet. Be the first to review this book!
        </div>
      </section>
    </div>
  );
};

export default BookDetailsPage;