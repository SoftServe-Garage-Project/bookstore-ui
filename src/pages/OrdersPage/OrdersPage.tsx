import React, { useEffect, useState } from "react";
import { orderService } from "../../services/orderService/orderService";
import { authService } from "../../services/authService/authService";
import Button from "../../components/Button/Button";
import Header from "../../components/Header/Header";
import styles from "./OrdersPage.module.css";
import { useNavigate } from "react-router-dom";

import packageIcon from "../../assets/icons/package.svg";
import Pagination from "../../components/Pagination/Pagination";
import CustomSelect from "../../components/CustomSelect/CustomSelect";

interface OrderItem {
  bookId: number;
  bookTitle: string;
  quantity: number;
  finalPrice: number;
}

interface Order {
  id: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
  paymentMethod: string;
  totalAmount: number;
}

interface PaginatedOrders {
  content: Order[];
  number: number;
  totalPages: number;
}

const ORDER_STATUSES = [
  "PENDING",
  "PAID",
  "IN_PROGRESS",
  "SHIPPED",
  "DELIVERED",
  "CANCELED",
  "RETURNED",
];

const STATUS_CONFIG: Record<
  string,
  { color: string; background: string; icon?: string }
> = {
  PAID: {
    color: "#10b981",
    background: "rgba(16,185,129,0.15)",
  },
  PENDING: {
    color: "#f59e0b",
    background: "rgba(245,158,11,0.15)",
  },
  IN_PROGRESS: {
    color: "#06b6d4",
    background: "rgba(6,182,212,0.15)",
  },
  SHIPPED: {
    color: "#3b82f6",
    background: "rgba(59,130,246,0.15)",
  },
  DELIVERED: {
    color: "#22c55e",
    background: "rgba(34,197,94,0.15)",
  },
  CANCELED: {
    color: "#ef4444",
    background: "rgba(239,68,68,0.15)",
  },
  RETURNED: {
    color: "#a855f7",
    background: "rgba(168,85,247,0.15)",
  },
};

const OrdersPage = () => {
  const [ordersData, setOrdersData] = useState<PaginatedOrders | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAdmin = authService.getUserRoles() === "ROLE_ADMIN";

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

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      setOrdersData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          content: prev.content.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          ),
        };
      });
    } catch (error) {
      alert("Failed to update status");
    }
  };

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
      case "DELIVERED":
        return styles.statusPaid;
      case "PENDING":
      case "IN_PROGRESS":
        return styles.statusPending;
      case "CANCELED":
      case "RETURNED":
        return styles.statusCancelled;
      default:
        return "";
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Header
        isMenuOpen={isMenuOpen}
        onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
      />

      <main className={styles.container}>
        <header className={styles.pageHeader}>
          <h1 className={styles.title}>
            {isAdmin ? "Order Management" : "Order History"}
          </h1>
          <p className={styles.subtitle}>
            {isAdmin
              ? "Admin view: update and track all system orders"
              : "Manage and track your recent purchases"}
          </p>
        </header>

        {loading ? (
          <div className={styles.loader}>Loading orders...</div>
        ) : !ordersData || ordersData.content.length === 0 ? (
          <div className={styles.emptyCard}>
            <img
              className={styles.emptyIcon}
              src={packageIcon}
              alt="No orders"
            />
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

                  {isAdmin ? (
                    <div
                      className={`${styles.statusSelectWrapper} ${getStatusClass(order.status)}`}
                    >
                      <CustomSelect
                        value={order.status}
                        options={ORDER_STATUSES.map((status) => {
                          const statusConfig = STATUS_CONFIG[status];
                          return {
                            value: status,
                            label: status,
                            color: statusConfig.color,
                            background: statusConfig.background,
                            icon: (
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  fontSize: "0.95rem",
                                  filter:
                                    "drop-shadow(0 1px 2px rgba(0,0,0,0.1))",
                                }}
                              >
                                {statusConfig.icon}
                              </span>
                            ),
                          };
                        })}
                        onChange={(value) =>
                          handleStatusChange(order.id, value)
                        }
                      />
                    </div>
                  ) : (
                    <div
                      className={styles.statusBadge}
                      style={{
                        backgroundColor:
                          STATUS_CONFIG[order.status]?.background,
                        color: STATUS_CONFIG[order.status]?.color,
                        borderColor: STATUS_CONFIG[order.status]?.color + "4D",
                      }}
                    >
                      <span className={styles.statusIcon}>
                        {STATUS_CONFIG[order.status]?.icon}
                      </span>
                      {order.status.replace("_", " ")}
                    </div>
                  )}
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

            <Pagination
              currentPage={ordersData.number}
              totalPages={ordersData.totalPages}
              onPageChange={(page) => loadOrders(page)}
              loading={loading}
            />
          </section>
        )}
      </main>
    </div>
  );
};

export default OrdersPage;
