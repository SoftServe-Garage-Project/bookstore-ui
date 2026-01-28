import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, useNavigate, useParams } from "react-router-dom";
import BookDetailsPage from "./BookDetailsPage";
import { fetchBookById } from "../../services/bookService/bookService";
import { cartService } from "../../services/cartService/cartService";

jest.mock("../../services/bookService/bookService");
jest.mock("../../services/cartService/cartService");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

const mockBook = {
  id: 1,
  title: "Test Book",
  genre: "Fantasy",
  ageGroup: "12+",
  authors: [{ firstName: "John", lastName: "Doe" }],
  price: 29.99,
  discountPercentage: 10,
  publishedYear: 2023,
  pageCount: 350,
  languageCode: "EN",
  stockQuantity: 5,
  description: "A great test book description",
  coverImageUrl: "test-image.jpg",
};

describe("BookDetailsPage", () => {
  const mockedNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useParams as jest.Mock).mockReturnValue({ id: "1" });
    (useNavigate as jest.Mock).mockReturnValue(mockedNavigate);
  });

  it("отображает лоадер при загрузке", () => {
    (fetchBookById as jest.Mock).mockReturnValue(new Promise(() => {})); // Вечный промис
    render(
      <MemoryRouter>
        <BookDetailsPage />
      </MemoryRouter>,
    );
    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
  });

  it("отображает ошибку, если книга не найдена", async () => {
    (fetchBookById as jest.Mock).mockResolvedValue(null);
    render(
      <MemoryRouter>
        <BookDetailsPage />
      </MemoryRouter>,
    );

    const errorMessage = await screen.findByText(/book not found/i);
    expect(errorMessage).toBeInTheDocument();
  });

  it("отображает детали книги после успешной загрузки", async () => {
    (fetchBookById as jest.Mock).mockResolvedValue(mockBook);

    render(
      <MemoryRouter>
        <BookDetailsPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Test Book")).toBeInTheDocument();
    expect(screen.getByText("by John Doe")).toBeInTheDocument();
    expect(screen.getByText("$29.99")).toBeInTheDocument();
    expect(
      screen.getByText("A great test book description"),
    ).toBeInTheDocument();
    const stockElement = screen.getByText((content, element) => {
      const hasText = (node: Element | null) =>
        node?.textContent === "In stock: 5";
      const nodeHasText = hasText(element);
      const childrenDontHaveText = Array.from(element?.children || []).every(
        (child) => !hasText(child as Element),
      );

      return nodeHasText && childrenDontHaveText;
    });
    expect(stockElement).toBeInTheDocument();
  });

  it("возвращается назад при клике на кнопку Back", async () => {
    (fetchBookById as jest.Mock).mockResolvedValue(mockBook);
    render(
      <MemoryRouter>
        <BookDetailsPage />
      </MemoryRouter>,
    );

    const backBtn = await screen.findByText(/Back to Catalog/i);
    fireEvent.click(backBtn);
    expect(mockedNavigate).toHaveBeenCalledWith(-1);
  });

  it("меняет количество товара", async () => {
    (fetchBookById as jest.Mock).mockResolvedValue(mockBook);
    render(
      <MemoryRouter>
        <BookDetailsPage />
      </MemoryRouter>,
    );

    const input = (await screen.findByLabelText(
      /quantity:/i,
    )) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "3" } });
    expect(input.value).toBe("3");
  });

  it('вызывает cartService и открывает модалку при добавлении в корзину', async () => {
  (fetchBookById as jest.Mock).mockResolvedValue(mockBook);
  jest.spyOn(cartService, 'addToCart').mockResolvedValue({} as any);

  render(<MemoryRouter><BookDetailsPage /></MemoryRouter>);

  const addButton = await screen.findByRole('button', { name: /add to cart/i });
  fireEvent.click(addButton);

  const modalTitle = await screen.findByText(/added to cart/i); 
  expect(modalTitle).toBeInTheDocument();
  
  expect(cartService.addToCart).toHaveBeenCalledWith({
    bookId: mockBook.id,
    quantity: 1
  });
});

  it("блокирует кнопку, если товара нет в наличии", async () => {
    const outOfStockBook = { ...mockBook, stockQuantity: 0 };
    (fetchBookById as jest.Mock).mockResolvedValue(outOfStockBook);

    render(
      <MemoryRouter>
        <BookDetailsPage />
      </MemoryRouter>,
    );

    const addButton = await screen.findByRole("button", {
      name: /add to cart/i,
    });
    expect(addButton).toBeDisabled();
    expect(screen.getByText(/OUT OF STOCK/i)).toBeInTheDocument();
  });

  it("обрабатывает ошибку при добавлении в корзину", async () => {
    (fetchBookById as jest.Mock).mockResolvedValue(mockBook);
    jest
      .spyOn(cartService, "addToCart")
      .mockRejectedValue(new Error("API Error"));
    window.alert = jest.fn();

    render(
      <MemoryRouter>
        <BookDetailsPage />
      </MemoryRouter>,
    );

    const addButton = await screen.findByRole("button", {
      name: /add to cart/i,
    });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        "Error adding to cart. Please try again.",
      );
    });
  });
});
