import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  TextField,
  Button as MuiButton,
  IconButton,
  Divider,
  CircularProgress,
  Stack,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  DeleteOutline as DeleteIcon,
  ShoppingBagOutlined as BagIcon,
  AccountBalanceWalletOutlined as WalletIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

import { cartService, CartResponse } from "../../services/cartService/cartService";
import { Order, orderService } from "../../services/orderService/orderService";
import { promoCodeService } from "../../services/promoCodeService/promoCodeService";
import { authService, UserProfile } from "../../services/authService/authService";

import Header from "../../components/Header/Header";
import { StatusModal, ModalType } from "../../components/StatusModal/StatusModal";


const PageWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  minHeight: "100vh",
  paddingBottom: theme.spacing(8),
}));

const SummaryCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  position: "sticky",
  top: theme.spacing(4),
  borderRadius: `${(theme.shape.borderRadius as number) * 2}px`,
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
}));

const ItemCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: `${(theme.shape.borderRadius as number) * 1.5}px`,
  transition: "transform 0.2s",
  "&:hover": {
    transform: "translateY(-2px)",
  },
}));

const CartPage = () => {
  const navigate = useNavigate();
  const timers = useRef<{ [key: number]: NodeJS.Timeout }>({});

  const [cartData, setCartData] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [discountedTotal, setDiscountedTotal] = useState<number | null>(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>("success");
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [cart, profile] = await Promise.all([
        cartService.getCartItems(),
        authService.getUserBallance(),
      ]);
      setCartData(cart);
      setUserProfile(profile);
    } catch (error) {
      console.error("Data loading failed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleUpdateQuantity = async (itemId: number, newQty: number) => {
    try {
      await cartService.updateQuantity(itemId, newQty);
      const data = await cartService.getCartItems();
      setCartData(data);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const changeQuantity = (itemId: number, delta: number) => {
    if (!cartData) return;

    const updatedItems = cartData.items.map((item) => {
      if (item.id === itemId) {
        const nextQty = Math.max(1, item.quantity + delta);
        if (timers.current[itemId]) clearTimeout(timers.current[itemId]);
        timers.current[itemId] = setTimeout(() => {
          handleUpdateQuantity(itemId, nextQty);
        }, 800);
        return { ...item, quantity: nextQty };
      }
      return item;
    });
    setCartData({ ...cartData, items: updatedItems });
  };

  const handleRemove = async (itemId: number) => {
    try {
      await cartService.removeFromCart(itemId);
      const data = await cartService.getCartItems();
      setCartData(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim() || !cartData) return;
    try {
      setPromoError("");
      const data = await promoCodeService.validatePromo(promoCode.trim(), cartData.totalPrice);
      if (data.valid && data.finalAmount !== undefined) {
        setDiscountedTotal(data.finalAmount);
      } else {
        setPromoError(data.message || "Invalid promo code");
        setDiscountedTotal(null);
      }
    } catch (err: any) {
      setPromoError(err.message || "Validation error");
    }
  };

  const handleCheckout = async () => {
    if (!fullName || !address) {
      setModalType("error");
      setIsModalOpen(true);
      return;
    }

    try {
      const orderData = await orderService.confirmOrder(fullName, address, promoCode.trim() || undefined);
      setLastOrder(orderData);
      setModalType(orderData.status === "PAID" ? "success" : "error");
      if (orderData.status === "PAID") setCartData(null);
      setIsModalOpen(true);
    } catch (error) {
      setModalType("error");
      setIsModalOpen(true);
    }
  };

  const finalPrice = discountedTotal ?? cartData?.totalPrice ?? 0;
  const isBalanceLow = userProfile ? userProfile.balance < finalPrice : false;

  return (
    <PageWrapper>
      <Header isMenuOpen={isMenuOpen} onToggleMenu={() => setIsMenuOpen(!isMenuOpen)} />
      
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <BagIcon fontSize="large" color="primary" /> Shopping Cart
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress size={60} />
          </Box>
        ) : !cartData || cartData.items.length === 0 ? (
          <Paper sx={{ textAlign: "center", py: 8, px: 2, borderRadius: 4 }}>
            <BagIcon sx={{ fontSize: 80, color: "text.secondary", mb: 2, opacity: 0.2 }} />
            <Typography variant="h5" gutterBottom>Your cart is empty</Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>Time to add some great books!</Typography>
            <MuiButton variant="contained" size="large" onClick={() => navigate("/")} sx={{ px: 4, py: 1.5, borderRadius: 3 }}>
              Browse Collection
            </MuiButton>
          </Paper>
        ) : (
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
                {cartData.items.length} items in your bag
              </Typography>
              
              {cartData.items.map((item) => (
                <ItemCard key={item.id} elevation={0} variant="outlined">
                  <Grid container alignItems="center" spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="h6" fontWeight={700}>{item.bookTitle}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        ${item.price.toFixed(2)} per unit
                      </Typography>
                      <MuiButton 
                        startIcon={<DeleteIcon />} 
                        color="error" 
                        size="small" 
                        onClick={() => handleRemove(item.id)}
                        sx={{ mt: 1, textTransform: 'none' }}
                      >
                        Remove
                      </MuiButton>
                    </Grid>
                    
                    <Grid size={{ xs: 6, sm: 3 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <IconButton size="small" onClick={() => changeQuantity(item.id, -1)} sx={{ border: '1px solid #ddd' }}>
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <Typography fontWeight={700} sx={{ minWidth: 20, textAlign: 'center' }}>
                          {item.quantity}
                        </Typography>
                        <IconButton size="small" onClick={() => changeQuantity(item.id, 1)} sx={{ border: '1px solid #ddd' }}>
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Grid>
                    
                    <Grid size={{ xs: 6, sm: 3 }} sx={{ textAlign: "right" }}>
                      <Typography variant="h6" fontWeight={800} color="primary.main">
                        ${(item.price * item.quantity).toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                </ItemCard>
              ))}
            </Grid>

            <Grid size={{ xs: 12, md: 5 }} sx={{ position: "sticky", top: 20 }}>
              <SummaryCard elevation={0}>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Order Summary</Typography>
                
                <Stack spacing={2.5}>
                  <Typography variant="overline" color="text.secondary">Shipping Details</Typography>
                  <TextField
                    fullWidth
                    label="Full Name"
                    variant="outlined"
                    size="small"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Shipping Address"
                    variant="outlined"
                    size="small"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />

                  <Divider sx={{ my: 1 }} />

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      label="Promo Code"
                      size="small"
                      value={promoCode}
                      error={!!promoError}
                      helperText={promoError}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                    <MuiButton 
                      variant="outlined" 
                      onClick={handleApplyPromo}
                      disabled={!promoCode.trim()}
                      sx={{ height: 40 }}
                    >
                      Apply
                    </MuiButton>
                  </Box>

                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">Subtotal</Typography>
                      <Typography fontWeight={600} sx={{ textDecoration: discountedTotal ? 'line-through' : 'none', opacity: discountedTotal ? 0.5 : 1 }}>
                        ${cartData.totalPrice.toFixed(2)}
                      </Typography>
                    </Box>
                    
                    {discountedTotal && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography color="success.main">Promo Discount</Typography>
                        <Typography color="success.main" fontWeight={600}>
                          -${(cartData.totalPrice - discountedTotal).toFixed(2)}
                        </Typography>
                      </Box>
                    )}
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">Shipping</Typography>
                      <Typography color="success.main" fontWeight={600}>Free</Typography>
                    </Box>

                    <Divider sx={{ my: 1 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" fontWeight={700}>Total</Typography>
                      <Typography variant="h5" fontWeight={800} color="primary.main">
                        ${finalPrice.toFixed(2)}
                      </Typography>
                    </Box>
                  </Stack>

                  {userProfile && (
                    <Alert 
                      severity={isBalanceLow ? "error" : "info"} 
                      icon={<WalletIcon />}
                      sx={{ borderRadius: 2 }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <span>Your Balance:</span>
                        <strong>${userProfile.balance.toFixed(2)}</strong>
                      </Box>
                      {isBalanceLow && <Typography variant="caption">Insufficient funds to place order</Typography>}
                    </Alert>
                  )}

                  <MuiButton
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleCheckout}
                    disabled={isBalanceLow || !fullName || !address}
                    sx={{ py: 1.5, borderRadius: 3, fontWeight: 700, fontSize: '1.1rem' }}
                  >
                    Confirm Checkout
                  </MuiButton>
                </Stack>
              </SummaryCard>
            </Grid>
          </Grid>
        )}

        <StatusModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            if (modalType === "success") navigate("/orders");
          }}
          type={modalType}
          title={modalType === "success" ? "Order Placed Successfully!" : "Order Failed"}
          message={
            modalType === "success" && lastOrder ? (
              <Stack spacing={1}>
                <Typography>Order <b>#{lastOrder.id}</b> is now processing.</Typography>
                <Typography variant="h6" color="primary">Total Paid: ${lastOrder.totalAmount.toFixed(2)}</Typography>
              </Stack>
            ) : !fullName || !address ? (
              "Please fill in your name and delivery address."
            ) : (
              "Something went wrong. Please check your balance or try again later."
            )
          }
          buttonText={modalType === "success" ? "View My Orders" : "Close"}
        />
      </Container>
    </PageWrapper>
  );
};

export default CartPage;