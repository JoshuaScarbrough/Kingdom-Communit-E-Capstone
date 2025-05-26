import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import EditUserPics from './EditUserPics';

// Mock modules
// Had to fix this - originally the axios mock wasn't working properly
// The component was getting stuck in loading state because our mock wasn't actually intercepting the calls
// This approach explicitly mocks the specific methods we need (post and patch)
jest.mock('axios', () => ({
  post: jest.fn(),
  patch: jest.fn(),
}));

// Also had to properly mock jwt-decode - before it wasn't returning the user ID correctly
jest.mock('jwt-decode');

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));


describe("EditUserPics component", () => {
    const mockUser = {
    username: 'testuser',
    bio: 'test bio',
    useraddress: 'test address'
  };

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
        
        // Mock sessionStorage
        const mockSessionStorage = {
        getItem: jest.fn(() => 'mock-token'),
        setItem: jest.fn()
        };
        Object.defineProperty(window, 'sessionStorage', {
        value: mockSessionStorage,
        writable: true
        });

        // Mock window.alert
        window.alert = jest.fn();

        // This was the key fix! Had to properly set up the jwt decode mock
        // to return a user ID so the component would actually try to fetch user data
        jwtDecode.mockReturnValue({ id: 1});

        // And make sure axios.post returns the user data in the format the component expects
        // The component looks for response.data[0], so we return an array with our mock user
        axios.post.mockResolvedValue({ data: [mockUser] });
    });

  test("fetches user data on mount and populates the form inputs", async () => {
    // Fake user data as returned from the API
    const fakeUser = {
      profilepictureurl: "https://example.com/profile.jpg",
      coverphotourl: "https://example.com/cover.jpg",
    };
    axios.post.mockResolvedValueOnce({ data: [fakeUser] });

    render(
      <BrowserRouter>
        <EditUserPics />
      </BrowserRouter>
    );

    // Wait for axios.post to be called and the inputs to be updated.
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("http://localhost:5000/users", {
        id: 1,
      });

      expect(screen.getByDisplayValue("https://example.com/profile.jpg")).toBeInTheDocument();
      expect(screen.getByDisplayValue("https://example.com/cover.jpg")).toBeInTheDocument();
    });
  });

  test("updates the form fields and submits the updated user pics", async () => {
    const fakeUser = {
      profilepictureurl: "https://example.com/profile.jpg",
      coverphotourl: "https://example.com/cover.jpg",
    };
    axios.post.mockResolvedValueOnce({ data: [fakeUser] });

    axios.patch.mockResolvedValueOnce({
      data: {
        message: "User photos updated successfully",
        token: "newValidToken",
        user: { ...fakeUser, profilepictureurl: "https://newprofile.com", coverphotourl: "https://newcover.com" },
      },
    });

    render(
      <BrowserRouter>
        <EditUserPics />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("https://example.com/profile.jpg")).toBeInTheDocument();
    });

    const profilePictureInput = screen.getByDisplayValue("https://example.com/profile.jpg");
    const coverPhotoInput = screen.getByDisplayValue("https://example.com/cover.jpg");

    fireEvent.change(profilePictureInput, { target: { value: "https://newprofile.com" } });
    fireEvent.change(coverPhotoInput, { target: { value: "https://newcover.com" } });

    const updateButton = screen.getByRole("button", { name: /Update User/i });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith(
        "http://localhost:5000/users/1/updatePhotos",
        {
          token: "mock-token",
          updatedUser: { profilePicture: "https://newprofile.com", coverPhoto: "https://newcover.com" },
        }
      );

      expect(sessionStorage.getItem("token")).toBe("mock-token");

      expect(mockNavigate).toHaveBeenCalledWith("/users");
    });
  });
});