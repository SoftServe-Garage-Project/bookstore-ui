import { authService } from './../authService/authService';

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
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'DELIVERED' | string;
  paymentMethod: 'BALANCE' | 'CARD' | string;
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

const API_ORDERS_URL = '/api/orders';

export const orderService = {
  getOrders: async (page: number = 0, size: number = 10): Promise<OrderPageResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort: 'createdAt,desc'
    });

    const response = await authService.authorizedFetch(`${API_ORDERS_URL}?${params.toString()}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch orders: ${response.status} ${errorText}`);
    }

    return response.json();
  },

  confirmOrder: async (): Promise<Order> => {
  const response = await authService.authorizedFetch(`${API_ORDERS_URL}/checkout`, {
    method: 'POST',
  });

  return response.json(); 
}
};