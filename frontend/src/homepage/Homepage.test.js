import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Homepage from "./Homepage";

describe("Homepage component", () => {
  beforeEach(() => {
    // Mock sessionStorage.clear()
    jest.spyOn(window.sessionStorage, "clear");
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Restore mocks after each test
  });

  test("renders the welcome message and navigation links", () => {
    render(
      <BrowserRouter>
        <Homepage />
      </BrowserRouter>
    );

    // Check if welcome message appears
    expect(screen.getByText("Kingdom Communit-E")).toBeInTheDocument();

    // Check if login and register links exist
    expect(screen.getByRole("link", { name: /Login/i })).toHaveAttribute("href", "/auth/login");
    expect(screen.getByRole("link", { name: /Register/i })).toHaveAttribute("href", "/auth/register");
  });

});