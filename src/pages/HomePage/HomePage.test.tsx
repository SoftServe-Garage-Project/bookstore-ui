import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HomePage from "./HomePage";
import { authService } from "../../services/authService/authService";
import { fetchBooks } from "../../services/bookService/bookService";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../../components/Header/Header", () => {
  return function MockHeader({ onToggleMenu }: any) {
    return (
      <header>
        <button onClick={onToggleMenu}>Toggle Menu</button>
      </header>
    );
  };
});

jest.mock("../../components/SidePanel/SidePanel", () => {
  return function MockSidePanel({
    onTitleSearch,
    onSortChange,
    onClose,
    isOpen,
    onGenreChange,
  }: any) {
    return (
      <aside
        data-testid="side-panel"
        style={{ display: isOpen ? "block" : "none" }}
      >
        <button onClick={onClose}>Close Panel</button>
        <input
          placeholder="Search books..."
          onChange={(e) => onTitleSearch(e.target.value)}
        />
        <select
          data-testid="sort-select"
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="price,asc">Low</option>
          <option value="price,desc">High</option>
        </select>
        <button onClick={() => onGenreChange(undefined)}>Reset Genre</button>
      </aside>
    );
  };
});

jest.mock("../../services/authService/authService");
jest.mock("../../services/bookService/bookService");

const mockBooks = [
  {
    id: 1,
    title: "The Great Gatsby",
    price: 10,
    authors: [{ firstName: "F. Scott", lastName: "Fitzgerald" }],
    description: "Classic novel",
  },
  {
    id: 2,
    title: "1984",
    price: 15,
    authors: [{ firstName: "George", lastName: "Orwell" }],
    description: "Dystopian novel",
  },
];

const mockResponse = {
  content: mockBooks,
  totalPages: 2,
};

describe("HomePage Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authService.getAccessToken as jest.Mock).mockReturnValue("fake-token");
    (fetchBooks as jest.Mock).mockResolvedValue(mockResponse);
  });

  test("перенаправляє на /login, якщо користувач не авторизований", () => {
    (authService.getAccessToken as jest.Mock).mockReturnValue(null);

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  test("відображає лоадер під час завантаження даних", async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument(),
    );
  });

  test("успішно відображає список книг після завантаження", async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    const bookTitle = await screen.findByText("The Great Gatsby");
    expect(bookTitle).toBeInTheDocument();
    expect(screen.getByText("1984")).toBeInTheDocument();
  });

  test("відображає повідомлення про помилку при невдалому запиті", async () => {
    (fetchBooks as jest.Mock).mockRejectedValue(new Error("API Error"));

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    const errorMessage = await screen.findByText("API Error");
    expect(errorMessage).toBeInTheDocument();
  });

  test("updateQueryParams: коректно змінює сторінку (handlePageChange)", async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    const nextButton = await screen.findByText(/Next/i);
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(fetchBooks).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
        }),
      );
    });
  });

  test("updateQueryParams: видаляє параметр з URL, якщо передано undefined", async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    const resetBtn = screen.getByText("Reset Genre");
    fireEvent.click(resetBtn);

    await waitFor(() => {
      expect(fetchBooks).toHaveBeenCalledWith(
        expect.objectContaining({
          genreName: undefined,
        }),
      );
    });
  });

  
  test("handleTitleSearch: встановлює та видаляє пошуковий запит", async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    const searchInput = screen.getByPlaceholderText("Search books...");

    fireEvent.change(searchInput, { target: { value: "React" } });
    await waitFor(() => {
      expect(fetchBooks).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "React",
          page: 0,
        }),
      );
    });

    fireEvent.change(searchInput, { target: { value: "" } });
    await waitFor(() => {
      expect(fetchBooks).toHaveBeenLastCalledWith(
        expect.objectContaining({
          title: undefined,
          page: 0,
        }),
      );
    });
  });

  test("handleSortChange: змінює сортування та скидає сторінку", async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    const sortSelect = screen.getByTestId("sort-select");
    fireEvent.change(sortSelect, { target: { value: "price,desc" } });

    await waitFor(() => {
      expect(fetchBooks).toHaveBeenCalledWith(
        expect.objectContaining({
          sort: "price,desc",
          page: 0,
        }),
      );
    });
  });
  test("відкриває та закриває бокове меню", async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    const sidePanel = screen.getByTestId("side-panel");
    expect(sidePanel).not.toBeVisible();
    fireEvent.click(screen.getByText("Toggle Menu"));
    expect(sidePanel).toBeVisible();
    fireEvent.click(screen.getByText("Close Panel"));
    expect(sidePanel).not.toBeVisible();
  });

  test("handleTitleSearch та handleSortChange викликаються з правильними параметрами", async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    const input = screen.getByPlaceholderText("Search books...");
    fireEvent.change(input, { target: { value: "Clean Code" } });

    const select = screen.getByTestId("sort-select");
    fireEvent.change(select, { target: { value: "price,desc" } });

    await waitFor(() => {
      expect(fetchBooks).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Clean Code",
          sort: "price,desc",
          page: 0,
        }),
      );
    });
  });
});
