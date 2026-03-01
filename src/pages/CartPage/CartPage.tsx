import React, { useEffect, useState, useRef } from "react";
import {
  cartService,
  CartResponse,
} from "../../services/cartService/cartService";
import { Order, orderService } from "../../services/orderService/orderService";
import Button from "../../components/Button/Button";
import Header from "../../components/Header/Header";
import styles from "./CartPage.module.css";
import { useNavigate } from "react-router-dom";
import { StatusModal } from "../../components/StatusModal/StatusModal";
import { promoCodeService } from "../../services/promoCodeService/promoCodeService";
import {
  authService,
  UserProfile,
} from "../../services/authService/authService";

const CartPage = () => {
  const [cartData, setCartData] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalState, setModalState] = useState<"success" | "error">("success");
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [discountedTotal, setDiscountedTotal] = useState<number | null>(null);
  const [promoError, setPromoError] = useState("");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [formError, setFormError] = useState("");

  const navigate = useNavigate();
  const timers = useRef<{ [key: number]: NodeJS.Timeout }>({});

  const loadCart = async () => {
    try {
      const data = await cartService.getCartItems();
      setCartData(data);
    } catch (error) {
      console.error("Failed to load cart:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [cart, profile] = await Promise.all([
        cartService.getCartItems(),
        authService.getUserBallance(),
      ]);
      setCartData(cart);
      setUserProfile(profile);
      if (profile.username) setFullName(profile.username);
    } catch (error) {
      console.error("Data loading failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const performUpdate = async (itemInCartId: number, newQuantity: number) => {
    try {
      await cartService.updateQuantity(itemInCartId, newQuantity);
      await loadCart();
    } catch (error) {
      console.error("Update failed:", error);
      loadCart();
    }
  };

  const handleRemove = async (itemInCartId: number) => {
    try {
      await cartService.removeFromCart(itemInCartId);
      loadCart();
    } catch (error) {
      alert("Could not remove item");
    }
  };

  const handleCheckout = async () => {
    if (!fullName.trim() || !shippingAddress.trim()) {
      setFormError("Please fill in all delivery details (Name and Address)");
      return;
    }

    try {
      setFormError("");
      const orderData = await orderService.confirmOrder(
        fullName.trim(),
        shippingAddress.trim(),
        promoCode.trim() || undefined
      );

      setLastOrder(orderData);
      setModalState(orderData.status === "PAID" ? "success" : "error");
      if (orderData.status === "PAID") setCartData(null);
      setIsModalOpen(true);
    } catch (error) {
      setModalState("error");
      setIsModalOpen(true);
    }
  };

  const changeQuantity = (itemInCartId: number, delta: number) => {
    if (!cartData) return;

    const updatedItems = cartData.items.map((item) => {
      if (item.id === itemInCartId) {
        const nextQty = Math.max(1, item.quantity + delta);
        if (timers.current[itemInCartId])
          clearTimeout(timers.current[itemInCartId]);
        timers.current[itemInCartId] = setTimeout(() => {
          performUpdate(itemInCartId, nextQty);
        }, 800);
        return { ...item, quantity: nextQty };
      }
      return item;
    });

    setCartData({ ...cartData, items: updatedItems });
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim() || !cartData) return;

    try {
      setPromoError("");
      const data = await promoCodeService.validatePromo(
        promoCode.trim(),
        cartData.totalPrice
      );

      if (data.valid && data.finalAmount !== undefined) {
        setDiscountedTotal(data.finalAmount);
      } else {
        setPromoError(data.message || "Promocode invalid");
        setDiscountedTotal(null);
      }
    } catch (error: any) {
      setPromoError(error.message || "Error while validating");
      setDiscountedTotal(null);
    }
  };

  useEffect(() => {
    if (!promoCode) {
      setDiscountedTotal(null);
      setPromoError("");
    }
  }, [promoCode]);

  return (
    <div className={styles.pageWrapper}>
      <Header
        isMenuOpen={isMenuOpen}
        onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
      />

      <main className={styles.container}>
        <header className={styles.pageHeader}>
          <h1 className={styles.title}>Shopping Cart</h1>
          <p className={styles.countInfo}>
            {loading
              ? "Loading..."
              : `${cartData?.items.length || 0} ${cartData?.items.length === 1 ? "item" : "items"} in your bag`}
          </p>
        </header>

        {loading ? (
          <div className={styles.loader}>Loading cart...</div>
        ) : !cartData || cartData.items.length === 0 ? (
          <div className={styles.emptyCard}>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any books yet.</p>
            <Button onClick={() => navigate("/")}>Browse Collection</Button>
          </div>
        ) : (
          <div className={styles.cartGrid}>
            <section className={styles.itemsList}>
              {cartData.items.map((item) => (
                <div key={item.id} className={styles.cartItemCard}>
                  <div className={styles.itemInfo}>
                    <h3 className={styles.bookTitle}>{item.bookTitle}</h3>
                    <p className={styles.pricePerOne}>
                      ${item.price.toFixed(2)} per unit
                    </p>
                    <button
                      className={styles.removeBtn}
                      onClick={() => handleRemove(item.id)}
                    >
                      Remove from cart
                    </button>
                  </div>

                  <div className={styles.itemActions}>
                    <div className={styles.stepperContainer}>
                      <span className={styles.label}>Quantity</span>
                      <div className={styles.quantityStepper}>
                        <button
                          className={styles.stepBtn}
                          onClick={() => changeQuantity(item.id, -1)}
                        >
                          −
                        </button>
                        <span className={styles.qtyValue}>{item.quantity}</span>
                        <button
                          className={styles.stepBtn}
                          onClick={() => changeQuantity(item.id, 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className={styles.priceSection}>
                      <span className={styles.label}>Total</span>
                      <span className={styles.itemTotalPrice}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            <aside className={styles.summarySticky}>
              <div className={styles.summaryCard}>
                <h3 className={styles.summaryTitle}>Order Summary</h3>

                <div className={styles.deliverySection}>
                  <div className={styles.inputGroup}>
                    <input
                      type="text"
                      className={`${styles.promoInput} ${formError && !fullName ? styles.inputError : ""}`}
                      placeholder="Your Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div
                    className={styles.inputGroup}
                    style={{ marginTop: "12px" }}
                  >
                    <textarea
                      className={`${styles.promoInput} ${formError && !shippingAddress ? styles.inputError : ""}`}
                      placeholder="Shipping Address (Street, City...)"
                      rows={2}
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      style={{ resize: "none", width: "100%", padding: "10px" }}
                    />
                  </div>
                  {formError && <p className={styles.errorText}>{formError}</p>}
                </div>

                <hr
                  className={styles.divider}
                  style={{ margin: "20px 0", opacity: 0.1 }}
                />

                <div className={styles.promoSection}>
                  <div className={styles.promoInputWrapper}>
                    <input
                      type="text"
                      className={`${styles.promoInput} ${promoError ? styles.inputError : ""}`}
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                    <button
                      className={styles.applyBtn}
                      onClick={handleApplyPromo}
                      disabled={!promoCode.trim()}
                    >
                      Apply
                    </button>
                  </div>
                  {promoError && (
                    <p className={styles.errorText}>{promoError}</p>
                  )}
                </div>

                <div className={styles.summaryDetails}>
                  <div className={styles.summaryRow}>
                    <span>Subtotal</span>
                    <span
                      className={discountedTotal ? styles.strikethrough : ""}
                    >
                      ${cartData.totalPrice.toFixed(2)}
                    </span>
                  </div>

                  {discountedTotal && (
                    <div
                      className={`${styles.summaryRow} ${styles.discountRow}`}
                    >
                      <span>Promo Discount</span>
                      <span>
                        -${(cartData.totalPrice - discountedTotal).toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className={styles.summaryRow}>
                    <span>Shipping</span>
                    <span className={styles.free}>Free</span>
                  </div>

                  <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                    <span>Total Amount</span>
                    <span className={styles.finalPrice}>
                      ${(discountedTotal ?? cartData.totalPrice).toFixed(2)}
                    </span>
                  </div>

                  {userProfile && (
                    <div className={styles.balanceInfo}>
                      <div className={styles.summaryRow}>
                        <span>Your Balance</span>
                        <span
                          className={
                            userProfile.balance <
                            (discountedTotal ?? cartData.totalPrice)
                              ? styles.lowBalance
                              : styles.okBalance
                          }
                        >
                          ${userProfile.balance.toFixed(2)}
                        </span>
                      </div>
                      {userProfile.balance <
                        (discountedTotal ?? cartData.totalPrice) && (
                        <p className={styles.balanceWarning}>
                          Insufficient funds
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  onClick={handleCheckout}
                  disabled={
                    userProfile
                      ? userProfile.balance <
                        (discountedTotal ?? cartData.totalPrice)
                      : false
                  }
                >
                  Confirm Checkout
                </Button>
              </div>
            </aside>
          </div>
        )}

        <StatusModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            if (modalState === "success") navigate("/orders");
          }}
          type={modalState}
          title={modalState === "success" ? "Order Placed!" : "Error"}
          buttonText={modalState === "success" ? "Go to Orders" : "Try Again"}
          message={
            modalState === "success" && lastOrder ? (
              <div className={styles.modalContent}>
                <p>
                  Order <strong>#{lastOrder.id}</strong> has been successfully
                  processed.
                </p>
                <p className={styles.modalTotal}>
                  Paid: ${lastOrder.totalAmount.toFixed(2)}
                </p>
              </div>
            ) : (
              "Unable to process order. Please check your delivery details and balance."
            )
          }
        />
      </main>
    </div>
  );
};

export default CartPage;
