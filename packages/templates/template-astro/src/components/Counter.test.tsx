import {render, screen} from "@testing-library/react";
import {userEvent} from "@testing-library/user-event";
import {describe, expect, it} from "vitest";
import Counter from "./Counter";

describe("Counter component", () => {
  it("should render with initial count", () => {
    render(<Counter initialCount={5} />);

    expect(screen.getByText("React Counter Island")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByRole("button", {name: "-"})).toBeInTheDocument();
    expect(screen.getByRole("button", {name: "+"})).toBeInTheDocument();
  });

  it("should render with default initial count of 0", () => {
    render(<Counter />);

    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("should increment count when plus button is clicked", async () => {
    const user = userEvent.setup();
    render(<Counter initialCount={3} />);

    const incrementButton = screen.getByRole("button", {name: "+"});
    const countDisplay = screen.getByText("3");

    expect(countDisplay).toBeInTheDocument();

    await user.click(incrementButton);

    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.queryByText("3")).not.toBeInTheDocument();
  });

  it("should decrement count when minus button is clicked", async () => {
    const user = userEvent.setup();
    render(<Counter initialCount={5} />);

    const decrementButton = screen.getByRole("button", {name: "-"});
    const countDisplay = screen.getByText("5");

    expect(countDisplay).toBeInTheDocument();

    await user.click(decrementButton);

    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.queryByText("5")).not.toBeInTheDocument();
  });

  it("should handle multiple interactions", async () => {
    const user = userEvent.setup();
    render(<Counter initialCount={0} />);

    const incrementButton = screen.getByRole("button", {name: "+"});
    const decrementButton = screen.getByRole("button", {name: "-"});

    expect(screen.getByText("0")).toBeInTheDocument();

    // Increment three times
    await user.click(incrementButton);
    await user.click(incrementButton);
    await user.click(incrementButton);

    expect(screen.getByText("3")).toBeInTheDocument();

    // Decrement once
    await user.click(decrementButton);

    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("should have accessible button elements", () => {
    render(<Counter />);

    const decrementButton = screen.getByRole("button", {name: "-"});
    const incrementButton = screen.getByRole("button", {name: "+"});

    expect(decrementButton).toHaveClass(
      "rounded",
      "bg-red-500",
      "px-4",
      "py-2",
      "text-white",
    );
    expect(incrementButton).toHaveClass(
      "rounded",
      "bg-blue-500",
      "px-4",
      "py-2",
      "text-white",
    );
  });

  it("should display the description text", () => {
    render(<Counter />);

    expect(
      screen.getByText(/This is a React component rendered as an Astro island/),
    ).toBeInTheDocument();
  });
});
