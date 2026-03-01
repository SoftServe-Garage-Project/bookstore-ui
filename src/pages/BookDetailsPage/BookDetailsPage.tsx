import React, { useEffect, useState } from "react";
import { useParams} from "react-router-dom";
import { Book, fetchBookById } from "../../services/bookService/bookService";
import {
  reviewService,
  Review,
} from "../../services/reviewService/reviewService";
import Button from "../../components/Button/Button";
import Header from "../../components/Header/Header";
import AddToCartModal from "../../components/AddToCartModal/AddToCartModal";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import { StatusModal } from "../../components/StatusModal/StatusModal";
import { Order, orderService } from "../../services/orderService/orderService";
import { cartService } from "../../services/cartService/cartService";
import {
  authService,
  UserProfile,
} from "../../services/authService/authService";
import { promoCodeService } from "../../services/promoCodeService/promoCodeService";
import styles from "./BookDetails.module.css";

const BookDetailsPage = () => {
  const { id } = useParams<{ id: string }>();

  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [quantity, setQuantity] = useState(1);
  const [promoCode, setPromoCode] = useState("");
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState<number | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [fullName, setFullName] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [formError, setFormError] = useState("");

  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<number | null>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"cart" | "status">("cart");
  const [modalState, setModalState] = useState<"success" | "error">("success");
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const loadInitialData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [bookData, profileData, reviewsData] = await Promise.all([
        fetchBookById(Number(id)),
        authService.getUserBallance().catch(() => null),
        reviewService.fetchReviewsByBookId(Number(id)).catch(() => []),
      ]);

      setBook(bookData);
      setUserProfile(profileData);
      setReviews(reviewsData);
      if (profileData && profileData.username) {
        setFullName(profileData.username);
      }
    } catch (error) {
      console.error("Data loading failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [id]);

  const currentTotalPrice =
    discountedPrice ?? (book ? book.price * quantity : 0);
  const hasEnoughFunds = userProfile
    ? userProfile.balance >= currentTotalPrice
    : true;

  const handleApplyPromo = async () => {
    if (!promoCode.trim() || !book) return;
    setIsValidatingPromo(true);
    setPromoError("");
    try {
      const data = await promoCodeService.validatePromo(
        promoCode.trim(),
        book.price * quantity
      );
      if (data.valid && data.finalAmount !== undefined) {
        setDiscountedPrice(data.finalAmount);
      } else {
        setPromoError(data.message || "Invalid code");
        setDiscountedPrice(null);
      }
    } catch (error: any) {
      setPromoError(error.message || "Validation error");
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleBuyNow = async () => {
    if (!book || !hasEnoughFunds) return;
    if (!fullName.trim() || !shippingAddress.trim()) {
      setFormError("Name and Address are required for quick purchase");
      return;
    }
    setIsPurchasing(true);
    setFormError("");
    try {
      const orderData = await orderService.buyNow(
        book.id,
        quantity,
        fullName.trim(),
        shippingAddress.trim(),
        promoCode.trim() || undefined
      );
      setLastOrder(orderData);
      setModalType("status");
      setModalState("success");
      setIsModalOpen(true);
      const updatedProfile = await authService
        .getUserBallance()
        .catch(() => null);
      setUserProfile(updatedProfile);
    } catch (error: any) {
      setModalType("status");
      setModalState("error");
      setErrorMessage(error.message);
      setIsModalOpen(true);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newComment.trim()) return;
    setIsSubmittingReview(true);
    try {
      await reviewService.addReview({
        bookId: Number(id),
        rating,
        comment: newComment,
      });
      setNewComment("");
      const updatedReviews = await reviewService.fetchReviewsByBookId(
        Number(id)
      );
      setReviews(updatedReviews);
    } catch (error: any) {
      alert(error.message || "Error submitting review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  useEffect(() => {
    setDiscountedPrice(null);
    setPromoError("");
  }, [quantity, promoCode]);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.headerFixed}>
        <Header
          isMenuOpen={isMenuOpen}
          onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
        />
      </div>

      <main className={styles.container}>
        {loading && !book ? (
          <div className={styles.loader}>Searching the shelves...</div>
        ) : !book ? (
          <div className={styles.error}>Book not found.</div>
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

                <div className={styles.detailsList}>
                  <div className={styles.detailItem}>
                    <strong>Year</strong>
                    <span>{book.publishedYear}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <strong>Pages</strong>
                    <span>{book.pageCount}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <strong>Lang</strong>
                    <span>{book.languageCode}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <strong>Stock</strong>
                    <span
                      className={
                        book.stockQuantity > 0
                          ? styles.inStock
                          : styles.outOfStock
                      }
                    >
                      {book.stockQuantity > 0 ? book.stockQuantity : "Sold Out"}
                    </span>
                  </div>
                </div>

                <p className={styles.description}>{book.description}</p>

                <div className={styles.buyCard}>
                  <div className={styles.priceRow}>
                    <div className={styles.priceCol}>
                      <span
                        className={
                          discountedPrice
                            ? styles.oldPrice
                            : styles.currentPrice
                        }
                      >
                        ${(book.price * quantity).toFixed(2)}
                      </span>
                      {discountedPrice && (
                        <span className={styles.newPrice}>
                          ${discountedPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    {userProfile && (
                      <div className={styles.balanceTag}>
                        <span>Your Balance:</span>
                        <strong
                          className={
                            hasEnoughFunds
                              ? styles.okBalance
                              : styles.lowBalance
                          }
                        >
                          ${userProfile.balance.toFixed(2)}
                        </strong>
                      </div>
                    )}
                  </div>
                  <div className={styles.deliveryFormQuick}>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={`${styles.promoInput} ${formError && !fullName ? styles.inputError : ""}`}
                      style={{ marginBottom: "10px", width: "100%" }}
                    />
                    <textarea
                      placeholder="Shipping Address"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className={`${styles.promoInput} ${formError && !shippingAddress ? styles.inputError : ""}`}
                      style={{
                        marginBottom: "10px",
                        width: "100%",
                        resize: "none",
                      }}
                      rows={2}
                    />
                    {formError && (
                      <p className={styles.promoErrorText}>{formError}</p>
                    )}
                  </div>
                  <div className={styles.controlsGrid}>
                    <div className={styles.inputGroup}>
                      <label>Qty</label>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        className={styles.qtyInput}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Promo Code</label>
                      <div className={styles.promoActionWrapper}>
                        <input
                          type="text"
                          value={promoCode}
                          className={styles.promoInput}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="SUMMER2026"
                        />
                        <button
                          className={styles.validateBtn}
                          onClick={handleApplyPromo}
                          disabled={!promoCode.trim() || isValidatingPromo}
                        >
                          {isValidatingPromo ? "..." : "Apply"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {promoError && (
                    <p className={styles.promoErrorText}>{promoError}</p>
                  )}
                  {!hasEnoughFunds && (
                    <p className={styles.promoErrorText}>
                      Insufficient balance.
                    </p>
                  )}

                  <div className={styles.actionRow}>
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={() =>
                        cartService
                          .addToCart({ bookId: book.id, quantity })
                          .then(() => {
                            setModalType("cart");
                            setIsModalOpen(true);
                          })
                      }
                    >
                      Add to Cart
                    </Button>
                    <Button
                      variant="primary"
                      fullWidth
                      onClick={handleBuyNow}
                      disabled={
                        isPurchasing ||
                        !hasEnoughFunds ||
                        book.stockQuantity === 0
                      }
                    >
                      {isPurchasing ? "Processing..." : "Buy Now"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <section className={styles.reviewsSection}>
              <div className={styles.sectionHeader}>
                <h2>Customer Reviews</h2>
              </div>

              <form onSubmit={handleSubmitReview} className={styles.reviewForm}>
                <div className={styles.ratingSelect}>
                  <span>Rating:</span>
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
                  placeholder="Share your thoughts about this book..."
                  className={styles.commentArea}
                />
                <Button type="submit" disabled={isSubmittingReview}>
                  {isSubmittingReview ? "Posting..." : "Submit Review"}
                </Button>
              </form>

              <div className={styles.reviewsList}>
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className={styles.reviewItem}>
                      <div className={styles.reviewMeta}>
                        <strong>{review.userName}</strong>
                        <span className={styles.stars}>
                          {"★".repeat(review.rating)}
                        </span>
                        <small>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </small>
                        {((authService.getUserName() &&
                          review.userName === authService.getUserName()) ||
                          authService.getUserRoles() === "ADMIN") && (
                          <button
                            className={styles.deleteBtn}
                            onClick={() => {
                              setReviewToDelete(review.id);
                              setIsDeleteModalOpen(true);
                            }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <p>{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className={styles.noReviews}>
                    No reviews yet. Be the first!
                  </p>
                )}
              </div>
            </section>
          </>
        )}
      </main>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={async () => {
          if (reviewToDelete) {
            await reviewService.deleteReview(reviewToDelete);
            setReviews((prev) => prev.filter((r) => r.id !== reviewToDelete));
            setIsDeleteModalOpen(false);
          }
        }}
        title="Delete Review?"
        message="This action cannot be undone."
      />

      {modalType === "cart" ? (
        <AddToCartModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          bookTitle={book?.title || ""}
          bookImage={book?.coverImageUrl || null}
          quantity={quantity}
        />
      ) : (
        <StatusModal
          isOpen={isModalOpen}
          type={modalState}
          title={modalState === "success" ? "Success!" : "Error"}
          message={
            modalState === "success"
              ? `Order #${lastOrder?.id} placed.`
              : errorMessage
          }
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default BookDetailsPage;
