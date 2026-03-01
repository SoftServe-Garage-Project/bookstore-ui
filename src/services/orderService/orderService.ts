import { authService } from "./../authService/authService";

export interface OrderItem {
  bookId: number;
  bookTitle: string;
  quantity: number;
  originalPrice: number;
  finalPrice: number;
  bookDiscountPercentage: number;
}

export interface Order {
  id: number;
  totalAmount: number;
  status: "PENDING" | "PAID" | "CANCELLED" | "DELIVERED" | string;
  paymentMethod: "BALANCE" | "CARD" | string;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderPageResponse {
  content: Order[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  last: boolean;
  first: boolean;
  empty: boolean;
}

const API_ORDERS_URL = "/api/orders";

export const orderService = {
  getOrders: async (
    page: number = 0,
    size: number = 10
  ): Promise<OrderPageResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort: "createdAt,desc",
    });

    const response = await authService.authorizedFetch(
      `${API_ORDERS_URL}?${params.toString()}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch orders: ${response.status} ${errorText}`
      );
    }

    return response.json();
  },

  confirmOrder: async (promoCode?: string): Promise<Order> => {
    const response = await authService.authorizedFetch(
      `${API_ORDERS_URL}/checkout`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: promoCode ? JSON.stringify({ promoCode }) : JSON.stringify({}),
      }
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Error while confirming an order" }));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    return response.json();
  },

  buyNow: async (
    bookId: number,
    quantity: number,
    shippingAddress: string,
    fullName: string,
    promoCode?: string
  ): Promise<Order> => {
    const body: any = { bookId, quantity, shippingAddress, fullName };
    if (promoCode) body.promoCode = promoCode;

    const response = await authService.authorizedFetch(
      `${API_ORDERS_URL}/buy-now`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const contentType = response.headers.get("content-type");
    let responseData;

    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = { message: await response.text() };
    }

    if (!response.ok) {
      throw new Error(
        responseData.message || responseData.error || "Quick purchase failed"
      );
    }

    return responseData;
  },
};
