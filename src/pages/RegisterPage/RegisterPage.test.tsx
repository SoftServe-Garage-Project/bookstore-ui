import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RegisterPage from "./RegisterPage";
import { authService } from "../../services/authService/authService";
import { validateRegistration } from "../../utils/validation";

jest.mock("../../services/authService/authService");
jest.mock("../../utils/validation");

const mockNavigate = jest.fn();

jest.mock("react-router", () => ({
  useNavigate: () => mockNavigate,
}));

describe("RegisterPage", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const fillForm = () => {
    fireEvent.change(screen.getByLabelText("Ім'я"), {
      target: { value: "John" },
    });

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "john@test.com" },
    });

    fireEvent.change(screen.getByLabelText("Пароль"), {
      target: { value: "password123" },
    });

    fireEvent.change(screen.getByLabelText("Підтвердження пароля"), {
      target: { value: "password123" },
    });
  };

  test("рендерить форму реєстрації", () => {

    render(<RegisterPage />);

    expect(screen.getByText("Реєстрація")).toBeInTheDocument();
    expect(screen.getByText("Зареєструватися")).toBeInTheDocument();

  });

  test("показує помилку валідації і не викликає API", async () => {

    (validateRegistration as jest.Mock).mockReturnValue("Validation error");

    render(<RegisterPage />);

    fillForm();

    fireEvent.click(screen.getByText("Зареєструватися"));

    expect(
      await screen.findByText("Validation error")
    ).toBeInTheDocument();

    expect(authService.register).not.toHaveBeenCalled();

  });

  test("успішна реєстрація + redirect", async () => {

    jest.useFakeTimers();

    (validateRegistration as jest.Mock).mockReturnValue(null);
    (authService.register as jest.Mock).mockResolvedValueOnce({});

    render(<RegisterPage />);

    fillForm();

    fireEvent.click(screen.getByText("Зареєструватися"));

    expect(
      await screen.findByText("Реєстрація успішна! Перенаправлення...")
    ).toBeInTheDocument();

    expect(authService.register).toHaveBeenCalledWith({
      username: "John",
      email: "john@test.com",
      password: "password123",
    });

    jest.advanceTimersByTime(1500);

    expect(mockNavigate).toHaveBeenCalledWith("/login");

    jest.useRealTimers();

  });

  test("показує помилку сервера", async () => {

    (validateRegistration as jest.Mock).mockReturnValue(null);

    (authService.register as jest.Mock).mockRejectedValueOnce({
      message: "Server error",
    });

    render(<RegisterPage />);

    fillForm();

    fireEvent.click(screen.getByText("Зареєструватися"));

    expect(
      await screen.findByText("Server error")
    ).toBeInTheDocument();

  });

  test("блокує кнопку під час запиту", async () => {

    (validateRegistration as jest.Mock).mockReturnValue(null);

    let resolvePromise: any;

    (authService.register as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
    );

    render(<RegisterPage />);

    fillForm();

    fireEvent.click(screen.getByText("Зареєструватися"));

    const button = screen.getByRole("button");

    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("Завантаження...");

    resolvePromise({});

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });

  });

});
