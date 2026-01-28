import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import SidePanel from "./SidePanel";
import { useGenres } from "../../hooks/useGenres/useGenres";
import styles from "./SidePanel.module.css";

jest.mock("../../hooks/useGenres/useGenres");

const mockProps = {
  selectedGenre: undefined,
  selectedSort: "price,asc",
  onGenreChange: jest.fn(),
  onTitleSearch: jest.fn(),
  onSortChange: jest.fn(),
  isOpen: true,
  onClose: jest.fn(),
};

const mockGenres = [
  { name: "Fantasy", description: "Magic and adventure" },
  { name: "Sci-Fi", description: "Space and future" },
];

describe("SidePanel Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useGenres as jest.Mock).mockReturnValue({
      genres: mockGenres,
      isLoading: false,
      error: null,
    });
  });

  afterEach(cleanup);
  
  test("відображає список жанрів під час успішного завантаження", () => {
    render(<SidePanel {...mockProps} />);
    
    expect(screen.getByText("Fantasy")).toBeInTheDocument();
    expect(screen.getByText("Sci-Fi")).toBeInTheDocument();
    expect(screen.getByText("All Books")).toBeInTheDocument();
  });

  test("відображає індикатор завантаження", () => {
    (useGenres as jest.Mock).mockReturnValue({
      genres: [],
      isLoading: true,
      error: null,
    });

    render(<SidePanel {...mockProps} />);
    expect(screen.getByText(/Loading genres.../i)).toBeInTheDocument();
  });

  test("викликає onSortChange при виборі опції сортування", () => {
    render(<SidePanel {...mockProps} />);
    
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "price,desc" } });

    expect(mockProps.onSortChange).toHaveBeenCalledWith("price,desc");
  });

  test("викликає onGenreChange і onClose при натисканні на жанр", () => {
    render(<SidePanel {...mockProps} />);
    
    const genreItem = screen.getByText("Fantasy");
    fireEvent.click(genreItem);

    expect(mockProps.onGenreChange).toHaveBeenCalledWith("Fantasy");
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  test("скидає жанр при кліку на 'All Books'", () => {
    render(<SidePanel {...mockProps} selectedGenre="Fantasy" />);
    
    const allBooksItem = screen.getByText("All Books");
    fireEvent.click(allBooksItem);

    expect(mockProps.onGenreChange).toHaveBeenCalledWith(undefined);
  });

  test("викликає onClose при натисканні на оверлей", () => {
    const { container } = render(<SidePanel {...mockProps} />);
    
    const overlay = container.querySelector(`.${styles.overlay}`);
    if (overlay) fireEvent.click(overlay);

    expect(mockProps.onClose).toHaveBeenCalled();
  });

  test("викликає OnClick при Find'", () => {
    render(<SidePanel {...mockProps} />);
    
    const findButton = screen.getByRole("button", { name: /Find/i });
    fireEvent.click(findButton);

    expect(mockProps.onClose).toHaveBeenCalled();
  });

  test("застосовуємо активний клас до обраного жанру", () => {
    render(<SidePanel {...mockProps} selectedGenre="Fantasy" />);
    
    const activeGenre = screen.getByText("Fantasy");
    expect(activeGenre.className).toContain("active");
  });
});