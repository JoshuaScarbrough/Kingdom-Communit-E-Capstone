import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LoginForm from "./LoginForm";
import axios from "axios";

// Mock axios
jest.mock("axios");

const mockNavigate = jest.fn();

// Mock useNavigate
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("LoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders login form", () => {
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    expect(screen.getByText(/Enter the Kingdom/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Login/i })).toBeInTheDocument();
  });

  test("submits form and navigates on success", async () => {
    axios.post.mockResolvedValue({
      data: {
        message: "Welcome back!",
        token: "mock-token"
      },
    });

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { name: "username", value: "testuser" },
    });

    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { name: "userPassword", value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    // Wait for async logic to complete
    await screen.findByText(/Enter the Kingdom/i); // forces re-render wait
    expect(mockNavigate).toHaveBeenCalledWith("/users");
  });
});