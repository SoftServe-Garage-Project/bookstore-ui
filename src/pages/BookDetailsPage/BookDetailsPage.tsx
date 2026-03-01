import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Container,
  Grid,
  Typography,
  Stack,
  Chip,
  TextField,
  Button as MuiButton,
  Paper,
  Rating,
  CircularProgress,
  IconButton,
  alpha,
  SxProps,
  Theme,
} from "@mui/material";
import {
  ShoppingCart as CartIcon,
  FlashOn as BuyIcon,
  Delete as DeleteIcon,
  AccountBalanceWallet as WalletIcon,
  HistoryEdu as ReviewIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

import { Book, fetchBookById } from "../../services/bookService/bookService";
import {
  reviewService,
  Review,
} from "../../services/reviewService/reviewService";
import { Order, orderService } from "../../services/orderService/orderService";
import { cartService } from "../../services/cartService/cartService";
import {
  authService,
  UserProfile,
} from "../../services/authService/authService";
import { promoCodeService } from "../../services/promoCodeService/promoCodeService";

import Header from "../../components/Header/Header";
import AddToCartModal from "../../components/AddToCartModal/AddToCartModal";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import { StatusModal } from "../../components/StatusModal/StatusModal";

const PageWrapper = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  backgroundColor: theme.palette.background.default,
  paddingBottom: theme.spacing(8),
  overflowX: "hidden",
}));

const ImagePaper = styled(Paper)(({ theme }) => ({
  position: "relative",
  width: "100%",
  paddingTop: "140%",
  borderRadius: theme.spacing(2),
  overflow: "hidden",
  backgroundColor: theme.palette.action.hover,
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 20px 40px rgba(0,0,0,0.6)"
      : "0 20px 40px rgba(0,0,0,0.1)",
}));

const BuyCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  position: "sticky",
  top: theme.spacing(12),
  backgroundImage: "none",
}));

const ReviewPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: theme.spacing(2),
  backgroundColor: alpha(theme.palette.background.paper, 0.6),
  border: `1px solid ${theme.palette.divider}`,
  transition: "transform 0.2s",
  "&:hover": { transform: "translateX(4px)" },
}));

const StyledInput = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    backgroundColor: alpha(theme.palette.common.black, 0.03),
    borderRadius: theme.shape.borderRadius,
  },
}));

const styles: Record<string, SxProps<Theme>> = {
  priceBox: {
    p: 2,
    borderRadius: 2,
    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
    display: "flex",
    flexDirection: "column",
    gap: 0.5,
  },
  balanceTag: {
    display: "flex",
    alignItems: "center",
    gap: 1,
    mt: 1,
    color: "text.secondary",
    fontSize: "0.85rem",
  },
};

const BookDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();

  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [promoCode, setPromoCode] = useState("");
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState<number | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState<number | null>(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<number | null>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"cart" | "status">("cart");
  const [modalState, setModalState] = useState<"success" | "error">("success");
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const loadInitialData = useCallback(async () => {
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
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

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
      setPromoError(error.message);
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleBuyNow = async () => {
    if (!book || !hasEnoughFunds) return;
    setIsPurchasing(true);
    try {
      const orderData = await orderService.buyNow(
        book.id,
        quantity,
        fullName,
        shippingAddress,
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
    if (!id || !newComment.trim() || !rating) return;
    setIsSubmittingReview(true);
    try {
      await reviewService.addReview({
        bookId: Number(id),
        rating,
        comment: newComment,
      });
      setNewComment("");
      const updated = await reviewService.fetchReviewsByBookId(Number(id));
      setReviews(updated);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading && !book) {
    return (
      <PageWrapper>
        <Header
          isMenuOpen={isMenuOpen}
          onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
        />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "80vh",
          }}
        >
          <CircularProgress />
        </Box>
      </PageWrapper>
    );
  }

  if (!book) return <Typography>Book not found.</Typography>;

  return (
    <PageWrapper>
      <Header
        isMenuOpen={isMenuOpen}
        onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
      />

      <Container maxWidth="lg" sx={{ mt: { xs: 4, md: 8 } }}>
        <Grid container spacing={{ xs: 4, md: 8 }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <ImagePaper elevation={0}>
              {book.coverImageUrl ? (
                <img
                  src={book.coverImageUrl}
                  alt={book.title}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "text.disabled",
                  }}
                >
                  <Typography variant="h6">No Cover</Typography>
                </Box>
              )}
            </ImagePaper>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }} sx={{ position: "relative" }}>
            <Stack spacing={3}>
              <Box>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <Chip
                    label={book.genre}
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 700 }}
                  />
                  <Chip label={book.ageGroup} variant="outlined" />
                </Stack>
                <Typography
                  variant="h3"
                  component="h1"
                  sx={{ fontWeight: 900, mb: 1, lineHeight: 1.1 }}
                >
                  {book.title}
                </Typography>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ fontStyle: "italic" }}
                >
                  by{" "}
                  {book.authors
                    .map((a) => `${a.firstName} ${a.lastName}`)
                    .join(", ")}
                </Typography>
              </Box>

              <Grid container spacing={2}>
                {[
                  { label: "Year", value: book.publishedYear },
                  { label: "Pages", value: book.pageCount },
                  { label: "Language", value: book.languageCode },
                  {
                    label: "Stock",
                    value:
                      book.stockQuantity > 0 ? book.stockQuantity : "Sold Out",
                    color:
                      book.stockQuantity > 0 ? "success.main" : "error.main",
                  },
                ].map((item, idx) => (
                  <Grid size={{ xs: 3 }} key={idx}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 700, textTransform: "uppercase" }}
                    >
                      {item.label}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 600,
                        color: item.color || "text.primary",
                      }}
                    >
                      {item.value}
                    </Typography>
                  </Grid>
                ))}
              </Grid>

              <Typography
                variant="body1"
                sx={{ color: "text.secondary", lineHeight: 1.7 }}
              >
                {book.description}
              </Typography>

              <BuyCard elevation={0}>
                <Box sx={styles.priceBox}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Typography
                      variant={discountedPrice ? "h6" : "h4"}
                      sx={{
                        fontWeight: 800,
                        textDecoration: discountedPrice
                          ? "line-through"
                          : "none",
                        color: discountedPrice
                          ? "text.disabled"
                          : "primary.main",
                      }}
                    >
                      ${(book.price * quantity).toFixed(2)}
                    </Typography>
                    {discountedPrice && (
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: 900, color: "primary.main" }}
                      >
                        ${discountedPrice.toFixed(2)}
                      </Typography>
                    )}
                  </Stack>

                  {userProfile && (
                    <Box sx={styles.balanceTag}>
                      <WalletIcon fontSize="inherit" />
                      Your Balance:
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color: hasEnoughFunds ? "success.main" : "error.main",
                        }}
                      >
                        ${userProfile.balance.toFixed(2)}
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Stack direction="row" spacing={2} sx={{ mt: 3, mb: 2 }}>
                  <StyledInput
                    type="number"
                    label="Qty"
                    size="small"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, Number(e.target.value)))
                    }
                    sx={{ width: 80 }}
                  />
                  <Box sx={{ flex: 1, display: "flex", gap: 1 }}>
                    <StyledInput
                      fullWidth
                      label="Promo Code"
                      size="small"
                      placeholder="SUMMER2026"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      error={!!promoError}
                      helperText={promoError}
                    />
                    <MuiButton
                      variant="outlined"
                      onClick={handleApplyPromo}
                      disabled={!promoCode.trim() || isValidatingPromo}
                      sx={{ height: 40 }}
                    >
                      {isValidatingPromo ? (
                        <CircularProgress size={20} />
                      ) : (
                        "Apply"
                      )}
                    </MuiButton>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={2}>
                  <MuiButton
                    fullWidth
                    variant="outlined"
                    size="large"
                    startIcon={<CartIcon />}
                    onClick={() =>
                      cartService
                        .addToCart({ bookId: book.id, quantity })
                        .then(() => {
                          setModalType("cart");
                          setIsModalOpen(true);
                        })
                    }
                    sx={{ borderRadius: 2 }}
                  >
                    Add
                  </MuiButton>
                  <MuiButton
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={<BuyIcon />}
                    disabled={
                      isPurchasing ||
                      !hasEnoughFunds ||
                      book.stockQuantity === 0
                    }
                    onClick={handleBuyNow}
                    sx={{ borderRadius: 2 }}
                  >
                    {isPurchasing ? "Processing..." : "Buy Now"}
                  </MuiButton>
                </Stack>
                <Stack direction="row" spacing={2} sx={{ mt: 3, mb: 2 }}>
                  <StyledInput
                    fullWidth
                    label="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                  <StyledInput
                    fullWidth
                    label="Shipping Address"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                  />
                </Stack>
              </BuyCard>
            </Stack>
          </Grid>
        </Grid>

        <Box sx={{ mt: 10 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 4 }}>
            Customer Reviews
          </Typography>

          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 3,
              mb: 6,
              bgcolor: alpha(theme.palette.primary.main, 0.02),
            }}
            elevation={0}
          >
            <form onSubmit={handleSubmitReview}>
              <Stack spacing={2.5}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Your Rating:
                  </Typography>
                  <Rating
                    value={rating}
                    onChange={(_, val) => setRating(val)}
                    size="large"
                  />
                </Stack>
                <StyledInput
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Share your thoughts about this book..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <MuiButton
                  type="submit"
                  variant="contained"
                  startIcon={<ReviewIcon />}
                  disabled={isSubmittingReview || !newComment.trim()}
                  sx={{ alignSelf: "flex-start", px: 4, borderRadius: 2 }}
                >
                  Post Review
                </MuiButton>
              </Stack>
            </form>
          </Paper>

          <Stack spacing={3}>
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <ReviewPaper key={review.id} elevation={0}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    sx={{ mb: 1.5 }}
                  >
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                        {review.userName}
                      </Typography>
                      <Rating value={review.rating} readOnly size="small" />
                    </Box>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </Typography>
                      {((authService.getUserName() &&
                        review.userName === authService.getUserName()) ||
                        authService.getUserRoles() === "ADMIN") && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setReviewToDelete(review.id);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>
                  </Stack>
                  <Typography variant="body1" sx={{ color: "text.secondary" }}>
                    {review.comment}
                  </Typography>
                </ReviewPaper>
              ))
            ) : (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography color="text.secondary">
                  No reviews yet. Be the first to share your experience!
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>
      </Container>

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
          title={modalState === "success" ? "Order Placed!" : "Error"}
          message={
            modalState === "success"
              ? `Order #${lastOrder?.id} has been created successfully.`
              : errorMessage
          }
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </PageWrapper>
  );
};

export default BookDetailsPage;
