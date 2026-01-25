import { cartService, AddToCartRequest } from './cartService';
import { authService } from './../authService/authService';

jest.mock('./../authService/authService', () => ({
  authService: {
    authorizedFetch: jest.fn(),
  },
}));

describe('cartService', () => {
  const mockCartItem = {
    id: 101,
    bookId: 1,
    bookTitle: 'Clean Code',
    quantity: 2,
    price: 500,
  };

  const mockCartResponse = {
    id: 1,
    items: [mockCartItem],
    totalPrice: 1000,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addToCart()', () => {
    const requestData: AddToCartRequest = { bookId: 1, quantity: 2 };

    it('повинен успішно додати товар і повернути CartItem', async () => {
      (authService.authorizedFetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCartItem,
      });

      const result = await cartService.addToCart(requestData);

      expect(authService.authorizedFetch).toHaveBeenCalledWith('/api/cart/items', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });
      expect(result).toEqual(mockCartItem);
    });

    it('повинен викидати помилку з текстом від сервера при невдачі', async () => {
      (authService.authorizedFetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Недостатньо товару на складі',
      });

      await expect(cartService.addToCart(requestData))
        .rejects.toThrow('Failed to add item to cart: 400 Недостатньо товару на складі');
    });
  });

  describe('getCartItems()', () => {
    it('повинен повертати вміст кошика', async () => {
      (authService.authorizedFetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCartResponse,
      });

      const result = await cartService.getCartItems();

      expect(authService.authorizedFetch).toHaveBeenCalledWith('/api/cart', {
        method: 'GET',
      });
      expect(result).toEqual(mockCartResponse);
    });

    it('повинен викидати помилку, якщо кошик не вдалося отримати', async () => {
      (authService.authorizedFetch as jest.Mock).mockResolvedValueOnce({ ok: false });

      await expect(cartService.getCartItems()).rejects.toThrow('Failed to fetch cart');
    });
  });

  describe('removeFromCart()', () => {
    it('повинен відправити DELETE запит для видалення товару', async () => {
      (authService.authorizedFetch as jest.Mock).mockResolvedValueOnce({ ok: true });

      await cartService.removeFromCart(101);

      expect(authService.authorizedFetch).toHaveBeenCalledWith('/api/cart/items/101', {
        method: 'DELETE',
      });
    });

    it('повинен викидати помилку при невдалому видаленні', async () => {
      (authService.authorizedFetch as jest.Mock).mockResolvedValueOnce({ ok: false });

      await expect(cartService.removeFromCart(101)).rejects.toThrow('Failed to remove item');
    });
  });

  describe('updateQuantity()', () => {
    it('повинен спочатку видалити товар, а потім додати з новою кількістю', async () => {
      const removeSpy = jest.spyOn(cartService, 'removeFromCart').mockResolvedValue(undefined);
      const addSpy = jest.spyOn(cartService, 'addToCart').mockResolvedValue(mockCartItem);

      await cartService.updateQuantity(101, 5);

      expect(removeSpy).toHaveBeenCalledWith(101);
      expect(addSpy).toHaveBeenCalledWith({ bookId: 101, quantity: 5 });

      removeSpy.mockRestore();
      addSpy.mockRestore();
    });

    it('повинен зупинитися, якщо removeFromCart впав з помилкою', async () => {
      jest.spyOn(cartService, 'removeFromCart').mockRejectedValue(new Error('Remove error'));
      const addSpy = jest.spyOn(cartService, 'addToCart');

      await expect(cartService.updateQuantity(101, 5)).rejects.toThrow('Remove error');
      expect(addSpy).not.toHaveBeenCalled();
    });
  });
});