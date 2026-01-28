import React, { useEffect, useState, useRef } from "react";
import { cartService, CartResponse } from "../../services/cartService/cartService";
import Button from "../../components/Button/Button";
import Header from "../../components/Header/Header";
import styles from "./CartPage.module.css";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const [cartData, setCartData] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);

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
      alert(
        "Could not update quantity, trying to reload cart and update again."
      );
      loadCart();
    }
  };
  const handleRemove = async (itemInCartId: number) => {
    try {
      await cartService.removeFromCart(itemInCartId);

      if (cartData) {
        setCartData({
          ...cartData,
          items: cartData.items.filter((item) => item.id !== itemInCartId),
        });
      }

      loadCart();
    } catch (error) {
      alert("Could not remove item");
    }
  };

  const changeQuantity = (itemInCartId: number, delta: number) => {
    if (!cartData) return;

    const updatedItems = cartData.items.map((item) => {
      if (item.id === itemInCartId) {
        const nextQty = Math.max(1, item.quantity + delta);

        if (timers.current[itemInCartId]) {
          clearTimeout(timers.current[itemInCartId]);
        }

        timers.current[itemInCartId] = setTimeout(() => {
          performUpdate(itemInCartId, nextQty);
        }, 800);

        return { ...item, quantity: nextQty };
      }
      return item;
    });

    setCartData({ ...cartData, items: updatedItems });
  };

  if (loading && !cartData)
    return <div className={styles.loader}>Loading cart...</div>;

  return (
    <div className={styles.pageWrapper}>
      <Header
      />

      <main className={styles.container}>
        <h1 className={styles.title}>Your Shopping Cart</h1>

        {!cartData || cartData.items.length === 0 ? (
          <div className={styles.emptyMessage}>
            <p>Your cart is empty</p>
            <Button onClick={() => navigate("/")}>Go Shopping</Button>
          </div>
        ) : (
          <div className={styles.cartGrid}>
            <div className={styles.itemsList}>
              {cartData.items.map((item) => (
                <div key={item.id} className={styles.cartItem}>
                  <div className={styles.itemMain}>
                    <h3 className={styles.bookTitle}>{item.bookTitle}</h3>
                    <p className={styles.pricePerOne}>
                      ${item.price.toFixed(2)} / unit
                    </p>
                  </div>

                  <div className={styles.controlsRow}>
                    <div className={styles.quantityStepper}>
                      <div className={styles.quantityStepper}>
                        <Button
                          variant="secondary"
                          className={styles.square}
                          onClick={() => changeQuantity(item.id, -1)}
                        >
                          -
                        </Button>

                        <span className={styles.qtyValue}>{item.quantity}</span>

                        <Button
                          variant="secondary"
                          className={styles.square}
                          onClick={() => changeQuantity(item.id, 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="danger"
                      className="danger"
                      onClick={() => handleRemove(item.id)}
                    >
                      Remove
                    </Button>
                  </div>

                  <div className={styles.itemTotal}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <aside className={styles.summaryCard}>
              <h3>Order Summary</h3>
              <div className={styles.summaryRow}>
                <span>Total Amount:</span>
                <span className={styles.finalPrice}>
                  ${cartData.totalPrice.toFixed(2)}
                </span>
              </div>
              <Button variant="primary" fullWidth size="lg">
                Checkout Now
              </Button>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
};

export default CartPage;
