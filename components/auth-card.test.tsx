import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthCard } from "./auth-card";
import "@testing-library/jest-dom";

// Mock the next/link component as it won't work in a Jest environment
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

// Mock the sonner toast library to prevent errors during tests
jest.mock("sonner", () => ({
  toast: {
    warning: jest.fn(),
    error: jest.fn(),
  },
}));

describe("AuthCard Component", () => {
  const mockOnSubmit = jest.fn();
  const defaultProps = {
    title: "Test Title",
    subtitle: "Test Subtitle",
    submitLabel: "Submit",
    altAction: { href: "/other-page", label: "Go to Other Page" },
    onSubmit: mockOnSubmit,
  };

  // Clear mock function calls before each test
  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it("should render all the basic elements from props", () => {
    render(<AuthCard {...defaultProps} />);

    // Check if title, subtitle, button, and link are rendered correctly
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Subtitle")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Go to Other Page" })
    ).toBeInTheDocument();
  });

  it("should allow the user to type into email and password fields", async () => {
    const user = userEvent.setup();
    render(<AuthCard {...defaultProps} />);

    const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    expect(emailInput.value).toBe("test@example.com");
    expect(passwordInput.value).toBe("password123");
  });

  it("should have a disabled submit button initially and enable it after valid input", async () => {
    const user = userEvent.setup();
    render(<AuthCard {...defaultProps} />);

    const submitButton = screen.getByRole("button", { name: "Submit" });
    expect(submitButton).toBeDisabled();

    // Fill in the form
    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");

    expect(submitButton).toBeEnabled();
  });

  it("should call onSubmit with the correct credentials when the form is submitted", async () => {
    const user = userEvent.setup();
    render(<AuthCard {...defaultProps} />);

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    // Verify that our mock function was called
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    // Verify it was called with the correct data
    expect(mockOnSubmit).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
  });

  it("should display a loading state on the button during submission", async () => {
    const user = userEvent.setup();
    // Create a promise that we can control to simulate a delay
    const promise = new Promise(() => {});
    mockOnSubmit.mockReturnValue(promise);

    render(<AuthCard {...defaultProps} />);

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    const submitButton = screen.getByRole("button", { name: "Submit" });

    await user.click(submitButton);

    // After clicking, the button should be disabled and show loading text
    expect(submitButton).toBeDisabled();
    expect(screen.getByText("Please wait...")).toBeInTheDocument();
  });

  it("should display password validation errors if a validator is provided", async () => {
    const user = userEvent.setup();
    const mockValidatePassword = (password: string) => {
      const errors = [];
      if (password.length < 8) errors.push("Must be 8 characters");
      return errors;
    };

    render(
      <AuthCard {...defaultProps} validatePassword={mockValidatePassword} />
    );

    const passwordInput = screen.getByLabelText("Password");
    await user.type(passwordInput, "123");

    // Wait for the error message to appear
    expect(await screen.findByText("Must be 8 characters")).toBeInTheDocument();
  });

  it("should display a success message when password validation passes", async () => {
    const user = userEvent.setup();
    const mockValidatePassword = (password: string) => {
      if (password === "ValidPassword123!") return [];
      return ["Error"];
    };

    render(
      <AuthCard {...defaultProps} validatePassword={mockValidatePassword} />
    );

    const passwordInput = screen.getByLabelText("Password");
    await user.type(passwordInput, "ValidPassword123!");

    // Wait for the success message to appear
    expect(
      await screen.findByText("Password meets all requirements.")
    ).toBeInTheDocument();
  });
});
