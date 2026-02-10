import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage/LoginPage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import HomePage from "./pages/HomePage/HomePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage/ResetPasswordPage";
import BookDetailsPage from "./pages/BookDetailsPage/BookDetailsPage";
import CartPage from "./pages/CartPage/CartPage";
import OrdersPage from "./pages/OrdersPage/OrdersPage";
import TransactionsPage from "./pages/TransactionsPage/TransactionsPage";
import PromoCodePage from "./pages/PromoCodePage/PromoCodePage";
import { authService } from "./services/authService/authService";
import { useEffect } from "react";
import { ThemeProvider } from "./ThemeContext";

function App() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("auth_callback") === "true") {
      authService
        .authorizedFetch("/api/me")
        .then((res) => (res.ok ? res.json() : null))
        .then((userData) => {
          if (userData) {
            authService.saveUserInfo(userData);
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );
            console.log("Авторизація через Google успішна!");
          }
        })
        .catch((err) => console.error("Помилка підтягування даних:", err));
    }
  }, []);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/book/:id" element={<BookDetailsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/promocodes" element={<PromoCodePage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
