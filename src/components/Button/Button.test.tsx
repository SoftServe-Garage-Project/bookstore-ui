import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React, { createRef } from "react";
import Button from "./Button";

jest.mock("./Button.module.css", () => ({
  button: "button",
  primary: "primary",
  secondary: "secondary",
  outline: "outline",
  danger: "danger",
  ghost: "ghost",
  link: "link",
  nav: "nav",
  sm: "sm",
  md: "md",
  lg: "lg",
  fullWidth: "fullWidth",
  loading: "loading",
  spinner: "spinner",
  iconLeft: "iconLeft",
  iconRight: "iconRight",
  content: "content",
}));

describe("Button Component", () => {
  it("рендериться з текстом за замовчуванням", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button");

    expect(button).toHaveClass("button");
    expect(button).toHaveClass("primary");
    expect(button).toHaveClass("md");
    expect(button).toHaveTextContent("Click me");
  });

  it("застосовує правильні класи для варіантів та розмірів", () => {
    const { rerender } = render(
      <Button variant="danger" size="lg">
        Delete
      </Button>
    );
    const button = screen.getByRole("button");

    expect(button).toHaveClass("danger");
    expect(button).toHaveClass("lg");

    rerender(<Button fullWidth>Wide</Button>);
    expect(button).toHaveClass("fullWidth");
  });

  it("відображає іконки, коли вони передані", () => {
    render(
      <Button
        leftIcon={<span data-testid="left-icon" />}
        rightIcon={<span data-testid="right-icon" />}
      >
        With Icons
      </Button>
    );
    expect(screen.getByTestId("left-icon")).toBeInTheDocument();
    expect(screen.getByTestId("right-icon")).toBeInTheDocument();
  });

  it("обробляє стан завантаження (isLoading)", () => {
    render(
      <Button isLoading leftIcon={<span data-testid="left-icon" />}>
        Loading
      </Button>
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button.querySelector(".spinner")).toBeInTheDocument();
    expect(screen.queryByTestId("left-icon")).not.toBeInTheDocument();
  });

  it("викликає onClick при натисканні", async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    await userEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("не викликає onClick, якщо заблокований", async () => {
    const handleClick = jest.fn();
    render(
      <Button onClick={handleClick} disabled>
        Disabled
      </Button>
    );

    await userEvent.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("підтримує передачу ref через forwardRef", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ref Button</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("передає стандартні HTML атрибути (наприклад, type)", () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });
});
