import React, { useEffect, useState } from "react";
import { orderService } from "../../services/orderService/orderService";
import Button from "../../components/Button/Button";
import Header from "../../components/Header/Header";
import styles from "./OrdersPage.module.css";
import { useNavigate } from "react-router-dom";

interface OrderItem {
  bookId: number;
  bookTitle: string;
  quantity: number;
  originalPrice: number;
  finalPrice: number;
  bookDiscountPercentage: number;
}

interface Order {
  id: number;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  items: OrderItem[];
}

interface PaginatedOrders {
  content: Order[];
  totalPages: number;
  totalElements: number;
  number: number;
}
const OrdersPage = () => {
  const [ordersData, setOrdersData] = useState<PaginatedOrders | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigate = useNavigate();

  const loadOrders = async (page: number = 0) => {
    try {
      setLoading(true);
      const data = await orderService.getOrders(page);
      setOrdersData(data);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(0);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "PAID":
        return styles.statusPaid;
      case "PENDING":
        return styles.statusPending;
      case "CANCELLED":
        return styles.statusCancelled;
      default:
        return "";
    }
  };

  if (loading && !ordersData) {
    return <div className={styles.loader}>Loading orders...</div>;
  }

  return (
    <div className={styles.pageWrapper}>
      <Header
        isMenuOpen={isMenuOpen}
        onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
      />

      <main className={styles.container}>
        <header className={styles.pageHeader}>
          <h1 className={styles.title}>Order History</h1>
          <p className={styles.subtitle}>
            Manage and track your recent purchases
          </p>
        </header>

        {!ordersData || ordersData.content.length === 0 ? (
          <div className={styles.emptyCard}>
            <div className={styles.emptyIcon}>📦</div>
            <p>You haven't placed any orders yet.</p>
            <Button onClick={() => navigate("/")}>Explore Books</Button>
          </div>
        ) : (
          <section className={styles.ordersGrid}>
            {ordersData.content.map((order) => (
              <article key={order.id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <div className={styles.orderInfo}>
                    <span className={styles.orderNumber}>
                      Order #{order.id}
                    </span>
                    <span className={styles.orderDate}>
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                  <div
                    className={`${styles.statusBadge} ${getStatusClass(order.status)}`}
                  >
                    {order.status}
                  </div>
                </div>

                <div className={styles.orderBody}>
                  <div className={styles.itemsList}>
                    {order.items.map((item) => (
                      <div key={item.bookId} className={styles.itemRow}>
                        <div className={styles.itemDetails}>
                          <span className={styles.bookTitle}>
                            {item.bookTitle}
                          </span>
                          <span className={styles.itemQty}>
                            ×{item.quantity}
                          </span>
                        </div>
                        <span className={styles.itemPrice}>
                          ${item.finalPrice.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.orderFooter}>
                  <div className={styles.paymentInfo}>
                    <span className={styles.label}>Payment</span>
                    <span className={styles.value}>{order.paymentMethod}</span>
                  </div>
                  <div className={styles.totalSection}>
                    <span className={styles.label}>Total Amount</span>
                    <span className={styles.totalAmount}>
                      ${order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </article>
            ))}

            {ordersData.totalPages > 1 && (
              <nav className={styles.pagination}>
                <Button
                  disabled={ordersData.number === 0}
                  onClick={() => loadOrders(ordersData.number - 1)}
                  variant="secondary"
                >
                  Previous
                </Button>
                <span className={styles.pageIndicator}>
                  {ordersData.number + 1} / {ordersData.totalPages}
                </span>
                <Button
                  disabled={ordersData.number + 1 >= ordersData.totalPages}
                  onClick={() => loadOrders(ordersData.number + 1)}
                  variant="secondary"
                >
                  Next
                </Button>
              </nav>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default OrdersPage;
