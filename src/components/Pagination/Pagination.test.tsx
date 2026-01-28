import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Pagination from "./Pagination";

jest.mock("./Pagination.module.css", () => ({
  pagination: "pagination",
  pageBtn: "pageBtn",
  pageInfo: "pageInfo",
}));

describe("Pagination Component", () => {
  const mockOnPageChange = jest.fn();

  beforeEach(() => {
    mockOnPageChange.mockClear();
  });

  test("не рендерується, якщо загальна кількість сторінок <= 1", () => {
    const { container } = render(
      <Pagination currentPage={0} totalPages={1} onPageChange={mockOnPageChange} />
    );
    expect(container.firstChild).toBeNull();
  });

  test("коректно відображає інформацію про поточну сторінку", () => {
    render(
      <Pagination currentPage={2} totalPages={10} onPageChange={mockOnPageChange} />
    );
    expect(screen.getByText(/Page 3 of 10/i)).toBeInTheDocument();
  });

  test("кнопку 'Prev' заблоковано на першій сторінці", () => {
    render(
      <Pagination currentPage={0} totalPages={5} onPageChange={mockOnPageChange} />
    );
    const prevButton = screen.getByRole("button", { name: /Prev/i });
    expect(prevButton).toBeDisabled();
  });

  test("кнопку 'Next' заблоковано на останній сторінці", () => {
    render(
      <Pagination currentPage={4} totalPages={5} onPageChange={mockOnPageChange} />
    );
    const nextButton = screen.getByRole("button", { name: /Next/i });
    expect(nextButton).toBeDisabled();
  });

  test("викликає onPageChange з аргументом (currentPage + 1) при натисканні на Next", () => {
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />
    );
    const nextButton = screen.getByRole("button", { name: /Next/i });
    fireEvent.click(nextButton);

    expect(mockOnPageChange).toHaveBeenCalledTimes(1);
    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  test("викликає onPageChange з аргументом (currentPage - 1) при натисканні на Prev", () => {
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />
    );
    const prevButton = screen.getByRole("button", { name: /Prev/i });
    fireEvent.click(prevButton);

    expect(mockOnPageChange).toHaveBeenCalledTimes(1);
    expect(mockOnPageChange).toHaveBeenCalledWith(0);
  });
});