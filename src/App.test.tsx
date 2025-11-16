import { render, screen } from "@testing-library/react";
import RegisterPage from "./pages/RegisterPage";

test("renders RegisterPage component", () => {
  render(<RegisterPage />);
  const title = screen.getByText("Реєстрація");
  expect(title).toBeInTheDocument();
});

/*
test("renders LoginPage component", () => {
  render(<LoginPage />);
  const title = screen.getByText("Вхід");
  expect(title).toBeInTheDocument();
});
*/