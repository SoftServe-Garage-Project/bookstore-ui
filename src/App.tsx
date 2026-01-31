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
import { OAuthCallback } from "./components/OAuthCallback/OAuthCallback";
import PromoCodePage from "./pages/PromoCodePage/PromoCodePage";

function App() {
  return (
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
        <Route path="/oauth-callback" element={<OAuthCallback />} />
        <Route path="/promocodes" element={<PromoCodePage />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
