import { authService } from './authService';

export interface AddToCartRequest {
  bookId: number;
  quantity: number;
}

export interface CartItem {
  id: number;
  bookId: number;
  bookTitle: string;
  quantity: number;
  price: number;
}

export interface CartResponse {
  id: number;
  items: CartItem[];
  totalPrice: number;
}

const API_CART_URL = '/api/cart';
const API_CART_ITEMS_URL = '/api/cart/items';

export const cartService = {

  addToCart: async (data: AddToCartRequest): Promise<CartItem> => {
    const response = await authService.authorizedFetch(API_CART_ITEMS_URL, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to add item to cart: ${response.status} ${errorText}`);
    }

    return response.json();
  },

  getCartItems: async (): Promise<CartResponse> => {
    const response = await authService.authorizedFetch(API_CART_URL, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch cart');
    }

    return response.json();
  },

  removeFromCart: async (bookInCartId: number): Promise<void> => {

    const response = await authService.authorizedFetch(`${API_CART_ITEMS_URL}/${bookInCartId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to remove item');
    }
  },

  /** 
  updateQuantity: async (bookInCartId: number, newQuantity: number): Promise<void> => {
    const response = await authService.authorizedFetch(`${API_CART_ITEMS_URL}/${bookInCartId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity: newQuantity }),
    });

    if (!response.ok) {
      throw new Error('Failed to update quantity');
    }
  },
  */
  updateQuantity: async (bookInCartId: number, newQuantity: number): Promise<void> => {
    await cartService.removeFromCart(bookInCartId);
    await cartService.addToCart({ bookId: bookInCartId, quantity: newQuantity });
  }

};