import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import EditUser from './EditUser';

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

describe('EditUser Component', () => {
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
    jwtDecode.mockReturnValue({ id: '123' });

    // And make sure axios.post returns the user data in the format the component expects
    // The component looks for response.data[0], so we return an array with our mock user
    axios.post.mockResolvedValue({ data: [mockUser] });
  });

  test('redirects to homepage if no token', () => {
    // Mock sessionStorage to return null for token
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn(() => null)
      },
      writable: true
    });

    render(
      <BrowserRouter>
        <EditUser />
      </BrowserRouter>
    );

    expect(window.alert).toHaveBeenCalledWith('Please Login');
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('renders edit user form', async () => {
    render(
      <BrowserRouter>
        <EditUser />
      </BrowserRouter>
    );

    // First, we should see the loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Wait for the form to be populated
    // Before our fix, this would timeout because the loading never finished
    // Now it works because our axios mock actually resolves!
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // Now check for the form elements
    expect(screen.getByText(/Edit User/i)).toBeInTheDocument();
    const usernameInput = screen.getByLabelText(/Username:/i);
    expect(usernameInput).toBeInTheDocument();
    expect(usernameInput).toHaveAttribute('name', 'username');
    expect(screen.getByLabelText(/Bio:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Address:/i)).toBeInTheDocument();
    expect(screen.getByText(/Update User/i)).toBeInTheDocument();
  });

  test('handles form submission', async () => {
    // Mock the patch request for form submission
    axios.patch.mockResolvedValue({
      data: {
        message: 'User updated successfully',
        token: 'new-token',
        user: mockUser
      }
    });

    render(
      <BrowserRouter>
        <EditUser />
      </BrowserRouter>
    );

    // Wait for loading to finish and form to be populated
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // Wait for the form to be populated with user data
    await waitFor(() => {
      const usernameInput = screen.getByLabelText(/Username:/i);
      expect(usernameInput).toHaveValue(mockUser.username);
    }, { timeout: 3000 });

    // Update form fields
    fireEvent.change(screen.getByLabelText(/Username:/i), {
      target: { name: 'username', value: 'newusername' }
    });

    // Submit form
    fireEvent.click(screen.getByText(/Update User/i));

    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/users');
    });
  });
});