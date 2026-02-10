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

const CartPage = () => {
  const [cartData, setCartData] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalState, setModalState] = useState<"success" | "error">("success");
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

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
    try {
      const orderData = await orderService.confirmOrder();
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
                <div className={styles.summaryDetails}>
                  <div className={styles.summaryRow}>
                    <span>Subtotal</span>
                    <span>${cartData.totalPrice.toFixed(2)}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Shipping</span>
                    <span className={styles.free}>Free</span>
                  </div>
                  <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                    <span>Total Amount</span>
                    <span className={styles.finalPrice}>
                      ${cartData.totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  onClick={handleCheckout}
                >
                  Confirm Checkout
                </Button>
                <p className={styles.secureNote}>Secure Checkout</p>
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
              "Unable to process order. Please check your balance."
            )
          }
        />
      </main>
    </div>
  );
};

export default CartPage;
