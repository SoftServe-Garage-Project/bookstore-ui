import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Chip,
  Divider,
  Grid,
  CircularProgress,
  MenuItem,
  TextField,
  Button as MuiButton,
  alpha,
  Pagination as MuiPagination,
  Fade,
  Avatar,
} from "@mui/material";
import {
  Inventory as PackageIcon,
  Event as CalendarIcon,
  Payment as PaymentIcon,
  Receipt as OrderIcon,
  Circle as CircleIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

import { orderService } from "../../services/orderService/orderService";
import { authService } from "../../services/authService/authService";

import Header from "../../components/Header/Header";


const STATUS_CONFIG: Record<
  string,
  { color: any; label: string; iconColor: string }
> = {
  PAID: { color: "success", label: "Paid", iconColor: "#10b981" },
  PENDING: { color: "warning", label: "Pending", iconColor: "#f59e0b" },
  IN_PROGRESS: { color: "info", label: "In Progress", iconColor: "#3b82f6" },
  SHIPPED: { color: "primary", label: "Shipped", iconColor: "#6366f1" },
  DELIVERED: { color: "success", label: "Delivered", iconColor: "#10b981" },
  CANCELED: { color: "error", label: "Canceled", iconColor: "#ef4444" },
  RETURNED: { color: "secondary", label: "Returned", iconColor: "#6b7280" },
};

const PageWrapper = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  backgroundColor: theme.palette.background.default,
  paddingBottom: theme.spacing(8),
}));

const OrderPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2.5),
  border: `1px solid ${theme.palette.divider}`,
  backgroundImage: "none",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    borderColor: theme.palette.primary.light,
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 12px 32px rgba(0,0,0,0.4)"
        : "0 12px 32px rgba(44, 36, 32, 0.08)",
  },
}));

const SummaryBox = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(2, 3),
  borderRadius: theme.spacing(2),
  backgroundColor: alpha(theme.palette.primary.main, 0.04),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
}));

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


