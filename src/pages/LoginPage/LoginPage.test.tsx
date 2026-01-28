import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "./LoginPage";
import { authService } from "../../services/authService/authService";
import { BrowserRouter } from "react-router-dom";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../../services/authService/authService");

describe("LoginPage", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const fillForm = () => {
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@test.com" },
    });

    fireEvent.change(screen.getByLabelText("Пароль"), {
      target: { value: "password123" },
    });
  };

  test("рендерить форму логіну", () => {
    render(<LoginPage />, { wrapper: BrowserRouter });

    expect(screen.getByText("Вхід")).toBeInTheDocument();
    expect(screen.getByText("Увійти")).toBeInTheDocument();
    expect(screen.getByText("Немає акаунту? Реєстрація")).toBeInTheDocument();
    expect(screen.getByText("Забули пароль?")).toBeInTheDocument();
  });

  test("успішний логін + navigate", async () => {
    (authService.login as jest.Mock).mockResolvedValueOnce({});

    render(<LoginPage />, { wrapper: BrowserRouter });

    fillForm();

    fireEvent.click(screen.getByText("Увійти"));

    await waitFor(() => expect(authService.login).toHaveBeenCalledWith({
      email: "test@test.com",
      password: "password123",
    }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/"));
  });

  test("показує помилку якщо login кидає error.message", async () => {
    (authService.login as jest.Mock).mockRejectedValueOnce({
      message: "Server error",
    });

    render(<LoginPage />, { wrapper: BrowserRouter });

    fillForm();

    fireEvent.click(screen.getByText("Увійти"));

    expect(await screen.findByText("Server error")).toBeInTheDocument();
  });

  test("показує fallback помилку якщо error.message відсутній", async () => {
    (authService.login as jest.Mock).mockRejectedValueOnce({});

    render(<LoginPage />, { wrapper: BrowserRouter });

    fillForm();

    fireEvent.click(screen.getByText("Увійти"));

    expect(await screen.findByText("Помилка входу")).toBeInTheDocument();
  });

  test("блокує кнопку під час запиту", async () => {
    let resolvePromise: any;
    (authService.login as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
    );

    render(<LoginPage />, { wrapper: BrowserRouter });

    fillForm();

    fireEvent.click(screen.getByText("Увійти"));

    const button = screen.getByRole("button");

    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("Вхід...");

    resolvePromise({});

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

});
