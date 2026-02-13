import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Book, fetchBookById } from "../../services/bookService/bookService";
import {
  reviewService,
  Review,
} from "../../services/reviewService/reviewService";
import Button from "../../components/Button/Button";
import styles from "./BookDetails.module.css";
import Header from "../../components/Header/Header";
import { cartService } from "../../services/cartService/cartService";
import AddToCartModal from "../../components/AddToCartModal/AddToCartModal";
import { authService } from "../../services/authService/authService";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";

const BookDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<number | null>(null);

  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const bookData = await fetchBookById(Number(id));
      if (bookData) {
        setBook(bookData);
        const reviewsData = await reviewService.fetchReviewsByBookId(
          Number(id)
        );
        setReviews(reviewsData);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleAddToCart = async () => {
    if (!book) return;
    try {
      await cartService.addToCart({ bookId: book.id, quantity: quantity });
      setIsModalOpen(true);
    } catch (error) {
      alert("Error adding to cart.");
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newComment.trim()) return;
    setIsSubmittingReview(true);
    try {
      await reviewService.addReview({
        bookId: Number(id),
        rating: rating,
        comment: newComment,
      });
      setNewComment("");
      const reviewsData = await reviewService.fetchReviewsByBookId(Number(id));
      setReviews(reviewsData);
    } catch (error: any) {
      alert(error.message || "Error submitting review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const openDeleteConfirm = (reviewId: number) => {
    setReviewToDelete(reviewId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (reviewToDelete === null) return;
    try {
      await reviewService.deleteReview(reviewToDelete);
      setReviews((prev) => prev.filter((r) => r.id !== reviewToDelete));
    } catch (error) {
      alert("Could not delete review.");
    } finally {
      setReviewToDelete(null);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Header
        isMenuOpen={isMenuOpen}
        onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
      />

      {loading && !book ? (
        <div className={styles.loader}>Loading book details...</div>
      ) : !book ? (
        <div className={styles.error}>Book not found</div>
      ) : (
        <>
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
                by{" "}
                {book.authors
                  .map((a) => `${a.firstName} ${a.lastName}`)
                  .join(", ")}
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
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className={styles.qtyInput}
                  />
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={handleAddToCart}
                    disabled={book.stockQuantity === 0}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <section className={styles.reviewsSection}>
            <div className={styles.sectionHeader}>
              <h2>Customer Reviews</h2>
              {loading && (
                <span className={styles.smallLoader}>Updating...</span>
              )}
            </div>

            {/* Форма отзыва ... код как был ... */}
            <form onSubmit={handleSubmitReview} className={styles.reviewForm}>
              <div className={styles.ratingSelect}>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} Stars
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your review..."
                className={styles.commentArea}
              />
              <Button type="submit" disabled={isSubmittingReview}>
                {isSubmittingReview ? "Sending..." : "Submit Review"}
              </Button>
            </form>

            <div className={styles.reviewsList}>
              {reviews.map((review) => (
                <div key={review.id} className={styles.reviewItem}>
                  <div className={styles.reviewMeta}>
                    <strong>{review.userName}</strong>
                    <span className={styles.rating}>
                      {"★".repeat(review.rating)}
                    </span>
                    <small>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </small>

                    {((authService.getUserName() &&
                      review.userName === authService.getUserName()) ||
                      authService.getUserRoles() === "ADMIN") && (
                      <Button
                        variant="error"
                        onClick={() => openDeleteConfirm(review.id)} // Вызываем открытие модалки
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                  <p>{review.comment}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Модалка подтверждения удаления */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Review?"
        message="This action cannot be undone. Are you sure you want to delete your review?"
      />

      {book && (
        <AddToCartModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          bookTitle={book.title}
          bookImage={book.coverImageUrl}
          quantity={quantity}
        />
      )}
    </div>
  );
};

export default BookDetailsPage;
