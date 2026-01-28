import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ForgotPasswordPage from "./ForgotPasswordPage";
import { authService } from "../../services/authService/authService";
import { BrowserRouter } from "react-router-dom";

jest.mock("../../services/authService/authService");

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const fillForm = () => {
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@test.com" },
    });
  };

  test("рендерить форму і заголовок", () => {
    render(<ForgotPasswordPage />, { wrapper: BrowserRouter });
    expect(screen.getByText("Відновлення пароля")).toBeInTheDocument();
    expect(screen.getByText("Надіслати інструкції")).toBeInTheDocument();
  });

  test("успішна відправка форми", async () => {
    (authService.forgotPassword as jest.Mock).mockResolvedValueOnce({});

    render(<ForgotPasswordPage />, { wrapper: BrowserRouter });

    fillForm();

    fireEvent.click(screen.getByText("Надіслати інструкції"));

    expect(
      await screen.findByText(/Інструкції надіслано на/i),
    ).toBeInTheDocument();
    expect(authService.forgotPassword).toHaveBeenCalledWith("test@test.com");
  });

  test("помилка сервера", async () => {
    (authService.forgotPassword as jest.Mock).mockRejectedValueOnce({
      message: "Server error",
    });

    render(<ForgotPasswordPage />, { wrapper: BrowserRouter });

    fillForm();

    fireEvent.click(screen.getByText("Надіслати інструкції"));

    expect(await screen.findByText("Server error")).toBeInTheDocument();
  });

  test("fallback помилка без message", async () => {
    (authService.forgotPassword as jest.Mock).mockRejectedValueOnce({});

    render(<ForgotPasswordPage />, { wrapper: BrowserRouter });

    fillForm();

    fireEvent.click(screen.getByText("Надіслати інструкції"));

    expect(await screen.findByText("Сталася помилка")).toBeInTheDocument();
  });

  test("loading state кнопки", async () => {
  let resolvePromise: any;
  (authService.forgotPassword as jest.Mock).mockImplementation(
    () =>
      new Promise((resolve) => {
        resolvePromise = resolve;
      })
  );

  render(<ForgotPasswordPage />, { wrapper: BrowserRouter });

  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "test@test.com" },
  });

  const button = screen.getByRole("button", { name: /Надіслати інструкції/i });

  fireEvent.click(button);

  expect(button).toBeDisabled();
  expect(button).toHaveTextContent("Надсилаємо...");

  resolvePromise({});
  await waitFor(() => {
    expect(screen.queryByRole("button", { name: /Надіслати інструкції/i })).toBeNull();
    expect(screen.getByText(/Інструкції надіслано на/i)).toBeInTheDocument();
  });
});

});
