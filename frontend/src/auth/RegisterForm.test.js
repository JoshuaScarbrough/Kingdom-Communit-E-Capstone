import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RegisterForm from "./RegisterForm";
import axios from "axios";

// Mock axios
jest.mock("axios");

// Mock navigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("RegisterForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders register form fields", () => {
    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    );

    expect(screen.getByText(/Become a Kingdom Citizen/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Set Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Set Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Set Address/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Register/i })).toBeInTheDocument();
  });

  test("submits form and navigates on success", async () => {
    axios.post.mockResolvedValue({
      data: {
        message: "User registered successfully"
      },
    });

    window.alert = jest.fn(); // Mock alert

    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Set Username/i), {
      target: { name: "username", value: "newuser" },
    });
    fireEvent.change(screen.getByLabelText(/Set Password/i), {
      target: { name: "userPassword", value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/Set Address/i), {
      target: { name: "userAddress", value: "123 Kingdom St" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    await screen.findByText(/Become a Kingdom Citizen/i); // Re-render wait

    expect(window.alert).toHaveBeenCalledWith("User registered successfully");
    expect(mockNavigate).toHaveBeenCalledWith("/auth/login");
  });

  test("submits form and stays on register page on failure", async () => {
    axios.post.mockResolvedValue({
      data: {
        message: "Username already exists"
      },
    });

    window.alert = jest.fn(); // Mock alert

    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Set Username/i), {
      target: { name: "username", value: "existinguser" },
    });
    fireEvent.change(screen.getByLabelText(/Set Password/i), {
      target: { name: "userPassword", value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/Set Address/i), {
      target: { name: "userAddress", value: "456 Duplication Ln" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    await screen.findByText(/Become a Kingdom Citizen/i); // Wait for update

    expect(window.alert).toHaveBeenCalledWith("Username already exists");
    expect(mockNavigate).toHaveBeenCalledWith("/auth/register");
  });
});