const OrdersPage = () => {
  const [ordersData, setOrdersData] = useState<PaginatedOrders | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const isAdmin = authService.getUserRoles() === "ROLE_ADMIN";

  const loadOrders = useCallback(async (page: number = 0) => {
    try {
      setLoading(true);
      const data = await orderService.getOrders(page);
      setOrdersData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders(0);
  }, [loadOrders]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      setOrdersData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          content: prev.content.map((o) =>
            o.id === orderId ? { ...o, status: newStatus } : o
          ),
        };
      });
    } catch (error) {
      alert("Failed to update status");
    }
  };

  return (
    <PageWrapper>
      <Header
        isMenuOpen={isMenuOpen}
        onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
      />

      <Container maxWidth="lg" sx={{ mt: { xs: 4, md: 6 } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ sm: "flex-end" }}
          sx={{ mb: 6 }}
          spacing={2}
        >
          <Box>
            <Typography
              variant="h3"
              sx={{ fontWeight: 900, mb: 1, letterSpacing: "-0.02em" }}
            >
              {isAdmin ? "Orders Hub" : "My Orders"}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {isAdmin
                ? "Control panel for logistics and fulfillment"
                : "Track and manage your book collection history"}
            </Typography>
          </Box>
          {isAdmin && (
            <Chip
              label="Administrator Mode"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 800, px: 1 }}
            />
          )}
        </Stack>

        {loading && !ordersData ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 15 }}>
            <CircularProgress size={60} thickness={4} />
          </Box>
        ) : !ordersData || ordersData.content.length === 0 ? (
          <Fade in={true}>
            <Paper
              sx={{
                textAlign: "center",
                py: 12,
                borderRadius: 6,
                border: "2px dashed",
                borderColor: "divider",
                bgcolor: "transparent",
              }}
              elevation={0}
            >
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: (theme) => alpha(theme.palette.divider, 0.1),
                  margin: "0 auto 24px",
                }}
              >
                <PackageIcon sx={{ fontSize: 50, color: "text.disabled" }} />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                No orders yet
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Time to fill your library with new stories!
              </Typography>
              <MuiButton
                variant="contained"
                size="large"
                onClick={() => navigate("/")}
                sx={{ borderRadius: 3, px: 6 }}
              >
                Explore Bookstore
              </MuiButton>
            </Paper>
          </Fade>
        ) : (
          <Stack spacing={4}>
            {ordersData.content.map((order, index) => (
              <Fade in={true} timeout={300 + index * 100} key={order.id}>
                <OrderPaper elevation={0}>
                  <Grid
                    container
                    spacing={2}
                    alignItems="center"
                    sx={{ mb: 4 }}
                  >
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          sx={{
                            bgcolor: "primary.main",
                            width: 48,
                            height: 48,
                          }}
                        >
                          <OrderIcon />
                        </Avatar>
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontWeight: 800, textTransform: "uppercase" }}
                          >
                            Order Reference
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 900 }}>
                            #{order.id}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CalendarIcon
                          sx={{ color: "text.disabled", fontSize: 20 }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-US",
                            { month: "long", day: "numeric", year: "numeric" }
                          )}
                        </Typography>
                      </Stack>
                    </Grid>

                    <Grid
                      size={{ xs: 12, md: 4 }}
                      sx={{ textAlign: { md: "right" } }}
                    >
                      {isAdmin ? (
                        <TextField
                          select
                          fullWidth
                          size="small"
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value)
                          }
                          sx={{
                            maxWidth: { md: 200 },
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 3,
                              fontWeight: 700,
                              bgcolor: alpha(
                                STATUS_CONFIG[order.status]?.iconColor ||
                                  "#000",
                                0.05
                              ),
                            },
                          }}
                        >
                          {Object.keys(STATUS_CONFIG).map((status) => (
                            <MenuItem key={status} value={status}>
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1.5}
                              >
                                <CircleIcon
                                  sx={{
                                    fontSize: 10,
                                    color: STATUS_CONFIG[status].iconColor,
                                  }}
                                />
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 600 }}
                                >
                                  {STATUS_CONFIG[status].label}
                                </Typography>
                              </Stack>
                            </MenuItem>
                          ))}
                        </TextField>
                      ) : (
                        <Chip
                          label={
                            STATUS_CONFIG[order.status]?.label || order.status
                          }
                          color={STATUS_CONFIG[order.status]?.color as any}
                          sx={{
                            fontWeight: 800,
                            borderRadius: 2,
                            height: 32,
                            fontSize: "0.75rem",
                            textTransform: "uppercase",
                          }}
                        />
                      )}
                    </Grid>
                  </Grid>

                  <Divider sx={{ borderStyle: "dashed", mb: 3 }} />

                  <Stack spacing={2} sx={{ mb: 4 }}>
                    {order.items.map((item) => (
                      <Box
                        key={item.bookId}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1.5}
                        >
                          <ChevronRightIcon
                            sx={{ color: "primary.main", fontSize: 18 }}
                          />
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {item.bookTitle}
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.secondary"
                              sx={{ ml: 1, fontWeight: 400 }}
                            >
                              × {item.quantity}
                            </Typography>
                          </Typography>
                        </Stack>
                        <Typography variant="body1" sx={{ fontWeight: 800 }}>
                          ${item.finalPrice.toFixed(2)}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>

                  <SummaryBox>
                    <Stack direction="row" spacing={3}>
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            fontWeight: 800,
                            textTransform: "uppercase",
                            display: "block",
                          }}
                        >
                          Payment
                        </Typography>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={0.5}
                        >
                          <PaymentIcon
                            sx={{ fontSize: 14, color: "text.secondary" }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {order.paymentMethod}
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          fontWeight: 800,
                          textTransform: "uppercase",
                          display: "block",
                        }}
                      >
                        Grand Total
                      </Typography>
                      <Typography
                        variant="h4"
                        color="primary"
                        sx={{ fontWeight: 900, lineHeight: 1 }}
                      >
                        ${order.totalAmount.toFixed(2)}
                      </Typography>
                    </Box>
                  </SummaryBox>
                </OrderPaper>
              </Fade>
            ))}
          </Stack>
        )}

        {ordersData && ordersData.totalPages > 1 && (
          <Box sx={{ mt: 8, display: "flex", justifyContent: "center" }}>
            <MuiPagination
              count={ordersData.totalPages}
              page={ordersData.number + 1}
              onChange={(_, page) => loadOrders(page - 1)}
              color="primary"
              size="large"
              sx={{
                "& .MuiPaginationItem-root": {
                  fontWeight: 700,
                  borderRadius: 2,
                },
              }}
            />
          </Box>
        )}
      </Container>
    </PageWrapper>
  );
};

export default OrdersPage;
