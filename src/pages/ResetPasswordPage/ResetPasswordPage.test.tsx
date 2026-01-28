import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ResetPasswordPage from "./ResetPasswordPage";
import { authService } from "../../services/authService/authService";

jest.mock("../../services/authService/authService", () => ({
  authService: {
    resetPassword: jest.fn(),
  },
}));

let mockToken: string | null = "test-token";

jest.mock("react-router-dom", () => ({
  useSearchParams: () => [
    new URLSearchParams(mockToken ? { token: mockToken } : {}),
  ],
  Link: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("../../components/Input/Input", () => (props: any) => (
  <input
    aria-label={props.label}
    value={props.value}
    type={props.type}
    onChange={(e) => props.onChange(e.target.value)}
  />
));

jest.mock("../../components/Button/Button", () => (props: any) => (
  <button disabled={props.disabled} type={props.type || "button"}>
    {props.children}
  </button>
));

jest.mock("../../components/AuthForm/AuthFormWrapper", () => (props: any) => (
  <div>{props.children}</div>
));

describe("ResetPasswordPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockToken = "test-token";
  });

  test("рендерить сторінку ресет паролю", () => {
    render(<ResetPasswordPage />);

    expect(screen.getByText("Новий пароль")).toBeInTheDocument();
    expect(screen.getByText("Змінити пароль")).toBeInTheDocument();
  });

  test("показує помилку якщо пароль занадто короткий", async () => {
    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByLabelText("Новий пароль"), {
      target: { value: "123" },
    });

    fireEvent.change(screen.getByLabelText("Підтвердіть пароль"), {
      target: { value: "123" },
    });

    fireEvent.click(screen.getByText("Змінити пароль"));

    expect(
      await screen.findByText("Password must be at least 8 characters"),
    ).toBeInTheDocument();
  });

  test("показує помилку якщо паролі не співпадають", async () => {
    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByLabelText("Новий пароль"), {
      target: { value: "password123" },
    });

    fireEvent.change(screen.getByLabelText("Підтвердіть пароль"), {
      target: { value: "password456" },
    });

    fireEvent.click(screen.getByText("Змінити пароль"));

    expect(
      await screen.findByText("Passwords do not match"),
    ).toBeInTheDocument();
  });

  test("показує помилку якщо токену нема", async () => {
    mockToken = null;

    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByLabelText("Новий пароль"), {
      target: { value: "password123" },
    });

    fireEvent.change(screen.getByLabelText("Підтвердіть пароль"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByText("Змінити пароль"));

    expect(
      await screen.findByText(
        "Токен відсутній. Перейдіть за посиланням з листа ще раз.",
      ),
    ).toBeInTheDocument();

    expect(authService.resetPassword).not.toHaveBeenCalled();
  });

  test("показує fallback помилку якщо error.message відсутній", async () => {
    (authService.resetPassword as jest.Mock).mockRejectedValueOnce({});

    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByLabelText("Новий пароль"), {
      target: { value: "password123" },
    });

    fireEvent.change(screen.getByLabelText("Підтвердіть пароль"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByText("Змінити пароль"));

    expect(
      await screen.findByText("Помилка при скиданні пароля"),
    ).toBeInTheDocument();
  });

  test("викликає resetPassword з правильними аргументами", async () => {
    (authService.resetPassword as jest.Mock).mockResolvedValueOnce(undefined);

    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByLabelText("Новий пароль"), {
      target: { value: "password123" },
    });

    fireEvent.change(screen.getByLabelText("Підтвердіть пароль"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByText("Змінити пароль"));

    await waitFor(() => {
      expect(authService.resetPassword).toHaveBeenCalledWith(
        "test-token",
        "password123",
      );
    });
  });

  test("показує успішний екран після успішного скидання", async () => {
    (authService.resetPassword as jest.Mock).mockResolvedValueOnce(undefined);

    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByLabelText("Новий пароль"), {
      target: { value: "password123" },
    });

    fireEvent.change(screen.getByLabelText("Підтвердіть пароль"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByText("Змінити пароль"));

    expect(
      await screen.findByText(/Ваш пароль успішно змінено/i),
    ).toBeInTheDocument();

    expect(screen.getByText("Перейти до входу")).toBeInTheDocument();
  });

  test("показує api помилку", async () => {
    (authService.resetPassword as jest.Mock).mockRejectedValueOnce({
      message: "Server error",
    });

    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByLabelText("Новий пароль"), {
      target: { value: "password123" },
    });

    fireEvent.change(screen.getByLabelText("Підтвердіть пароль"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByText("Змінити пароль"));

    expect(await screen.findByText("Server error")).toBeInTheDocument();
  });
});
