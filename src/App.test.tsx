import { render, screen } from "@testing-library/react";
import RegisterPage from "./pages/RegisterPage/RegisterPage";

test("renders RegisterPage component", () => {
  render(<RegisterPage />);
  const title = screen.getByText("Реєстрація");
  expect(title).toBeInTheDocument();
});

