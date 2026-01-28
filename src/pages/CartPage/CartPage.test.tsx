import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CartPage from "./CartPage";
import {
  cartService,
  CartResponse,
} from "../../services/cartService/cartService";

jest.mock("../../services/cartService/cartService", () => ({
  cartService: {
    getCartItems: jest.fn(),
    removeFromCart: jest.fn(),
    updateQuantity: jest.fn(),
    addToCart: jest.fn(),
  },
}));

const mockedCartService = cartService as jest.Mocked<typeof cartService>;

const mockedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

const mockCartData: CartResponse = {
  id: 100,
  totalPrice: 90.0,
  items: [
    { id: 1, bookId: 10, bookTitle: "Clean Code", price: 50.0, quantity: 1 },
    { id: 2, bookId: 20, bookTitle: "Refactoring", price: 40.0, quantity: 1 },
  ],
};

describe("Кошик", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockedCartService.getCartItems.mockResolvedValue(mockCartData);
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it("повинен відображати елементи та загальну ціну правильно після завантаження", async () => {
    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Loading cart.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Clean Code")).toBeInTheDocument();
      expect(screen.getByText("$90.00")).toBeInTheDocument();
      expect(screen.getByText("$50.00 / unit")).toBeInTheDocument();
    });
  });

  it("повинен видалити елемент зі списку при кліку на 'Remove'", async () => {
    mockedCartService.getCartItems
      .mockResolvedValueOnce(mockCartData)
      .mockResolvedValueOnce({
        ...mockCartData,
        items: [mockCartData.items[1]],
        totalPrice: 40,
      });

    mockedCartService.removeFromCart.mockResolvedValueOnce(undefined);

    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(screen.getByText("Clean Code")).toBeInTheDocument(),
    );

    const removeButtons = screen.getAllByRole("button", { name: /Remove/i });
    fireEvent.click(removeButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText("Clean Code")).not.toBeInTheDocument();
    });

    expect(mockedCartService.removeFromCart).toHaveBeenCalledWith(1);
  });

  it("повинен показати помилку в консолі при помилці завантаження кошика", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const testError = new Error("Fetch failed");
    mockedCartService.getCartItems.mockRejectedValueOnce(testError);

    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByText(/Loading cart.../i)).not.toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalledWith("Failed to load cart:", testError);

    expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it("повинен викликати updateQuantity з затримкою 800мс", async () => {
    mockedCartService.updateQuantity.mockResolvedValueOnce(undefined);

    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(screen.getByText("Clean Code")).toBeInTheDocument(),
    );

    const plusButton = screen.getAllByText("+")[0];

    fireEvent.click(plusButton);
    fireEvent.click(plusButton);

    expect(mockedCartService.updateQuantity).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(800);
    });

    await waitFor(() => {
      expect(mockedCartService.updateQuantity).toHaveBeenCalledWith(1, 3);
      expect(mockedCartService.getCartItems).toHaveBeenCalledTimes(2);
    });
  });

  it("повинен показати помилку та сповіщення при помилці оновлення", async () => {
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
    mockedCartService.updateQuantity.mockRejectedValueOnce(
      new Error("Network Error"),
    );

    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(screen.getByText("Clean Code")).toBeInTheDocument(),
    );

    const plusButton = screen.getAllByText("+")[0];
    fireEvent.click(plusButton);

    act(() => {
      jest.advanceTimersByTime(800);
    });

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        expect.stringContaining("Could not update quantity"),
      );
      expect(mockedCartService.getCartItems).toHaveBeenCalledTimes(2);
    });

    alertSpy.mockRestore();
  });

  it("повинен показати пустий стан і перейти до покупок", async () => {
    mockedCartService.getCartItems.mockResolvedValueOnce({
      id: 1,
      items: [],
      totalPrice: 0,
    });

    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument();
    });

    const shopBtn = screen.getByRole("button", { name: /Go Shopping/i });
    fireEvent.click(shopBtn);

    expect(mockedNavigate).toHaveBeenCalledWith("/");
  });

  it("повинен показати помилку при видаленні елемента", async () => {
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

    mockedCartService.getCartItems.mockResolvedValue(mockCartData);
    mockedCartService.removeFromCart.mockRejectedValueOnce(
      new Error("Delete failed"),
    );

    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>,
    );

    await screen.findByText("Clean Code");
    const removeBtn = screen.getAllByRole("button", { name: /Remove/i })[0];
    fireEvent.click(removeBtn);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Could not remove item");
    });

    alertSpy.mockRestore();
  });
  
  

  it("повинен виконати зменшення кількості при кліку на кнопку '-'", async () => {
    const customData = {
      ...mockCartData,
      items: [
        { id: 1, bookId: 10, bookTitle: "Clean Code", price: 50, quantity: 5 },
      ],
    };
    mockedCartService.getCartItems.mockResolvedValue(customData);
    mockedCartService.updateQuantity.mockResolvedValue(undefined as any);

    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>,
    );

    await screen.findByText("Clean Code");

    const minusBtn = screen.getByText("-");
    fireEvent.click(minusBtn);

    act(() => {
      jest.advanceTimersByTime(800);
    });

    await waitFor(() => {
      expect(mockedCartService.updateQuantity).toHaveBeenCalledWith(1, 4);
    });
  });
  
});
