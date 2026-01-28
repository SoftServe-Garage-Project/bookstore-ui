import { render, screen } from "@testing-library/react";
import App from "./App";

jest.mock("./pages/HomePage/HomePage", () => () => <div>Home Page Content</div>);
jest.mock("./pages/LoginPage/LoginPage", () => () => <div>Login Page Content</div>);
jest.mock("./pages/RegisterPage/RegisterPage", () => () => <div>Register Content</div>);
jest.mock("./pages/ForgotPasswordPage/ForgotPasswordPage", () => () => <div>Forgot Content</div>);
jest.mock("./pages/ResetPasswordPage/ResetPasswordPage", () => () => <div>Reset Content</div>);
jest.mock("./pages/BookDetailsPage/BookDetailsPage", () => () => <div>Book Details Content</div>);
jest.mock("./pages/CartPage/CartPage", () => () => <div>Cart Page Content</div>);

jest.mock("react-router-dom", () => {
  return {
    BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Routes: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Route: ({ path, element }: { path: string, element: React.ReactNode }) => {
      const currentPath = globalThis.location.pathname;
      if (currentPath === path) {
        return element;
      }
      if (path === "/book/:id" && currentPath.startsWith("/book/")) {
         return element;
      }

      return null;
    },
  };
}, { virtual: true });

describe("App Routing", () => {
  test("відображає головну сторінку за шляхом /", () => {
    window.history.pushState({}, "Home", "/");
    render(<App />);
    expect(screen.getByText(/Home Page Content/i)).toBeInTheDocument();
  });

  test("відображає сторінку логіну за шляхом /login", () => {
    window.history.pushState({}, "Login", "/login");
    render(<App />);
    expect(screen.getByText(/Login Page Content/i)).toBeInTheDocument();
  });

  test("відображає кошик за шляхом /cart", () => {
    window.history.pushState({}, "Cart", "/cart");
    render(<App />);
    expect(screen.getByText(/Cart Page Content/i)).toBeInTheDocument();
  });
  
  test("відображає деталі книги за шляхом /book/123", () => {
    window.history.pushState({}, "Book", "/book/123");
    render(<App />);
    expect(screen.getByText(/Book Details Content/i)).toBeInTheDocument();
  });
});