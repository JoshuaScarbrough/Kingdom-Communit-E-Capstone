import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import CreatePost from './createPost';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("CreatePost component", () => {
  test("renders form sections", () => {
    render(
      <BrowserRouter>
        <CreatePost />
      </BrowserRouter>
    );

    expect(screen.getByText("Post Form")).toBeInTheDocument();
    expect(screen.getByText("Event Form")).toBeInTheDocument();
    expect(screen.getByText("Urgent Post Form")).toBeInTheDocument();
  });

  test("navigates back when back button is clicked", () => {
    render(
      <BrowserRouter>
        <CreatePost />
      </BrowserRouter>
    );

    const backButton = screen.getByRole("button", { name: /Back/i });
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith("/users");
  });
});